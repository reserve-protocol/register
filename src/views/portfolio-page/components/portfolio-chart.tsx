import { formatCurrency } from '@/utils'
import { cn } from '@/lib/utils'
import { useAtom } from 'jotai'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowUpRight, ArrowDownRight, Loader } from 'lucide-react'
import dayjs from 'dayjs'
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { portfolioPageTimeRangeAtom } from '../atoms'
import { useHistoricalPortfolio } from '../hooks/use-historical-portfolio'
import { PortfolioPeriod, PortfolioResponse } from '../types'
import { Address } from 'viem'
import { Card } from '@/components/ui/card'

const PERIOD_LABELS: { key: PortfolioPeriod; label: string }[] = [
  { key: '24h', label: '24hr' },
  { key: '7d', label: '7d' },
  { key: '1m', label: '1m' },
  { key: '3m', label: '3m' },
  { key: '6m', label: '6m' },
  { key: 'All', label: 'All time' },
]

const PERIOD_SUFFIX: Record<PortfolioPeriod, string> = {
  '24h': '24H',
  '7d': '7D',
  '1m': '1M',
  '3m': '3M',
  '6m': '6M',
  All: 'All',
}

const formatYAxis = (value: number) => {
  if (value >= 1000) return `$${Math.round(value / 1000)}K`
  if (value === 0) return '0.0'
  return `$${formatCurrency(value, 0)}`
}

type CategoryBreakdown = { label: string; proportion: number }[]

function ChartTooltip({
  payload,
  active,
  breakdown,
}: any & { breakdown: CategoryBreakdown }) {
  if (!active || !payload?.[0]) return null
  const total = payload[0]?.value as number
  const label = payload[0]?.payload?.label as string

  return (
    <Card className="px-4 py-3 min-w-[180px]">
      <p className="text-xs text-legend mb-2">{label}</p>
      <div className="space-y-1.5">
        {breakdown.map((cat: CategoryBreakdown[number]) => {
          const value = total * cat.proportion
          return (
            <div
              key={cat.label}
              className="flex items-center justify-between gap-6"
            >
              <span className="text-xs text-legend">{cat.label}</span>
              <span className="text-xs font-medium tabular-nums">
                ${formatCurrency(value)}
              </span>
            </div>
          )
        })}
      </div>
      <div className="border-t border-border mt-2 pt-2 flex items-center justify-between gap-6">
        <span className="text-xs font-semibold">Total</span>
        <span className="text-sm font-bold tabular-nums">
          ${formatCurrency(total)}
        </span>
      </div>
    </Card>
  )
}

const TimeRangeTabs = ({
  active,
  onChange,
}: {
  active: PortfolioPeriod
  onChange: (p: PortfolioPeriod) => void
}) => (
  <div className="flex items-center bg-muted rounded-2xl p-0.5">
    {PERIOD_LABELS.map(({ key, label }) => (
      <button
        key={key}
        onClick={() => onChange(key)}
        className={cn(
          'px-2.5 py-1.5 text-sm rounded-xl transition-all whitespace-nowrap',
          active === key
            ? 'bg-card text-primary font-medium shadow-[0px_1px_8px_2px_rgba(0,0,0,0.05)]'
            : 'text-foreground hover:text-primary'
        )}
      >
        {label}
      </button>
    ))}
  </div>
)

const CHART_LOADING_TEXTS = [
  'Loading your portfolio data...',
  'Retrieving historical prices...',
  'Calculating performance metrics...',
  'Assembling your chart...',
  'Almost there...',
]

const ChartLoadingSkeleton = () => {
  const [textIndex, setTextIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % CHART_LOADING_TEXTS.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative h-[414px] rounded-2xl bg-muted animate-pulse flex items-center justify-center">
      <div className="flex items-center gap-2 bg-card rounded-full px-4 py-2 text-sm text-primary border border-primary animate-fade-in">
        <Loader size={16} className="animate-spin-slow" />
        {CHART_LOADING_TEXTS[textIndex]}
      </div>
    </div>
  )
}

