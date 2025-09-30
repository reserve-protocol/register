import { iTokenAddressAtom } from '@/state/dtf/atoms'
import { useAtomValue } from 'jotai'
import useIndexDTFPriceHistory from '../../overview/hooks/use-dtf-price-history'
import { timeRangeAtom } from '../../overview/components/charts/time-range-selector'
import { getRangeParams } from '../utils/constants'
import {
  calculateMonthlyChartData,
  calculatePerformance,
  generateNetPerformanceData,
} from '../utils/calculations'
import { TIME_PERIODS } from '../utils/constants'
import type {
  FactsheetData,
  ChartDataPoint,
  PerformanceData,
} from '../types/factsheet-data'
import { useMemo } from 'react'

const prefetchRanges = ['24h', '7d', '1m', '3m', '1y'].map(getRangeParams)

export const useFactsheetData = () => {
  const address = useAtomValue(iTokenAddressAtom)
  const timeRange = useAtomValue(timeRangeAtom)

  const currentRangeParams = getRangeParams(timeRange)
  const allRangeParams = getRangeParams('all')

  const { data: currentRangeData, isLoading: currentLoading } =
    useIndexDTFPriceHistory({
      address,
      from: currentRangeParams.from,
      to: currentRangeParams.to,
      interval: currentRangeParams.interval,
      prefetchRanges,
    })

  const { data: allRangeData, isLoading: allLoading } = useIndexDTFPriceHistory(
    {
      address,
      from: allRangeParams.from,
      to: allRangeParams.to,
      interval: allRangeParams.interval,
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

    const currentPrice = allTimeseries[allTimeseries.length - 1].price
    const inception = allTimeseries[0].timestamp
    const now = Math.floor(Date.now() / 1000)

    const threeMonthsAgo = allTimeseries.find(
      (p) => p.timestamp >= now - TIME_PERIODS.THREE_MONTHS
    )
    const sixMonthsAgo = allTimeseries.find(
      (p) => p.timestamp >= now - TIME_PERIODS.SIX_MONTHS
    )
    const yearAgo = allTimeseries.find(
      (p) => p.timestamp >= now - TIME_PERIODS.YEAR
    )

    const currentYear = new Date().getFullYear()
    const jan1Timestamp = Math.floor(
      new Date(currentYear, 0, 1).getTime() / 1000
    )
    const yearStart = allTimeseries.find((p) => p.timestamp >= jan1Timestamp)

    const performance: PerformanceData = {
      '3m': calculatePerformance(currentPrice, threeMonthsAgo?.price),
      '6m': calculatePerformance(currentPrice, sixMonthsAgo?.price),
      ytd: yearStart
        ? calculatePerformance(currentPrice, yearStart.price)
        : null,
      '1y': calculatePerformance(currentPrice, yearAgo?.price),
      all: calculatePerformance(currentPrice, allTimeseries[0].price),
    }

    const netPerformance = generateNetPerformanceData(allTimeseries)

    return {
      chartData: navChartData,
      monthlyChartData,
      performance,
      netPerformance,
      inception,
      currentNav: currentPrice,
    }
  }, [currentRangeData, allRangeData])

  return {
    data: factsheetData,
    isLoading: currentLoading || allLoading,
  }
}
