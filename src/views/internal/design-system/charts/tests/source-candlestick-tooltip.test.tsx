import { render, screen } from '@testing-library/react'
import dayjs from 'dayjs'
import type { TooltipProps } from 'recharts'
import { describe, expect, it } from 'vitest'
import type { ChartCandle } from '@/views/index-dtf/overview/components/charts/use-candlestick-data'
import { SourceCandlestickTooltip } from '../source-candlestick-tooltip'

const candle: ChartCandle = {
  timestamp: dayjs('2026-01-02T03:04:00').unix(),
  open: 47.40637659819312,
  high: 50.531001594224485,
  low: 46.74850942330484,
  close: 49.826102697789935,
  highLow: [46.74850942330484, 50.531001594224485],
}

const payload = [{ payload: candle }] as TooltipProps<number, string>['payload']

describe('source candlestick tooltip presentation', () => {
  it('keeps the full formatted OHLC payload below its source timestamp', () => {
    render(<SourceCandlestickTooltip active payload={payload} />)

    const tooltip = screen.getByTestId('chart-candlestick-source-tooltip')
    expect(tooltip.querySelector('time')).toHaveTextContent('2026-1-2 03:04')
    expect(screen.getByText('Open').nextSibling).toHaveTextContent('$47.41')
    expect(screen.getByText('High').nextSibling).toHaveTextContent('$50.53')
    expect(screen.getByText('Low').nextSibling).toHaveTextContent('$46.75')
    expect(screen.getByText('Close').nextSibling).toHaveTextContent('$49.83')
  })

  it('uses the compact semantic floating-surface recipe', () => {
    render(<SourceCandlestickTooltip active payload={payload} />)

    const tooltip = screen.getByTestId('chart-candlestick-source-tooltip')
    expect(tooltip).toHaveClass(
      'rounded-lg',
      'border',
      'border-border',
      'bg-popover',
      'shadow-sm',
      'px-3',
      'py-2',
      'text-sm',
      'font-light',
      'leading-5'
    )
    expect(tooltip).not.toHaveClass('rounded-[20px]', 'p-4')
    expect(tooltip.querySelector('time')).toHaveClass('block', 'mb-2')
  })

  it('renders nothing without an active candle', () => {
    const { container, rerender } = render(
      <SourceCandlestickTooltip payload={payload} />
    )
    expect(container).toBeEmptyDOMElement()

    rerender(<SourceCandlestickTooltip active payload={[]} />)
    expect(container).toBeEmptyDOMElement()
  })
})
