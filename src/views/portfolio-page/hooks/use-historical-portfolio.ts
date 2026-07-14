import { useQuery } from '@tanstack/react-query'
import { RESERVE_API } from '@/utils/constants'
import { formatCurrency } from '@/utils'
import {
  HistoricalPortfolioResponse,
  PortfolioPeriod,
  PortfolioResponse,
} from '../types'
import { Address } from 'viem'
import { useCallback, useEffect, useMemo } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import dayjs from 'dayjs'
import { portfolioPageTimeRangeAtom } from '../atoms'
import { getAvailableTimeRanges } from '@/views/index-dtf/overview/components/charts/use-available-time-ranges'

export type ChartDataPoint = {
  value: number
  ts: number
  label: string
  display: string
  indexDTFs: number
  yieldDTFs: number
  stakedRSR: number
  voteLocked: number
  rsr: number
}

const fetchHistoricalPortfolio = async (
  address: Address,
  period: PortfolioPeriod
): Promise<ChartDataPoint[]> => {
  const response = await fetch(
    `${RESERVE_API}v1/historical/portfolio/${address}?period=${period}`
  )
  if (!response.ok) {
    throw new Error('Failed to fetch historical portfolio')
  }
  const data: HistoricalPortfolioResponse = await response.json()

  return data.timeseries.map((point) => ({
    value: point.totalHoldingsUSD,
    ts: point.timestamp * 1000,
    label: dayjs(point.timestamp * 1000).format('MMM DD, YYYY h:mm A'),
    display: `$${formatCurrency(point.totalHoldingsUSD)}`,
    indexDTFs: point.totalIndexDTFUSD,
    yieldDTFs: point.totalYieldDTFUSD,
    stakedRSR: point.totalStakedRSRUSD,
    voteLocked: point.totalVoteLockedUSD,
    rsr: point.totalRSRHoldingsUSD,
  }))
}

// The historical series ends at the API's last hourly gridpoint (plus CDN
// cache), so a fresh buy can lag the header total by up to an hour there.
// Appending the live portfolio keeps the chart end in sync with the header.
export const appendLivePoint = (
  chartData: ChartDataPoint[],
  portfolio: PortfolioResponse
): ChartDataPoint[] => {
  const sumValues = (positions: { value: number }[]) =>
    positions.reduce((acc, p) => acc + p.value, 0)
  const now = Date.now()

  return [
    ...chartData,
    {
      value: portfolio.totalHoldingsUSD,
      ts: now,
      label: dayjs(now).format('MMM DD, YYYY h:mm A'),
      display: `$${formatCurrency(portfolio.totalHoldingsUSD)}`,
      indexDTFs: sumValues(portfolio.indexDTFs),
      yieldDTFs: sumValues(portfolio.yieldDTFs),
      stakedRSR: sumValues(portfolio.stakedRSR),
      voteLocked: sumValues(portfolio.voteLocks),
      rsr: sumValues(portfolio.rsrBalances),
    },
  ]
}

const STALE_TIME: Record<PortfolioPeriod, number> = {
  '24h': 300_000,
  '7d': 60_000,
  '1m': 300_000,
  '3m': 300_000,
  ytd: 300_000,
  '1y': 300_000,
  all: 300_000,
}

const useHistoricalPeriod = (
  address: Address | null | undefined,
  period: PortfolioPeriod,
  enabled: boolean
) =>
  useQuery({
    queryKey: ['historical-portfolio', address, period],
    queryFn: () => fetchHistoricalPortfolio(address!, period),
    enabled: !!address && enabled,
    staleTime: STALE_TIME[period],
  })

const getFirstHistoryTimestamp = (
  data: ChartDataPoint[] | undefined
): number | null | undefined => {
  if (data === undefined) return undefined
  const first = data.find((p) => p.value > 0)
  if (!first) return null
  return Math.floor(first.ts / 1000)
}

export const useHistoricalPortfolio = (address?: Address | null) => {
  const timeRange = useAtomValue(portfolioPageTimeRangeAtom)
  const setTimeRange = useSetAtom(portfolioPageTimeRangeAtom)

  const q24h = useHistoricalPeriod(address, '24h', true)
  const q7d = useHistoricalPeriod(address, '7d', true)
  const q1m = useHistoricalPeriod(address, '1m', true)
  const q3m = useHistoricalPeriod(address, '3m', true)
  const qytd = useHistoricalPeriod(address, 'ytd', true)
  const q1y = useHistoricalPeriod(address, '1y', true)
  const qall = useHistoricalPeriod(address, 'all', timeRange === 'all')

  const data = useMemo(
    () => ({
      '24h': q24h.data,
      '7d': q7d.data,
      '1m': q1m.data,
      '3m': q3m.data,
      ytd: qytd.data,
      '1y': q1y.data,
      all: qall.data,
    }),
    [q24h.data, q7d.data, q1m.data, q3m.data, qytd.data, q1y.data, qall.data]
  )

  const getChartData = useCallback(
    (period: PortfolioPeriod) => data[period] ?? null,
    [data]
  )

  const firstHistoryTimestamp = useMemo(
    () => getFirstHistoryTimestamp(q1y.data),
    [q1y.data]
  )

  const availableTimeRanges = useMemo(
    () =>
      getAvailableTimeRanges({
        dtfTimestamp: 1,
        firstHistoryTimestamp,
        isYieldMode: false,
      }),
    [firstHistoryTimestamp]
  )

  const defaultTimeRange = useMemo<PortfolioPeriod>(() => {
    if (!availableTimeRanges) return '1y'
    const nonAll = availableTimeRanges.filter((r) => r.value !== 'all')
    return (nonAll[nonAll.length - 1]?.value ?? '1y') as PortfolioPeriod
  }, [availableTimeRanges])

  useEffect(() => {
    if (!availableTimeRanges) return
    const isAvailable = availableTimeRanges.some((r) => r.value === timeRange)
    if (!isAvailable && defaultTimeRange !== timeRange) {
      setTimeRange(defaultTimeRange)
    }
  }, [availableTimeRanges, defaultTimeRange, setTimeRange, timeRange])

  const selectedQuery =
    {
      '24h': q24h,
      '7d': q7d,
      '1m': q1m,
      '3m': q3m,
      ytd: qytd,
      '1y': q1y,
      all: qall,
    }[timeRange] ?? q1y

  return {
    getChartData,
    isLoading: selectedQuery.isLoading,
  }
}
