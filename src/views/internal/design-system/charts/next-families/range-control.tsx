import {
  SegmentedControl,
  SegmentedControlItem,
} from '@/components/design-system-v1/segmented-control'
import { cn } from '@/lib/utils'
import { useId } from 'react'

export type ReviewRange =
  | '24h'
  | '7d'
  | '30d'
  | '1m'
  | '3m'
  | 'ytd'
  | '1y'
  | 'all'

export type RangeWindow<T> = {
  points: T[]
  domain?: [number, number]
  isPartialCoverage: boolean
  availableFrom?: number
}

export type RangeDomainMode = 'requested' | 'available'

const RANGE_SECONDS: Partial<Record<ReviewRange, number>> = {
  '24h': 86_400,
  '7d': 7 * 86_400,
  '30d': 2_592_000,
}

export function RangeControl({
  ranges,
  disabledReasons = {},
  value,
  onChange,
  className,
}: {
  ranges: ReviewRange[]
  disabledReasons?: Partial<Record<ReviewRange, string>>
  value: ReviewRange
  onChange: (range: ReviewRange) => void
  className?: string
}) {
  const unavailableReasonId = useId()
  const reasonFor = (range: ReviewRange) => disabledReasons[range]

  return (
    <div
      data-testid="historical-range-scrollport"
      className={cn(
        '-mx-1 -my-2.5 min-w-0 overflow-x-auto px-1 py-2.5',
        className
      )}
    >
      <SegmentedControl
        presentation="text-only"
        textOnlyDensity="compact"
        value={value}
        onValueChange={(nextValue) => onChange(nextValue as ReviewRange)}
        aria-label="Historical range"
        className="w-max"
      >
        {ranges.map((range) => {
          const reason = reasonFor(range)
          return (
            <SegmentedControlItem
              key={range}
              value={range}
              disabled={!!reason}
              aria-describedby={
                reason ? `${unavailableReasonId}-${range}` : undefined
              }
              title={reason}
            >
              {range === 'all' ? 'All' : range.toUpperCase()}
            </SegmentedControlItem>
          )
        })}
      </SegmentedControl>
      {ranges.map((range) => {
        const reason = reasonFor(range)
        return reason ? (
          <span
            key={range}
            id={`${unavailableReasonId}-${range}`}
            className="sr-only"
          >
            {reason}
          </span>
        ) : null
      })}
    </div>
  )
}

export function pointsInRange<T extends { timestamp: number }>(
  points: T[],
  range: ReviewRange,
  asOfTimestamp?: number
) {
  const chronologicalPoints = [...points].sort(
    (left, right) => left.timestamp - right.timestamp
  )
  const resolvedAsOf = asOfTimestamp ?? chronologicalPoints.at(-1)?.timestamp
  if (resolvedAsOf === undefined) return chronologicalPoints
  if (range === 'all') return chronologicalPoints
  const start = getRangeStart(range, resolvedAsOf)
  return chronologicalPoints.filter(
    (point) => point.timestamp >= start && point.timestamp <= resolvedAsOf
  )
}

export function getRangeWindow<T extends { timestamp: number }>(
  points: T[],
  range: ReviewRange,
  asOfTimestamp: number,
  domainMode: RangeDomainMode = 'requested'
): RangeWindow<T> {
  const visiblePoints = pointsInRange(points, range, asOfTimestamp)
  const availableFrom = points.reduce<number | undefined>(
    (earliest, point) =>
      earliest === undefined
        ? point.timestamp
        : Math.min(earliest, point.timestamp),
    undefined
  )
  const requestedFirst =
    range === 'all' ? availableFrom : getRangeStart(range, asOfTimestamp)
  const first =
    range === 'all'
      ? availableFrom
      : domainMode === 'available'
        ? visiblePoints[0]?.timestamp
        : requestedFirst
  const last =
    range === 'all' || domainMode === 'available'
      ? visiblePoints.at(-1)?.timestamp
      : asOfTimestamp
  return {
    points: visiblePoints,
    domain:
      first === undefined || last === undefined ? undefined : [first, last],
    isPartialCoverage:
      visiblePoints.length > 0 &&
      requestedFirst !== undefined &&
      availableFrom !== undefined &&
      availableFrom > requestedFirst,
    availableFrom,
  }
}

export function getTimelineTicks(
  domain: [number, number] | undefined,
  width: number
) {
  if (!domain) return []
  const [first, last] = domain
  const ticks =
    width > 500 ? [first, Math.round((first + last) / 2), last] : domain
  return [...new Set(ticks)]
}

export function formatTimelineTick(
  timestamp: number,
  domain: [number, number]
) {
  const date = new Date(timestamp * 1000)
  const firstYear = new Date(domain[0] * 1000).getUTCFullYear()
  const lastYear = new Date(domain[1] * 1000).getUTCFullYear()
  const month = Intl.DateTimeFormat('en', {
    month: 'short',
    timeZone: 'UTC',
  }).format(date)
  const year = firstYear === lastYear ? '' : ` ${date.getUTCFullYear()}`
  return `${date.getUTCDate()} ${month}${year}`
}

export function formatCoverageDate(timestamp: number) {
  const date = new Date(timestamp * 1000)
  const month = Intl.DateTimeFormat('en', {
    month: 'short',
    timeZone: 'UTC',
  }).format(date)
  return `${date.getUTCDate()} ${month} ${date.getUTCFullYear()}`
}

export function filterRowsToPoints(
  rows: Record<string, string | number>[],
  points: { timestamp: number }[]
) {
  const timestamps = new Set(points.map((point) => point.timestamp))
  return rows.filter((row) => timestamps.has(Number(row.timestamp)))
}

export function getRangeStart(range: ReviewRange, asOfTimestamp: number) {
  const seconds = RANGE_SECONDS[range]
  if (seconds !== undefined) return asOfTimestamp - seconds

  const asOf = new Date(asOfTimestamp * 1000)
  if (range === 'ytd') return Date.UTC(asOf.getUTCFullYear(), 0, 1) / 1000
  if (range === '1m') return subtractUtcMonths(asOf, 1)
  if (range === '3m') return subtractUtcMonths(asOf, 3)
  if (range === '1y') return subtractUtcYears(asOf, 1)
  return asOfTimestamp
}

function subtractUtcMonths(date: Date, months: number) {
  const totalMonths = date.getUTCFullYear() * 12 + date.getUTCMonth() - months
  const year = Math.floor(totalMonths / 12)
  const month = totalMonths - year * 12
  return withClampedUtcDay(date, year, month)
}

function subtractUtcYears(date: Date, years: number) {
  return withClampedUtcDay(
    date,
    date.getUTCFullYear() - years,
    date.getUTCMonth()
  )
}

function withClampedUtcDay(date: Date, year: number, month: number) {
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
  return (
    Date.UTC(
      year,
      month,
      Math.min(date.getUTCDate(), lastDay),
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds()
    ) / 1000
  )
}
