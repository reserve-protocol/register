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

  if (!showView || !rebalanceParams || !rebalanceControl) return null

  const { initialBasket, priceMap } = useMemo(() => {
    const basket: Record<string, BasketItem> = {}
    const prices: Record<string, number> = {}

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
        basket[address] = {
          token,
          currentValue: savedProposedUnits[address] || folioValue,
          currentShares: formatUnits(currentShares[index] || 0n, 16),
          currentUnits: folioValue,
        }
        prices[address] = rebalanceParams.prices[address]?.currentPrice || 0
      }
    })

    return { initialBasket: basket, priceMap: prices }
  }, [rebalanceParams, tokenMap, savedProposedUnits])

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