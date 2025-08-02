import { Button } from '@/components/ui/button'
import {
  indexDTFRebalanceControlAtom,
  isHybridDTFAtom,
} from '@/state/dtf/atoms'
import {
  getStartRebalance,
  WeightRange,
} from '@reserve-protocol/dtf-rebalance-lib'
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
    const proposedUnit = proposedUnits[address]
    return proposedUnit && proposedUnit !== item.currentUnits
  }).length
  const totalRows = Object.keys(basketItems).length

  const handleSaveWeights = () => {
    if (!rebalanceParams || !rebalanceControl) return

    try {
      const targetShares = calculateTargetShares(
        rebalanceParams.rebalance.tokens,
        tokenMap,
        proposedUnits,
        basketItems,
        rebalanceParams.currentFolio,
        rebalanceParams.prices
      )
      
      const rebalanceData = prepareRebalanceData(
        targetShares,
        rebalanceParams.rebalance.tokens,
        tokenMap,
        basketItems,
        rebalanceParams.currentFolio,
        rebalanceParams.prices
      )

      const { weights } = getStartRebalance(
        rebalanceParams.supply,
        rebalanceData.tokens,
        rebalanceData.folio,
        rebalanceData.decimals,
        rebalanceData.targetBasket,
        rebalanceData.prices,
        rebalanceData.error,
        rebalanceControl.weightControl,
        isHybridDTF
      )

      const weightsMap = rebalanceData.tokens.reduce(
        (acc, address, index) => {
          acc[address.toLowerCase()] = weights[index]
          return acc
        },
        {} as Record<string, WeightRange>
      )

      setSavedWeights(weightsMap)
      setAreWeightsSaved(true)
      setManagedWeightUnits(proposedUnits)
      setShowView(false)
    } catch {}
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