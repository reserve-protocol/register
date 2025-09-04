import { useAtomValue } from 'jotai'
import { AuctionRound } from '@reserve-protocol/dtf-rebalance-lib'
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
import {
  activeAuctionAtom,
  rebalanceMetricsAtom,
  showManageWeightsViewAtom,
} from './atoms'
import { devModeAtom } from '@/state/atoms'

const RebalanceContent = () => {
  const isCompleted = useAtomValue(isCompletedAtom)
  const showManageWeights = useAtomValue(showManageWeightsViewAtom)
  const metrics = useAtomValue(rebalanceMetricsAtom)
  const activeAuction = useAtomValue(activeAuctionAtom)
  const isDebug = useAtomValue(devModeAtom)

  // Check if rebalance is successfully completed (FINAL round with < $1 auction size)
  const isSuccessfullyCompleted = 
    metrics?.round === AuctionRound.FINAL && 
    (metrics?.auctionSize ?? 0) < 1

  if (
    !isDebug &&
    !activeAuction &&
    (isCompleted || (metrics?.relativeProgression ?? 0) > 99.7 || isSuccessfullyCompleted)
  ) {
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
