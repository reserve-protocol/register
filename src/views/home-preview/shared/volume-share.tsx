import { cn } from '@/lib/utils'
import { useMemo, useState } from 'react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { CATEGORIES, CategoryKey, sliceRange } from '../mock/ugly-cash-series'
import { MetricToggle, RangeTabs } from './activity-controls'
import { CATEGORY_COLORS } from './category-colors'
import { countCompact, shortDate, usd, usdCompact } from './format'
import { glassClass } from './modern-bits'
import { RANGE_LABEL, useActivity } from './use-activity'

const RhythmTooltip = ({
  active,
  payload,
}: {
  active?: boolean
  payload?: { payload: { date: string; total: number } }[]
}) => {
  if (!active || !payload?.length) return null
  const p = payload[0].payload
  return (
    <div className={cn(glassClass, 'px-3 py-2 text-sm')}>
      {shortDate(p.date)} ·{' '}
      <span className="font-semibold">{usd(p.total)}</span>
    </div>
  )
}

// One bar that splits a dollar of activity by type, plus a small strip of the daily rhythm.
const VolumeShare = () => {
  const activity = useActivity('30D')
  const [hover, setHover] = useState<CategoryKey | null>(null)
  const isVolume = activity.metric === 'volume'
  const fmt = (v: number) => (isVolume ? usdCompact(v) : countCompact(v))
  const total = activity.total || 1
  const ordered = CATEGORIES.map(
    (c) => activity.byCategory.find((b) => b.key === c.key)!
  )

  const rhythm = useMemo(
    () =>
      sliceRange(
        activity.range === 'All' ||
          activity.range === 'YTD' ||
          activity.range === '6M'
          ? '30D'
          : activity.range
      ).map((p) => ({
        date: p.date,
        total: p.totalVolume,
        ...p.volume,
      })),
    [activity.range]
  )
  const days = sliceRange(activity.range).length
  const busiest = rhythm.reduce(
    (a, b) => (b.total > a.total ? b : a),
    rhythm[0]
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-xl text-primary">
            What people do with eUSD in UGLYCASH
          </h2>
          <p className="mt-2 text-4xl font-semibold text-primary tabular-nums">
            {fmt(activity.total)}
            <span className="ml-3 text-lg font-light text-legend">
              {isVolume ? 'moved' : 'transactions'}{' '}
              {RANGE_LABEL[activity.range]}
            </span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <MetricToggle activity={activity} />
          <RangeTabs activity={activity} />
        </div>
      </div>

      <div
        className="flex h-16 w-full overflow-hidden rounded-2xl"
        role="img"
        aria-label="Share of activity by type"
      >
        {ordered.map((c) => (
          <div
            key={c.key}
            onMouseEnter={() => setHover(c.key)}
            onMouseLeave={() => setHover(null)}
            className={cn(
              'flex min-w-0 items-end p-2 transition-opacity',
              hover && hover !== c.key && 'opacity-40'
            )}
            style={{
              width: `${(c.value / total) * 100}%`,
              background: CATEGORY_COLORS[c.key],
            }}
          />
        ))}
      </div>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-6">
        {ordered.map((c) => (
          <div
            key={c.key}
            onMouseEnter={() => setHover(c.key)}
            onMouseLeave={() => setHover(null)}
            className={cn(
              'flex flex-col gap-1 transition-opacity',
              hover && hover !== c.key && 'opacity-40'
            )}
          >
            <dt className="flex items-center gap-2 text-sm text-legend">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: CATEGORY_COLORS[c.key] }}
              />
              {c.label}
            </dt>
            <dd className="text-2xl font-semibold tabular-nums">
              {fmt(c.value)}
            </dd>
            <dd className="text-sm text-legend tabular-nums">
              {Math.round((c.value / total) * 100)}%
            </dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-6 rounded-3xl bg-secondary/50 p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:items-center">
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-sm text-legend">Average day</p>
            <p className="text-2xl font-semibold tabular-nums">
              {fmt(activity.total / days)}
            </p>
          </div>
          <div>
            <p className="text-sm text-legend">Busiest recent day</p>
            <p className="text-2xl font-semibold tabular-nums">
              {usdCompact(busiest.total)}{' '}
              <span className="text-base font-light text-legend">
                on {shortDate(busiest.date)}
              </span>
            </p>
          </div>
        </div>
        <div className="h-[120px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={rhythm}
              margin={{ top: 4, right: 0, bottom: 0, left: 0 }}
              barCategoryGap="20%"
            >
              <XAxis dataKey="date" hide />
              <Tooltip
                content={<RhythmTooltip />}
                cursor={{ fill: 'hsl(var(--primary))', fillOpacity: 0.06 }}
              />
              {CATEGORIES.map((c) => (
                <Bar
                  key={c.key}
                  dataKey={c.key}
                  stackId="r"
                  fill={CATEGORY_COLORS[c.key]}
                  fillOpacity={hover && hover !== c.key ? 0.15 : 1}
                  isAnimationActive={false}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default VolumeShare
