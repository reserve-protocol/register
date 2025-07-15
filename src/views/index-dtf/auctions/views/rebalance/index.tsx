import { useAtomValue } from 'jotai'
import { isExpiredAtom, isSuccessAtom } from '../../atoms'
import RebalanceAction from './components/rebalance-action'
import RebalanceAuctions from './components/rebalance-auctions'
import RebalanceDebug from './components/rebalance-debug'
import RebalanceHeader from './components/rebalance-header'
import RebalanceOverview from './components/rebalance-overview'
import RebalanceProgress from './components/rebalance-progress'
import Updater from './updater'
import RebalanceExpired from './components/rebalance-expired'
import RebalanceSuccess from './components/rebalance-success'

const RebalanceContent = () => {
  const isExpired = useAtomValue(isExpiredAtom)
  const isSuccess = useAtomValue(isSuccessAtom)

  if (isSuccess) {
    return <RebalanceSuccess />
  }
  if (isExpired) {
    return <RebalanceExpired />
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
