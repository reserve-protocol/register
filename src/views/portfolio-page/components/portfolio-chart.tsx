import { formatCurrency } from '@/utils'
import { cn } from '@/lib/utils'
import type { MessageDescriptor } from '@lingui/core'
import { msg } from '@lingui/core/macro'
import { Trans, useLingui } from '@lingui/react/macro'
import { useAtom, useAtomValue } from 'jotai'
import { useEffect, useMemo, useState } from 'react'
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
import {
  portfolioAddressAtom,
  portfolioDataAtom,
  portfolioPageTimeRangeAtom,
} from '../atoms'
import {
  appendLivePoint,
  ChartDataPoint,
  useHistoricalPortfolio,
} from '../hooks/use-historical-portfolio'
import { PortfolioPeriod } from '../types'
import { ALL_TIME_RANGES } from '@/views/index-dtf/overview/components/charts/use-available-time-ranges'
import { Card } from '@/components/ui/card'

// Period codes match the DTF Overview time ranges; only 'All time' is wrapped.
const PERIOD_LABELS: {
  key: PortfolioPeriod
  label: string | MessageDescriptor
}[] = ALL_TIME_RANGES.map((range) =>
  range.value === 'all'
    ? { key: 'all', label: msg`All time` }
    : { key: range.value as PortfolioPeriod, label: range.label }
)

// Suffix codes (24H/7D/...) stay untranslated; only 'All' is wrapped.
const PERIOD_SUFFIX: Record<PortfolioPeriod, string | MessageDescriptor> = {
  '24h': '24H',
  '7d': '7D',
  '1m': '1M',
  '3m': '3M',
  ytd: 'YTD',
  '1y': '1Y',
  all: msg`All`,
}

const formatYAxis = (value: number) => {
  if (value >= 1000) return `$${Math.round(value / 1000)}K`
  if (value === 0) return '0.0'
  return `$${formatCurrency(value, 0)}`
}

// Rendering order: bottom→top (reversed in tooltip to match visual top→bottom)
// 'RSR' label is a token symbol and stays untranslated.
const CATEGORIES = [
  { key: 'rsr', label: 'RSR', color: 'hsl(var(--primary))' },
  { key: 'voteLocked', label: msg`Vote-locked`, color: '#e2a735' },
  { key: 'stakedRSR', label: msg`Staked RSR`, color: '#e07044' },
  { key: 'yieldDTFs', label: msg`Yield DTFs`, color: '#2a9d8f' },
  { key: 'indexDTFs', label: msg`Index DTFs`, color: '#4a7ebf' },
] as const

const renderLabel = (
  t: (descriptor: MessageDescriptor) => string,
  label: string | MessageDescriptor
) => (typeof label === 'string' ? label : t(label))

function ChartTooltip({ payload, active, stacked }: any) {
  const { t } = useLingui()
  if (!active || !payload?.[0]) return null
  const point = payload[0]?.payload as ChartDataPoint

  const categories = [...CATEGORIES]
    .reverse()
    .map((c) => ({
      label: renderLabel(t, c.label),
      color: c.color,
      value: point[c.key] as number,
    }))
    .filter((c) => c.value > 0)

  return (
    <Card className="px-4 py-3 min-w-[180px]">
      <p className="text-xs text-legend mb-2">{point.label}</p>
      <div className="space-y-1.5">
        {categories.map((cat) => (
          <div
            key={cat.label}
            className="flex items-center justify-between gap-6"
          >
            <div className="flex items-center gap-1.5">
              {stacked && (
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
              )}
              <span className="text-xs text-legend">{cat.label}</span>
            </div>
            <span className="text-xs font-medium tabular-nums">
              ${formatCurrency(cat.value)}
            </span>
          </div>
        ))}
      </div>
      <div className="border-t border-border mt-2 pt-2 flex items-center justify-between gap-6">
        <span className="text-xs font-semibold">
          <Trans>Total</Trans>
        </span>
        <span className="text-sm font-bold tabular-nums">
          ${formatCurrency(point.value)}
        </span>
      </div>
    </Card>
  )
}

const TimeRangeTabs = ({
  periods,
  active,
  onChange,
}: {
  periods: typeof PERIOD_LABELS
  active: PortfolioPeriod
  onChange: (p: PortfolioPeriod) => void
}) => {
  const { t } = useLingui()
  return (
    <div className="flex items-center bg-muted rounded-2xl p-0.5 w-fit">
      {periods.map(({ key, label }) => (
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
          {renderLabel(t, label)}
        </button>
      ))}
    </div>
  )
}

