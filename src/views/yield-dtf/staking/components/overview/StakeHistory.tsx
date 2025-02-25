import AreaChart from 'components/charts/area/AreaChart'
import dayjs from 'dayjs'
import { gql } from 'graphql-request'
import useQuery from 'hooks/useQuery'
import useRToken from 'hooks/useRToken'
import useTimeFrom from 'hooks/useTimeFrom'
import { useMemo, useState } from 'react'
import { BoxProps, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { TIME_RANGES } from 'utils/constants'
import { formatEther } from 'viem'

const hourlyQuery = gql`
  query getStakingHourly($id: String!, $fromTime: Int!) {
    rtoken(id: $id) {
      snapshots: hourlySnapshots(where: { timestamp_gte: $fromTime }) {
        timestamp
        rsrStaked
      }
    }
  }
`

const dailyQuery = gql`
  query getStakingDaily($id: String!, $fromTime: Int!) {
    rtoken(id: $id) {
      snapshots: dailySnapshots(
        first: 365
        where: { timestamp_gte: $fromTime }
      ) {
        timestamp
        rsrStaked
      }
    }
  }
`
const StakeHistory = (props: BoxProps) => {
  const rToken = useRToken()
  const [current, setCurrent] = useState(TIME_RANGES.MONTH)
  const fromTime = useTimeFrom(current)
  const query = current === TIME_RANGES.DAY ? hourlyQuery : dailyQuery
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
            value: +formatEther(rsrStaked),
            label: dayjs.unix(+timestamp).format('YYYY-M-D HH:mm:ss'),
            display: `${formatCurrency(+formatEther(rsrStaked))}`,
          })
        ) || []
      )
    }
  }, [data])

  const currentValue = rows && rows.length ? rows[rows.length - 1].value : 0

  const handleChange = (range: string) => {
    setCurrent(range)
  }

  return (
    <AreaChart
      height={160}
      title={
        !currentValue ? (
          <Text variant="legend">Loading history...</Text>
        ) : (
          <>
            <Text variant="bold">Total staked:</Text>{' '}
            <Text ml="1" color="primary" variant="bold">
              {formatCurrency(currentValue, 2, {
                notation: 'compact',
                compactDisplay: 'short',
              })}{' '}
              RSR
            </Text>
          </>
        )
      }
      data={rows}
      timeRange={TIME_RANGES}
      currentRange={current}
      onRangeChange={handleChange}
    />
  )
}

export default StakeHistory
