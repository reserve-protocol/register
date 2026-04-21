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
  currentHour,
  historicalConfigs,
} from './price-chart-constants'
import { Range } from './time-range-selector'

export function usePriceChartData({ isBTCMode }: { isBTCMode: boolean }) {
  const dtf = useAtomValue(indexDTFAtom)
  const range = useAtomValue(performanceTimeRangeAtom)
  const currentBTCPrice = useAtomValue(btcPriceAtom)
  const isMobile = useIsMobile()

  const now = Math.floor(Date.now() / 1_000)
  const showHourlyInterval = now - (dtf?.timestamp || 0) < 30 * 86_400
  const config =
    range === 'all'
      ? {
          to: currentHour,
          from: dtf?.timestamp || 0,
          interval: (showHourlyInterval ? '1h' : '1d') as '1h' | '1d',
        }
      : historicalConfigs[range]

  const prefetchRanges = useMemo(() => {
    const ranges: Range[] = ['24h', '7d', '1m', '3m', '1y', 'all']
    return ranges
      .filter((r) => r !== range)
      .map((r) => {
        if (r === 'all') {
          return {
            to: currentHour,
            from: dtf?.timestamp || 0,
            interval: (showHourlyInterval ? '1h' : '1d') as '1h' | '1d',
          }
        }
        return {
          ...historicalConfigs[r],
          ...(showHourlyInterval ? { interval: '1h' as const } : {}),
        }
      })
  }, [range, dtf?.timestamp, showHourlyInterval])

  const hourOverride =
    showHourlyInterval && range !== 'all' ? { interval: '1h' as const } : {}

  const { data: history } = useIndexDTFPriceHistory({
    address: dtf?.id,
    ...config,
    ...hourOverride,
    prefetchRanges,
  })

  const { data: btcHistory } = useBTCPriceHistory({
    ...config,
    ...hourOverride,
    prefetchRanges,
    enabled: isBTCMode,
  })

  const timeseries = useMemo(() => {
    const raw = history?.timeseries.filter(({ price }) => Boolean(price)) || []
    const btc = btcHistory?.timeseries || []
    if (!btc.length && !currentBTCPrice) return raw
    const tolerance = config.interval === '1h' ? 3_600 : 86_400
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
  ])

  return {
    history,
    btcHistory,
    timeseries,
    interval: config.interval,
    isMobile,
    range,
  }
}

export function useXAxisTicks(
  chartData: { timestamp: number }[],
  isMobile: boolean
) {
  return useMemo(() => {
    if (chartData.length === 0) return []

    const mobilePositions = [0.15, 0.38, 0.62, 0.85]
    const desktopPositions = [0.05, 0.23, 0.41, 0.59, 0.77, 0.95]
    const positions = isMobile ? mobilePositions : desktopPositions

    return positions
      .map((i) => chartData[Math.floor(chartData.length * i)]?.timestamp)
      .filter(Boolean)
  }, [chartData, isMobile])
}
