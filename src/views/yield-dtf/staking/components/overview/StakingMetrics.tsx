import TabMenu from 'components/tab-menu'
import { useAtomValue } from 'jotai'
import { Suspense, lazy, useMemo, useState } from 'react'
import { Box, Spinner } from 'theme-ui'
import {
  StakeMetricType,
  stRsrTickerAtom,
} from '@/views/yield-dtf/staking/atoms'

const StakingMetricCharts = lazy(() => import('./StakingMetricCharts'))

const Skeleton = () => (
  <Box
    sx={{
      height: 254,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <Spinner size={24} />
  </Box>
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
    <Box variant="layout.borderBox">
      <TabMenu
        active={+current}
        items={options}
        onMenuChange={(key) => setCurrent(+key)}
        mb={3}
      />
      <Suspense fallback={<Skeleton />}>
        <StakingMetricCharts current={current} />
      </Suspense>
    </Box>
  )
}

export default StakingMetrics
