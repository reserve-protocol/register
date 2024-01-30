import { t } from '@lingui/macro'
import AreaChart from 'components/charts/area/AreaChart'
import dayjs from 'dayjs'
import { gql } from 'graphql-request'
import useQuery from 'hooks/useQuery'
import useRToken from 'hooks/useRToken'
import useTimeFrom from 'hooks/useTimeFrom'
import { useAtomValue } from 'jotai'
import { useMemo, useState } from 'react'
import { rTokenPriceAtom } from 'state/atoms'
import { Badge, Box, BoxProps, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { TIME_RANGES } from 'utils/constants'
import usePriceInToken from 'views/home/hooks/usePriceInToken'

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

const PriceChart = (props: BoxProps) => {
  const rToken = useRToken()
  const [current, setCurrent] = useState(TIME_RANGES.MONTH)
  const [currentPrice, setCurrentPrice] = useState<'ETH' | 'USD'>('USD')
  const price = useAtomValue(rTokenPriceAtom)
  const { priceInToken } = usePriceInToken({
    id: rToken?.address,
    chain: rToken?.chainId,
    supply: rToken?.supply,
    price,
    targetUnits: rToken?.targetUnits,
  })
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
          const value = currentPrice === 'USD' ? +priceUSD : +basketRate
          const display =
            currentPrice === 'USD'
              ? `$${formatCurrency(+priceUSD)}`
              : `${formatCurrency(+basketRate, 3)} ETH`
          return {
            value,
            label: dayjs.unix(+timestamp).format('YYYY-M-D HH:mm:ss'),
            display,
          }
        }
      ) || []
    )
  }, [data, currentPrice])

  const priceTitle = useMemo(() => {
    if (rToken?.targetUnits === 'ETH') {
      if (currentPrice === 'USD') {
        return `$${formatCurrency(price, 3)} (${priceInToken} ETH)`
      }
      return `${priceInToken} ETH ($${formatCurrency(price, 3)})`
    }
    return `$${formatCurrency(price, 3)}`
  }, [currentPrice, priceInToken, price])

  const handleChange = (range: string) => {
    setCurrent(range)
  }

  return (
    <AreaChart
      heading={t`Price`}
      title={priceTitle}
      data={rows}
      timeRange={TIME_RANGES}
      currentRange={current}
      onRangeChange={handleChange}
      moreActions={
        rToken?.targetUnits === 'ETH' && (
          <Box variant="layout.verticalAlign" sx={{ gap: 1 }}>
            {['ETH', 'USD'].map((price) =>
              currentPrice === price ? (
                <Badge sx={{ width: '48px', textAlign: 'center' }} key={price}>
                  {price}
                </Badge>
              ) : (
                <Box
                  key={price}
                  sx={{ cursor: 'pointer', width: '48px', textAlign: 'center' }}
                  onClick={() => setCurrentPrice(price as 'ETH' | 'USD')}
                >
                  <Text>{price}</Text>
                </Box>
              )
            )}
          </Box>
        )
      }
      {...props}
    />
  )
}

export default PriceChart
