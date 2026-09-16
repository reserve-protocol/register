import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { historicalMetrics } from '../fixture-data'
import { portfolioPressurePoints } from '../fixtures/portfolio-pressure'
import { MetricLineChart } from '../metric-line-chart'
import { PortfolioHistory } from '../portfolio-history'
import { describePortfolioPoint } from '../portfolio-formatters'
import { PORTFOLIO_CATEGORIES } from '../portfolio-categories'
import { formatChartTimestamp } from '../timestamp-formatters'
import { NextChartFamiliesReview } from '../review'

beforeAll(() => {
  Object.defineProperty(document, 'fonts', {
    configurable: true,
    value: { ready: Promise.resolve() },
  })
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    width: 640,
    height: 320,
    top: 0,
    right: 640,
    bottom: 320,
    left: 0,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  })
  Object.defineProperty(SVGElement.prototype, 'getBBox', {
    configurable: true,
    value: () => ({ width: 40 }),
  })
  global.ResizeObserver = class ResizeObserver {
    constructor(private callback: ResizeObserverCallback) {}
    observe() {
      this.callback(
        [{ contentRect: { width: 640, height: 320 } } as ResizeObserverEntry],
        this
      )
    }
    unobserve() {}
    disconnect() {}
  }
})

afterAll(() => vi.restoreAllMocks())

