import RevenuePieChart from './revenue-pie-chart'
import { useMemo } from 'react'

interface RevenueSplitChartProps {
  holdersRevenue: number
  stakersRevenue: number
}

const RevenueSplitChart = ({
  holdersRevenue,
  stakersRevenue,
}: RevenueSplitChartProps) => {
  const data = useMemo(() => {
    return [
      {
        name: 'Yield DTF Holders',
        value: holdersRevenue,
        color: 'hsl(var(--primary))',
      },
      {
        name: 'RSR Stakers',
        value: stakersRevenue,
        color: 'hsl(221, 83%, 53%)',
      },
    ]
  }, [holdersRevenue, stakersRevenue])

  return <RevenuePieChart data={data} height={300} />
}

export default RevenueSplitChart