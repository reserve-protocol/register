import { t } from '@lingui/macro'
import AreaChart from 'components/charts/area/AreaChart'
import dayjs from 'dayjs'
import { gql } from 'graphql-request'
import useQuery from 'hooks/useQuery'
import useRToken from 'hooks/useRToken'
import useTimeFrom from 'hooks/useTimeFrom'
import { useAtomValue } from 'jotai'
import { useMemo, useState } from 'react'
import { rTokenStateAtom } from 'state/atoms'
import { BoxProps } from 'theme-ui'
import { formatCurrency } from 'utils'
import { TIME_RANGES } from 'utils/constants'
import { formatEther } from 'viem'
import ExportCSVButton from './ExportCSVButton'

const hourlyPriceQuery = gql`
  query getTokenHourlyPrice($id: String!, $fromTime: Int!) {
    token(id: $id) {
      snapshots: hourlyTokenSnapshot(where: { timestamp_gte: $fromTime }) {
        timestamp
        supply: hourlyTotalSupply
      }
    }
  }
`

const dailyPriceQuery = gql`
  query getTokenDailyPrice($id: String!, $fromTime: Int!) {
    token(id: $id) {
      snapshots: dailyTokenSnapshot(
        first: 1000
        where: { timestamp_gte: $fromTime }
      ) {
        timestamp
        supply: dailyTotalSupply
      }
    }
  }
`

const SupplyChart = (props: BoxProps) => {
  const rToken = useRToken()
  const { tokenSupply: supply } = useAtomValue(rTokenStateAtom)
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
        data.token?.snapshots.map(
          ({ timestamp, supply }: { timestamp: string; supply: bigint }) => ({
            value: +formatEther(supply),
            label: dayjs.unix(+timestamp).format('YYYY-M-D HH:mm:ss'),
            display: `${formatCurrency(+formatEther(supply))} ${
              rToken?.symbol
            }`,
          })
        ) || []
      )
    }
  }, [data])

  const csvRows = useMemo(() => {
    return (
      data?.token?.snapshots.map(
        ({ timestamp, supply }: { timestamp: string; supply: bigint }) => ({
          timestamp: timestamp,
          supply: +formatEther(supply),
        })
      ) || []
    )
  }, [data])

  const handleChange = (range: string) => {
    setCurrent(range)
  }

  return (
    <AreaChart
      heading={t`Supply`}
      title={`${formatCurrency(supply || 0)} ${rToken?.symbol}`}
      data={rows}
      timeRange={TIME_RANGES}
      currentRange={current}
      onRangeChange={handleChange}
      sx={{
        backgroundColor: 'backgroundNested',
        borderRadius: '16px',
        border: '12px solid',
        borderColor: 'backgroundNested',
      }}
      moreActions={
        <ExportCSVButton
          headers={[
            { key: 'timestamp', label: 'Timestamp' },
            { key: 'supply', label: 'Supply' },
          ]}
          rows={csvRows || []}
          filename={`${rToken?.symbol}-historical-supply-${current}.csv`}
        />
      }
      {...props}
    />
  )
}

export default SupplyChart
