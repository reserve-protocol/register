import {
  indexDTFAtom,
  iTokenAddressAtom,
  performanceTimeRangeAtom,
} from '@/state/dtf/atoms'
import { useAtomValue } from 'jotai'
import useIndexDTFPriceHistory from '../../overview/hooks/use-dtf-price-history'
import { getRangeParams } from '../utils/constants'
import {
  calculateMonthlyChartData,
  calculatePerformance,
  generateNetPerformanceData,
  priceAtBoundary,
} from '../utils/calculations'
import { TIME_PERIODS } from '../utils/constants'
import type {
  FactsheetData,
  ChartDataPoint,
  PerformanceData,
} from '../types/factsheet-data'
import { useMemo } from 'react'

const prefetchRanges = ['24h', '7d', '1m', '3m', 'ytd', '1y']

export const useFactsheetData = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const address = useAtomValue(iTokenAddressAtom)
  const timeRange = useAtomValue(performanceTimeRangeAtom)

  // The API backfills NAV ~5y before deployment from the basket constituents;
  // this page reports real performance only, so every range is clamped to the
  // on-chain inception (dtf.timestamp).
  const inceptionTs = dtf?.timestamp ?? 0
  const currentRangeParams = getRangeParams(timeRange, inceptionTs)
  const allRangeParams = getRangeParams('all', inceptionTs)

  const { data: currentRangeData, isLoading: currentLoading } =
    useIndexDTFPriceHistory({
      address,
      from: currentRangeParams.from,
      to: currentRangeParams.to,
      interval: currentRangeParams.interval,
      enabled: !!dtf,
      prefetchRanges: prefetchRanges.map((r) => getRangeParams(r, inceptionTs)),
    })

  const { data: allRangeData, isLoading: allLoading } = useIndexDTFPriceHistory(
    {
      address,
      from: allRangeParams.from,
      to: allRangeParams.to,
      interval: allRangeParams.interval,
      enabled: !!dtf,
    }
  )

  const factsheetData = useMemo<FactsheetData | undefined>(() => {
    if (!currentRangeData?.timeseries || !allRangeData?.timeseries) {
      return undefined
    }

    const currentTimeseries = currentRangeData.timeseries
    const allTimeseries = allRangeData.timeseries

    if (currentTimeseries.length === 0 || allTimeseries.length === 0) {
      return undefined
    }

    const navChartData: ChartDataPoint[] = currentTimeseries.map((point) => ({
      timestamp: point.timestamp,
      value: point.price,
      navGrowth: point.price,
      monthlyPL: 0,
    }))

    const monthlyChartData = calculateMonthlyChartData(currentTimeseries)

    const lastPoint = allTimeseries[allTimeseries.length - 1]
    const currentPrice = lastPoint.price

    const lastTs = lastPoint.timestamp

    // Period boundaries relative to the last datapoint (aligned clock)
    const ts1m = lastTs - TIME_PERIODS.MONTH
    const ts3m = lastTs - TIME_PERIODS.THREE_MONTHS
    const ts6m = lastTs - TIME_PERIODS.SIX_MONTHS
    const ts1y = lastTs - TIME_PERIODS.YEAR

    // YTD boundary at Jan 1st 00:00:00 UTC of current year inferred from lastTs
    const d = new Date(lastTs * 1000)
    const y = d.getUTCFullYear()
    const jan1Utc = Math.floor(Date.UTC(y, 0, 1) / 1000)

    // Bases
    const base1m = priceAtBoundary(allTimeseries, ts1m)
    const base3m = priceAtBoundary(allTimeseries, ts3m)
    const base6m = priceAtBoundary(allTimeseries, ts6m)
    const base1y = priceAtBoundary(allTimeseries, ts1y)
    const baseYTD = priceAtBoundary(allTimeseries, jan1Utc)
    const baseAll = allTimeseries[0]?.price ?? null // or first non-zero if prefer

    const performance: PerformanceData = {
      '1m': calculatePerformance(currentPrice, base1m),
      '3m': calculatePerformance(currentPrice, base3m),
      '6m': calculatePerformance(currentPrice, base6m),
      ytd: calculatePerformance(currentPrice, baseYTD),
      '1y': calculatePerformance(currentPrice, base1y),
      all: calculatePerformance(currentPrice, baseAll),
    }

    const netPerformance = generateNetPerformanceData(allTimeseries)

    return {
      chartData: navChartData,
      monthlyChartData,
      performance,
      netPerformance,
      currentNav: currentPrice,
    }
  }, [currentRangeData, allRangeData])

  return {
    data: factsheetData,
    isLoading: currentLoading || allLoading,
  }
}
