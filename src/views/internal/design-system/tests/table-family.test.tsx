import { fireEvent, render, screen, within } from '@testing-library/react'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { EntityIdentity } from '@/components/entity-identity'
import { InlineAction } from '@/components/button'
import { Link } from '@/components/design-system-v1/link'
import { TableFamilyReview } from '../table-family/review'
import { Positions } from '../table-family/positions'
import { WithdrawalProgress } from '../table-family/progress'
import { POSITIONS, WITHDRAWALS, value } from '../table-family/fixtures'

const choosePreview = (state: string) => {
  fireEvent.keyDown(screen.getByTestId('table-preview-state'), {
    key: 'ArrowDown',
  })
  fireEvent.click(screen.getByTestId(`table-state-${state}`))
}
describe('position and withdrawal table candidates', () => {
  it('keeps existing action defaults and opts contextual actions into neutral body type', () => {
    render(
      <>
        <InlineAction>Default action</InlineAction>
        <InlineAction treatment="contextual">Contextual action</InlineAction>
        <Link href="/" treatment="standalone">
          Default link
        </Link>
        <Link href="/" treatment="contextual">
          Contextual link
        </Link>
      </>
    )
    for (const label of ['Default action', 'Default link']) {
      expect(screen.getByText(label)).toHaveClass(
        'text-primary',
        'text-sm',
        'font-medium'
      )
    }
    for (const label of ['Contextual action', 'Contextual link']) {
      expect(screen.getByText(label)).toHaveClass(
        'text-foreground',
        'text-base',
        'font-light'
      )
    }
  })
  it('keeps withdrawal actions compact in desktop and collapsed rows', () => {
    render(<TableFamilyReview />)
    expect(screen.getByTestId('withdraw-lock-ready')).toHaveAttribute(
      'data-size',
      'compact'
    )
    expect(screen.getByTestId('withdraw-lock-ready-mobile')).toHaveAttribute(
      'data-size',
      'compact'
    )
    expect(
      screen.getByTestId('source-lock-ready').querySelector('svg')
    ).toHaveAttribute('aria-hidden', 'true')
    const source = within(
      screen.getByTestId('table-family-withdrawals')
    ).getAllByRole('link')[0]
    expect(source).toHaveAccessibleName(/opens in a new tab/i)
    expect(source).toHaveAttribute('rel', 'noopener noreferrer')
  })
  beforeAll(() => {
    HTMLElement.prototype.scrollIntoView ??= vi.fn()
  })

  it('keeps the position type when changing preview conditions', () => {
    render(<TableFamilyReview />)
    fireEvent.mouseDown(screen.getByRole('tab', { name: 'Yield DTFs' }), {
      button: 0,
      ctrlKey: false,
    })
    fireEvent.keyDown(screen.getByRole('combobox', { name: 'Preview state' }), {
      key: 'ArrowDown',
    })
    fireEvent.click(screen.getByRole('option', { name: 'Long content' }))
    expect(screen.getByRole('tab', { name: 'Yield DTFs' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
    expect(
      within(screen.getByTestId('table-family-positions')).getByRole('heading')
    ).toHaveTextContent('Yield DTF Positions')
    expect(screen.getByTestId('table-family-positions')).toHaveTextContent(
      'Electronic Dollar with an unusually long display name'
    )
    expect(
      screen.getByRole('switch', { name: 'Constrained column' })
    ).not.toBeChecked()
    fireEvent.click(screen.getByRole('switch', { name: 'Constrained column' }))
    expect(
      screen.getByRole('switch', { name: 'Constrained column' })
    ).toBeChecked()
  })
  it('preserves countdown precision down to minutes and the ready boundary', () => {
    const { rerender } = render(
      <WithdrawalProgress
        row={{ ...WITHDRAWALS[0], remaining: 3660 }}
        state="idle"
      />
    )
    expect(screen.getByText('1h 1m')).toBeInTheDocument()
    rerender(
      <WithdrawalProgress
        row={{ ...WITHDRAWALS[0], remaining: 60 }}
        state="idle"
      />
    )
    expect(screen.getByText('1m')).toBeInTheDocument()
    rerender(
      <WithdrawalProgress
        row={{ ...WITHDRAWALS[0], remaining: 0 }}
        state="idle"
      />
    )
    expect(screen.getByText('Ready')).toBeInTheDocument()
  })

  it('shares field and direction between the collapsed menu and desktop sorting', () => {
    render(<TableFamilyReview />)
    const trigger = screen.getByTestId('table-sort-menu')
    expect(trigger).toHaveTextContent('Sort by: Value')
    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    fireEvent.click(screen.getByTestId('table-sort-field-cost'))
    expect(trigger).toHaveTextContent('Sort by: Avg Cost')
    expect(screen.getByTestId('sort-cost')).toHaveAttribute(
      'aria-description',
      'descending'
    )
    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    fireEvent.click(screen.getByTestId('table-sort-direction-asc'))
    expect(screen.getByTestId('sort-cost')).toHaveAttribute(
      'aria-description',
      'ascending'
    )
    fireEvent.click(screen.getByTestId('sort-value'))
    expect(trigger).toHaveTextContent('Sort by: Value')
    expect(trigger).toHaveAttribute('aria-description', 'ascending')
  })
  it('keeps Index positive-amount eligibility and Yield destinations distinct', () => {
    const { unmount } = render(
      <Positions rows={[{ ...POSITIONS[0], balance: value('0.00', 0n) }]} />
    )
    expect(
      screen.queryByTestId('table-family-positions')
    ).not.toBeInTheDocument()
    unmount()
    render(<TableFamilyReview />)
    fireEvent.mouseDown(screen.getByTestId('table-state-yield'), {
      button: 0,
      ctrlKey: false,
    })
    const positions = screen.getByTestId('table-family-positions')
    expect(within(positions).getByRole('heading')).toHaveTextContent(
      'Yield DTF Positions'
    )
    expect(
      within(positions)
        .getAllByRole('link')
        .some((link) => link.getAttribute('href')?.includes('/token/'))
    ).toBe(true)
  })

  it('expands withdrawals and keeps source preview separate from withdrawal state', () => {
    render(<TableFamilyReview />)
    const withdrawals = screen.getByTestId('table-family-withdrawals')
    expect(withdrawals.querySelectorAll('tbody tr')).toHaveLength(5)
    fireEvent.click(within(withdrawals).getByTestId('table-expand'))
    expect(withdrawals.querySelectorAll('tbody tr')).toHaveLength(6)
    fireEvent.click(screen.getByTestId('source-lock-ready'))
    expect(screen.getByTestId('table-source-preview')).toHaveTextContent(
      'claimLock(lockId)'
    )
    expect(screen.getByTestId('withdraw-lock-ready')).toBeEnabled()
    expect(screen.getByTestId('withdraw-lock-ready')).not.toHaveAttribute(
      'aria-busy'
    )
  })
  it('keeps truncation by default and opts long names into wrapping', () => {
    const { rerender } = render(<EntityIdentity mark="" name="Long name" />)
    expect(screen.getByText('Long name')).toHaveClass('truncate')
    rerender(<EntityIdentity mark="" name="Long name" wrapName />)
    expect(screen.getByText('Long name')).not.toHaveClass('truncate')
    expect(screen.getByText('Long name')).toHaveClass('break-words')
  })

  it('keeps zero distinct from unavailable in the shared cell gallery', () => {
    render(<TableFamilyReview />)
    const cells = within(screen.getByTestId('table-family-cells'))
    expect(cells.getByTestId('cell-zero')).toHaveTextContent('$0.00')
    expect(cells.getByTestId('cell-unavailable')).toHaveTextContent('—')
    expect(cells.getByTestId('cell-zero')).not.toHaveTextContent('—')
  })

  it('limits after sorting so expansion appends without moving existing rows', () => {
    render(<TableFamilyReview />)
    const positions = screen.getByTestId('table-family-positions')
    expect(positions.querySelectorAll('tbody tr')).toHaveLength(5)
    expect(positions.querySelector('tbody tr')).toHaveTextContent(
      'Bloomberg Galaxy Crypto Index'
    )
    const before = [...positions.querySelectorAll('tbody tr')].map(
      (row) => row.textContent
    )
    fireEvent.click(within(positions).getByTestId('table-expand'))
    expect(positions.querySelectorAll('tbody tr')).toHaveLength(6)
    expect(positions.querySelector('tbody tr')).toHaveTextContent(
      'Bloomberg Galaxy Crypto Index'
    )
    expect(
      [...positions.querySelectorAll('tbody tr')]
        .slice(0, 5)
        .map((row) => row.textContent)
    ).toEqual(before)
    for (const id of [
      'performance',
      'pnl',
      'cost',
      'cap',
      'balance',
      'value',
    ]) {
      fireEvent.click(within(positions).getByTestId(`sort-${id}`))
      expect(
        within(positions).getByTestId(`sort-${id}`).closest('th')
      ).toHaveAttribute('aria-sort', 'ascending')
    }
    fireEvent.click(within(positions).getByTestId('table-expand'))
    expect(positions.querySelectorAll('tbody tr')).toHaveLength(5)
  })

  it('keeps named native links separate from pointer row navigation', () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null)
    render(<TableFamilyReview />)
    const first = screen
      .getByTestId('table-family-positions')
      .querySelector('tbody tr')!
    const link = within(first as HTMLElement).getAllByRole('link')[0]
    expect(link).toHaveAttribute('target', '_blank')
    fireEvent.click(link)
    expect(open).not.toHaveBeenCalled()
    fireEvent.click(first)
    expect(open).toHaveBeenCalledWith(
      link.getAttribute('href'),
      '_blank',
      'noopener,noreferrer'
    )
    open.mockRestore()
  })

  it('separates waiting, ready, processing and simulated receipt states for both sources', () => {
    render(<TableFamilyReview />)
    const table = screen.getByTestId('table-family-withdrawals')
    expect(
      within(table).getByRole('columnheader', {
        name: 'Withdrawal',
        exact: true,
      })
    ).toBeInTheDocument()
    expect(
      within(table).queryByRole('columnheader', { name: 'Progress' })
    ).not.toBeInTheDocument()
    expect(
      within(table).queryByRole('columnheader', { name: 'Action' })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('withdraw-staked-pending')
    ).not.toBeInTheDocument()
    expect(screen.getByTestId('withdrawal-staked-pending')).toHaveTextContent(
      'Available in 13d'
    )
    for (const id of ['staked-ready', 'lock-ready']) {
      const button = screen.getByTestId(`withdraw-${id}`)
      expect(button).toBeEnabled()
      expect(screen.getByTestId(`withdrawal-${id}`)).not.toHaveTextContent(
        'Ready'
      )
      fireEvent.click(button)
      expect(screen.queryByTestId(`withdraw-${id}`)).not.toBeInTheDocument()
      expect(screen.getByTestId(`withdrawal-${id}`)).toHaveTextContent(
        'Withdrawing…'
      )
    }
    fireEvent.click(screen.getByTestId('table-simulate-receipt'))
    expect(screen.getByTestId('withdrawal-staked-ready')).toHaveTextContent(
      'Withdrawn'
    )
    expect(screen.getByTestId('withdrawal-lock-ready')).toHaveTextContent(
      'Withdrawn'
    )
    fireEvent.click(screen.getByRole('switch', { name: 'Elapsed deadlines' }))
    expect(screen.getByTestId('withdraw-staked-pending')).toBeEnabled()
    expect(screen.getByTestId('table-family-preview-note')).toHaveTextContent(
      'no wallet or on-chain writes'
    )
  })

  it('keeps skeletons and section absence distinct from empty portfolio', () => {
    render(<TableFamilyReview />)
    choosePreview('loading')
    expect(screen.getAllByTestId('v1-skeleton').length).toBeGreaterThan(5)
    expect(
      screen.queryByTestId('withdraw-staked-ready')
    ).not.toBeInTheDocument()
    choosePreview('empty')
    expect(
      screen.queryByTestId('table-family-positions')
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('table-family-withdrawals')
    ).not.toBeInTheDocument()
  })
})
