import AreaChart from 'components/charts/area/AreaChart'
import dayjs from 'dayjs'
import { gql } from 'graphql-request'
import useQuery from 'hooks/useQuery'
import useRToken from 'hooks/useRToken'
import useTimeFrom from 'hooks/useTimeFrom'
import { useAtomValue } from 'jotai'
import { useMemo, useState } from 'react'
import { rTokenStateAtom } from 'state/atoms'
import { Box } from 'theme-ui'
import { formatCurrency } from 'utils'
import { TIME_RANGES } from 'utils/constants'

const query = gql`
  query getRTokenExchangeRate($id: String!, $fromTime: Int!) {
    rtoken(id: $id) {
      snapshots: dailySnapshots(
        first: 1000
        where: { timestamp_gte: $fromTime }
      ) {
        timestamp
        rsrExchangeRate
      }
    }
  }
`

const ExchangeRate = () => {
  const rToken = useRToken()
  const { exchangeRate: rate } = useAtomValue(rTokenStateAtom)
  const [current, setCurrent] = useState(TIME_RANGES.MONTH)
  const fromTime = useTimeFrom(current)
  const { data } = useQuery(rToken ? query : null, {
    id: rToken?.address.toLowerCase(),
    fromTime,
  })
  const stToken = rToken?.stToken?.symbol ?? 'stRSR'

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
    <Box variant="layout.borderBox" padding={4}>
      <AreaChart
        height={76}
        title={
          rate
            ? `1 ${stToken} = ${formatCurrency(rate, 5)} RSR`
            : 'Loading exchange rate...'
        }
        data={rows}
        timeRange={TIME_RANGES}
        currentRange={current}
        onRangeChange={handleChange}
      />
    </Box>
  )
}

export default ExchangeRate
