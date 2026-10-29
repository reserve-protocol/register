import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act, useState } from 'react'
import { MemoryRouter, Link as RouterLink, useLocation } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Button } from '@/components/button'
import { CopyableValue } from '../copyable-value'
import { Link } from '../link'
import { Pagination } from '../pagination'
import { SegmentedControl, SegmentedControlItem } from '../segmented-control'

afterEach(() => vi.useRealTimers())

describe('design-system component behavior', () => {
  it('keeps a controlled segmented selection stable across presses', async () => {
    const user = userEvent.setup()
    const Example = () => {
      const [value, setValue] = useState('chart')
      return (
        <SegmentedControl
          aria-label="View mode"
          presentation="contained"
          value={value}
          onValueChange={setValue}
        >
          <SegmentedControlItem value="chart">Chart</SegmentedControlItem>
          <SegmentedControlItem value="table">Table</SegmentedControlItem>
        </SegmentedControl>
      )
    }
    render(<Example />)
    await user.click(screen.getByRole('radio', { name: 'Chart' }))
    expect(screen.getByRole('radio', { name: 'Chart' })).toHaveAttribute(
      'data-state',
      'on'
    )
    await user.click(screen.getByRole('radio', { name: 'Table' }))
    expect(screen.getByRole('radio', { name: 'Table' })).toHaveAttribute(
      'data-state',
      'on'
    )
  })

  it('uses 1-based pagination and disables boundary actions', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    const { rerender } = render(
      <Pagination
        currentPage={1}
        pageCount={12}
        visibleCount={10}
        totalCount={112}
        onPageChange={onPageChange}
      />
    )
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled()
    expect(screen.getByLabelText('Page 1, current page')).toHaveAttribute(
      'aria-current',
      'page'
    )
    await user.click(screen.getByRole('button', { name: 'Page 3' }))
    await user.click(screen.getByRole('button', { name: 'Next page' }))
    expect(onPageChange).toHaveBeenNthCalledWith(1, 3)
    expect(onPageChange).toHaveBeenNthCalledWith(2, 2)
    rerender(
      <Pagination
        currentPage={12}
        pageCount={12}
        visibleCount={2}
        totalCount={112}
        onPageChange={onPageChange}
      />
    )
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled()
  })

  it('copies the full value, isolates the click, and clears success feedback', async () => {
    vi.useFakeTimers()
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })
    const parentClick = vi.fn()
    const address = '0x0000000000000000000000000000000000000000'
    render(
      <div onClick={parentClick}>
        <CopyableValue value={address} />
      </div>
    )
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Copy to clipboard' }))
    })
    expect(writeText).toHaveBeenCalledWith(address)
    expect(parentClick).not.toHaveBeenCalled()
    expect(screen.getByRole('status')).toHaveTextContent('Copied to clipboard!')
    act(() => vi.advanceTimersByTime(2000))
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('reports clipboard success only after a completed write and supports dismissal', async () => {
    vi.useFakeTimers()
    const writeText = vi
      .fn()
      .mockRejectedValueOnce(new Error('Clipboard unavailable'))
      .mockResolvedValueOnce(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })
    render(<CopyableValue value="proposal-42" />)
    const copyButton = screen.getByRole('button', { name: 'Copy to clipboard' })
    await act(async () => fireEvent.click(copyButton))
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    await act(async () => fireEvent.click(copyButton))
    expect(screen.getByRole('status')).toBeInTheDocument()
    fireEvent.keyDown(screen.getByRole('tooltip'), { key: 'Escape' })
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('keeps external links announced and secure', () => {
    render(
      <Link
        href="https://docs.reserve.org"
        external
        externalAnnouncement=", opens in a new tab"
        rel="external"
      >
        Protocol documentation
      </Link>
    )
    const link = screen.getByRole('link', {
      name: 'Protocol documentation, opens in a new tab',
    })
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'external noopener noreferrer')
  })

  it('blocks navigation for disabled and loading slotted buttons', () => {
    render(
      <MemoryRouter initialEntries={['/current']}>
        <Button asChild disabled>
          <RouterLink to="/disabled">Disabled route</RouterLink>
        </Button>
        <Button asChild loading>
          <RouterLink to="/loading">Loading route</RouterLink>
        </Button>
        <LocationProbe />
      </MemoryRouter>
    )
    for (const name of ['Disabled route', 'Loading route']) {
      const link = screen.getByRole('link', { name })
      expect(link).toHaveAttribute('aria-disabled', 'true')
      expect(link).toHaveAttribute('tabindex', '-1')
      fireEvent.click(link)
      expect(screen.getByTestId('router-location')).toHaveTextContent(
        '/current'
      )
    }
  })
})

const LocationProbe = () => {
  const location = useLocation()
  return <span data-testid="router-location">{location.pathname}</span>
}
