import AreaChart from 'components/charts/area/AreaChart'
import dayjs from 'dayjs'
import { gql } from 'graphql-request'
import useQuery from 'hooks/useQuery'
import useRToken from 'hooks/useRToken'
import useTimeFrom from 'hooks/useTimeFrom'
import { useAtomValue } from 'jotai'
import { useMemo, useState } from 'react'
import { rTokenStateAtom } from 'state/atoms'
import { Box, BoxProps, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { TIME_RANGES } from 'utils/constants'
import { stRsrTickerAtom } from '@/views/rtoken/staking/atoms'

const query = gql`
  query getRTokenExchangeRate($id: String!, $fromTime: Int!) {
    rtoken(id: $id) {
      snapshots: dailySnapshots(
        first: 365
        where: { timestamp_gte: $fromTime }
      ) {
        timestamp
        rsrExchangeRate
      }
    }
  }
`

const ExchangeRate = (props: BoxProps) => {
  const rToken = useRToken()
  const { exchangeRate: rate } = useAtomValue(rTokenStateAtom)
  const [current, setCurrent] = useState(TIME_RANGES.YEAR)
  const fromTime = useTimeFrom(current)
  const { data } = useQuery(rToken ? query : null, {
    id: rToken?.address.toLowerCase(),
    fromTime,
  })
  const stToken = useAtomValue(stRsrTickerAtom)

  const rows = useMemo(() => {
    if (data) {
      return (
        data.rtoken?.snapshots.map(
          ({
            timestamp,
            rsrExchangeRate,
          }: {
            timestamp: string
            rsrExchangeRate: string
          }) => ({
            value: +rsrExchangeRate,
            label: dayjs.unix(+timestamp).format('YYYY-M-D HH:mm:ss'),
            display: `1 ${stToken} = ${formatCurrency(
              +rsrExchangeRate,
              5
            )} RSR`,
          })
        ) || []
      )
    }
  }, [data])

  const handleChange = (range: string) => {
    setCurrent(range)
  }

  return (
    <AreaChart
      height={160}
      title={
        !rate ? (
          <Text variant="legend">Loading history...</Text>
        ) : (
          <>
            <Text variant="bold">1 {stToken} =</Text>{' '}
            <Text ml="1" color="primary" variant="bold">
              {formatCurrency(rate, 5)} RSR
            </Text>
          </>
        )
      }
      data={rows}
      timeRange={TIME_RANGES}
      currentRange={current}
      domain={['auto', 'auto']}
      onRangeChange={handleChange}
    />
  )
}

export default ExchangeRate
