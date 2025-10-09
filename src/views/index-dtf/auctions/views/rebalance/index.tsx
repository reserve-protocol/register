import { useAtomValue } from 'jotai'
import { showManageWeightsViewAtom } from './atoms'
import ManageWeightsView from './components/manage-weights/manage-weights-view'
import RebalanceAction from './components/rebalance-action'
import RebalanceAuctions from './components/rebalance-auctions'
import RebalanceCompleted from './components/rebalance-completed'
import RebalanceDebug from './components/rebalance-debug'
import RebalanceHeader from './components/rebalance-header'
import RebalanceOverview from './components/rebalance-overview'
import RebalanceProgress from './components/rebalance-progress'
import useIsRebalanceCompleted from './hooks/use-is-rebalance-completed'
import Updater from './updater'

const RebalanceContent = () => {
  const showManageWeights = useAtomValue(showManageWeightsViewAtom)
  const isCompleted = useIsRebalanceCompleted()

  if (isCompleted) {
    return <RebalanceCompleted />
  }

  if (showManageWeights) {
    return <ManageWeightsView />
  }

  return (
    <div className="md:w-[480px] p-1 flex flex-col gap-1 bg-secondary rounded-3xl">
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
