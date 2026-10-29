import { cn } from '@/lib/utils'
import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  CATEGORIES,
  CategoryKey,
  DayPoint,
  SERIES,
} from '../mock/ugly-cash-series'
import { CATEGORY_COLORS } from './category-colors'
import { shortDate, usd, usdCompact } from './format'
import { glassClass } from './modern-bits'

const SubplotTooltip = ({
  active,
  payload,
}: {
  active?: boolean
  payload?: { payload: DayPoint }[]
}) => {
  if (!active || !payload?.length) return null
  const p = payload[0].payload
  return (
    <div className={cn(glassClass, 'min-w-[220px] px-4 py-3 text-sm')}>
      <p className="mb-2">{shortDate(p.date)}</p>
      {[...CATEGORIES].reverse().map((c) => (
        <div key={c.key} className="flex justify-between gap-6">
          <span className="flex items-center gap-2 text-legend">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: CATEGORY_COLORS[c.key] }}
            />
            {c.label}
          </span>
          <span className="tabular-nums">{usd(p.volume[c.key])}</span>
        </div>
      ))}
      <div className="mt-2 flex justify-between border-t border-border pt-2 font-semibold">
        <span>Total</span>
        <span className="tabular-nums text-primary">{usd(p.totalVolume)}</span>
      </div>
    </div>
  )
}

// A short volume strip on the hero's time axis, the way trading charts put volume under price.
const VolumeSubplot = () => {
  const [focus, setFocus] = useState<CategoryKey | null>(null)
  const rows = useMemo(() => SERIES.map((p) => ({ ...p, ...p.volume })), [])
  return (
    <div className="border-t-2 border-secondary">
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 pt-4 sm:px-10">
        <p className="text-sm">
          <span className="text-legend">Daily eUSD volume by type · </span>
          <span className="font-semibold tabular-nums">
            {usdCompact(SERIES.reduce((a, p) => a + p.totalVolume, 0))} since
            launch
          </span>
        </p>
        <div
          role="group"
          aria-label="Isolate a type"
          className="flex flex-wrap gap-1"
        >
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              type="button"
              aria-pressed={focus === c.key}
              onClick={() => setFocus(focus === c.key ? null : c.key)}
              className={cn(
                'flex h-7 items-center gap-1.5 rounded-full px-2.5 text-xs transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                focus === c.key ? 'bg-card' : 'hover:bg-card/70',
                focus && focus !== c.key && 'opacity-40'
              )}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: CATEGORY_COLORS[c.key] }}
              />
              {c.label}
            </button>
          ))}
        </div>
      </div>
      <div className="h-[96px] sm:h-[120px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={rows}
            margin={{ top: 8, right: 1, bottom: 0, left: 0 }}
            barCategoryGap={0}
          >
            <XAxis dataKey="date" hide />
            <YAxis hide domain={[0, 'dataMax']} />
            <Tooltip
              content={<SubplotTooltip />}
              cursor={{ fill: 'hsl(var(--primary))', fillOpacity: 0.08 }}
              wrapperStyle={{ zIndex: 1000 }}
            />
            {CATEGORIES.map((c) => (
              <Bar
                key={c.key}
                dataKey={c.key}
                stackId="v"
                fill={CATEGORY_COLORS[c.key]}
                fillOpacity={focus && focus !== c.key ? 0.12 : 1}
                isAnimationActive={false}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default VolumeSubplot
