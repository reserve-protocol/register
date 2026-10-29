import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { PerformanceChartLaunchMarker } from '../performance-chart-launch-marker'

vi.mock('@/components/token-logo', () => ({
  default: () => <span data-testid="token-logo" />,
}))

const token = {
  address: '0x0000000000000000000000000000000000000001',
  chainId: 1,
  symbol: 'TEST',
}

describe('Home performance chart launch marker presentation', () => {
  it('keeps the production-default pill unchanged', () => {
    render(
      <PerformanceChartLaunchMarker
        chartWidth={340}
        isActive
        leftPercent={65}
        onActiveChange={vi.fn()}
        performanceDirection="positive"
        token={token}
        useLaunchLabel
      />
    )

    expect(screen.getByTestId('feature-card-launch-label')).toHaveClass(
      'rounded-full',
      'border',
      'bg-card',
      'px-2',
      'py-1',
      'text-[10px]',
      'shadow-sm'
    )
  })

  it('offers an unboxed auxiliary annotation without removing interaction', () => {
    const onActiveChange = vi.fn()
    render(
      <PerformanceChartLaunchMarker
        chartWidth={340}
        isActive
        leftPercent={65}
        onActiveChange={onActiveChange}
        performanceDirection="positive"
        presentation="annotation"
        token={token}
        useLaunchLabel
      />
    )

    const label = screen.getByTestId('feature-card-launch-label')
    expect(label).toHaveClass(
      'text-xs',
      'font-light',
      'leading-4',
      'text-foreground'
    )
    expect(label).not.toHaveClass(
      'rounded-full',
      'border',
      'bg-card',
      'shadow-sm'
    )
    expect(screen.getByTestId('feature-card-launch-history-label')).toHaveClass(
      'text-xs',
      'text-muted-foreground'
    )
    fireEvent.mouseEnter(screen.getByTestId('feature-card-launch-marker'))
    expect(onActiveChange).toHaveBeenCalledWith(true)
  })

  it('ends the resting annotation guide at the circular badge', () => {
    render(
      <PerformanceChartLaunchMarker
        chartWidth={340}
        isActive={false}
        isLineActive={false}
        leftPercent={65}
        onActiveChange={vi.fn()}
        performanceDirection="positive"
        presentation="annotation"
        token={token}
        useLaunchLabel
      />
    )

    const line = screen.getByTestId('feature-card-launch-line')
    const label = screen.getByTestId('feature-card-launch-label')
    expect(line).toHaveStyle({ bottom: '26px' })
    expect(line.getAttribute('style')).toContain('repeating-linear-gradient')
    expect(label).toHaveAttribute('aria-hidden', 'true')
  })

  it('uses the same visible-label state for active and clipped guide clearance', () => {
    const { rerender } = render(
      <PerformanceChartLaunchMarker
        chartWidth={340}
        isActive
        isLineActive
        leftPercent={65}
        onActiveChange={vi.fn()}
        performanceDirection="positive"
        presentation="annotation"
        token={token}
        useLaunchLabel
      />
    )

    expect(screen.getByTestId('feature-card-launch-line')).toHaveStyle({
      bottom: '52px',
      backgroundImage: 'none',
    })
    expect(screen.getByTestId('feature-card-launch-label')).toHaveAttribute(
      'aria-hidden',
      'false'
    )

    rerender(
      <PerformanceChartLaunchMarker
        chartWidth={340}
        isActive={false}
        isLineActive={false}
        leftPercent={0}
        onActiveChange={vi.fn()}
        performanceDirection="positive"
        presentation="annotation"
        token={token}
        useLaunchLabel
      />
    )

    expect(screen.getByTestId('feature-card-launch-line')).toHaveStyle({
      bottom: '52px',
    })
    expect(screen.getByTestId('feature-card-launch-label')).toHaveAttribute(
      'aria-hidden',
      'false'
    )
    expect(
      screen.queryByTestId('feature-card-launch-marker')
    ).not.toBeInTheDocument()
  })
})