const PortfolioChart = ({
  data: portfolio,
  address,
}: {
  data: PortfolioResponse
  address: Address
}) => {
  const [timeRange, setTimeRange] = useAtom(portfolioPageTimeRangeAtom)
  const { getChartData, isLoading } = useHistoricalPortfolio(address)

  const chartData = getChartData(timeRange)
  const totalValue = portfolio.totalHoldingsUSD

  const breakdown = useMemo((): CategoryBreakdown => {
    const categories = [
      {
        label: 'Index DTFs',
        value: portfolio.indexDTFs.reduce((s, d) => s + (d.value || 0), 0),
      },
      {
        label: 'Yield DTFs',
        value: portfolio.yieldDTFs.reduce((s, d) => s + (d.value || 0), 0),
      },
      {
        label: 'Staked RSR',
        value: portfolio.stakedRSR.reduce((s, d) => s + (d.value || 0), 0),
      },
      {
        label: 'Vote-locked',
        value: portfolio.voteLocks.reduce((s, d) => s + (d.value || 0), 0),
      },
      {
        label: 'RSR',
        value: portfolio.rsrBalances.reduce((s, d) => s + (d.value || 0), 0),
      },
    ].filter((c) => c.value > 0)

    const total = categories.reduce((s, c) => s + c.value, 0)
    if (total === 0) return []
    return categories.map((c) => ({
      label: c.label,
      proportion: c.value / total,
    }))
  }, [portfolio])

  const change = useMemo(() => {
    if (!chartData || chartData.length < 2) return null
    const first = chartData[0].value
    const last = chartData[chartData.length - 1].value
    const diff = last - first
    const pct = first > 0 ? (diff / first) * 100 : 0
    return { diff, pct }
  }, [chartData])

  const isPositive = !change || change.pct >= 0

  const formatXAxis = useCallback(
    (ts: number) => {
      if (timeRange === '24h') return dayjs(ts).format('HH:mm')
      return dayjs(ts).format('DD MMM')
    },
    [timeRange]
  )

  return (
    <div>
      {/* Top row: Value left, Tabs right */}
      <div className="flex items-start justify-between gap-4">
        <div className="pl-2">
          <h1 className="text-[46px] leading-[50px] font-medium text-primary">
            ${formatCurrency(totalValue)}
          </h1>
          <div className="flex items-center gap-1.5 mt-2">
            {change && (
              <>
                {isPositive ? (
                  <ArrowUpRight size={20} className="text-primary" />
                ) : (
                  <ArrowDownRight size={20} className="text-destructive" />
                )}
                <span
                  className={cn(
                    'text-lg',
                    isPositive ? 'text-primary' : 'text-destructive'
                  )}
                >
                  {formatCurrency(Math.abs(change.pct), 1)}% (
                  {change.diff >= 0 ? '+' : '-'}$
                  {formatCurrency(Math.abs(change.diff))})
                </span>
                <span className="text-sm text-legend ml-1">
                  {PERIOD_SUFFIX[timeRange]}
                </span>
              </>
            )}
          </div>
        </div>
        <TimeRangeTabs active={timeRange} onChange={setTimeRange} />
      </div>

      {/* Chart */}
      {isLoading || !chartData ? (
        <ChartLoadingSkeleton />
      ) : chartData.length === 0 ? (
        <div className="flex items-center justify-center h-[414px] text-legend">
          No data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={414}>
          <AreaChart
            data={chartData}
            margin={{ top: 8, right: 0, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient
                id="portfolioGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={1}
                />
                <stop
                  offset="100%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0.6}
                />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="ts"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }}
              tickFormatter={formatXAxis}
              tickMargin={8}
              minTickGap={60}
            />
            <YAxis
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: 'hsl(var(--legend))' }}
              tickFormatter={formatYAxis}
              width={50}
              tickMargin={4}
            />
            <Tooltip content={<ChartTooltip breakdown={breakdown} />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              strokeWidth={0.5}
              fill="url(#portfolioGradient)"
              fillOpacity={1}
              activeDot={{ r: 4, fill: 'hsl(var(--primary))' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

export default PortfolioChart
