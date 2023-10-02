import { t } from '@lingui/macro'
import AreaChart from 'components/charts/area/AreaChart'
import dayjs from 'dayjs'
import { gql } from 'graphql-request'
import useQuery from 'hooks/useQuery'
import useRToken from 'hooks/useRToken'
import useTimeFrom from 'hooks/useTimeFrom'
import { useAtomValue } from 'jotai'
import { useMemo, useState } from 'react'
import { rsrPriceAtom } from 'state/atoms'
import { BoxProps } from 'theme-ui'
import { formatCurrency } from 'utils'
import { TIME_RANGES } from 'utils/constants'
import { formatEther } from 'viem'

const hourlyPriceQuery = gql`
  query getTokenHourlyPrice($id: String!, $fromTime: Int!) {
    rtoken(id: $id) {
      snapshots: hourlySnapshots(where: { timestamp_gte: $fromTime }) {
        timestamp
        rsrStaked
      }
    }
  }
`

const dailyPriceQuery = gql`
  query getTokenDailyPrice($id: String!, $fromTime: Int!) {
    rtoken(id: $id) {
      snapshots: dailySnapshots(
        first: 1000
        where: { timestamp_gte: $fromTime }
      ) {
        timestamp
        rsrStaked
      }
    }
  }
`

const StakingChart = (props: BoxProps) => {
  const rToken = useRToken()
  const rsrPrice = useAtomValue(rsrPriceAtom)
  const [current, setCurrent] = useState(TIME_RANGES.MONTH)
  const fromTime = useTimeFrom(current)
  const query = current === TIME_RANGES.DAY ? hourlyPriceQuery : dailyPriceQuery
  const { data } = useQuery(rToken ? query : null, {
    id: rToken?.address.toLowerCase(),
    fromTime,
  })

  const rows = useMemo(() => {
    if (data) {
      return (
        data.rtoken?.snapshots.map(
          ({
            timestamp,
            rsrStaked,
          }: {
            timestamp: string
            rsrStaked: bigint
          }) => ({
            value: +formatEther(rsrStaked) * rsrPrice,
            label: dayjs.unix(+timestamp).format('YYYY-M-D HH:mm:ss'),
            display: `$${formatCurrency(+formatEther(rsrStaked) * rsrPrice)}`,
          })
        ) || []
      )
    }
  }, [data, rsrPrice])

  const currentValue = rows && rows.length ? rows[rows.length - 1].value : 0

  const handleChange = (range: string) => {
    setCurrent(range)
  }

  return (
    <AreaChart
      heading={t`RSR Staked`}
      title={`$${formatCurrency(currentValue)}`}
      data={rows}
      timeRange={TIME_RANGES}
      currentRange={current}
      onRangeChange={handleChange}
      {...props}
    />
  )
}

export default StakingChart
