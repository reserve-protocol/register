import TabMenu from 'components/tab-menu'
import { useAtomValue } from 'jotai'
import { useMemo, useState } from 'react'
import { Box } from 'theme-ui'
import { stRsrTickerAtom } from 'views/staking/atoms'
import ExchangeRate from './ExchangeRate'
import StakeHistory from './StakeHistory'
import StakeRewardsHistory from './StakeRewardsHistory'
import StakeApy from './StakeApy'

enum StakeMetricType {
  Apy,
  Exchange,
  Staked,
  Income,
}

const Views = {
  [StakeMetricType.Apy]: StakeApy,
  [StakeMetricType.Exchange]: ExchangeRate,
  [StakeMetricType.Staked]: StakeHistory,
  [StakeMetricType.Income]: StakeRewardsHistory,
}

const StakingMetrics = () => {
  const [current, setCurrent] = useState(StakeMetricType.Apy)
  const ticker = useAtomValue(stRsrTickerAtom)
  const options = useMemo(
    () => [
      {
        key: StakeMetricType.Apy,
        label: 'APY',
      },
      {
        key: StakeMetricType.Exchange,
        label: `${ticker}/RSR`,
      },
      {
        key: StakeMetricType.Staked,
        label: 'Staked RSR',
      },
      // {
      //   key: StakeMetricType.Income,
      //   label: 'Income',
      // },
    ],
    [ticker]
  )

  const Component = Views[current]

  return (
    <Box variant="layout.borderBox">
      <TabMenu
        active={+current}
        items={options}
        onMenuChange={(key) => setCurrent(+key)}
        mb={3}
      />
      <Component />
    </Box>
  )
}

export default StakingMetrics
