import { getCurrentBasket } from '@/lib/index-rebalance/utils'
import { indexDTFRebalanceControlAtom } from '@/state/dtf/atoms'
import { useAtom, useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { formatUnits } from 'viem'
import {
  rebalanceTokenMapAtom,
  showManageWeightsViewAtom,
  managedWeightUnitsAtom,
} from '../../atoms'
import useRebalanceParams from '../../hooks/use-rebalance-params'
import {
  BasketSetupProvider,
  BasketItem,
} from '@/components/index-basket-setup'
import ManageWeightsContent from './manage-weights-content'

const ManageWeightsView = () => {
  const [showView] = useAtom(showManageWeightsViewAtom)
  const rebalanceParams = useRebalanceParams()
  const tokenMap = useAtomValue(rebalanceTokenMapAtom)
  const rebalanceControl = useAtomValue(indexDTFRebalanceControlAtom)
  const savedProposedUnits = useAtomValue(managedWeightUnitsAtom)

  const { initialBasket, priceMap } = useMemo(() => {
    const basket: Record<string, BasketItem> = {}
    const prices: Record<string, number> = {}

    if (!rebalanceParams || !rebalanceControl) {
      return { initialBasket: basket, priceMap: prices }
    }

    // Always calculate proposed units from rebalance weights for comparison
    let proposedUnitsFromWeights: Record<string, string> = {}
    if (rebalanceParams.rebalance.weights) {
      // Weights are in D27 format (tok/BU - tokens per basket unit)
      // For a DTF with 1 basket unit = 1 DTF token (typical case),
      // the weight directly represents tokens per DTF token in D27 format

      rebalanceParams.rebalance.tokens.forEach((tokenAddress, index) => {
        const address = tokenAddress.toLowerCase()
        const token = tokenMap[address]
        const weight = rebalanceParams.rebalance.weights[index]

        if (token && weight) {
          // The spot weight in D27 represents tokens per basket unit
          // Since 1 DTF = 1 BU, we just need to scale from D27 to token decimals
          const spotWeight = BigInt(weight.spot)

          // Convert from D27 to human readable format
          // Equation: {wholeTok/wholeBU} = D27{tok/BU} * {BU/wholeBU} / {tok/wholeTok} / D27
          // Since BU = 1, this simplifies to:
          // whole token units = weight / 10^decimals / 10^9
          // Which is equivalent to: formatUnits(weight, decimals + 9)

          proposedUnitsFromWeights[address] = formatUnits(spotWeight, token.decimals + 9)
        }
      })
    }

    const tokenData = rebalanceParams.rebalance.tokens
      .map((tokenAddress) => {
        const address = tokenAddress.toLowerCase()
        const token = tokenMap[address]
        const assets = rebalanceParams.currentAssets[address] || 0n

        return {
          address,
          token,
          assets,
          decimals: BigInt(token.decimals),
          price: rebalanceParams.prices[address]?.currentPrice || 0,
        }
      })
      .filter((d) => d.token && d.assets !== undefined)

    const currentShares = getCurrentBasket(
      tokenData.map((d) => d.assets),
      tokenData.map((d) => d.decimals),
      tokenData.map((d) => d.price)
    )

    rebalanceParams.rebalance.tokens.forEach((tokenAddress, index) => {
      const address = tokenAddress.toLowerCase()
      const token = tokenMap[address]
      const assets = rebalanceParams.currentAssets[address] || 0n
      const totalSupply = rebalanceParams.supply || 1n

      // TODO @audit
      const folio = assets * 10n ** 18n / totalSupply

      if (token) {
        const folioValue = formatUnits(folio, token.decimals)
        const proposedValue = proposedUnitsFromWeights[address] || folioValue
        basket[address] = {
          token,
          currentValue: savedProposedUnits[address] || proposedValue,
          currentShares: formatUnits(currentShares[index] || 0n, 16),
          currentUnits: folioValue,
          proposedValue: proposedValue, // This is the original proposed value for comparison
        }
        prices[address] = rebalanceParams.prices[address]?.currentPrice || 0
      }
    })

    return { initialBasket: basket, priceMap: prices }
  }, [rebalanceParams, tokenMap, savedProposedUnits, rebalanceControl])

  if (!showView || !rebalanceParams || !rebalanceControl) return null

  return (
    <BasketSetupProvider
      config={{
        mode: 'units',
        initialBasket,
        priceMap,
      }}
    >
      <ManageWeightsContent />
    </BasketSetupProvider>
  )
}

export default ManageWeightsView
