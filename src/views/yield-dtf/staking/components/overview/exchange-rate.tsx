import { Trans } from '@lingui/react/macro'
import AreaChart from 'components/charts/area/AreaChart'
import dayjs from 'dayjs'
import { gql } from 'graphql-request'
import useQuery from 'hooks/use-query'
import useRToken from 'hooks/useRToken'
import useTimeFrom from 'hooks/useTimeFrom'
import { useAtomValue } from 'jotai'
import { useMemo, useState } from 'react'
import { rTokenStateAtom } from 'state/atoms'
import { formatCurrency } from 'utils'
import { TIME_RANGES } from 'utils/constants'
import { stRsrTickerAtom } from '@/views/yield-dtf/staking/atoms'

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

interface ExchangeRateSnapshot {
  timestamp: string
  rsrExchangeRate: string
}
interface ExchangeRateData {
  rtoken?: { snapshots?: ExchangeRateSnapshot[] }
}

export const buildExchangeRateRows = (
  data: ExchangeRateData | undefined,
  stToken: string
) =>
  // Guard `snapshots`, not just `rtoken` — a partial subgraph response can
  // return the rtoken without snapshots (Z38, same class as stake-history;
  // this chart is the default StakingMetrics tab).
  (data?.rtoken?.snapshots ?? []).map(({ timestamp, rsrExchangeRate }) => ({
    value: +rsrExchangeRate,
    label: dayjs.unix(+timestamp).format('YYYY-M-D HH:mm:ss'),
    display: `1 ${stToken} = ${formatCurrency(+rsrExchangeRate, 5)} RSR`,
  }))

const ExchangeRate = () => {
  const rToken = useRToken()
  const { exchangeRate: rate } = useAtomValue(rTokenStateAtom)
  const [current, setCurrent] = useState(TIME_RANGES.YEAR)
  const fromTime = useTimeFrom(current)
  const { data } = useQuery(rToken ? query : null, {
    id: rToken?.address.toLowerCase(),
    fromTime,
  })
  const stToken = useAtomValue(stRsrTickerAtom)

  // `undefined` while loading (chart skeleton), rows once data lands — same
  // distinction the pre-guard code had.
  const rows = useMemo(
    () => (data ? buildExchangeRateRows(data, stToken) : undefined),
    [data, stToken]
  )

  const handleChange = (range: string) => {
    setCurrent(range)
  }

  return (
    <AreaChart
      height={160}
      title={
        !rate ? (
          <span className="text-legend">
            <Trans>Loading history...</Trans>
          </span>
        ) : (
          <>
            <span className="font-semibold">1 {stToken} =</span>{' '}
            <span
              data-testid="staking-exchange-rate"
              className="ml-1 text-primary font-semibold"
            >
              {formatCurrency(rate, 5)} RSR
            </span>
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
