import { Token } from '@/types'
import {
  AsyncZapLeg,
  fetchTokenPrices,
} from '@reserve-protocol/async-zap-sdk'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { Address, formatUnits } from 'viem'

// Per-leg price impact: the price implied by the CoW quote vs the Reserve API
// reference price for the same asset. Signed from the user's perspective —
// positive = better than reference, negative = worse (slippage/impact).
//
//   buy leg  (paying quoteToken for asset): (referenceUsd − paidUsd) / referenceUsd
//   sell leg (receiving quoteToken for asset): (receivedUsd − referenceUsd) / referenceUsd
export type PriceImpactResult = {
  // Per-leg impact keyed by leg id (undefined when no reference price / no quote).
  byLeg: Record<string, number | undefined>
  // Reference-value-weighted aggregate across all priced legs.
  aggregate: number | undefined
}

export function usePriceImpact({
  legs,
  quoteToken,
  chainId,
}: {
  legs: AsyncZapLeg[]
  quoteToken: Token
  chainId: number
}): PriceImpactResult {
  // Unique asset addresses (+ quote token) to price, stable across re-quotes.
  const addresses = useMemo(() => {
    const set = new Set<string>([quoteToken.address.toLowerCase()])
    for (const leg of legs) set.add(leg.asset.address.toLowerCase())
    return [...set].sort()
  }, [legs, quoteToken.address])

  const queryClient = useQueryClient()
  const { data: prices } = useQuery({
    queryKey: ['async-mint/impact-prices', chainId, addresses.join(',')],
    queryFn: () =>
      fetchTokenPrices(
        queryClient,
        addresses.map((address) => ({
          chainId,
          tokenAddress: address as Address,
        }))
      ),
    enabled: addresses.length > 0,
    staleTime: 60_000,
  })

  return useMemo(() => {
    const priceByAddress = new Map<string, number>()
    for (const p of prices ?? []) {
      priceByAddress.set(p.address.toLowerCase(), p.price)
    }
    const quoteTokenPrice =
      priceByAddress.get(quoteToken.address.toLowerCase()) ?? 1

    const byLeg: Record<string, number | undefined> = {}
    let weightedSum = 0
    let totalReferenceUsd = 0
    for (const leg of legs) {
      const referencePrice = priceByAddress.get(leg.asset.address.toLowerCase())
      const assetUnits = Number(formatUnits(leg.assetAmount, leg.asset.decimals))
      const quoteUnits = Number(
        formatUnits(leg.quoteTokenAmount, quoteToken.decimals)
      )
      // Need a resolved quote and a usable reference price.
      if (
        !referencePrice ||
        referencePrice <= 0 ||
        assetUnits <= 0 ||
        quoteUnits <= 0
      ) {
        byLeg[leg.id] = undefined
        continue
      }
      const referenceUsd = assetUnits * referencePrice
      const executedUsd = quoteUnits * quoteTokenPrice
      const impact =
        leg.side === 'sell'
          ? (executedUsd - referenceUsd) / referenceUsd
          : (referenceUsd - executedUsd) / referenceUsd
      byLeg[leg.id] = impact
      weightedSum += referenceUsd * impact
      totalReferenceUsd += referenceUsd
    }
    const aggregate =
      totalReferenceUsd > 0 ? weightedSum / totalReferenceUsd : undefined
    return { byLeg, aggregate }
  }, [legs, prices, quoteToken.address, quoteToken.decimals])
}
