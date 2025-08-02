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
import { getTargetBasket, WeightRange } from '@reserve-protocol/dtf-rebalance-lib'

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

    // Calculate proposed units from rebalance weights
    let proposedUnitsFromWeights: Record<string, string> = {}
    if (Object.keys(savedProposedUnits).length === 0 && rebalanceParams.rebalance.weights) {
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
          
          // Convert from D27 to actual token amount
          // D27 means the value is multiplied by 10^27
          // We need to divide by 10^(27 - token.decimals) to get the display value
          const scaleFactor = 27n - BigInt(token.decimals)
          const units = spotWeight / (10n ** scaleFactor)
          
          proposedUnitsFromWeights[address] = formatUnits(units, token.decimals)
        }
      })
    }

    const tokenData = rebalanceParams.rebalance.tokens
      .map((tokenAddress) => {
        const address = tokenAddress.toLowerCase()
        const token = tokenMap[address]
        const folio = rebalanceParams.currentFolio[address] || 0n

        return {
          address,
          token,
          folio,
          decimals: BigInt(token.decimals),
          price: rebalanceParams.prices[address]?.currentPrice || 0,
        }
      })
      .filter((d) => d.token && d.folio !== undefined)

    const currentShares = getCurrentBasket(
      tokenData.map((d) => d.folio),
      tokenData.map((d) => d.decimals),
      tokenData.map((d) => d.price)
    )


    rebalanceParams.rebalance.tokens.forEach((tokenAddress, index) => {
      const address = tokenAddress.toLowerCase()
      const token = tokenMap[address]
      const folio = rebalanceParams.currentFolio[address] || 0n

      if (token) {
        const folioValue = formatUnits(folio, token.decimals)
        const proposedValue = proposedUnitsFromWeights[address] || folioValue
        basket[address] = {
          token,
          currentValue: savedProposedUnits[address] || proposedValue,
          currentShares: formatUnits(currentShares[index] || 0n, 16),
          currentUnits: folioValue,
          proposedValue: proposedValue, // Store initial proposed value for comparison
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