import { devModeAtom } from '@/state/atoms'
import { AuctionRound } from '@reserve-protocol/dtf-rebalance-lib'
import { useAtomValue } from 'jotai'
import { isCompletedAtom } from '../../../atoms'
import { activeAuctionAtom, rebalanceMetricsAtom } from '../atoms'

const COMPLETED_THRESHOLD = 99.7

const useIsRebalanceCompleted = () => {
  const isCompleted = useAtomValue(isCompletedAtom)
  const metrics = useAtomValue(rebalanceMetricsAtom)
  const activeAuction = useAtomValue(activeAuctionAtom)
  const isDebug = useAtomValue(devModeAtom)
  const isAboveThreshold =
    (metrics?.relativeProgression ?? 0) > COMPLETED_THRESHOLD
  const isSuccessfullyCompleted =
    metrics?.round === AuctionRound.FINAL && (metrics?.auctionSize ?? 0) < 1

  return (
    !isDebug &&
    !activeAuction &&
    (isCompleted || isAboveThreshold || isSuccessfullyCompleted)
  )
}

export default useIsRebalanceCompleted
