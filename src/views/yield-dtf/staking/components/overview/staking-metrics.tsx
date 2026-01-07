import TabMenu from 'components/tab-menu'
import { useAtomValue } from 'jotai'
import { Suspense, lazy, useMemo, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import {
  StakeMetricType,
  stRsrTickerAtom,
} from '@/views/yield-dtf/staking/atoms'

const StakingMetricCharts = lazy(() => import('./staking-metric-charts'))

const ChartSkeleton = () => (
  <div className="h-[254px] flex justify-center items-center">
    <Skeleton className="h-6 w-6 rounded-full" />
  </div>
)

const StakingMetrics = () => {
  const [current, setCurrent] = useState(StakeMetricType.Exchange)
  const ticker = useAtomValue(stRsrTickerAtom)
  const options = useMemo(
    () => [
      {
        key: StakeMetricType.Exchange,
        label: `${ticker}/RSR`,
      },
      {
        key: StakeMetricType.Staked,
        label: 'Staked RSR',
      },
    ],
    [ticker]
  )

  return (
    <div className="rounded-3xl border border-border p-6">
      <TabMenu
        active={+current}
        items={options}
        onMenuChange={(key) => setCurrent(+key)}
        className="mb-4"
      />
      <Suspense fallback={<ChartSkeleton />}>
        <StakingMetricCharts current={current} />
      </Suspense>
    </div>
  )
}

export default StakingMetrics
