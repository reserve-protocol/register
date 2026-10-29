import { cn } from '@/lib/utils'
import { useMemo, useState } from 'react'
import { CATEGORIES, CategoryKey, SERIES } from '../mock/ugly-cash-series'
import { countCompact, monthYear, shortDate, usd, usdCompact } from './format'
import { Metric } from './use-activity'

type Cell = { date: string; value: number }

// Months as rows, day of month as columns: the paydays on the 1st and 15th show up as columns.
const VolumeCalendar = () => {
  const [metric, setMetric] = useState<Metric>('volume')
  const [category, setCategory] = useState<CategoryKey | 'all'>('all')
  const [hover, setHover] = useState<Cell | null>(null)

  const { months } = useMemo(() => {
    const byMonth = new Map<string, (Cell | null)[]>()
    for (const p of SERIES) {
      const key = p.date.slice(0, 7)
      if (!byMonth.has(key)) byMonth.set(key, Array(31).fill(null))
      const value =
        category === 'all'
          ? metric === 'volume'
            ? p.totalVolume
            : p.totalCount
          : p[metric][category]
      byMonth.get(key)![Number(p.date.slice(8, 10)) - 1] = {
        date: p.date,
        value,
      }
    }
    const months = [...byMonth.entries()].map(([key, cells]) => {
      const monthMax = Math.max(...cells.map((c) => c?.value ?? 0)) || 1
      return [key, cells, monthMax] as const
    })
    return { months }
  }, [metric, category])

  const fmt = (v: number) => (metric === 'volume' ? usd(v) : countCompact(v, 1))
  const shade = (v: number, monthMax: number) =>
    0.1 + 0.9 * Math.pow(v / monthMax, 2)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <div
          role="group"
          aria-label="Metric"
          className="flex gap-1 rounded-full bg-muted p-1"
        >
          {(['volume', 'count'] as Metric[]).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={metric === m}
              onClick={() => setMetric(m)}
              className={cn(
                'h-8 rounded-full px-3 text-sm',
                metric === m
                  ? 'bg-card font-medium text-primary shadow-sm'
                  : 'text-legend'
              )}
            >
              {m === 'volume' ? 'Volume' : 'Transactions'}
            </button>
          ))}
        </div>
        <div role="group" aria-label="Type" className="flex flex-wrap gap-1">
          {[{ key: 'all' as const, label: 'All types' }, ...CATEGORIES].map(
            (c) => (
              <button
                key={c.key}
                type="button"
                aria-pressed={category === c.key}
                onClick={() => setCategory(c.key)}
                className={cn(
                  'h-8 rounded-full border px-3 text-sm transition-colors',
                  category === c.key
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card hover:border-primary/40'
                )}
              >
                {c.label}
              </button>
            )
          )}
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="mx-auto min-w-[640px] max-w-[980px]">
          <div className="grid grid-cols-[72px_repeat(31,minmax(0,1fr))] gap-[3px] pb-1 text-[11px] text-legend">
            <span />
            {Array.from({ length: 31 }, (_, d) => (
              <span
                key={d}
                className={cn(
                  'text-center',
                  (d === 0 || d === 14) && 'font-semibold text-primary'
                )}
              >
                {d === 0 || d === 14 || d === 30 || (d + 1) % 5 === 0
                  ? d + 1
                  : ''}
              </span>
            ))}
          </div>
          {months.map(([key, cells, monthMax]) => (
            <div
              key={key}
              className="grid grid-cols-[72px_repeat(31,minmax(0,1fr))] gap-[3px] py-[1.5px]"
            >
              <span className="text-xs text-legend">
                {monthYear(`${key}-01`)}
              </span>
              {cells.map((c, d) =>
                c ? (
                  <button
                    key={d}
                    type="button"
                    aria-label={`${shortDate(c.date)}: ${fmt(c.value)}`}
                    onMouseEnter={() => setHover(c)}
                    onFocus={() => setHover(c)}
                    onMouseLeave={() => setHover(null)}
                    className="h-[18px] rounded-[4px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    style={{
                      background: `hsl(212 99% 35% / ${shade(c.value, monthMax)})`,
                    }}
                  />
                ) : (
                  <span key={d} />
                )
              )}
            </div>
          ))}
        </div>
      </div>
      <p className="min-h-6 text-sm text-legend" aria-live="polite">
        {hover ? (
          <>
            <span className="text-foreground">{shortDate(hover.date)}</span> ·{' '}
            {fmt(hover.value)}
          </>
        ) : (
          <>
            Each row is shaded against its own month, so darker means a busier
            day for that month. Hover a day for its total.
          </>
        )}
      </p>
    </div>
  )
}

export const calendarTotal = () =>
  usdCompact(SERIES.reduce((a, p) => a + p.totalVolume, 0))

export default VolumeCalendar
