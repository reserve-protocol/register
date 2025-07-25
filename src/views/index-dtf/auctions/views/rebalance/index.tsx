import { useAtomValue } from 'jotai'
import RebalanceAction from './components/rebalance-action'
import RebalanceAuctions from './components/rebalance-auctions'
import RebalanceCompleted from './components/rebalance-completed'
import RebalanceDebug from './components/rebalance-debug'
import RebalanceHeader from './components/rebalance-header'
import RebalanceOverview from './components/rebalance-overview'
import RebalanceProgress from './components/rebalance-progress'
import Updater from './updater'
import { isCompletedAtom } from '../../atoms'

const RebalanceContent = () => {
  const isCompleted = useAtomValue(isCompletedAtom)

  if (isCompleted) {
    return <RebalanceCompleted />
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
