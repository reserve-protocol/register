import { AuctionRound } from '@reserve-protocol/dtf-rebalance-lib'
import { useAtomValue } from 'jotai'
import { rebalanceMetricsAtom } from '../atoms'
import ProgressBar from './progress-bar'
import AuctionList from './auction-list'

const ESTIMATED_ROUNDS = {
  [AuctionRound.EJECT]: '2-3',
  [AuctionRound.PROGRESS]: '1-2',
  [AuctionRound.FINAL]: '0',
}

const RebalanceSetup = () => {
  const metrics = useAtomValue(rebalanceMetricsAtom)

  return (
    <div className="p-2">
      <div className="flex mb-1 mt-2 px-4">
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
      <ProgressBar
        className="px-4"
        expectedProgress={(metrics?.relativeTarget ?? 0) * 100}
        currentProgress={metrics?.relativeProgression ?? 0}
      />
      <AuctionList />
    </div>
  )
}

export default RebalanceSetup
