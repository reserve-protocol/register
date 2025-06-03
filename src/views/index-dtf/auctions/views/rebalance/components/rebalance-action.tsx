import { useAtomValue } from 'jotai'
import { ArrowRight } from 'lucide-react'
import { rebalancePercentAtom } from '../atoms'
import LaunchAuctionsButton from './launch-auctions-button'

const RebalanceAction = () => {
  const rebalancePercent = useAtomValue(rebalancePercentAtom)

  return (
    <div className="bg-background p-4 rounded-3xl">
      <div className="flex ">
        <div>
          <h1 className="text-2xl">Step title</h1>
          <h4 className="text-legend">Do stuff</h4>
        </div>
        <div className="ml-auto flex items-center flex-shrink-0 gap-1">
          <span className="text-legend">0%</span>
          <ArrowRight className="w-4 h-4 text-primary" />
          <span className="text-primary">{rebalancePercent}%</span>
        </div>
      </div>
      <LaunchAuctionsButton />
    </div>
  )
}

export default RebalanceAction
