import { cn } from '@/lib/utils'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { CATEGORIES } from '../mock/ugly-cash-series'
import { CATEGORY_COLORS } from './category-colors'
import { countCompact, monthYear, shortDate, usd, usdCompact } from './format'
import { Activity } from './use-activity'
import { useReducedMotion } from './use-reduced-motion'

const Swatch = ({ color }: { color: string }) => (
  <span
    aria-hidden="true"
    className="h-2.5 w-2.5 shrink-0 rounded-full"
    style={{ background: color }}
  />
)

const ColorTooltip = ({
  active,
  payload,
  activity,
}: {
  active?: boolean
  payload?: { payload: Record<string, number | string> }[]
  activity: Activity
}) => {
  if (!active || !payload?.length) return null
  const row = payload[0].payload
  const fmt = (v: number) =>
    activity.metric === 'volume' ? usd(v) : countCompact(v, 1)
  return (
    <div className="flex min-w-[260px] flex-col rounded-2xl border-2 border-card bg-card/80 shadow-[0_20px_70px_rgba(0,0,0,0.12)] backdrop-blur-md">
      <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3 text-sm">
        <span>
          {activity.isDaily
            ? shortDate(String(row.date))
            : `Week of ${shortDate(String(row.date))}`}
        </span>
        <span className="text-legend">
          {activity.metric === 'volume' ? 'eUSD volume' : 'Transactions'}
        </span>
      </div>
      <div className="flex flex-col gap-1.5 px-4 py-3">
        {[...CATEGORIES].reverse().map((c) => (
          <div
            key={c.key}
            className={cn(
              'flex items-center justify-between gap-6',
              activity.focus && activity.focus !== c.key && 'opacity-40'
            )}
          >
            <span className="flex items-center gap-2">
              <Swatch color={CATEGORY_COLORS[c.key]} />
              {c.label}
            </span>
            <span className="font-semibold tabular-nums">
              {fmt(Number(row[c.key]))}
            </span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-border px-4 py-3">
        <span>Total</span>
        <span className="font-bold text-primary tabular-nums">
          {fmt(Number(row.total))}
        </span>
      </div>
    </div>
  )
}

const ColorActivityChart = ({
  activity,
  type = 'bar',
  className,
}: {
  activity: Activity
  type?: 'bar' | 'area'
  className?: string
}) => {
  const reduced = useReducedMotion()
  const fmtAxis = (v: number) =>
    activity.metric === 'volume' ? usdCompact(v, 0) : countCompact(v, 0)
  const dense = activity.rows.length > 60
  const axes = (
    <>
      <XAxis
        dataKey="date"
        tickLine={false}
        axisLine={false}
        minTickGap={48}
        tick={{ fill: 'hsl(var(--legend))', fontSize: 12 }}
        tickFormatter={(d: string) =>
          activity.isDaily ? shortDate(d).replace(/, \d{4}$/, '') : monthYear(d)
        }
      />
      <YAxis
        orientation="right"
        tickLine={false}
        axisLine={false}
        width={56}
        tick={{ fill: 'hsl(var(--legend))', fontSize: 12 }}
        tickFormatter={fmtAxis}
      />
      <Tooltip
        cursor={
          type === 'bar'
            ? { fill: 'hsl(var(--primary))', fillOpacity: 0.06 }
            : {
                stroke: 'hsl(var(--foreground))',
                strokeOpacity: 0.3,
                strokeDasharray: '3 4',
              }
        }
        content={<ColorTooltip activity={activity} />}
        wrapperStyle={{ zIndex: 1000 }}
      />
      {activity.outlierDate && (
        <ReferenceLine
          x={activity.outlierDate}
          stroke="transparent"
          label={{
            value: 'One $1.6M deposit',
            position: 'top',
            fill: 'hsl(var(--legend))',
            fontSize: 12,
          }}
        />
      )}
    </>
  )
  const opacity = (key: string) =>
    activity.focus && activity.focus !== key ? 0.12 : 1

  return (
    <div className={cn('h-[320px] w-full sm:h-[400px]', className)}>
      <ResponsiveContainer width="100%" height="100%">
        {type === 'bar' ? (
          <BarChart
            key={`${activity.range}-${activity.metric}`}
            data={activity.rows}
            margin={{ top: 28, right: 0, bottom: 0, left: 0 }}
            barCategoryGap={dense ? 1 : '18%'}
          >
            {axes}
            {CATEGORIES.map((c, i) => (
              <Bar
                key={c.key}
                dataKey={c.key}
                stackId="a"
                fill={CATEGORY_COLORS[c.key]}
                fillOpacity={opacity(c.key)}
                radius={
                  i === CATEGORIES.length - 1 && !dense ? [3, 3, 0, 0] : 0
                }
                isAnimationActive={!reduced}
                animationDuration={700}
              />
            ))}
          </BarChart>
        ) : (
          <AreaChart
            key={`${activity.range}-${activity.metric}`}
            data={activity.rows}
            margin={{ top: 28, right: 0, bottom: 0, left: 0 }}
          >
            {axes}
            {CATEGORIES.map((c) => (
              <Area
                key={c.key}
                type="monotone"
                dataKey={c.key}
                stackId="a"
                stroke="hsl(var(--background))"
                strokeWidth={1}
                fill={CATEGORY_COLORS[c.key]}
                fillOpacity={opacity(c.key)}
                isAnimationActive={!reduced}
                animationDuration={900}
              />
            ))}
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}

export const ColorLegend = ({
  activity,
  className,
}: {
  activity: Activity
  className?: string
}) => {
  const total = activity.total || 1
  return (
    <div
      role="group"
      aria-label="Isolate a category"
      className={cn('flex flex-wrap gap-2', className)}
    >
      {CATEGORIES.map((c) => {
        const item = activity.byCategory.find((b) => b.key === c.key)!
        const active = activity.focus === c.key
        return (
          <button
            key={c.key}
            type="button"
            aria-pressed={active}
            onClick={() => activity.setFocus(active ? null : c.key)}
            className={cn(
              'flex h-9 items-center gap-2 rounded-full border-2 px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              active
                ? 'border-primary bg-card'
                : 'border-transparent bg-card/70 hover:bg-card',
              activity.focus && !active && 'opacity-50'
            )}
          >
            <Swatch color={CATEGORY_COLORS[c.key]} />
            <span>{c.label}</span>
            <span className="text-legend tabular-nums">
              {Math.round((item.value / total) * 100)}%
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default ColorActivityChart
