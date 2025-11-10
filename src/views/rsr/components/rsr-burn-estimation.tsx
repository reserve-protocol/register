import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Slider } from '@/components/ui/slider'
import { formatCurrency } from '@/utils'
import {
  Flame,
  TrendingUp,
  Calculator,
  DollarSign,
  Activity,
  Target,
  Info
} from 'lucide-react'
import { useState, useMemo } from 'react'
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts'
import { ChartContainer, ChartConfig } from '@/components/ui/chart'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'
import { useRSRBurnCalculator } from '../hooks/use-index-revenue-enhanced'

interface RSRBurnEstimationProps {
  metrics: any
  rsrPrice: number
  loading?: boolean
}

const chartConfig = {
  burned: {
    label: 'RSR Burned',
    color: 'hsl(var(--destructive))',
  },
  projected: {
    label: 'Projected',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig

const RSRBurnEstimation = ({ metrics, rsrPrice, loading }: RSRBurnEstimationProps) => {
  // Calculator states
  const [tvlSlider, setTvlSlider] = useState(metrics.totalTVL || 10000000) // $10M default
  const [mintingVolumeSlider, setMintingVolumeSlider] = useState(1000000) // $1M monthly default

  const calculateBurn = useRSRBurnCalculator(metrics)

  // Calculate projections based on sliders
  const projections = useMemo(() => {
    return calculateBurn(tvlSlider, mintingVolumeSlider, rsrPrice)
  }, [calculateBurn, tvlSlider, mintingVolumeSlider, rsrPrice])

  // Prepare chart data for historical burns (using same filtered data as table)
  const burnChartData = useMemo(() => {
    if (!metrics.historicalBurns || metrics.historicalBurns.length === 0) {
      // No burns found, return empty array
      return []
    }

    // Group burns by month (using filtered burns that are >= 1000 RSR)
    const burnsByMonth: Record<string, number> = {}
    metrics.historicalBurns.forEach((burn: any) => {
      // Burns are already filtered in the hook (>= 1000 RSR)
      const monthKey = burn.date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
      burnsByMonth[monthKey] = (burnsByMonth[monthKey] || 0) + burn.amountRSR
    })

    // Sort by date and take last 6 months
    const sortedMonths = Object.entries(burnsByMonth)
      .sort((a, b) => {
        // Parse month-year to sort chronologically
        const dateA = new Date(a[0])
        const dateB = new Date(b[0])
        return dateA.getTime() - dateB.getTime()
      })
      .slice(-6)
      .map(([month, burned]) => ({
        month,
        burned,
      }))

    return sortedMonths
  }, [metrics.historicalBurns])

  // Prepare projection chart data
  const projectionChartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    const baseProjection = metrics.monthlyRsrBurnAmountProjection || 0
    const growthRate = metrics.revenueGrowthRate || 0.15

    return months.map((month, i) => ({
      month,
      conservative: baseProjection * Math.pow(1 + growthRate * 0.5, i),
      expected: baseProjection * Math.pow(1 + growthRate, i),
      optimistic: baseProjection * Math.pow(1 + growthRate * 1.5, i),
    }))
  }, [metrics])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[400px]" />
        <Skeleton className="h-[200px]" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header Section */}
      <Card className="border-2 border-secondary">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <div className="border rounded-full border-foreground p-2">
                <Flame className="h-4 w-4 text-destructive" />
              </div>
              RSR Burn Overview
            </span>
            <span className="px-2 py-1 text-xs font-mono bg-secondary rounded-md">
              5¢ per $1 Revenue
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="h-4 w-4 text-destructive" />
                <span className="text-sm font-medium">Monthly Burn (USD)</span>
              </div>
              <p className="text-2xl font-bold">
                ${formatCurrency(metrics.monthlyRsrBurnProjection, 0)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Index DTF portion
              </p>
            </div>

            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Monthly Burn (RSR)</span>
              </div>
              <p className="text-2xl font-bold">
                {formatCurrency(metrics.monthlyRsrBurnAmountProjection, 0)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                @ ${rsrPrice.toFixed(4)}/RSR
              </p>
            </div>

            <div className="p-4 rounded-lg bg-secondary">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">Annual Projection</span>
              </div>
              <p className="text-2xl font-bold">
                ${formatCurrency(metrics.monthlyRsrBurnProjection * 12, 0)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatCurrency(metrics.monthlyRsrBurnAmountProjection * 12, 0)} RSR/year
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Note about burn sources */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-blue-500 mt-0.5" />
          <div className="text-sm space-y-1">
            <p className="font-medium">About RSR Burns:</p>
            <p className="text-muted-foreground">
              The protocol burns 5¢ worth of RSR for every $1 of revenue generated. Historical burns shown below
              include ALL protocol revenue (Index DTFs, Yield DTFs, and other sources). The projections above show
              only the Index DTF contribution to RSR burns.
            </p>
          </div>
        </div>
      </div>

      {/* Historical Burns Chart and Table */}
      <Card className="border-2 border-secondary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="border rounded-full border-foreground p-2">
              <Activity className="h-4 w-4" />
            </div>
            RSR Burn History (All Protocol Revenue)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Line Chart */}
            <div>
              <h3 className="text-sm font-medium mb-3">Monthly Burns (≥1000 RSR)</h3>
              {burnChartData.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={burnChartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="month"
                      className="text-xs"
                    />
                    <YAxis
                      className="text-xs"
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                              <p className="text-xs font-medium mb-1">{payload[0].payload.month}</p>
                              <p className="text-xs">
                                <span className="text-muted-foreground">Burned: </span>
                                <span className="font-bold">
                                  {formatCurrency(payload[0].value || 0, 0)} RSR
                                </span>
                              </p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="burned"
                      stroke={chartConfig.burned.color}
                      strokeWidth={2}
                      dot={{ fill: chartConfig.burned.color, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center border rounded-lg bg-muted/10">
                <p className="text-sm text-muted-foreground">No significant burns to display</p>
              </div>
            )}
            </div>

            {/* Recent Transactions Table */}
            <div>
              <h3 className="text-sm font-medium mb-3">Recent Transactions</h3>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Date</TableHead>
                      <TableHead className="text-xs text-right">RSR</TableHead>
                      <TableHead className="text-xs text-right">USD</TableHead>
                      <TableHead className="text-xs text-center">Tx</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(metrics.historicalBurns && metrics.historicalBurns.length > 0) ? (
                      metrics.historicalBurns.slice(0, 5).map((burn: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="text-xs">
                            {burn.date.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: '2-digit'
                            })}
                          </TableCell>
                          <TableCell className="text-xs text-right font-mono">
                            {formatCurrency(burn.amountRSR, 0)}
                          </TableCell>
                          <TableCell className="text-xs text-right font-mono">
                            ${formatCurrency(burn.amountUSD, 0)}
                          </TableCell>
                          <TableCell className="text-xs text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2"
                              onClick={() => window.open(`https://etherscan.io/tx/${burn.txHash}`, '_blank')}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-xs text-muted-foreground py-4">
                          No significant burn transactions (≥1000 RSR) found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Burn Calculator */}
      <Card className="border-2 border-secondary">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <div className="border rounded-full border-foreground p-2">
                <Calculator className="h-4 w-4" />
              </div>
              RSR Burn Calculator
            </span>
            <span className="px-2 py-1 text-xs bg-secondary rounded-md">Interactive</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-muted/30 rounded-lg">
            <div className="flex items-start gap-2 mb-4">
              <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="text-sm text-muted-foreground space-y-1">
                <p>
                  Adjust TVL and minting volume to see projected RSR burns. Based on average fees:
                  Minting {metrics.weightedMintingFee?.toFixed(2) || '0.30'}%, TVL {metrics.weightedTvlFee?.toFixed(2) || '2.00'}% annual
                </p>
                <p className="font-medium">
                  RSR burn = 5 cents per dollar of total revenue (5% of all revenue generated).
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* TVL Slider */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium">DTF Total Value Locked (TVL)</label>
                <span className="text-sm font-mono font-bold">
                  ${formatCurrency(tvlSlider, 0)}
                </span>
              </div>
              <Slider
                value={[tvlSlider]}
                onValueChange={([value]) => setTvlSlider(value)}
                min={1000000}
                max={100000000}
                step={1000000}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>$1M</span>
                <span>$100M</span>
              </div>
            </div>

            {/* Minting Volume Slider */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium">Monthly Minting Volume</label>
                <span className="text-sm font-mono font-bold">
                  ${formatCurrency(mintingVolumeSlider, 0)}
                </span>
              </div>
              <Slider
                value={[mintingVolumeSlider]}
                onValueChange={([value]) => setMintingVolumeSlider(value)}
                min={100000}
                max={10000000}
                step={100000}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>$100k</span>
                <span>$10M</span>
              </div>
            </div>

            {/* Calculation Results */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-sm text-muted-foreground mb-1">Monthly Revenue</p>
                <p className="text-xl font-bold">
                  ${formatCurrency(projections.totalMonthlyRevenue, 0)}
                </p>
                <div className="text-xs text-muted-foreground mt-2 space-y-1">
                  <div>Minting: ${formatCurrency(projections.mintingRevenue, 0)}</div>
                  <div>TVL Fee: ${formatCurrency(projections.tvlRevenue, 0)}</div>
                  <div className="pt-2 text-foreground/60">Platform: ${formatCurrency(projections.platformRevenue, 0)} ({(projections.platformKeep * 100).toFixed(0)}%)</div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-muted-foreground mb-1">Monthly RSR Burn</p>
                <p className="text-xl font-bold text-destructive">
                  {formatCurrency(projections.rsrBurnAmount, 0)} RSR
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  ${formatCurrency(projections.rsrBurnUSD, 0)} USD (5¢ per $1 revenue)
                </p>
              </div>

              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-sm text-muted-foreground mb-1">Annual RSR Burn</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(projections.annualizedBurnAmount, 0)} RSR
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  ${formatCurrency(projections.annualizedBurnUSD, 0)} USD
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Future Projections */}
      <Card className="border-2 border-secondary">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <div className="border rounded-full border-foreground p-2">
                <TrendingUp className="h-4 w-4" />
              </div>
              6-Month Burn Projections
            </span>
            <div className="flex gap-2">
              <span className="px-2 py-1 text-xs text-green-600 border border-green-600 rounded-md">
                Optimistic
              </span>
              <span className="px-2 py-1 text-xs text-blue-600 border border-blue-600 rounded-md">
                Expected
              </span>
              <span className="px-2 py-1 text-xs text-orange-600 border border-orange-600 rounded-md">
                Conservative
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={projectionChartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis
                  className="text-xs"
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="space-y-1">
                            {payload.map((entry: any) => (
                              <div key={entry.dataKey} className="flex justify-between gap-4">
                                <span className="text-xs capitalize">
                                  {entry.dataKey}:
                                </span>
                                <span className="font-bold text-xs">
                                  {formatCurrency(entry.value, 0)} RSR
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="conservative"
                  stroke="#fb923c"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="expected"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="optimistic"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}

export default RSRBurnEstimation
