import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/utils'
import { TrendingUp } from 'lucide-react'
import { useMemo } from 'react'
import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend
} from 'recharts'

interface MonthlyData {
  month: string
  totalRevenue: number
  ethereumRevenue: number
  baseRevenue: number
  arbitrumRevenue: number
}

interface YieldRevenueOverviewProps {
  monthlyData: MonthlyData[]
  totalRevenue: number
  holdersRevenue: number
  stakersRevenue: number
  rsrPrice: number
  isLoading: boolean
}

const YieldRevenueOverview = ({
  monthlyData,
  totalRevenue,
  holdersRevenue,
  stakersRevenue,
  rsrPrice,
  isLoading
}: YieldRevenueOverviewProps) => {
  // Format value for tooltip
  const formatTooltipValue = (value: number) => {
    return `$${formatCurrency(value, 0)}`
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-mono">{formatTooltipValue(entry.value)}</span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  // Calculate average monthly revenue (difference between consecutive months)
  const averageMonthlyRevenue = useMemo(() => {
    if (!monthlyData || monthlyData.length < 2) return 0

    let totalMonthlyRevenue = 0
    let monthCount = 0

    for (let i = 1; i < monthlyData.length; i++) {
      const currentRevenue = monthlyData[i].totalRevenue
      const previousRevenue = monthlyData[i - 1].totalRevenue
      const monthlyRevenue = currentRevenue - previousRevenue

      if (monthlyRevenue > 0) {
        totalMonthlyRevenue += monthlyRevenue
        monthCount++
      }
    }

    return monthCount > 0 ? totalMonthlyRevenue / monthCount : 0
  }, [monthlyData])

  return (
    <Card className="border-2 border-secondary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="rounded-full border border-foreground p-2">
            <TrendingUp size={16} />
          </div>
          Revenue Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[400px]" />
        ) : (
          <div className="space-y-6">
            {/* Chart */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  Cumulative Revenue (Last 12 Months)
                </p>
                <span className="text-sm text-muted-foreground">
                  Avg Monthly: ${formatCurrency(averageMonthlyRevenue, 0)}
                </span>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                    tickFormatter={(value) => `$${formatCurrency(value, 0)}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: '12px' }}
                    iconType="line"
                  />

                  {/* Total Revenue - Main line */}
                  <Line
                    type="monotone"
                    dataKey="totalRevenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={false}
                    name="Total"
                  />

                  {/* Per-chain lines */}
                  <Line
                    type="monotone"
                    dataKey="ethereumRevenue"
                    stroke="#627eea"
                    strokeWidth={2}
                    dot={false}
                    name="Ethereum"
                    strokeDasharray="5 5"
                  />
                  <Line
                    type="monotone"
                    dataKey="baseRevenue"
                    stroke="#0052ff"
                    strokeWidth={2}
                    dot={false}
                    name="Base"
                    strokeDasharray="5 5"
                  />
                  <Line
                    type="monotone"
                    dataKey="arbitrumRevenue"
                    stroke="#ff7a00"
                    strokeWidth={2}
                    dot={false}
                    name="Arbitrum"
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Revenue Breakdown */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Revenue Distribution</h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm text-muted-foreground">Holders</span>
                  </div>
                  <p className="text-xl font-semibold">
                    ${formatCurrency(holdersRevenue, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {totalRevenue > 0 ? ((holdersRevenue / totalRevenue) * 100).toFixed(1) : '0'}% of total
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-sm text-muted-foreground">Stakers</span>
                  </div>
                  <p className="text-xl font-semibold">
                    ${formatCurrency(stakersRevenue, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {totalRevenue > 0 ? ((stakersRevenue / totalRevenue) * 100).toFixed(1) : '0'}% of total
                  </p>
                </div>
              </div>

              {/* Current Month Stats */}
              <div className="pt-4 border-t grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Latest Total</p>
                  <p className="text-sm font-semibold">
                    ${formatCurrency(monthlyData[monthlyData.length - 1]?.totalRevenue || 0, 0)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">RSR Price</p>
                  <p className="text-sm font-semibold">
                    ${rsrPrice.toFixed(4)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default YieldRevenueOverview