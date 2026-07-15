import { indexDTFPriceAtom } from '@/state/dtf/atoms'
import {
  dtfQueryKeys,
  useDtfSdk,
  useIndexDtfIdentity,
} from '@reserve-protocol/react-sdk'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { useEffect, useMemo } from 'react'
import { Address, erc20Abi, formatEther } from 'viem'
import { useReadContract } from 'wagmi'

export type IndexDTFPerformance = {
  address: Address
  timeseries: {
    timestamp: number
    price: number
    marketCap: number
    totalSupply: number
    basket: {
      address: string
      price: number
      amount: number
    }[]
  }[]
}

const REFRESH_INTERVAL = 1000 * 60 * 30 // 30 minutes

// The only granularities historical/dtf serves — anything else is HTTP 400.
export type FetchInterval = '5m' | '1h' | '1d'

export type UseIndexDTFPriceHistoryParams = {
  address?: Address
  from: number
  to: number
  interval: FetchInterval
  enabled?: boolean
  prefetchRanges?: Array<{
    from: number
    to: number
    interval: FetchInterval
  }>
}

// The API occasionally returns duplicated rows for the same timestamp; keep
// the last occurrence so the chart doesn't render vertical artifacts. Input
// is expected in ascending timestamp order (API contract) — the fast path
// returns it untouched; only the rebuilt array is re-sorted.
export const dedupeByTimestamp = <T extends { timestamp: number }>(
  points: T[]
): T[] => {
  const byTimestamp = new Map<number, T>()
  for (const point of points) {
    byTimestamp.set(point.timestamp, point)
  }
  if (byTimestamp.size === points.length) return points
  return [...byTimestamp.values()].sort((a, b) => a.timestamp - b.timestamp)
}

const useIndexDTFPriceHistory = ({
  address,
  from,
  to,
  interval,
  enabled = true,
  prefetchRanges = [],
}: UseIndexDTFPriceHistoryParams) => {
  const sdk = useDtfSdk()
  const { chainId } = useIndexDtfIdentity()
  const currentPrice = useAtomValue(indexDTFPriceAtom)
  const { data: supply } = useReadContract({
    address: address as Address,
    abi: erc20Abi,
    functionName: 'totalSupply',
    chainId,
    query: {
      enabled: Boolean(enabled && address),
    },
  })

  const queryClient = useQueryClient()

  // Raw timeseries through the SDK, keyed by the SDK's canonical query key (one
  // key per source — chart, factsheet and week-ago PnL all share it). The
  // dedupe + live-point composition stays here as product policy, applied over
  // the cached SDK points below.
  const params = address ? { address, chainId, from, to, interval } : undefined

  const rawQuery = useQuery({
    queryKey: dtfQueryKeys.index.priceHistory(params),
    queryFn: async () => {
      if (!params) return []
      const startTime = Date.now()
      const points = await sdk.index.getPriceHistory(params)

      // Floor the fetch at 1s so a fast response doesn't flash the skeleton.
      const remaining = Math.max(0, 1000 - (Date.now() - startTime))
      if (remaining > 0) {
        await new Promise((resolve) => setTimeout(resolve, remaining))
      }

      return points
    },
    enabled: Boolean(enabled && address && supply && currentPrice),
    refetchInterval: REFRESH_INTERVAL,
    staleTime: REFRESH_INTERVAL,
  })

  const data = useMemo<IndexDTFPerformance | undefined>(() => {
    if (!rawQuery.data || !address) return undefined

    const timeseries = dedupeByTimestamp(
      rawQuery.data.map((point) => ({
        timestamp: point.timestamp,
        price: point.price,
        marketCap: point.marketCap,
        totalSupply: point.totalSupply,
        basket: point.basket.map((asset) => ({
          address: asset.address,
          price: asset.price,
          amount: asset.amount,
        })),
      }))
    )

    if (currentPrice && supply) {
      const numberSupply = +formatEther(supply)
      timeseries.push({
        timestamp: Math.floor(Date.now() / 1_000),
        price: currentPrice,
        marketCap: currentPrice * numberSupply,
        totalSupply: numberSupply,
        basket: [],
      })
    }

    return { address, timeseries }
  }, [rawQuery.data, address, currentPrice, supply])

  // Prefetch other ranges under the SAME SDK keys.
  useEffect(() => {
    if (
      !enabled ||
      !address ||
      !supply ||
      !currentPrice ||
      prefetchRanges.length === 0
    ) {
      return
    }

    prefetchRanges.forEach((range) => {
      const rangeParams = {
        address,
        chainId,
        from: range.from,
        to: range.to,
        interval: range.interval,
      }
      queryClient.prefetchQuery({
        queryKey: dtfQueryKeys.index.priceHistory(rangeParams),
        queryFn: () => sdk.index.getPriceHistory(rangeParams),
        staleTime: REFRESH_INTERVAL,
      })
    })
  }, [
    enabled,
    address,
    supply,
    currentPrice,
    chainId,
    queryClient,
    prefetchRanges,
    sdk,
  ])

  return { ...rawQuery, data }
}

export default useIndexDTFPriceHistory
