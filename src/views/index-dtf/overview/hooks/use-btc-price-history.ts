import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

const BINANCE_KLINES_URL = 'https://api.binance.com/api/v3/klines'

const REFRESH_INTERVAL = 1000 * 60 * 30

export type BTCPriceHistory = {
  timeseries: {
    timestamp: number
    price: number
  }[]
}

export type UseBTCPriceHistoryParams = {
  from: number
  to: number
  interval: '1h' | '1d'
  prefetchRanges?: Array<{ from: number; to: number; interval: '1h' | '1d' }>
  enabled?: boolean
}

type BinanceKline = [
  number,
  string,
  string,
  string,
  string,
  string,
  number,
  string,
  number,
  string,
  string,
  string,
]

const fetchBTCPrices = async (
  from: number,
  to: number,
  interval: '1h' | '1d'
): Promise<BTCPriceHistory> => {
  const sp = new URLSearchParams()
  sp.set('symbol', 'BTCUSDT')
  sp.set('interval', interval)
  sp.set('startTime', (from * 1000).toString())
  sp.set('endTime', (to * 1000).toString())
  sp.set('limit', '1000')

  const response = await fetch(`${BINANCE_KLINES_URL}?${sp.toString()}`)

  if (!response.ok) {
    throw new Error('Failed to fetch btc price history from binance')
  }

  const data = (await response.json()) as BinanceKline[]

  return {
    timeseries: data.map(([openTimeMs, , , , close]) => ({
      timestamp: Math.floor(openTimeMs / 1_000),
      price: parseFloat(close),
    })),
  }
}

const useBTCPriceHistory = ({
  from,
  to,
  interval,
  prefetchRanges = [],
  enabled = true,
}: UseBTCPriceHistoryParams) => {
  const queryClient = useQueryClient()

  const mainQuery = useQuery({
    queryKey: ['btc-historical-price', from, to, interval],
    queryFn: () => fetchBTCPrices(from, to, interval),
    enabled,
    refetchInterval: REFRESH_INTERVAL,
    staleTime: REFRESH_INTERVAL,
  })

  useEffect(() => {
    if (!enabled || prefetchRanges.length === 0) return

    prefetchRanges.forEach((range) => {
      queryClient.prefetchQuery({
        queryKey: [
          'btc-historical-price',
          range.from,
          range.to,
          range.interval,
        ],
        queryFn: () => fetchBTCPrices(range.from, range.to, range.interval),
        staleTime: REFRESH_INTERVAL,
      })
    })
  }, [enabled, queryClient, prefetchRanges])

  return mainQuery
}

export default useBTCPriceHistory
