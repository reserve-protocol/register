import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  ChartLegend,
  ChartPanel,
  useChartInspection,
  type ChartPanelState,
} from '../chart-panel'
import {
  bucketsForPeriod,
  bucketTotal,
  formatCompactValue,
  groupIntoWeeks,
  plotAxis,
  summarizeBuckets,
  toPlotRows,
  type CategoryBucket,
} from '../category-bar-chart-data'

const categories = [
  { key: 'deposits', label: 'Deposits', slot: 1 },
  { key: 'withdrawals', label: 'Withdrawals', slot: 2 },
  { key: 'cardSpends', label: 'Card spends', slot: 3 },
] as const

const buckets: CategoryBucket[] = [
  { start: 1, values: { deposits: 100, withdrawals: 40, cardSpends: 10 } },
  { start: 2, values: { deposits: 50, withdrawals: 20, cardSpends: 5 } },
  {
    start: 3,
    values: { deposits: 30, withdrawals: 0, cardSpends: 1 },
    partial: true,
  },
]

function Harness({ state = 'ready' }: { state?: ChartPanelState }) {
  const inspection = useChartInspection(buckets.length)
  const selected =
    inspection.selectedIndex === undefined
      ? undefined
      : buckets[inspection.selectedIndex]
  const summary = selected
    ? { total: bucketTotal(selected, categories), byCategory: selected.values }
    : summarizeBuckets(buckets, categories)
  return (
    <ChartPanel
      label="Transaction volume"
      value={`$${summary.total}`}
      caption={selected ? `Day ${selected.start}` : 'Last 3 days'}
      state={state}
      emptyMessage="No activity in this period"
      plotLabel="Daily volume by category"
      inspection={inspection}
      summary={`Total $${summary.total}`}
      legend={
        <ChartLegend
          items={categories.map((category) => ({
            key: category.key,
            label: category.label,
            slot: category.slot,
            value: `$${summary.byCategory[category.key] ?? 0}`,
          }))}
        />
      }
    >
      <div data-testid="plot" />
    </ChartPanel>
  )
}

describe('chart panel', () => {
  it('shows the range total until a day is inspected, then that day', () => {
    render(<Harness />)
    const plot = screen.getByRole('group', { name: /daily volume/i })

    expect(screen.getByTestId('chart-panel-value')).toHaveTextContent('$256')
    expect(screen.getByText('Last 3 days')).toBeInTheDocument()

    fireEvent.keyDown(plot, { key: 'ArrowLeft' })
    expect(screen.getByTestId('chart-panel-value')).toHaveTextContent('$31')
    expect(screen.getByText('Day 3')).toBeInTheDocument()

    fireEvent.keyDown(plot, { key: 'ArrowLeft' })
    expect(screen.getByTestId('chart-panel-value')).toHaveTextContent('$75')
    expect(
      screen.getByRole('definition', { name: 'Deposits' })
    ).toHaveTextContent('$50')

    fireEvent.keyDown(plot, { key: 'Home' })
    expect(screen.getByText('Day 1')).toBeInTheDocument()
    fireEvent.keyDown(plot, { key: 'ArrowLeft' })
    expect(screen.getByText('Day 1')).toBeInTheDocument()
    fireEvent.keyDown(plot, { key: 'End' })
    expect(screen.getByText('Day 3')).toBeInTheDocument()

    fireEvent.blur(plot)
    expect(screen.getByTestId('chart-panel-value')).toHaveTextContent('$256')
  })

  it('announces the current reading politely', () => {
    render(<Harness />)
    fireEvent.keyDown(screen.getByRole('group'), { key: 'ArrowRight' })
    const live = screen.getByRole('status')
    expect(live).toHaveAttribute('aria-live', 'polite')
    expect(live).toHaveTextContent('Total $31')
  })

  it('replaces the plot with a message when there is nothing to inspect', () => {
    const { rerender } = render(<Harness state="empty" />)
    expect(screen.queryByRole('group')).toBeNull()
    expect(screen.queryByTestId('plot')).toBeNull()
    expect(screen.getByText('No activity in this period')).toBeInTheDocument()

    rerender(<Harness state="unavailable" />)
    expect(screen.queryByRole('group')).toBeNull()
    expect(screen.getByText('Data unavailable')).toBeInTheDocument()

    rerender(<Harness state="loading" />)
    expect(screen.queryByRole('group')).toBeNull()
    expect(screen.getByTestId('chart-panel')).toHaveAttribute(
      'aria-busy',
      'true'
    )
    expect(screen.queryByTestId('chart-panel-value')).toBeNull()
  })
})

