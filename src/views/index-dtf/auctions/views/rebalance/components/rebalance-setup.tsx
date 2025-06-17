import { Slider } from '@/components/ui/slider'
import { AuctionRound } from '@reserve-protocol/dtf-rebalance-lib'
import { useAtom, useAtomValue } from 'jotai'
import {
  isAuctionOngoingAtom,
  rebalanceMetricsAtom,
  rebalancePercentAtom,
} from '../atoms'

const ESTIMATED_ROUNDS = {
  [AuctionRound.EJECT]: '2-3',
  [AuctionRound.PROGRESS]: '1-2',
  [AuctionRound.FINAL]: '0',
}

const RebalanceSetup = () => {
  const [rebalancePercent, setRebalancePercent] = useAtom(rebalancePercentAtom)
  const rebalanceOngoing = useAtomValue(isAuctionOngoingAtom)
  const metrics = useAtomValue(rebalanceMetricsAtom)

  return (
    <div className="p-4">
      <div className="mb-4 flex">
        <div>
          <h4 className="text-sm text-legend">Percent rebalanced</h4>
          <h1 className="text-2xl">
            {metrics?.relativeProgression.toFixed(2) ?? 0}%
          </h1>
        </div>
        <div className="ml-auto text-right">
          <h4 className="text-legend text-sm">Est. Upcoming rounds</h4>
          <h1 className="text-2xl">{ESTIMATED_ROUNDS[metrics?.round ?? 1]}</h1>
        </div>
      </div>
      <Slider
        className="mb-2"
        min={0}
        max={100}
        disabled={rebalanceOngoing}
        value={[rebalancePercent]}
        onValueChange={(value) => {
          if (value[0] > (metrics?.absoluteProgression ?? 0)) {
            setRebalancePercent(value[0])
          }
        }}
      />
    </div>
  )
}

export default RebalanceSetup
