import { chainIdAtom } from '@/state/atoms'
import { indexDTFAtom, performanceTimeRangeAtom } from '@/state/dtf/atoms'
import { RESERVE_API } from '@/utils/constants'
import { useQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { Address } from 'viem'
import { currentHour, historicalConfigs } from './price-chart-constants'

const REFRESH_INTERVAL = 1000 * 60 * 30 // 30 minutes

const DAY = 86_400
const YEAR = 31_536_000

export type CandleInterval = '1h' | '4h' | '1d' | '7d' | '30d'

export const CANDLE_INTERVAL_SECONDS: Record<CandleInterval, number> = {
  '1h': 3_600,
  '4h': 14_400,
  '1d': DAY,
  '7d': 7 * DAY,
  '30d': 30 * DAY,
}

// Pure: pick the candle bucket size for a visible window so the candle count
// stays readable on the narrow overview chart. Thresholds chosen so the named
// ranges land on: 24h -> 1h, 7d -> 4h, 1m/3m -> 1d, ytd/1y -> 7d once the span
// reaches 4 months, 2y+ -> 30d.
export const getCandleInterval = (spanSeconds: number): CandleInterval => {
  if (spanSeconds <= 2 * DAY) return '1h'
  if (spanSeconds <= 14 * DAY) return '4h'
  if (spanSeconds < 120 * DAY) return '1d'
  if (spanSeconds < 2 * YEAR) return '7d'
  return '30d'
}

// Pure: the API buckets on an epoch-aligned grid (floor(ts/N)*N) and clips
// aggregation at `from`, so an unaligned `from` yields a truncated first
// candle labeled before the window. Snapping to the same grid keeps the first
// candle complete and honestly labeled. Snaps down: the candle window may
// start up to one bucket before the nominal range (complete first candle over
// window ⊆ range).
export const snapToBucketStart = (
  from: number,
  interval: CandleInterval
): number => {
  const seconds = CANDLE_INTERVAL_SECONDS[interval]
  return from - (from % seconds)
}

// Pure: find the candle bucket containing `timestamp` and how far into it the
// timestamp falls (0..1), for positioning overlays on the category axis.
// Null when it falls outside the series or in a filtered-out bucket.
export const locateCandleBucket = (
  candles: ChartCandle[],
  timestamp: number,
  intervalSeconds: number
): { index: number; fraction: number } | null => {
  const index = candles.findIndex(
    (c) => timestamp >= c.timestamp && timestamp < c.timestamp + intervalSeconds
  )
  if (index === -1) return null
  return {
    index,
    fraction: (timestamp - candles[index].timestamp) / intervalSeconds,
  }
}

export type DTFCandle = {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  count: number
}

export type DTFCandlesResponse = {
  address: string
  candles: DTFCandle[]
}

// Candle shaped for recharts: `highLow` drives the Bar (its pixel span covers
// the full wick), open/close drive the body inside the custom shape.
export type ChartCandle = {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  highLow: [number, number]
}

// Pure: keep only candles with sane positive OHLC and attach the [low, high]
// tuple the Bar renders against.
export const mapCandles = (
  response: DTFCandlesResponse | undefined
): ChartCandle[] => {
  if (!response?.candles) return []

  return response.candles
    .filter(
      (c) =>
        c.open > 0 &&
        c.high > 0 &&
        c.low > 0 &&
        c.close > 0 &&
        c.high >= c.low
    )
    .map((c) => ({
      timestamp: c.timestamp,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
      highLow: [c.low, c.high],
    }))
}

// Pure: y-axis domain spanning all wicks with a small padding so candles never
// touch the chart edges. Returns 'auto' bounds when there is no data.
export const getCandleYDomain = (
  candles: ChartCandle[],
  padding = 0.05
): [number, number] | ['auto', 'auto'] => {
  if (candles.length === 0) return ['auto', 'auto']

  let min = Infinity
  let max = -Infinity
  for (const c of candles) {
    if (c.low < min) min = c.low
    if (c.high > max) max = c.high
  }

  const span = max - min
  const pad = span > 0 ? span * padding : Math.abs(max) * padding || 1

  return [min - pad, max + pad]
}

const fetchCandles = async (
  chainId: number,
  address: string,
  from: number,
  to: number,
  interval: CandleInterval
): Promise<DTFCandlesResponse> => {
  const sp = new URLSearchParams()
  sp.set('chainId', chainId.toString())
  sp.set('address', address.toLowerCase())
  sp.set('from', from.toString())
  sp.set('to', to.toString())
  sp.set('interval', interval)

  const response = await fetch(
    `${RESERVE_API}v2/historical/dtf/candles/?${sp.toString()}`
  )

  if (!response.ok) {
    throw new Error('Failed to fetch dtf candles')
  }

  return (await response.json()) as DTFCandlesResponse
}

const candleQueryOptions = (
  address: Address | undefined,
  chainId: number,
  from: number,
  to: number,
  interval: CandleInterval,
  enabled: boolean
) => ({
  queryKey: ['dtf-candles', address, from, to, interval, chainId] as const,
  queryFn: () => fetchCandles(chainId, address ?? '', from, to, interval),
  enabled: Boolean(enabled && address && chainId),
  refetchInterval: REFRESH_INTERVAL,
  staleTime: REFRESH_INTERVAL,
})

export const useCandlestickData = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)
  const range = useAtomValue(performanceTimeRangeAtom)
  const address = dtf?.id as Address | undefined
  const isAll = range === 'all'
  // Same 'all' window as the line chart (1 year of backfilled NAV before
  // on-chain inception) so toggling chart types keeps the same range.
  const allRangeFrom = Math.max(0, (dtf?.timestamp || 0) - 31_536_000)

  // For 'all' we don't know how far back data goes within the window, and the
  // interval depends on that span (7d weekly under 2y, 30d monthly beyond).
  // Probe with a cheap coarse (30d) query first to learn the earliest candle.
  const discovery = useQuery(
    candleQueryOptions(
      address,
      chainId,
      snapToBucketStart(allRangeFrom, '30d'),
      currentHour,
      '30d',
      isAll
    )
  )

  const { from, to, interval } = useMemo(() => {
    if (isAll) {
      const earliest = discovery.data?.candles?.[0]?.timestamp ?? currentHour
      const allInterval = getCandleInterval(currentHour - earliest)
      return {
        from: snapToBucketStart(allRangeFrom, allInterval),
        to: currentHour,
        interval: allInterval,
      }
    }
    const cfg = historicalConfigs[range]
    const rangeInterval = getCandleInterval(cfg.to - cfg.from)
    return {
      from: snapToBucketStart(cfg.from, rangeInterval),
      to: cfg.to,
      interval: rangeInterval,
    }
  }, [isAll, range, discovery.data, allRangeFrom])

  // When 'all' resolves to 30d this shares the discovery query key, so React
  // Query serves it from cache with no extra request. A candle-less discovery
  // skips the main query entirely (it would request the whole window hourly
  // just to come back empty before the line-chart fallback renders).
  const main = useQuery(
    candleQueryOptions(
      address,
      chainId,
      from,
      to,
      interval,
      !isAll || Boolean(discovery.data?.candles?.length)
    )
  )

  const candles = useMemo(() => mapCandles(main.data), [main.data])
  const isLoading = (isAll && discovery.isLoading) || main.isLoading

  return {
    candles,
    isLoading,
    interval,
    intervalSeconds: CANDLE_INTERVAL_SECONDS[interval],
  }
}
