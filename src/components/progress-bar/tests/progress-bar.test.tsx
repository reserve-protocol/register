import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ProgressBar from '..'

// The outer wrapper is the full-width track; its first child is the filled portion
const bar = (container: HTMLElement) =>
  container.firstElementChild?.firstElementChild as HTMLElement

describe('ProgressBar', () => {
  it('renders a share of the bar for a normal percentage', () => {
    const { container, getByText } = render(<ProgressBar percentage={42} />)

    expect(bar(container).style.width).toBe('42%')
    expect(getByText('42%')).toBeDefined()
  })

  it('falls back to 0% when the percentage is not a number', () => {
    const { container, queryByText, getByText } = render(
      <ProgressBar percentage={NaN} />
    )

    expect(bar(container).style.width).toBe('0%')
    expect(queryByText(/NaN/)).toBeNull()
    expect(getByText('0%')).toBeDefined()
  })

  it('clamps out-of-range percentages', () => {
    const { container: over } = render(<ProgressBar percentage={180} />)
    const { container: under } = render(<ProgressBar percentage={-20} />)

    expect(bar(over).style.width).toBe('100%')
    expect(bar(under).style.width).toBe('0%')
  })
})