describe('chart inspection', () => {
  it('clears a selection when the data identity changes at the same length', () => {
    const { result, rerender } = renderHook(
      ({ resetKey }) => useChartInspection(30, resetKey),
      { initialProps: { resetKey: 'refresh-1' } }
    )
    act(() => result.current.inspect(12))
    expect(result.current.selectedIndex).toBe(12)

    rerender({ resetKey: 'refresh-1' })
    expect(result.current.selectedIndex).toBe(12)
    rerender({ resetKey: 'refresh-2' })
    expect(result.current.selectedIndex).toBeUndefined()
  })
})

describe('category bar chart data', () => {
  it('totals each category and the range', () => {
    expect(summarizeBuckets(buckets, categories)).toEqual({
      total: 256,
      byCategory: { deposits: 180, withdrawals: 60, cardSpends: 16 },
    })
  })

  it('draws categories below the baseline only in diverging layout', () => {
    expect(toPlotRows(buckets, categories, [])[0]).toMatchObject({
      deposits: 100,
      withdrawals: 40,
    })
    expect(toPlotRows(buckets, categories, ['withdrawals'])[0]).toMatchObject({
      start: 1,
      deposits: 100,
      withdrawals: -40,
      cardSpends: 10,
    })
    expect(toPlotRows(buckets, categories, [])[2]).toMatchObject({
      partial: true,
    })
  })

  it('fits the axis to the tallest stack with clean ticks below it', () => {
    expect(plotAxis(0, 520_000)).toEqual({
      domain: [0, 546_000],
      ticks: [0, 200_000, 400_000],
    })
    expect(plotAxis(0, 3_300_000)).toEqual({
      domain: [0, 3_465_000],
      ticks: [0, 1_000_000, 2_000_000, 3_000_000],
    })
    expect(plotAxis(-140_000, 400_000).ticks).toContain(0)
    expect(plotAxis(0, 0)).toEqual({ domain: [0, 1], ticks: [0] })
  })

  it('groups days into weeks that end on the latest day', () => {
    const days = Array.from({ length: 15 }, (_, index) => ({
      start: index + 1,
      values: { deposits: 1, withdrawals: index },
      partial: index === 14 || undefined,
    }))
    const weeks = groupIntoWeeks(days)
    expect(weeks.map((week) => week.start)).toEqual([2, 9])
    expect(weeks[1]).toEqual({
      start: 9,
      values: { deposits: 7, withdrawals: 8 + 9 + 10 + 11 + 12 + 13 + 14 },
      partial: true,
    })
    expect(weeks[0].partial).toBeUndefined()
  })

  it('keeps daily buckets up to 90 days and switches to weeks beyond', () => {
    const days = Array.from({ length: 400 }, (_, index) => ({
      start: index,
      values: { deposits: 1 },
    }))
    expect(bucketsForPeriod(days, 90)).toHaveLength(90)
    expect(bucketsForPeriod(days, 90)[0].start).toBe(310)
    const year = bucketsForPeriod(days, 365)
    expect(year).toHaveLength(52)
    expect(year.at(-1)).toMatchObject({ start: 393, values: { deposits: 7 } })
    expect(bucketsForPeriod(days.slice(0, 5), 30)).toHaveLength(5)
  })
})

describe('compact values', () => {
  it('formats money and counts compactly without trailing zeros', () => {
    expect(formatCompactValue(13_600_000, { currency: true })).toBe('$13.6M')
    expect(formatCompactValue(500_000, { currency: true })).toBe('$500K')
    expect(formatCompactValue(0, { currency: true })).toBe('$0')
    expect(formatCompactValue(-140_000, { currency: true })).toBe('-$140K')
    expect(formatCompactValue(12_431)).toBe('12.4K')
    expect(formatCompactValue(842)).toBe('842')
  })
})
