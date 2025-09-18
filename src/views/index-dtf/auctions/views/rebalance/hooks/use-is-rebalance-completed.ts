import { chainIdAtom, devModeAtom } from '@/state/atoms'
import { ChainId } from '@/utils/chains'
import { AuctionRound } from '@reserve-protocol/dtf-rebalance-lib'
import { useAtomValue } from 'jotai'
import { isCompletedAtom } from '../../../atoms'
import { activeAuctionAtom, rebalanceMetricsAtom } from '../atoms'

const COMPLETED_THRESHOLD = {
  [ChainId.Mainnet]: 95,
  [ChainId.Base]: 98,
  [ChainId.BSC]: 98,
  DEFAULT: 98,
}

const useIsRebalanceCompleted = () => {
  const isCompleted = useAtomValue(isCompletedAtom)
  const chainId = useAtomValue(chainIdAtom)
  const metrics = useAtomValue(rebalanceMetricsAtom)
  const activeAuction = useAtomValue(activeAuctionAtom)
  const isDebug = useAtomValue(devModeAtom)
  const isAboveThreshold =
    (metrics?.relativeProgression ?? 0) >
    (COMPLETED_THRESHOLD[chainId] ?? COMPLETED_THRESHOLD.DEFAULT)
  const isSuccessfullyCompleted =
    metrics?.round === AuctionRound.FINAL && (metrics?.auctionSize ?? 0) < 1

  return (
    !isDebug &&
    !activeAuction &&
    (isCompleted || isAboveThreshold || isSuccessfullyCompleted)
  )
}

export default useIsRebalanceCompleted
