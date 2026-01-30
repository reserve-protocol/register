import { Button } from '@/components/ui/button'
import {
  indexDTFRebalanceControlAtom,
  isHybridDTFAtom,
} from '@/state/dtf/atoms'
import {
  getStartRebalance,
  WeightRange,
} from '@reserve-protocol/dtf-rebalance-lib'
import { StartRebalanceArgsPartial as StartRebalanceArgsPartialV4 } from '@reserve-protocol/dtf-rebalance-lib/dist/4.0.0/types'
import { useAtomValue, useSetAtom } from 'jotai'
import {
  areWeightsSavedAtom,
  savedWeightsAtom,
  rebalanceTokenMapAtom,
  showManageWeightsViewAtom,
  managedWeightUnitsAtom,
} from '../../atoms'
import useRebalanceParams from '../../hooks/use-rebalance-params'
import {
  BasketTable,
  CsvImport,
  useBasketSetup,
} from '@/components/index-basket-setup'
import { calculateTargetShares, prepareRebalanceData } from './utils/weight-calculation-utils'
import ManageWeightsHeader from './manage-weights-header'
import ManageWeightsHero from './manage-weights-hero'
import { FOLIO_VERSION_V5, getRebalanceTokens, getRebalanceWeights } from '../../utils/transforms'
import { MAX_AUCTION_SIZE_USD } from '@/views/index-dtf/governance/views/propose/basket/atoms'

const ManageWeightsContent = () => {
  const rebalanceParams = useRebalanceParams()
  const tokenMap = useAtomValue(rebalanceTokenMapAtom)
  const rebalanceControl = useAtomValue(indexDTFRebalanceControlAtom)
  const isHybridDTF = useAtomValue(isHybridDTFAtom)
  const setSavedWeights = useSetAtom(savedWeightsAtom)
  const setAreWeightsSaved = useSetAtom(areWeightsSavedAtom)
  const setShowView = useSetAtom(showManageWeightsViewAtom)
  const setManagedWeightUnits = useSetAtom(managedWeightUnitsAtom)
  const { basketItems, proposedUnits, validation } = useBasketSetup()

  if (!rebalanceParams || !rebalanceControl) return null

  const editedRows = Object.entries(basketItems).filter(([address, item]) => {
    const proposedUnit = proposedUnits[address] || item.currentValue
    const initialProposedUnit = item.proposedValue || item.currentUnits || item.currentValue
    return proposedUnit !== initialProposedUnit
  }).length
  const totalRows = Object.keys(basketItems).length

  const handleSaveWeights = () => {
    if (!rebalanceParams || !rebalanceControl) return

    try {
      // Get tokens using version-aware helper
      const rebalanceTokens = getRebalanceTokens(
        rebalanceParams.rebalance,
        rebalanceParams.folioVersion
      )

      const targetShares = calculateTargetShares(
        rebalanceTokens,
        tokenMap,
        proposedUnits,
        basketItems,
        rebalanceParams.currentAssets,
        rebalanceParams.prices
      )

      const rebalanceData = prepareRebalanceData(
        targetShares,
        rebalanceTokens,
        tokenMap,
        basketItems,
        rebalanceParams.currentAssets,
        rebalanceParams.prices
      )

      // Max auction size per token in USD (hardcoded to $1M)
      const maxAuctionSizes = rebalanceData.tokens.map(() => MAX_AUCTION_SIZE_USD)

      const startRebalanceArgs = getStartRebalance(
        rebalanceParams.folioVersion,
        rebalanceParams.supply,
        rebalanceData.tokens,
        rebalanceData.assets,
        rebalanceData.decimals,
        rebalanceData.targetBasket,
        rebalanceData.prices,
        rebalanceData.error,
        maxAuctionSizes,
        rebalanceControl.weightControl,
        isHybridDTF
      )

      // Get weights - for v5 we need to extract from tokens, for v4 use weights directly
      let weights: WeightRange[]
      if (rebalanceParams.folioVersion === FOLIO_VERSION_V5) {
        // For v5, getRebalanceWeights helper extracts from rebalance, but here we need from startRebalanceArgs
        // The v5 returns tokens: TokenRebalanceParams[], so we extract weights from there
        const argsV5 = startRebalanceArgs as { tokens: Array<{ weight: WeightRange }> }
        weights = argsV5.tokens.map((t) => t.weight)
      } else {
        const argsV4 = startRebalanceArgs as StartRebalanceArgsPartialV4
        weights = argsV4.weights
      }

      // Create weights map ensuring correct token order
      const weightsMap: Record<string, WeightRange> = {}
      rebalanceTokens.forEach((tokenAddress, index) => {
        const address = tokenAddress.toLowerCase()
        weightsMap[address] = weights[index]

        // Debug logging
        console.log(`Token ${index}: ${tokenAddress}`, {
          weight: weights[index],
          proposedUnit: proposedUnits[address],
          targetShare: targetShares[index],
        })
      })

      // Validate weights distribution
      const totalWeight = weights.reduce(
        (sum: number, w: WeightRange) => sum + Number(w.spot),
        0
      )
      console.log('Total weight (should be close to 1):', totalWeight)

      setSavedWeights(weightsMap)
      setAreWeightsSaved(true)
      setManagedWeightUnits(proposedUnits)
      setShowView(false)
    } catch (error) {
      console.error('Error saving weights:', error)
    }
  }

  return (
    <div className="bg-background rounded-3xl">
      <ManageWeightsHeader />
      <ManageWeightsHero />

      <div className="p-2 space-y-2">
        <CsvImport />
        <BasketTable
          mode="units"
          columns={['token', 'current', 'input', 'allocation']}
          showToggle={false}
          showAddToken={false}
          readOnly={false}
        />
      </div>

      <div className="p-2 pt-0 border-t border-secondary">
        <Button
          className="w-full rounded-xl text-base py-6"
          onClick={handleSaveWeights}
          disabled={!validation.isValid}
        >
          Save Weights {editedRows}/{totalRows} edited
        </Button>
      </div>
    </div>
  )
}

export default ManageWeightsContent