describe('next-family partial history presentation', () => {
  it('formats explicit day and minute precision in UTC', () => {
    const timestamp = Date.parse('2026-05-31T23:59:59Z') / 1000

    expect(formatChartTimestamp(timestamp, 'day')).toBe('31 May 2026')
    expect(formatChartTimestamp(timestamp, 'minute')).toBe(
      '31 May 2026 · 23:59'
    )
  })

  it('keeps Portfolio minute precision synchronized across visible and live readouts', () => {
    render(<PortfolioHistory timestampPrecision="minute" />)

    expect(screen.getByTestId('next-portfolio-time')).toHaveTextContent(
      '24 Aug 2026 · 00:00'
    )
    expect(
      screen.getByTestId('next-portfolio-history').querySelector('output')
    ).toHaveTextContent('24 Aug 2026 · 00:00, total $54,270.00')
  })

  it('uses explicit day precision for the Portfolio sentinel and live output', () => {
    const sentinel = portfolioPressurePoints.find(
      (point) => point.timestamp === Date.parse('2026-05-31T23:59:59Z') / 1000
    )!

    expect(formatChartTimestamp(sentinel.timestamp, 'day')).toBe('31 May 2026')
    expect(describePortfolioPoint(sentinel, PORTFOLIO_CATEGORIES)).toContain(
      '31 May 2026, total $0.00'
    )
    expect(
      describePortfolioPoint(sentinel, PORTFOLIO_CATEGORIES)
    ).not.toContain('23:59')
  })

  it('renders Yield inspection timestamps as exact UTC minutes', () => {
    const timestamp = Date.parse('2026-05-31T23:59:59Z') / 1000
    const metric = {
      ...historicalMetrics.find((candidate) => candidate.id === 'price')!,
      asOfTimestamp: timestamp,
      points: [{ timestamp, value: 1.125 }],
    }
    render(<MetricLineChart metric={metric} isPricePilot />)

    fireEvent.keyDown(screen.getByRole('group', { name: /historical plot/ }), {
      key: 'ArrowRight',
    })
    expect(screen.getByTestId('yield-price-time')).toHaveTextContent(
      '31 May 2026 · 23:59'
    )
  })

  it('does not mount a separate missing-history Price specimen', () => {
    render(<NextChartFamiliesReview />)

    expect(
      screen.queryByTestId('next-partial-history-example')
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText('Missing historical coverage')
    ).not.toBeInTheDocument()
  })

  it('keeps ordinary Yield charts on their available bounds', () => {
    const price = historicalMetrics.find((metric) => metric.id === 'price')!
    render(<MetricLineChart metric={price} />)

    const plot = screen.getByRole('group', { name: /historical plot/ })
    const chart = screen.getByTestId('next-metric-price')
    expect(plot).not.toHaveAttribute('aria-describedby')
    expect(
      Array.from(chart.querySelectorAll('.recharts-xAxis text'), (tick) => ({
        label: tick.textContent,
        anchor: tick.getAttribute('text-anchor'),
      }))
    ).toEqual([
      { label: '27 Jul', anchor: 'start' },
      { label: '10 Aug', anchor: 'middle' },
      { label: '24 Aug', anchor: 'end' },
    ])
  })

  it('disables Portfolio 24H with its weekly-capture reason', () => {
    render(<PortfolioHistory />)

    const chart = screen.getByTestId('next-portfolio-history')
    const range = screen.getByTestId('next-portfolio-ranges')
    expect(within(range).getByRole('radio', { name: '24H' })).toBeDisabled()
    expect(
      within(range).getByRole('radio', { name: '24H' })
    ).toHaveAccessibleDescription('Unavailable in this weekly capture')
    expect(
      Array.from(chart.querySelectorAll('.recharts-xAxis text'), (tick) => ({
        label: tick.textContent,
        anchor: tick.getAttribute('text-anchor'),
      }))
    ).toEqual([
      { label: '24 May', anchor: 'start' },
      { label: '9 Jul', anchor: 'middle' },
      { label: '24 Aug', anchor: 'end' },
    ])
  })

  it('resets Portfolio inspection when the range changes', () => {
    render(<PortfolioHistory />)
    const chart = screen.getByTestId('next-portfolio-history')
    const plot = screen.getByRole('group', {
      name: /Portfolio value and category history/,
    })

    fireEvent.keyDown(plot, { key: 'ArrowLeft' })
    expect(chart).toHaveAttribute(
      'data-selected-timestamp',
      String(portfolioPressurePoints.at(-2)!.timestamp)
    )

    fireEvent.click(screen.getByRole('radio', { name: '7D' }))
    expect(chart).toHaveAttribute(
      'data-selected-timestamp',
      String(portfolioPressurePoints.at(-1)!.timestamp)
    )
  })

  it('shows exact zero Portfolio holdings before the first positive sample', () => {
    render(<PortfolioHistory />)
    const chart = screen.getByTestId('next-portfolio-history')
    const plot = screen.getByRole('group', {
      name: /Portfolio value and category history/,
    })

    for (let step = 0; step < 14; step += 1) {
      fireEvent.keyDown(plot, { key: 'ArrowLeft' })
    }

    expect(chart).toHaveAttribute(
      'data-selected-timestamp',
      String(Date.parse('2026-05-24T00:00:00Z') / 1000)
    )
    expect(screen.getByTestId('next-portfolio-value')).toHaveTextContent(
      '$0.00'
    )
    expect(screen.getByTestId('next-portfolio-time')).toHaveTextContent(
      '24 May 2026'
    )
    for (const category of [
      'indexDTFs',
      'yieldDTFs',
      'stakedRSR',
      'voteLocked',
      'rsr',
    ]) {
      expect(
        screen.getByTestId(`next-portfolio-${category}-amount`)
      ).toHaveTextContent('$0.00')
    }
    expect(chart.querySelector('output')).toHaveTextContent(
      '24 May 2026, total $0.00'
    )
  })

  it('selects known-zero history in broad ranges and keeps short ranges post-holdings', () => {
    render(<PortfolioHistory />)
    const chart = screen.getByTestId('next-portfolio-history')
    const plot = screen.getByRole('group', {
      name: /Portfolio value and category history/,
    })

    for (const { label, firstTimestamp } of [
      { label: 'YTD', firstTimestamp: '2026-01-01T00:00:00Z' },
      { label: '1Y', firstTimestamp: '2025-08-24T00:00:00Z' },
      { label: 'All', firstTimestamp: '2025-08-24T00:00:00Z' },
    ]) {
      fireEvent.click(screen.getByRole('radio', { name: label }))
      for (let step = 0; step < portfolioPressurePoints.length; step += 1) {
        fireEvent.keyDown(plot, { key: 'ArrowLeft' })
      }
      expect(chart).toHaveAttribute(
        'data-selected-timestamp',
        String(Date.parse(firstTimestamp) / 1000)
      )
      expect(screen.getByTestId('next-portfolio-value')).toHaveTextContent(
        '$0.00'
      )
    }

    for (const { label, firstTimestamp } of [
      { label: '7D', firstTimestamp: '2026-08-17T00:00:00Z' },
      { label: '1M', firstTimestamp: '2026-07-27T00:00:00Z' },
    ]) {
      fireEvent.click(screen.getByRole('radio', { name: label }))
      for (let step = 0; step < portfolioPressurePoints.length; step += 1) {
        fireEvent.keyDown(plot, { key: 'ArrowLeft' })
      }
      expect(chart).toHaveAttribute(
        'data-selected-timestamp',
        String(Date.parse(firstTimestamp) / 1000)
      )
      expect(screen.getByTestId('next-portfolio-value')).not.toHaveTextContent(
        '$0.00'
      )
    }
  })
})
