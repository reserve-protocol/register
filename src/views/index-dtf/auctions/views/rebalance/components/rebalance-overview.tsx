import DecimalDisplay from '@/components/decimal-display'
import { Skeleton } from '@/components/ui/skeleton'
import { isAuctionLauncherAtom, isHybridDTFAtom } from '@/state/dtf/atoms'
import { formatPercentage } from '@/utils'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import {
  ArrowLeftRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Target,
  X,
} from 'lucide-react'
import {
  areWeightsSavedAtom,
  areWeightsSettledAtom,
  rebalanceAuctionsAtom,
  rebalanceMetricsAtom,
  showManageWeightsViewAtom,
} from '../atoms'
import useRebalanceParams from '../hooks/use-rebalance-params'
import { useTotalValueTraded } from '../hooks/use-total-value-traded'

const trackingErrorAtom = atom((get) => {
  const metrics = get(rebalanceMetricsAtom)

  if (!metrics) return undefined

  return 100 - metrics.absoluteProgression
})

const SavedWeights = () => {
  const areWeightsSettled = useAtomValue(areWeightsSettledAtom)
  const auctions = useAtomValue(rebalanceAuctionsAtom)
  const isHybridDTF = useAtomValue(isHybridDTFAtom)
  const isAuctionLauncher = useAtomValue(isAuctionLauncherAtom)
  const setShowManageWeights = useSetAtom(showManageWeightsViewAtom)

  if (!isHybridDTF) return null

  const canEditWeights = true
    isAuctionLauncher && areWeightsSettled && auctions.length === 0

  return (
    <div className="flex items-center gap-2 flex-wrap mb-4">
      <div className="flex items-center gap-2 mr-auto text-legend">
        <CheckCircle2 className="h-4 w-4" />
        <span>Weights saved:</span>
      </div>
      {canEditWeights ? (
        <button
          className="flex items-center gap-1 hover:opacity-80 transition-opacity"
          onClick={() => setShowManageWeights(true)}
        >
          <Check className="h-4 w-4 text-primary" />
          <span className="text-primary">Yes</span>
          <ChevronRight className="h-4 w-4 text-primary" />
        </button>
      ) : (
        <>
          {areWeightsSettled ? (
            <Check className="h-4 w-4 text-primary" />
          ) : (
            <X className="h-4 w-4 text-destructive" />
          )}
          <span
            className={areWeightsSettled ? 'text-primary' : 'text-destructive'}
          >
            {areWeightsSettled ? 'Yes' : 'No'}
          </span>
        </>
      )}
    </div>
  )
}

const RebalanceOverview = () => {
  const trackingError = useAtomValue(trackingErrorAtom)
  const totalValueTraded = useTotalValueTraded()

  return (
    <div className="border-t border-secondary p-4 md:p-6">
      <SavedWeights />
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2 mr-auto text-legend">
          <ArrowLeftRight className="h-4 w-4" />
          <span>Total value traded:</span>
        </div>
        <span>
          $
          <DecimalDisplay value={totalValueTraded} />
        </span>
      </div>
      <div className="flex items-center gap-2 mt-4 flex-wrap">
        <div className="flex items-center gap-2 mr-auto text-legend">
          <Target className="h-4 w-4" />
          <span>Current basket deviation:</span>
        </div>
        {trackingError ? (
          <span>-{formatPercentage(trackingError)}</span>
        ) : (
          <Skeleton className="w-16 h-4" />
        )}
      </div>
    </div>
  )
}

export default RebalanceOverview
