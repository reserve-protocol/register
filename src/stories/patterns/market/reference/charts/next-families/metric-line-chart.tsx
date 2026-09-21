import { useEffect, useMemo, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { v1SemanticRoles as roles } from '@/components/design-system-v1/semantic-roles'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import { formatMetricAxis, formatMetricValue } from './metric-formatters'
import { MetricExport } from './metric-export'
import {
  filterRowsToPoints,
  getRangeWindow,
  RangeControl,
  type ReviewRange,
} from './range-control'
import type { HistoricalMetric } from './types'
import { MetricLinePlot } from './yield-price-plot'
import { formatChartTimestamp } from './timestamp-formatters'

const METRIC_DESCRIPTORS: Record<HistoricalMetric['id'], string> = {
  price: 'Price',
  apy: 'APY',
  supply: 'Supply',
  'staked-rsr': 'RSR staked',
}

export function MetricLineChart({
  metric,
  isPricePilot = false,
}: {
  metric: HistoricalMetric
  isPricePilot?: boolean
}) {
  const [range, setRange] = useState<ReviewRange>('30d')
  const [selectedIndex, setSelectedIndex] = useState<number>()
  const isTouchInput = useRef(false)
  const rangeWindow = useMemo(
    () =>
      getRangeWindow(metric.points, range, metric.asOfTimestamp, 'available'),
    [metric.asOfTimestamp, metric.points, range]
  )
  const { points } = rangeWindow
  const selected =
    selectedIndex === undefined ? undefined : points[selectedIndex]
  const value = selected
    ? metric.id === 'price'
      ? formatMetricAxis(metric.id, selected.value)
      : formatMetricValue(metric.id, selected.value)
    : metric.headline
  const date = selected
    ? formatChartTimestamp(selected.timestamp, 'minute')
    : ''
  const csv = metric.csv
    ? {
        ...metric.csv,
        rows: filterRowsToPoints(metric.csv.rows, points),
        filename: `${metric.csv.filename}-${range}.csv`,
      }
    : undefined
  const testId = isPricePilot ? 'yield-price-pilot' : `next-metric-${metric.id}`

  useEffect(() => setSelectedIndex(undefined), [metric.points])

  const moveSelection = (direction: -1 | 1) => {
    if (!points.length) return
    setSelectedIndex((current) =>
      Math.min(
        points.length - 1,
        Math.max(0, (current ?? points.length - 1) + direction)
      )
    )
  }

  return (
    <section
      id={isPricePilot ? 'yield-price-pilot' : undefined}
      data-testid={testId}
      data-metric-id={metric.id}
      data-range={range}
      data-point-count={points.length}
      data-selected-timestamp={selected?.timestamp}
      className={cn(
        'min-w-0 scroll-mt-40 [container-type:inline-size]',
        roles.text.primary
      )}
    >
      <header className="px-6">
        <div className="min-w-0">
          <p
            data-testid={`next-metric-${metric.id}-descriptor`}
            className={cn(type.supporting, roles.text.supporting)}
          >
            {METRIC_DESCRIPTORS[metric.id]}
            {metric.id === 'apy' || metric.id === 'staked-rsr' ? (
              <span className="ml-2">· hyUSD</span>
            ) : null}
          </p>
          <div className="mt-1 flex min-w-0 flex-wrap items-baseline gap-x-2">
            <p
              data-testid={
                isPricePilot
                  ? 'yield-price-value'
                  : `next-metric-${metric.id}-value`
              }
              className={cn(type.body, 'break-words tabular-nums')}
            >
              {value}
            </p>
            {metric.id === 'price' ? (
              <>
                <span
                  aria-hidden="true"
                  className={cn(type.body, roles.text.supporting)}
                >
                  ·
                </span>
                <p
                  data-testid="yield-price-ticker"
                  className={cn(type.body, roles.text.supporting)}
                >
                  hyUSD
                </p>
              </>
            ) : null}
          </div>
          <p
            data-testid={
              isPricePilot
                ? 'yield-price-time'
                : `next-metric-${metric.id}-time`
            }
            className={cn(
              'min-h-5 tabular-nums',
              type.supporting,
              roles.text.supporting
            )}
          >
            {date}
          </p>
        </div>
      </header>

      {points.length ? (
        <div
          role="group"
          tabIndex={0}
          aria-label={`${metric.heading} historical plot. Use left and right arrow keys to inspect values.`}
          onPointerDownCapture={(event) => {
            isTouchInput.current = event.pointerType === 'touch'
          }}
          onPointerMoveCapture={(event) => {
            isTouchInput.current = event.pointerType === 'touch'
          }}
          onKeyDown={(event) => {
            if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
            event.preventDefault()
            moveSelection(event.key === 'ArrowLeft' ? -1 : 1)
          }}
          onBlur={() => setSelectedIndex(undefined)}
          onPointerLeave={(event) => {
            if (event.pointerType === 'mouse') setSelectedIndex(undefined)
          }}
          className={cn(
            'h-52 w-full touch-auto focus-visible:outline-none',
            roles.focus.visibleInset
          )}
        >
          <MetricLinePlot
            metric={metric}
            points={points}
            domain={rangeWindow.domain!}
            selected={selected}
            onInspect={(index) => {
              if (!isTouchInput.current) setSelectedIndex(index)
            }}
          />
        </div>
      ) : (
        <div
          className={cn(
            'flex h-52 items-center justify-center px-6',
            type.supporting,
            roles.text.supporting
          )}
        >
          No data
        </div>
      )}

      <footer className="flex min-w-0 items-center justify-between gap-4 px-6 pt-4">
        <RangeControl
          ranges={
            metric.id === 'apy'
              ? ['7d', '30d', '1y']
              : ['24h', '7d', '30d', '1y']
          }
          disabledReasons={
            metric.id === 'apy'
              ? undefined
              : { '24h': 'Unavailable in this daily capture' }
          }
          value={range}
          className="flex-1"
          onChange={(nextRange) => {
            setRange(nextRange)
            setSelectedIndex(undefined)
          }}
        />
        <MetricExport
          csv={csv}
          csvUnavailableReason={metric.csvUnavailableReason}
          disabledReason={
            !points.length
              ? 'Unavailable when no chart data is present'
              : undefined
          }
        />
      </footer>
      <output className="sr-only" aria-live="polite" aria-atomic="true">
        {`${value}, ${metric.unit}${date ? `, ${date}` : ''}`}
      </output>
    </section>
  )
}
