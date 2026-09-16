import { render, screen } from '@testing-library/react'
import dayjs from 'dayjs'
import type { TooltipProps } from 'recharts'
import { describe, expect, it } from 'vitest'
import { SourceLineTooltip } from '../source-line-tooltip'

const point = {
  timestamp: dayjs('2026-01-02T03:04:00').unix(),
  price: 47.40637659819312,
}
const payload = [{ payload: point }] as TooltipProps<number, string>['payload']

describe('source line tooltip presentation', () => {
  it('keeps the production value, unit, and timestamp formatting', () => {
    render(<SourceLineTooltip active payload={payload} />)

    const tooltip = screen.getByTestId('chart-line-source-tooltip')
    expect(tooltip).toHaveTextContent('$47.41')
    expect(tooltip.querySelector('time')).toHaveTextContent('2026-1-2 03:04')
  })

  it('uses the compact semantic floating-surface recipe', () => {
    render(<SourceLineTooltip active payload={payload} />)

    const tooltip = screen.getByTestId('chart-line-source-tooltip')
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
  })

  it('renders nothing without a complete active point', () => {
    const { container, rerender } = render(
      <SourceLineTooltip payload={payload} />
    )
    expect(container).toBeEmptyDOMElement()

    rerender(<SourceLineTooltip active payload={[]} />)
    expect(container).toBeEmptyDOMElement()

    rerender(
      <SourceLineTooltip
        active
        payload={
          [{ payload: { timestamp: point.timestamp } }] as TooltipProps<
            number,
            string
          >['payload']
        }
      />
    )
    expect(container).toBeEmptyDOMElement()
  })
})
