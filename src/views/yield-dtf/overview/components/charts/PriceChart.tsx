import { t } from '@lingui/macro'
import AreaChart from 'components/charts/area/AreaChart'
import TabMenu from 'components/tab-menu'
import dayjs from 'dayjs'
import { gql } from 'graphql-request'
import useQuery from 'hooks/useQuery'
import useRToken from 'hooks/useRToken'
import useTimeFrom from 'hooks/useTimeFrom'
import { useAtomValue } from 'jotai'
import { useEffect, useMemo, useState } from 'react'
import { rTokenPriceAtom } from 'state/atoms'
import { Box, BoxProps } from 'theme-ui'
import { formatCurrency } from 'utils'
import { TIME_RANGES } from 'utils/constants'
import ExportCSVButton from './ExportCSVButton'

const hourlyPriceQuery = gql`
  query getTokenHourlyPrice($id: String!, $fromTime: Int!) {
    token(id: $id) {
      snapshots: hourlyTokenSnapshot(where: { timestamp_gte: $fromTime }) {
        timestamp
        priceUSD
        basketRate
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
        priceUSD
        basketRate
      }
    }
  }
`

const PRICE_OPTIONS = [
  {
    key: 'ETH',
    label: 'ETH',
  },
  {
    key: 'USD',
    label: 'USD',
  },
]

const PriceChart = (props: BoxProps) => {
  const rToken = useRToken()
  const [current, setCurrent] = useState(TIME_RANGES.MONTH)
  const [currentPrice, setCurrentPrice] = useState<'ETH' | 'USD'>('USD')
  const price = useAtomValue(rTokenPriceAtom)
  const fromTime = useTimeFrom(current)
  const query = current === TIME_RANGES.DAY ? hourlyPriceQuery : dailyPriceQuery
  const { data } = useQuery(rToken ? query : null, {
    id: rToken?.address.toLowerCase(),
    fromTime,
  })
  const rows = useMemo(() => {
    if (!data) return []
    return (
      data.token?.snapshots.map(
        ({
          timestamp,
          priceUSD,
          basketRate,
        }: {
          timestamp: string
          priceUSD: string
          basketRate: string
        }) => {
          let value = currentPrice === 'USD' ? +priceUSD : +basketRate
          // Temporal fix for USDC+ historical price data
          value =
            timestamp === '1703193935' && rToken?.symbol === 'USDC+' ? 1 : value
          const display =
            rToken?.targetUnits === 'ETH' && currentPrice === 'ETH'
              ? `${formatCurrency(+basketRate, 4)} ETH`
              : `$${formatCurrency(
                  +priceUSD,
                  rToken?.targetUnits === 'ETH' ? 2 : 3
                )}`
          return {
            value,
            label: dayjs.unix(+timestamp).format('YYYY-M-D HH:mm:ss'),
            display,
          }
        }
      ) || []
    )
  }, [data, currentPrice, rToken?.symbol, rToken?.targetUnits])

  // TODO: HACK to display correct prices
  useEffect(() => {
    if (rToken?.symbol?.includes('ETH')) {
      setCurrentPrice('ETH')
    } else {
      setCurrentPrice('USD')
    }
  }, [rToken?.symbol])

  const priceTitle = useMemo(() => {
    if (rToken?.targetUnits === 'ETH' && currentPrice === 'ETH') {
      const ethPrice =
        Math.trunc(
          ((rToken?.basketsNeeded || 0) / (rToken?.supply || 1)) * 10000
        ) / 10000

      return `${ethPrice} ETH`
    }
    return `$${formatCurrency(price, 3)}`
  }, [
    currentPrice,
    price,
    rToken?.basketsNeeded,
    rToken?.supply,
    rToken?.targetUnits,
  ])

  const handleChange = (range: string) => {
    setCurrent(range)
  }

  return (
    <AreaChart
      heading={t`${rToken?.symbol ?? ''} Price`}
      title={priceTitle}
      data={rows}
      timeRange={TIME_RANGES}
      domain={['auto', 'auto']}
      currentRange={current}
      onRangeChange={handleChange}
      sx={{
        backgroundColor: 'backgroundNested',
        borderRadius: '16px',
        border: '12px solid',
        borderColor: 'backgroundNested',
      }}
      moreActions={
        <Box variant="layout.verticalAlign" sx={{ gap: 1 }}>
          {rToken?.targetUnits === 'ETH' && (
            <TabMenu
              items={PRICE_OPTIONS}
              active={currentPrice}
              onMenuChange={(key) => setCurrentPrice(key as 'ETH' | 'USD')}
            />
          )}
          <ExportCSVButton
            headers={[
              { key: 'timestamp', label: 'Timestamp' },
              { key: 'priceUSD', label: 'Price USD' },
              { key: 'basketRate', label: 'Price ETH' },
            ]}
            rows={data?.token?.snapshots || []}
            filename={`${rToken?.symbol}-historical-price-${current}.csv`}
          />
        </Box>
      }
      {...props}
    />
  )
}

export default PriceChart
