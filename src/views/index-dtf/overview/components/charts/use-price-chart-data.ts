import { useIsMobile } from '@/hooks/use-media-query'
import { btcPriceAtom } from '@/state/chain/atoms/chainAtoms'
import {
  indexDTFAtom,
  performanceTimeRangeAtom,
} from '@/state/dtf/atoms'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import useBTCPriceHistory from '../../hooks/use-btc-price-history'
import useIndexDTFPriceHistory from '../../hooks/use-dtf-price-history'
import {
  downsampleToBucket,
  WEEK_IN_SECONDS,
  WEEKLY_DOWNSAMPLE_THRESHOLD,
} from './downsample'
import {
  currentHour,
  historicalConfigs,
  type Range,
} from './price-chart-constants'

export function usePriceChartData({ isBTCMode }: { isBTCMode: boolean }) {
  const dtf = useAtomValue(indexDTFAtom)
  const range = useAtomValue(performanceTimeRangeAtom)
  const currentBTCPrice = useAtomValue(btcPriceAtom)
  const isMobile = useIsMobile()

  // Show 1 year of backfilled NAV before on-chain inception.
  const allRangeFrom = Math.max(0, (dtf?.timestamp || 0) - 31_536_000)
  const config =
    range === 'all'
      ? {
          to: currentHour,
          from: allRangeFrom,
          interval: '1d' as const,
        }
      : historicalConfigs[range]

  const prefetchRanges = useMemo(() => {
    const ranges: Range[] = ['24h', '7d', '1m', '3m', 'ytd', '1y', 'all']
    return ranges
      .filter((r) => r !== range && r !== '1y')
      .map((r) => {
        if (r === 'all') {
          return {
            to: currentHour,
            from: allRangeFrom,
            interval: '1d' as const,
          }
        }
        return historicalConfigs[r]
      })
  }, [range, allRangeFrom])

  const { data: history } = useIndexDTFPriceHistory({
    address: dtf?.id,
    ...config,
    prefetchRanges,
  })

  const { data: oneYearHistory } = useIndexDTFPriceHistory({
    address: dtf?.id,
    ...historicalConfigs['1y'],
    enabled: range !== '1y',
  })

  const { data: btcHistory } = useBTCPriceHistory({
    ...config,
    prefetchRanges,
    enabled: isBTCMode,
  })

  const timeseries = useMemo(() => {
    const filtered =
      history?.timeseries.filter(({ price }) => Boolean(price)) || []
    const bucket =
      range === 'all'
        ? filtered.length > WEEKLY_DOWNSAMPLE_THRESHOLD
          ? WEEK_IN_SECONDS
          : undefined
        : historicalConfigs[range].bucket
    const raw = bucket ? downsampleToBucket(filtered, bucket) : filtered
    const btc = btcHistory?.timeseries || []
    if (!btc.length && !currentBTCPrice) return raw
    const tolerance = { '5m': 300, '1h': 3_600, '1d': 86_400 }[config.interval]
    const lastBTCTimestamp = btc.length ? btc[btc.length - 1].timestamp : 0
    let j = 0
    return raw.map((d) => {
      let btcPrice: number | null = null
      if (d.timestamp > lastBTCTimestamp && currentBTCPrice) {
        btcPrice = currentBTCPrice
      } else if (btc.length) {
        while (
          j < btc.length - 1 &&
          Math.abs(btc[j + 1].timestamp - d.timestamp) <
            Math.abs(btc[j].timestamp - d.timestamp)
        ) {
          j++
        }
        if (Math.abs(btc[j].timestamp - d.timestamp) <= tolerance) {
          btcPrice = btc[j].price
        }
      }
      return {
        ...d,
        priceBTC: btcPrice && btcPrice > 0 ? d.price / btcPrice : undefined,
      }
    })
  }, [
    history?.timeseries,
    btcHistory?.timeseries,
    currentBTCPrice,
    config.interval,
    range,
  ])

  return {
    history,
    btcHistory,
    rangeAvailabilityHistory:
      range === '1y' ? history : oneYearHistory,
    timeseries,
    interval: config.interval,
    isMobile,
    range,
    xDomain:
      range === 'all'
        ? undefined
        : ([
            Math.max(config.from, timeseries[0]?.timestamp ?? 0),
            Math.max(
              config.to,
              timeseries[timeseries.length - 1]?.timestamp ?? 0
            ),
          ] as const),
  }
}

export function useXAxisTicks(
  chartData: { timestamp: number }[],
  isMobile: boolean,
  xDomain?: readonly [number, number]
) {
  return useMemo(() => {
    if (xDomain) {
      const [start, end] = xDomain
      if (start >= end) return []

      const positions = isMobile
        ? [0.15, 0.38, 0.62, 0.85]
        : [0.05, 0.23, 0.41, 0.59, 0.77, 0.95]

      return positions.map((position) =>
        Math.round(start + (end - start) * position)
      )
    }

    if (chartData.length === 0) return []

    const mobilePositions = [0.15, 0.38, 0.62, 0.85]
    const desktopPositions = [0.05, 0.23, 0.41, 0.59, 0.77, 0.95]
    const positions = isMobile ? mobilePositions : desktopPositions

    return positions
      .map((i) => chartData[Math.floor(chartData.length * i)]?.timestamp)
      .filter(Boolean)
  }, [chartData, isMobile, xDomain])
}
