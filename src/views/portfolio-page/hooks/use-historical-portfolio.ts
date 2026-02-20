import { useQuery } from '@tanstack/react-query'
import { RESERVE_API } from '@/utils/constants'
import { formatCurrency } from '@/utils'
import { HistoricalPortfolioResponse, PortfolioPeriod } from '../types'
import { Address } from 'viem'
import { useCallback } from 'react'
import dayjs from 'dayjs'

type ChartDataPoint = { value: number; label: string; display: string }

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
    label: dayjs(point.timestamp * 1000).format('MMM DD, YYYY h:mm A'),
    display: `$${formatCurrency(point.totalHoldingsUSD)}`,
  }))
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
