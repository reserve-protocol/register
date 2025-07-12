import { formatPercentage } from '@/utils'
import { useAtomValue } from 'jotai'
import { rebalanceMetricsAtom } from '../atoms'
import ProgressBar from './progress-bar'

const RebalanceProgressOverview = () => {
  const metrics = useAtomValue(rebalanceMetricsAtom)

  return (
    <div className="p-4 md:p-6">
      <div className="flex mb-1">
        <div className="text-primary">
          <h4 className="text-sm">Execution progress</h4>
          <h1 className="text-2xl">
            {formatPercentage(metrics?.relativeProgression ?? 0)}
          </h1>
        </div>
        <div className="ml-auto text-right">
          <h4 className="text-sm">Next auction target</h4>
          <h1 className="text-2xl">
            {formatPercentage((metrics?.relativeTarget ?? 0) * 100)}
          </h1>
        </div>
      </div>
      <ProgressBar
        expectedProgress={(metrics?.relativeTarget ?? 0) * 100}
        currentProgress={metrics?.relativeProgression ?? 0}
      />
    </div>
  )
}

export default RebalanceProgressOverview
