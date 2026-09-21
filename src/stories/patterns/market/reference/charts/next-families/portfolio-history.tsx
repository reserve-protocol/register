import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/utils'
import { v1SemanticRoles as roles } from '@/components/design-system-v1/semantic-roles'
import {
  v1Typography as type,
  v1TypographyVariants,
} from '@/components/design-system-v1/typography'
import { portfolioPressurePoints } from './fixtures/portfolio-pressure'
import { portfolioPressureAsOfTimestamp } from './fixtures/portfolio-pressure'
import { PortfolioLegend } from './portfolio-legend'
import { describePortfolioPoint } from './portfolio-formatters'
import { PORTFOLIO_CATEGORIES } from './portfolio-categories'
import { getRangeWindow, RangeControl, type ReviewRange } from './range-control'
import { PortfolioHistoryPlot } from './portfolio-history-plot'
import {
  formatChartTimestamp,
  type ChartTimestampPrecision,
} from './timestamp-formatters'
import type { PortfolioSourceState } from './types'

export type { PortfolioSourceState } from './types'

export function PortfolioHistory({
  empty = false,
  sourceState = 'total',
  timestampPrecision = 'day',
}: {
  empty?: boolean
  sourceState?: PortfolioSourceState
  timestampPrecision?: ChartTimestampPrecision
}) {
  const [range, setRange] = useState<ReviewRange>('3m')
  const rangeWindow = getRangeWindow(
    empty ? [] : portfolioPressurePoints,
    range,
    portfolioPressureAsOfTimestamp,
    'available'
  )
  const { points } = rangeWindow
  const [selectedIndex, setSelectedIndex] = useState<number>()
  const isTouchInput = useRef(false)
  const selected =
    selectedIndex === undefined ? points.at(-1) : points[selectedIndex]
  useEffect(() => setSelectedIndex(undefined), [empty, sourceState])

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
      data-testid="next-portfolio-history"
      data-source-state={sourceState}
      data-range={range}
      data-point-count={points.length}
      data-selected-timestamp={selected?.timestamp}
      className={cn('min-w-0 [container-type:inline-size]', roles.text.primary)}
    >
      <header className="grid gap-4 px-6 [@container(min-width:40rem)]:grid-cols-[minmax(0,1fr)_auto]">
        <div className="min-w-0">
          <p className={cn(type.body, roles.text.supporting)}>
            Portfolio total
          </p>
          <p
            data-testid="next-portfolio-value"
            className={cn(
              'mt-2 break-words tabular-nums',
              v1TypographyVariants.responsivePageTitle
            )}
          >
            {selected ? `$${formatCurrency(selected.value)}` : '—'}
          </p>
          <p
            data-testid="next-portfolio-time"
            className={cn(
              'mt-2 min-h-5 tabular-nums',
              type.supporting,
              roles.text.supporting
            )}
          >
            {selected
              ? formatChartTimestamp(selected.timestamp, timestampPrecision)
              : 'No portfolio history'}
          </p>
        </div>
        <div
          data-testid="next-portfolio-ranges"
          className="min-w-0 pb-2.5 [@container(min-width:40rem)]:justify-self-end [@container(min-width:40rem)]:pb-0"
        >
          <RangeControl
            ranges={['24h', '7d', '1m', '3m', 'ytd', '1y', 'all']}
            disabledReasons={{
              '24h': 'Unavailable in this weekly capture',
            }}
            value={range}
            onChange={(nextRange) => {
              setRange(nextRange)
              setSelectedIndex(undefined)
            }}
          />
        </div>
      </header>

      {points.length ? (
        <div
          role="group"
          tabIndex={0}
          aria-label="Portfolio value and category history. Use left and right arrow keys to inspect values."
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
            'h-72 w-full touch-auto focus-visible:outline-none sm:h-80',
            roles.focus.visibleInset
          )}
        >
          <PortfolioHistoryPlot
            points={points}
            domain={rangeWindow.domain!}
            selected={selected}
            selectedIndex={selectedIndex}
            sourceState={sourceState}
            isTouchInput={isTouchInput}
            onInspect={setSelectedIndex}
          />
        </div>
      ) : (
        <div
          className={cn(
            'flex h-72 items-center justify-center px-6 sm:h-80',
            type.supporting,
            roles.text.supporting
          )}
        >
          No data available
        </div>
      )}

      <PortfolioLegend categories={PORTFOLIO_CATEGORIES} selected={selected} />
      <output className="sr-only" aria-live="polite" aria-atomic="true">
        {selected
          ? describePortfolioPoint(
              selected,
              PORTFOLIO_CATEGORIES,
              timestampPrecision
            )
          : 'Portfolio history unavailable'}
      </output>
    </section>
  )
}
