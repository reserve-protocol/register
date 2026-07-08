import { useQuery } from '@tanstack/react-query'
import { RESERVE_API } from '@/utils/constants'
import { formatCurrency } from '@/utils'
import {
  HistoricalPortfolioResponse,
  PortfolioPeriod,
  PortfolioResponse,
} from '../types'
import { Address } from 'viem'
import { useCallback } from 'react'
import dayjs from 'dayjs'

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

const useHistoricalPeriod = (
  address: Address | null | undefined,
  period: PortfolioPeriod,
  staleTime: number
) =>
  useQuery({
    queryKey: ['historical-portfolio', address, period],
    queryFn: () => fetchHistoricalPortfolio(address!, period),
    enabled: !!address,
    staleTime,
  })

export const useHistoricalPortfolio = (address?: Address | null) => {
  const q24h = useHistoricalPeriod(address, '24h', 300_000)
  const q7d = useHistoricalPeriod(address, '7d', 60_000)
  const q1m = useHistoricalPeriod(address, '1m', 300_000)
  const q3m = useHistoricalPeriod(address, '3m', 300_000)
  const q6m = useHistoricalPeriod(address, '6m', 300_000)
  const qAll = useHistoricalPeriod(address, 'All', 300_000)

  const queries: Record<
    PortfolioPeriod,
    { data: ChartDataPoint[] | undefined; isLoading: boolean }
  > = {
    '24h': q24h,
    '7d': q7d,
    '1m': q1m,
    '3m': q3m,
    '6m': q6m,
    All: qAll,
  }

  const getChartData = useCallback(
    (period: PortfolioPeriod) => queries[period]?.data ?? null,
    [q24h.data, q7d.data, q1m.data, q3m.data, q6m.data, qAll.data]
  )

  return {
    getChartData,
    isLoading: q7d.isLoading,
  }
}
