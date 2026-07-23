import { Trans } from '@lingui/macro'
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
import { computeFolioUnits } from './utils/weight-calculation-utils'
import { getRebalanceTokens, getRebalanceWeights } from '../../utils/transforms'

const ManageWeightsView = () => {
  const [showView] = useAtom(showManageWeightsViewAtom)
  const rebalanceParams = useRebalanceParams()
  const tokenMap = useAtomValue(rebalanceTokenMapAtom)
  const rebalanceControl = useAtomValue(indexDTFRebalanceControlAtom)
  const savedProposedUnits = useAtomValue(managedWeightUnitsAtom)

  // A 0 supply makes every per-share unit indeterminate — bail rather than render a fabricated basket.
  const hasSupply = !!rebalanceParams && rebalanceParams.supply > 0n

  // The token map comes from the subgraph while the rebalance token list is
  // on-chain — indexer lag can leave a token unmapped. Weights derived from a
  // partial map would misattribute shares and break Save, so the whole view
  // fails closed until every token resolves.
  const hasCompleteMetadata = useMemo(() => {
    if (!rebalanceParams) return false
    const rebalanceTokens = getRebalanceTokens(
      rebalanceParams.rebalance,
      rebalanceParams.folioVersion
    )
    return (
      rebalanceTokens.length > 0 &&
      rebalanceTokens.every((address) => tokenMap[address.toLowerCase()])
    )
  }, [rebalanceParams, tokenMap])

  const { initialBasket, priceMap } = useMemo(() => {
    const basket: Record<string, BasketItem> = {}
    const prices: Record<string, number> = {}

    if (!rebalanceParams || !rebalanceControl || !hasSupply || !hasCompleteMetadata) {
      return { initialBasket: basket, priceMap: prices }
    }

    // Get tokens and weights using version-aware helpers
    const rebalanceTokens = getRebalanceTokens(
      rebalanceParams.rebalance,
      rebalanceParams.folioVersion
    )
    const rebalanceWeights = getRebalanceWeights(
      rebalanceParams.rebalance,
      rebalanceParams.folioVersion
    )

    // Always calculate proposed units from rebalance weights for comparison
    let proposedUnitsFromWeights: Record<string, string> = {}
    if (rebalanceWeights.length > 0) {
      // Weights are in D27 format (tok/BU - tokens per basket unit)
      // For a DTF with 1 basket unit = 1 DTF token (typical case),
      // the weight directly represents tokens per DTF token in D27 format

      rebalanceTokens.forEach((tokenAddress, index) => {
        const address = tokenAddress.toLowerCase()
        const token = tokenMap[address]
        const weight = rebalanceWeights[index]

        if (token && weight) {
          // The spot weight in D27 represents tokens per basket unit
          // Since 1 DTF = 1 BU, we just need to scale from D27 to token decimals
          const spotWeight = BigInt(weight.spot)

          // Convert from D27 to human readable format
          // Equation: {wholeTok/wholeBU} = D27{tok/BU} * {BU/wholeBU} / {tok/wholeTok} / D27
          // Since BU = 1, this simplifies to:
          // whole token units = weight / 10^decimals / 10^9
          // Which is equivalent to: formatUnits(weight, decimals + 9)

          proposedUnitsFromWeights[address] = formatUnits(
            spotWeight,
            token.decimals + 9
          )
        }
      })
    }

    // hasCompleteMetadata guarantees every token resolves, so tokenData keeps
    // the on-chain order and currentShares stays index-aligned below.
    const tokenData = rebalanceTokens
      .map((tokenAddress) => tokenAddress.toLowerCase())
      .map((address) => {
        const token = tokenMap[address]

        return {
          address,
          token,
          assets: rebalanceParams.currentAssets[address] || 0n,
          decimals: BigInt(token.decimals),
          price: rebalanceParams.prices[address]?.currentPrice || 0,
        }
      })

    const currentShares = getCurrentBasket(
      tokenData.map((d) => d.assets),
      tokenData.map((d) => d.decimals),
      tokenData.map((d) => d.price)
    )

    rebalanceTokens.forEach((tokenAddress, index) => {
      const address = tokenAddress.toLowerCase()
      const token = tokenMap[address]
      const assets = rebalanceParams.currentAssets[address] || 0n

      // supply is guaranteed > 0n here (hasSupply gate), so folio is never null.
      const folio = computeFolioUnits(assets, rebalanceParams.supply)

      if (token && folio !== null) {
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
  }, [
    rebalanceParams,
    hasSupply,
    hasCompleteMetadata,
    tokenMap,
    savedProposedUnits,
    rebalanceControl,
  ])

  if (!showView || !rebalanceParams || !rebalanceControl) return null

  if (!hasSupply || !hasCompleteMetadata || !Object.keys(initialBasket).length) {
    return (
      <div
        data-testid="manage-weights-unavailable"
        className="bg-background rounded-3xl p-6 text-sm text-legend"
      >
        <Trans>
          Weight management is unavailable — rebalance token data is incomplete
          or still indexing. Try again shortly.
        </Trans>
      </div>
    )
  }

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