const CHART_LOADING_TEXTS: MessageDescriptor[] = [
  msg`Loading your portfolio data...`,
  msg`Retrieving historical prices...`,
  msg`Calculating performance metrics...`,
  msg`Assembling your chart...`,
  msg`Almost there...`,
]

const ChartLoadingSkeleton = () => {
  const { t } = useLingui()
  const [textIndex, setTextIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % CHART_LOADING_TEXTS.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative mt-2 h-[406px] rounded-2xl bg-muted animate-pulse flex items-center justify-center">
      <div className="flex items-center gap-2 bg-card rounded-full px-4 py-2 text-sm text-primary border border-primary animate-fade-in">
        <Loader size={16} className="animate-spin-slow" />
        {t(CHART_LOADING_TEXTS[textIndex])}
      </div>
    </div>
  )
}

const PortfolioChart = () => {
  const { t } = useLingui()
  const address = useAtomValue(portfolioAddressAtom)
  const portfolio = useAtomValue(portfolioDataAtom)
  const [timeRange, setTimeRange] = useAtom(portfolioPageTimeRangeAtom)
  const [stacked, setStacked] = useState(false)
  const { getChartData, isLoading, availableTimeRanges } =
    useHistoricalPortfolio(address)

  // Same rule as the DTF Overview: ranges older than the account's history
  // are hidden, since the hook resets any unavailable selection.
  const periods = useMemo(
    () =>
      availableTimeRanges
        ? PERIOD_LABELS.filter(({ key }) =>
            availableTimeRanges.some((r) => r.value === key)
          )
        : PERIOD_LABELS,
    [availableTimeRanges]
  )

  const rawChartData = getChartData(timeRange)
  const chartData = useMemo(
    () =>
      rawChartData && portfolio
        ? appendLivePoint(rawChartData, portfolio)
        : rawChartData,
    [rawChartData, portfolio]
  )
  const totalValue = portfolio?.totalHoldingsUSD ?? 0

  const change = useMemo(() => {
    if (!chartData || chartData.length < 2) return null
    const first = chartData[0].value
    const last = chartData[chartData.length - 1].value
    const diff = last - first
    const pct = first > 0 ? (diff / first) * 100 : 0
    return { diff, pct }
  }, [chartData])

  const isPositive = !change || change.pct >= 0

  const formatXAxis = (ts: number) => {
    if (timeRange === '24h') return dayjs(ts).format('HH:mm')
    return dayjs(ts).format('DD MMM')
  }

  return (
    <div>
      {/* Top row: Value left, Tabs right */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-3 sm:mb-0">
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
                  {renderLabel(t, PERIOD_SUFFIX[timeRange])}
                </span>
              </>
            )}
          </div>
        </div>
        <TimeRangeTabs
          periods={periods}
          active={timeRange}
          onChange={(p) => {
            setTimeRange(p)
            setStacked(false)
          }}
        />
      </div>

      {/* Chart */}
      {isLoading || !chartData ? (
        <ChartLoadingSkeleton />
      ) : chartData.length === 0 ? (
        <div className="flex items-center justify-center h-[414px] text-legend">
          <Trans>No data available</Trans>
        </div>
      ) : (
        <div
          onMouseEnter={() => setStacked(true)}
          onMouseLeave={() => setStacked(false)}
          onClick={() => setStacked((s) => !s)}
        >
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
              <Tooltip content={<ChartTooltip stacked={stacked} />} />
              {CATEGORIES.map((cat) => (
                <Area
                  key={cat.key}
                  type="monotone"
                  dataKey={cat.key}
                  stackId="1"
                  stroke="none"
                  fill={cat.color}
                  isAnimationActive={false}
                  style={{
                    fillOpacity: stacked ? 0.5 : 0,
                    transition: 'fill-opacity 300ms ease',
                  }}
                  activeDot={stacked ? { r: 3, fill: cat.color } : false}
                />
              ))}
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={0.5}
                fill="url(#portfolioGradient)"
                isAnimationActive={false}
                style={{
                  fillOpacity: stacked ? 0 : 1,
                  strokeOpacity: stacked ? 0 : 1,
                  transition:
                    'fill-opacity 300ms ease, stroke-opacity 300ms ease',
                }}
                activeDot={
                  stacked ? false : { r: 4, fill: 'hsl(var(--primary))' }
                }
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

export default PortfolioChart
