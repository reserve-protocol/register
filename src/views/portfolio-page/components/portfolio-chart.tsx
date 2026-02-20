import AreaChart from '@/components/charts/area/AreaChart'
import { formatCurrency } from '@/utils'
import { useAtom } from 'jotai'
import { portfolioPageTimeRangeAtom } from '../atoms'
import { useHistoricalPortfolio } from '../hooks/use-historical-portfolio'
import { PortfolioPeriod } from '../types'
import { Address } from 'viem'

const TIME_RANGES: Record<string, string> = {
  '24h': '24h',
  '7d': '7d',
  '1m': '1m',
  '3m': '3m',
  '6m': '6m',
  All: 'All',
}

const PortfolioChart = ({
  totalValue,
  address,
}: {
  totalValue: number
  address: Address
}) => {
  const [timeRange, setTimeRange] = useAtom(portfolioPageTimeRangeAtom)
  const { getChartData } = useHistoricalPortfolio(address)

  const chartData = getChartData(timeRange)

  return (
    <div>
      <h1 className="text-3xl font-bold mb-1">
        ${formatCurrency(totalValue)}
      </h1>
      <AreaChart
        data={chartData ?? []}
        title={<span className="text-sm text-legend">Total Portfolio Value</span>}
        timeRange={TIME_RANGES}
        currentRange={timeRange}
        onRangeChange={(range) => setTimeRange(range as PortfolioPeriod)}
        height={200}
      />
    </div>
  )
}

export default PortfolioChart
