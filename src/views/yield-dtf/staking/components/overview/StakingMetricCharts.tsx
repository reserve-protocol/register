import { StakeMetricType } from '@/views/yield-dtf/staking/atoms'
import ExchangeRate from './ExchangeRate'
import StakeHistory from './StakeHistory'

const Views = {
  [StakeMetricType.Exchange]: ExchangeRate,
  [StakeMetricType.Staked]: StakeHistory,
}

const StakingMetricCharts = ({ current }: { current: StakeMetricType }) => {
  const Component = Views[current]

  return <Component />
}

export default StakingMetricCharts
