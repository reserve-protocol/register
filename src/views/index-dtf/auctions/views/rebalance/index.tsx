import { useAtomValue } from 'jotai'
import { rebalanceErrorAtom, showManageWeightsViewAtom } from './atoms'
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

const RebalanceError = () => {
  const rebalanceError = useAtomValue(rebalanceErrorAtom)

  if (!rebalanceError) return null

  return (
    <div className='rounded-3xl p-3 border border-red-500 bg-red-500/10'>
      <h1 className='font-semibold text-red-500'>Rebalance error</h1>
      <p>{rebalanceError}</p>
    </div>
  )
}

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
    <div className="md:w-[480px] p-1 pt-4 flex flex-col gap-1 bg-secondary rounded-3xl">
      <RebalanceError />
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
