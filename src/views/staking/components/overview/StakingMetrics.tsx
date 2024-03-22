import TabMenu from 'components/tab-menu'
import { useAtomValue } from 'jotai'
import { useMemo, useState } from 'react'
import { Box } from 'theme-ui'
import { stRsrTickerAtom } from 'views/staking/atoms'
import ExchangeRate from './ExchangeRate'

enum StakeMetricType {
  Exchange,
  Staked,
  Income,
}

const Views = {
  [StakeMetricType.Exchange]: ExchangeRate,
  [StakeMetricType.Staked]: () => <div>Staked</div>,
  [StakeMetricType.Income]: () => <div>Income</div>,
}

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
      {
        key: StakeMetricType.Income,
        label: 'Income',
      },
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
