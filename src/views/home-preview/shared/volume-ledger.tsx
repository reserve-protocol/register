import { useMemo } from 'react'
import { SERIES, sliceRange, weekly } from '../mock/ugly-cash-series'
import { MetricToggle, RangeTabs } from './activity-controls'
import { CATEGORY_COLORS } from './category-colors'
import { countCompact, usdCompact } from './format'
import { RANGE_LABEL, useActivity } from './use-activity'

const W = 160
const H = 40

const sparkPath = (values: number[]) => {
  const max = Math.max(...values) || 1
  const step = W / (values.length - 1)
  const pts = values.map(
    (v, i) => `${(i * step).toFixed(1)},${(H - (v / max) * (H - 2)).toFixed(1)}`
  )
  return {
    line: `M${pts.join(' L')}`,
    area: `M0,${H} L${pts.join(' L')} L${W},${H} Z`,
  }
}

// A watchlist of transaction types: every type gets its own small trend instead of one big chart.
const VolumeLedger = () => {
  const activity = useActivity('30D')
  const isVolume = activity.metric === 'volume'
  const weeks = useMemo(() => weekly(SERIES), [])

  const rows = useMemo(() => {
    const days = sliceRange(activity.range)
    const prev = SERIES.slice(-days.length * 2, -days.length)
    const total = activity.total || 1
    return activity.byCategory.map((c) => {
      const prevValue = prev.reduce((a, p) => a + p[activity.metric][c.key], 0)
      const change =
        activity.range === 'All' || !prevValue ? null : c.value / prevValue - 1
      return {
        ...c,
        share: c.value / total,
        change,
        spark: sparkPath(weeks.map((w) => w[activity.metric][c.key])),
      }
    })
  }, [activity, weeks])

  const fmt = (v: number) => (isVolume ? usdCompact(v) : countCompact(v))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-xl text-primary">
            Where eUSD moves inside UGLYCASH
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
      <div className="overflow-hidden rounded-4xl border-[4px] border-secondary bg-secondary">
        <table className="w-full border-separate border-spacing-y-1 text-left">
          <caption className="sr-only">
            eUSD {isVolume ? 'volume' : 'transactions'} by type
          </caption>
          <thead className="text-sm text-legend">
            <tr>
              <th className="px-6 py-2 font-normal">Type</th>
              <th className="hidden px-4 py-2 font-normal md:table-cell">
                Trend since launch
              </th>
              <th className="px-4 py-2 text-right font-normal">
                {isVolume ? 'Volume' : 'Transactions'}
              </th>
              <th className="hidden px-4 py-2 font-normal sm:table-cell">
                Share
              </th>
              <th className="px-6 py-2 text-right font-normal">Change</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key} className="bg-background">
                <td className="rounded-l-3xl px-6 py-4">
                  <span className="flex items-center gap-3 text-lg">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ background: CATEGORY_COLORS[r.key] }}
                    />
                    {r.label}
                  </span>
                </td>
                <td className="hidden px-4 py-2 md:table-cell">
                  <svg
                    viewBox={`0 0 ${W} ${H}`}
                    className="h-10 w-40"
                    aria-hidden="true"
                  >
                    <path
                      d={r.spark.area}
                      fill={CATEGORY_COLORS[r.key]}
                      fillOpacity={0.18}
                    />
                    <path
                      d={r.spark.line}
                      fill="none"
                      stroke={CATEGORY_COLORS[r.key]}
                      strokeWidth={1.5}
                    />
                  </svg>
                </td>
                <td className="px-4 py-4 text-right text-xl font-semibold tabular-nums">
                  {fmt(r.value)}
                </td>
                <td className="hidden px-4 py-4 sm:table-cell">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-28 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${r.share * 100}%`,
                          background: CATEGORY_COLORS[r.key],
                        }}
                      />
                    </div>
                    <span className="text-sm text-legend tabular-nums">
                      {Math.round(r.share * 100)}%
                    </span>
                  </div>
                </td>
                <td className="rounded-r-3xl px-6 py-4 text-right tabular-nums">
                  {r.change === null ? (
                    <span className="text-legend">·</span>
                  ) : (
                    <span
                      className={
                        r.change >= 0 ? 'text-success' : 'text-destructive'
                      }
                    >
                      {r.change >= 0 ? '+' : ''}
                      {Math.round(r.change * 100)}%
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default VolumeLedger
