import { useAtomValue } from 'jotai'
import { ArrowRight } from 'lucide-react'
import { rebalanceMetricsAtom, rebalancePercentAtom } from '../atoms'
import LaunchAuctionsButton from './launch-auctions-button'

const RebalanceAction = () => {
  const rebalancePercent = useAtomValue(rebalancePercentAtom)
  const metrics = useAtomValue(rebalanceMetricsAtom)

  return (
    <div className="bg-background p-4 rounded-3xl">
      <div className="flex ">
        <div>
          <h1 className="text-2xl">Round {metrics?.round ?? 1}</h1>
          <h4 className="text-legend">Do stuff</h4>
        </div>
        <div className="ml-auto flex items-center flex-shrink-0 gap-1">
          <span className="text-legend">
            {metrics?.absoluteProgression.toFixed(2)}%
          </span>
          <ArrowRight className="w-4 h-4 text-primary" />
          <span className="text-primary">{rebalancePercent.toFixed(2)}%</span>
        </div>
      </div>
      <details className="mt-3">
        <summary className="text-sm text-legend cursor-pointer hover:text-foreground transition-colors">
          Metrics (helper output)
        </summary>
        <pre className="mt-2 p-3 bg-background rounded-lg text-xs overflow-auto max-h-64 text-foreground">
          {JSON.stringify(metrics, null, 2)}
        </pre>
      </details>
      <LaunchAuctionsButton />
    </div>
  )
}

export default RebalanceAction
