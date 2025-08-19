import { useAtomValue } from 'jotai'
import RebalanceAction from './components/rebalance-action'
import RebalanceAuctions from './components/rebalance-auctions'
import RebalanceCompleted from './components/rebalance-completed'
import RebalanceDebug from './components/rebalance-debug'
import RebalanceHeader from './components/rebalance-header'
import RebalanceOverview from './components/rebalance-overview'
import RebalanceProgress from './components/rebalance-progress'
import ManageWeightsView from './components/manage-weights/manage-weights-view'
import Updater from './updater'
import { isCompletedAtom } from '../../atoms'
import { rebalanceMetricsAtom, showManageWeightsViewAtom } from './atoms'

const RebalanceContent = () => {
  const isCompleted = useAtomValue(isCompletedAtom)
  const showManageWeights = useAtomValue(showManageWeightsViewAtom)
  const metrics = useAtomValue(rebalanceMetricsAtom)

  // TOOD: Needs more work, if the rebalance is still ongoing we need to use the current helpers for the metrics
  // If we use the API while rebalance is ongoing then we would get wrong metricsq
  // if (isCompleted || (metrics?.relativeProgression ?? 0) > 99.7) {
  if (isCompleted) {
    return <RebalanceCompleted />
  }

  if (showManageWeights) {
    return <ManageWeightsView />
  }

  return (
    <div className="w-[480px] flex flex-col gap-1 ">
      <div className="bg-background rounded-3xl">
        <RebalanceHeader />
        <RebalanceProgress />
        <RebalanceOverview />
      </div>
      <RebalanceAuctions />
      <RebalanceAction />
      <RebalanceDebug />
    </div>
  )
}

const Rebalance = () => {
  return (
    <>
      <RebalanceContent />
      <Updater />
    </>
  )
}

export default Rebalance
