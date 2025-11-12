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
  // Calculator states - use actual current values as defaults
  // For minting volume, estimate from monthly burn projections
  const estimatedMonthlyMinting = metrics.totalTVL ? metrics.totalTVL * 0.1 : 10000000 // Estimate 10% of TVL as monthly minting

  const [tvlSlider, setTvlSlider] = useState(metrics.totalTVL || 100000000) // Use actual TVL or $100M default
  const [mintingVolumeSlider, setMintingVolumeSlider] = useState(estimatedMonthlyMinting) // Use estimated minting

  const calculateBurn = useRSRBurnCalculator(metrics)

  // Calculate projections based on sliders
  const projections = useMemo(() => {
    return calculateBurn(tvlSlider, mintingVolumeSlider, rsrPrice)
  }, [calculateBurn, tvlSlider, mintingVolumeSlider, rsrPrice])

  // Prepare chart data for historical burns (using unfiltered data for chart)
  const burnChartData = useMemo(() => {
    // Use allHistoricalBurns for chart (includes all burns), fallback to historicalBurns
    const burnsData = metrics.allHistoricalBurns || metrics.historicalBurns || []

    if (!burnsData || burnsData.length === 0) {
      // No burns found, return empty array
      return []
    }

    // Group all burns by month (no filtering for chart)
    const burnsByMonth: Record<string, number> = {}
    burnsData.forEach((burn: any) => {
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
        burned: Math.max(0, burned), // Ensure burns are always positive
      }))

    return sortedMonths
  }, [metrics.allHistoricalBurns, metrics.historicalBurns])

  // Prepare projection chart data
  const projectionChartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    const baseProjection = metrics.monthlyRsrBurnAmountProjection || 0
    // Ensure growth rate is reasonable (cap at 50% monthly growth)
    const growthRate = Math.min(metrics.revenueGrowthRate || 0.10, 0.50)

    return months.map((month, i) => ({
      month,
      // Use compound growth formula for increasing burn projections
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

      {/* RSR Ecosystem Metrics Card */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              RSR Ecosystem Metrics
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-secondary">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">RSR Locked in Governance</span>
              </div>
              <p className="text-2xl font-bold">
                {formatCurrency(metrics.rsrLockedInDTFs || 0, 0)} RSR
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Vote-locked in Index DTFs
              </p>
              <p className="text-xs text-primary mt-2">
                ${formatCurrency((metrics.rsrLockedInDTFs || 0) * rsrPrice, 0)} USD value
              </p>
            </div>

            <div className="p-4 rounded-lg bg-secondary">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="h-4 w-4 text-destructive" />
                <span className="text-sm font-medium">Total RSR Burned</span>
              </div>
              <p className="text-2xl font-bold">
                {formatCurrency(metrics.actualRsrBurned || 0, 0)} RSR
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                All-time from platform fees
              </p>
              <p className="text-xs text-destructive mt-2">
                ${formatCurrency((metrics.actualRsrBurned || 0) * rsrPrice, 0)} USD value
              </p>
            </div>
          </div>

          {/* Monthly Burn Comparison */}
          <div className="mt-4 p-3 bg-primary/5 border border-primary/10 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Monthly Burn Analysis</span>
              <span className="text-xs text-muted-foreground">
                Expected vs Actual
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-muted-foreground">Expected Monthly</span>
                <p className="text-lg font-bold">
                  {formatCurrency(metrics.monthlyRsrBurnAmountProjection || 0, 0)} RSR
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Based on 5¢ per $1 TVL
                </p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Actual Monthly</span>
                <p className="text-lg font-bold">
                  {formatCurrency(metrics.actualMonthlyBurnRate || 0, 0)} RSR
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Recent month average
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div className="p-2 bg-muted rounded">
              <span className="text-muted-foreground">Monthly Actual:</span>
              <p className="font-mono font-bold">{formatCurrency(metrics.actualMonthlyBurnRate || 0, 0)} RSR</p>
            </div>
            <div className="p-2 bg-muted rounded">
              <span className="text-muted-foreground">Monthly Expected:</span>
              <p className="font-mono font-bold">{formatCurrency(metrics.monthlyRsrBurnAmountProjection, 0)} RSR</p>
            </div>
            <div className="p-2 bg-muted rounded">
              <span className="text-muted-foreground">Growth Rate:</span>
              <p className="font-mono font-bold">
                {metrics.revenueGrowthRate > 0
                  ? `+${Math.min(metrics.revenueGrowthRate * 100, 50).toFixed(1)}%`
                  : metrics.revenueGrowthRate < 0
                    ? `${(metrics.revenueGrowthRate * 100).toFixed(1)}%`
                    : '0.0%'
                }
              </p>
            </div>
            <div className="p-2 bg-muted rounded">
              <span className="text-muted-foreground">Data Points:</span>
              <p className="font-mono font-bold">{(metrics.allHistoricalBurns || metrics.historicalBurns)?.length || 0} burns</p>
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
              The protocol burns 5¢ worth of RSR for every $1 of revenue generated from Index DTFs.
              All values shown use current prices for historical calculations. Actual USD values at the time
              of burns may have been different due to price fluctuations.
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
                                  {formatCurrency(Number(payload[0].value) || 0, 0)} RSR
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
                  RSR burn = 5 cents per dollar of TVL annually ($0.05 per $1 TVL/year).
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
                min={10000000}
                max={500000000}
                step={5000000}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>$10M</span>
                <span>$500M</span>
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
                min={1000000}
                max={50000000}
                step={1000000}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>$1M</span>
                <span>$50M</span>
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
                  ${formatCurrency(projections.rsrBurnUSD, 0)} USD (5¢ per $1 TVL/year)
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

      {/* Advanced Projections to $1B TVL Target with RSR Price Increase */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <div className="border rounded-full border-foreground p-2">
                <TrendingUp className="h-4 w-4" />
              </div>
              Path to $1B TVL - RSR Burn Projections
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Targets:</span>
              <span className="px-2 py-1 text-xs font-mono bg-green-500/10 text-green-600 rounded-md">
                $1B TVL
              </span>
              <span className="px-2 py-1 text-xs font-mono bg-purple-500/10 text-purple-600 rounded-md">
                RSR $0.10
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-3 bg-muted/30 rounded-lg space-y-2">
            <p className="text-sm text-muted-foreground">
              Projections from current <span className="font-semibold">${formatCurrency(metrics.totalTVL / 1000000, 0)}M</span> to{' '}
              <span className="font-semibold">$1B TVL</span> target
            </p>
            <p className="text-sm text-muted-foreground">
              RSR price projection: <span className="font-semibold">${rsrPrice.toFixed(4)}</span> → <span className="font-semibold">$0.1000</span> ({((0.10 / rsrPrice - 1) * 100).toFixed(0)}% increase)
            </p>
          </div>

          {/* Monthly projection list with advanced calculations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart */}
            <div>
              <h4 className="text-sm font-medium mb-3">Burn & TVL Growth Trajectory</h4>
              <ChartContainer config={chartConfig} className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={Array.from({ length: 12 }, (_, i) => {
                      const date = new Date(Date.now() + i * 30 * 24 * 60 * 60 * 1000)
                      const monthName = date.toLocaleDateString('en-US', { month: 'short' })

                      // Calculate TVL growth to reach exactly $1B at month 12
                      const TARGET_TVL = 1_000_000_000
                      const currentTVL = metrics.totalTVL > 0 ? metrics.totalTVL : 100_000_000
                      const monthsToTarget = 12

                      // Calculate growth rate to reach exactly $1B at month 12
                      const requiredGrowth = Math.pow(TARGET_TVL / currentTVL, 1 / monthsToTarget) - 1
                      const monthlyTVLGrowth = Math.min(requiredGrowth, 0.30) // Cap at 30% monthly for TVL

                      // TVL projection - ensuring we reach $1B at month 12
                      const projectedTVL = i === 11 ? TARGET_TVL : currentTVL * Math.pow(1 + monthlyTVLGrowth, i + 1)

                      // Calculate RSR price increase (from current to $0.10 over 12 months)
                      const currentRSRPrice = rsrPrice > 0 ? rsrPrice : 0.004
                      const targetRSRPrice = 0.10
                      const rsrPriceGrowth = Math.pow(targetRSRPrice / currentRSRPrice, 1 / monthsToTarget) - 1
                      const projectedRSRPrice = currentRSRPrice * Math.pow(1 + rsrPriceGrowth, i + 1)

                      // Calculate progressive platform share based on TVL tranches
                      const calculateProgressivePlatformShare = (tvl: number) => {
                        let totalPlatformRevenue = 0
                        let remainingTVL = tvl

                        // Apply progressive rates tranche by tranche
                        const tranches = [
                          { limit: 100_000_000, rate: 0.50 },
                          { limit: 1_000_000_000, rate: 0.40 },
                          { limit: 10_000_000_000, rate: 0.30 },
                          { limit: 100_000_000_000, rate: 0.20 },
                          { limit: 1_000_000_000_000, rate: 0.10 },
                          { limit: Infinity, rate: 0.05 }
                        ]

                        let previousLimit = 0
                        for (const tranche of tranches) {
                          const trancheSize = Math.min(remainingTVL, tranche.limit - previousLimit)
                          if (trancheSize > 0) {
                            totalPlatformRevenue += trancheSize * tranche.rate
                            remainingTVL -= trancheSize
                            previousLimit = tranche.limit
                          }
                          if (remainingTVL <= 0) break
                        }

                        return totalPlatformRevenue / tvl // Effective platform rate
                      }

                      const effectivePlatformRate = calculateProgressivePlatformShare(projectedTVL)

                      // Calculate minting revenue (assume 20% of TVL growth comes from new mints)
                      const previousTVL = i === 0 ? currentTVL : currentTVL * Math.pow(1 + monthlyTVLGrowth, i - 1)
                      const tvlGrowth = projectedTVL - previousTVL
                      const estimatedMinting = tvlGrowth * 0.2 // 20% of growth from minting
                      const mintingFee = metrics.weightedMintingFee / 100 || 0.003
                      const mintingRevenue = estimatedMinting * mintingFee

                      // Calculate TVL fee revenue
                      const tvlFee = metrics.weightedTvlFee / 100 || 0.02
                      const annualTvlRevenue = projectedTVL * tvlFee
                      const monthlyTvlRevenue = annualTvlRevenue / 12

                      // Total revenue and platform share
                      const totalMonthlyRevenue = mintingRevenue + monthlyTvlRevenue
                      const platformRevenue = totalMonthlyRevenue * effectivePlatformRate

                      // RSR burn based on TVL (5 cents per dollar of TVL annually)
                      // Using PROJECTED RSR price for each month
                      const annualBurnUSD = projectedTVL * 0.05
                      const monthlyBurnUSD = annualBurnUSD / 12
                      const monthlyBurnRSR = projectedRSRPrice > 0 ? monthlyBurnUSD / projectedRSRPrice : 0

                      return {
                        month: monthName,
                        burn: monthlyBurnRSR,
                        tvl: projectedTVL / 1000000, // In millions
                        rsrPrice: projectedRSRPrice,
                        platformRate: effectivePlatformRate * 100, // As percentage
                      }
                    })}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis
                      className="text-xs"
                      yAxisId="left"
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    />
                    <YAxis
                      className="text-xs"
                      yAxisId="right"
                      orientation="right"
                      tickFormatter={(value) => `$${value.toFixed(0)}M`}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                              <p className="text-xs font-medium mb-1">{payload[0].payload.month}</p>
                              <div className="space-y-1">
                                <div className="flex justify-between gap-4">
                                  <span className="text-xs text-destructive">RSR Burn:</span>
                                  <span className="font-bold text-xs">
                                    {formatCurrency(payload[0].payload.burn, 0)} RSR
                                  </span>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span className="text-xs text-primary">TVL:</span>
                                  <span className="font-bold text-xs">
                                    ${formatCurrency(payload[0].payload.tvl, 0)}M
                                  </span>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span className="text-xs text-purple-600">RSR Price:</span>
                                  <span className="font-bold text-xs">
                                    ${payload[0].payload.rsrPrice.toFixed(4)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="burn"
                      stroke={chartConfig.burned.color}
                      strokeWidth={2}
                      dot={{ fill: chartConfig.burned.color, r: 3 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="tvl"
                      stroke={chartConfig.projected.color}
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>

              {/* Fee structure info */}
              <div className="mt-4 p-3 bg-secondary/50 rounded-lg text-xs">
                <p className="font-medium mb-2">Progressive Platform Fee Structure:</p>
                <div className="space-y-1 text-muted-foreground">
                  <div className="flex justify-between">
                    <span>&lt; $100M:</span><span>Platform keeps 50%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>$100M - $1B:</span><span>Platform keeps 40%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>$1B - $10B:</span><span>Platform keeps 30%</span>
                  </div>
                  <div className="flex justify-between font-medium text-primary">
                    <span>At $1B TVL:</span><span>~36% effective rate</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly breakdown */}
            <div>
              <h4 className="text-sm font-medium mb-3">Monthly Breakdown with Revenue Details</h4>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {Array.from({ length: 12 }, (_, i) => {
                  const date = new Date(Date.now() + i * 30 * 24 * 60 * 60 * 1000)
                  const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

                  // Same calculations as in chart - fixed to reach $1B
                  const TARGET_TVL = 1_000_000_000
                  const currentTVL = metrics.totalTVL > 0 ? metrics.totalTVL : 100_000_000
                  const monthsToTarget = 12

                  // TVL growth calculation
                  const requiredGrowth = Math.pow(TARGET_TVL / currentTVL, 1 / monthsToTarget) - 1
                  const monthlyTVLGrowth = Math.min(requiredGrowth, 0.30)
                  const projectedTVL = i === 11 ? TARGET_TVL : currentTVL * Math.pow(1 + monthlyTVLGrowth, i + 1)

                  // RSR price projection
                  const currentRSRPrice = rsrPrice > 0 ? rsrPrice : 0.004
                  const targetRSRPrice = 0.10
                  const rsrPriceGrowth = Math.pow(targetRSRPrice / currentRSRPrice, 1 / monthsToTarget) - 1
                  const projectedRSRPrice = currentRSRPrice * Math.pow(1 + rsrPriceGrowth, i + 1)

                  // Calculate progressive platform share
                  const calculateProgressivePlatformShare = (tvl: number) => {
                    let totalPlatformRevenue = 0
                    let remainingTVL = tvl

                    const tranches = [
                      { limit: 100_000_000, rate: 0.50 },
                      { limit: 1_000_000_000, rate: 0.40 },
                      { limit: 10_000_000_000, rate: 0.30 },
                      { limit: 100_000_000_000, rate: 0.20 },
                      { limit: 1_000_000_000_000, rate: 0.10 },
                      { limit: Infinity, rate: 0.05 }
                    ]

                    let previousLimit = 0
                    for (const tranche of tranches) {
                      const trancheSize = Math.min(remainingTVL, tranche.limit - previousLimit)
                      if (trancheSize > 0) {
                        totalPlatformRevenue += trancheSize * tranche.rate
                        remainingTVL -= trancheSize
                        previousLimit = tranche.limit
                      }
                      if (remainingTVL <= 0) break
                    }

                    return totalPlatformRevenue / tvl
                  }

                  const effectivePlatformRate = calculateProgressivePlatformShare(projectedTVL)

                  // Calculate revenues
                  const previousTVL = i === 0 ? currentTVL : currentTVL * Math.pow(1 + monthlyTVLGrowth, i - 1)
                  const tvlGrowth = projectedTVL - previousTVL
                  const estimatedMinting = tvlGrowth * 0.2
                  const mintingFee = metrics.weightedMintingFee / 100 || 0.003
                  const mintingRevenue = estimatedMinting * mintingFee

                  const tvlFee = metrics.weightedTvlFee / 100 || 0.02
                  const annualTvlRevenue = projectedTVL * tvlFee
                  const monthlyTvlRevenue = annualTvlRevenue / 12

                  const totalMonthlyRevenue = mintingRevenue + monthlyTvlRevenue

                  // RSR burn with PROJECTED price
                  const annualBurnUSD = projectedTVL * 0.05
                  const monthlyBurnUSD = annualBurnUSD / 12
                  const monthlyBurnRSR = projectedRSRPrice > 0 ? monthlyBurnUSD / projectedRSRPrice : 0

                  const isCurrentMonth = i === 0
                  const isTargetReached = projectedTVL >= 1_000_000_000

                  return (
                    <div
                      key={i}
                      className={`p-3 rounded-lg ${
                        isCurrentMonth
                          ? 'bg-primary/10 border border-primary/20'
                          : isTargetReached
                            ? 'bg-green-500/10 border border-green-500/20'
                            : 'bg-muted/50 hover:bg-muted/70 transition-colors'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{monthName}</span>
                          {isCurrentMonth && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                              Current
                            </span>
                          )}
                          {isTargetReached && !isCurrentMonth && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-500 text-white">
                              Target Met
                            </span>
                          )}
                        </div>
                        <p className="font-semibold text-sm">
                          {formatCurrency(monthlyBurnRSR, 0)} RSR
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <div>
                          <span>TVL:</span> <span className="font-medium">${formatCurrency(projectedTVL / 1000000, 0)}M</span>
                        </div>
                        <div>
                          <span>RSR:</span> <span className="font-medium text-purple-600">${projectedRSRPrice.toFixed(4)}</span>
                        </div>
                        <div>
                          <span>Burn USD:</span> <span className="font-medium">${formatCurrency(monthlyBurnUSD, 0)}</span>
                        </div>
                        <div>
                          <span>Platform:</span> <span className="font-medium">{(effectivePlatformRate * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Summary: Total RSR Burns */}
          <div className="mt-6 p-6 rounded-lg bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold flex items-center gap-2">
                  <Flame className="h-5 w-5 text-destructive" />
                  Total 12-Month RSR Burns to $1B TVL
                </h4>
                <p className="text-sm text-muted-foreground mt-2">
                  Accounting for RSR price increase to $0.10 and TVL growth to $1B
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">
                  {formatCurrency(
                    Array.from({ length: 12 }, (_, i) => {
                      // Calculate with proper projections
                      const TARGET_TVL = 1_000_000_000
                      const currentTVL = metrics.totalTVL > 0 ? metrics.totalTVL : 100_000_000
                      const monthsToTarget = 12
                      const requiredGrowth = Math.pow(TARGET_TVL / currentTVL, 1 / monthsToTarget) - 1
                      const monthlyTVLGrowth = Math.min(requiredGrowth, 0.30)
                      const projectedTVL = i === 11 ? TARGET_TVL : currentTVL * Math.pow(1 + monthlyTVLGrowth, i + 1)

                      // RSR price projection
                      const currentRSRPrice = rsrPrice > 0 ? rsrPrice : 0.004
                      const targetRSRPrice = 0.10
                      const rsrPriceGrowth = Math.pow(targetRSRPrice / currentRSRPrice, 1 / monthsToTarget) - 1
                      const projectedRSRPrice = currentRSRPrice * Math.pow(1 + rsrPriceGrowth, i + 1)

                      const annualBurnUSD = projectedTVL * 0.05
                      const monthlyBurnUSD = annualBurnUSD / 12
                      return projectedRSRPrice > 0 ? monthlyBurnUSD / projectedRSRPrice : 0
                    }).reduce((sum, burn) => sum + burn, 0),
                    0
                  )} RSR
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Total burned over 12 months
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default RSRBurnEstimation
