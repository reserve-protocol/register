import { cn } from '@/lib/utils'
import {
  Bar,
  BarChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { CATEGORIES } from '../mock/ugly-cash-series'
import { countCompact, monthYear, shortDate, usd, usdCompact } from './format'
import { Activity } from './use-activity'
import { useReducedMotion } from './use-reduced-motion'

type TooltipProps = {
  active?: boolean
  payload?: { payload: Record<string, number | string> }[]
  activity: Activity
}

const ActivityTooltip = ({ active, payload, activity }: TooltipProps) => {
  if (!active || !payload?.length) return null
  const row = payload[0].payload
  const fmt = (v: number) =>
    activity.metric === 'volume' ? usd(v) : countCompact(v, 1)
  return (
    <div className="flex flex-col border-2 border-muted bg-card rounded-xl min-w-[280px]">
      <div className="flex items-center gap-4 justify-between border-b border-border p-4">
        <span className="text-sm">
          {activity.isDaily
            ? shortDate(String(row.date))
            : `Week of ${shortDate(String(row.date))}`}
        </span>
        <span className="text-legend text-sm">
          ({activity.metric === 'volume' ? 'eUSD volume' : 'transactions'})
        </span>
      </div>
      <div className="flex flex-col gap-1 px-4 py-3">
        {CATEGORIES.map((c) => (
          <div
            key={c.key}
            className={cn(
              'flex items-center justify-between gap-6',
              activity.focus && activity.focus !== c.key && 'text-legend'
            )}
          >
            <span>{c.label}:</span>
            <span className="font-bold tabular-nums">
              {fmt(Number(row[c.key]))}
            </span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-border p-4">
        <span>Total:</span>
        <span className="text-primary font-bold tabular-nums">
          {fmt(Number(row.total))}
        </span>
      </div>
    </div>
  )
}

const ActivityChart = ({
  activity,
  showAxis = true,
  className,
}: {
  activity: Activity
  showAxis?: boolean
  className?: string
}) => {
  const reduced = useReducedMotion()
  const fmtAxis = (v: number) =>
    activity.metric === 'volume' ? usdCompact(v, 0) : countCompact(v, 0)

  return (
    <div className={cn('h-[320px] w-full sm:h-[380px]', className)}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          key={`${activity.range}-${activity.metric}`}
          data={activity.rows}
          margin={{ top: 28, right: 0, bottom: 0, left: 0 }}
          barCategoryGap={activity.rows.length > 60 ? 0 : '18%'}
        >
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            minTickGap={48}
            tick={{ fill: 'hsl(var(--legend))', fontSize: 12 }}
            tickFormatter={(d: string) =>
              activity.isDaily
                ? shortDate(d).replace(/, \d{4}$/, '')
                : monthYear(d)
            }
            hide={!showAxis}
          />
          <YAxis
            orientation="right"
            tickLine={false}
            axisLine={false}
            width={56}
            tick={{ fill: 'hsl(var(--legend))', fontSize: 12 }}
            tickFormatter={fmtAxis}
            hide={!showAxis}
          />
          <Tooltip
            cursor={{ fill: 'hsl(var(--primary))', fillOpacity: 0.06 }}
            content={<ActivityTooltip activity={activity} />}
            wrapperStyle={{ zIndex: 1000 }}
          />
          {CATEGORIES.map((c, i) => (
            <Bar
              key={c.key}
              dataKey={c.key}
              stackId="a"
              fill="hsl(var(--tvl))"
              fillOpacity={
                activity.focus && activity.focus !== c.key ? 0.14 : 1
              }
              radius={
                i === CATEGORIES.length - 1 && activity.rows.length <= 60
                  ? [3, 3, 0, 0]
                  : 0
              }
              isAnimationActive={!reduced}
              animationDuration={700}
            />
          ))}
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
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export const CategoryChips = ({ activity }: { activity: Activity }) => {
  const total = activity.total || 1
  return (
    <div
      role="group"
      aria-label="Highlight a category"
      className="flex flex-wrap gap-2"
    >
      {activity.byCategory.map((c) => {
        const active = activity.focus === c.key
        return (
          <button
            key={c.key}
            type="button"
            aria-pressed={active}
            onClick={() => activity.setFocus(active ? null : c.key)}
            className={cn(
              'flex h-9 items-center gap-2 rounded-full border px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              active
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card hover:border-primary/40'
            )}
          >
            <span>{c.label}</span>
            <span
              className={cn(
                'tabular-nums',
                active ? 'opacity-80' : 'text-legend'
              )}
            >
              {Math.round((c.value / total) * 100)}%
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default ActivityChart
