import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { OwnedPositionsReview } from '../table-family/owned-review'
import { OwnedTable } from '../table-family/owned-table'
import {
  OWNED_LOCKS,
  OWNED_STAKES,
  previewOwned,
} from '../table-family/owned-fixtures'
import { value } from '../table-family/fixtures'

const change = (label: string, option: string) => {
  fireEvent.keyDown(screen.getByRole('combobox', { name: label }), {
    key: 'ArrowDown',
  })
  fireEvent.click(screen.getByRole('option', { name: option }))
}

describe('owned Portfolio positions', () => {
  it('mounts both families and preserves family when changing preview state', () => {
    render(<OwnedPositionsReview />)
    expect(
      screen.getByRole('heading', { name: 'Vote-locked positions' })
    ).toBeInTheDocument()
    change('Position type', 'Staked RSR Positions')
    change('Preview state', 'Long content')
    expect(screen.getByTestId('owned-table')).toHaveAttribute(
      'data-family',
      'stake'
    )
    expect(screen.getByTestId('owned-table')).toHaveTextContent(
      '123,456,789.123456'
    )
    expect(screen.queryByText('TVL')).not.toBeInTheDocument()
  })

  it('keeps active shares as eligibility while retaining a successful zero redeemable balance', () => {
    const row = OWNED_LOCKS[1]
    const { rerender } = render(
      <OwnedTable
        family="lock"
        rows={[{ ...row, activeShares: 0n }]}
        onModify={vi.fn()}
      />
    )
    expect(screen.queryByTestId('owned-table')).not.toBeInTheDocument()
    rerender(
      <OwnedTable
        family="lock"
        rows={[
          { ...row, balance: value('0.00', 0n), value: value('$0.00', 0n) },
        ]}
        onModify={vi.fn()}
      />
    )
    expect(screen.getByTestId('owned-table')).toHaveTextContent('0.00 RSR')
    expect(screen.getByTestId('owned-table')).toHaveTextContent(
      '1 vlRSR = 1.0188 RSR'
    )
  })

  it('keeps tiny holdings, unknown values and an empty governed list distinct', () => {
    render(
      <OwnedTable
        family="lock"
        rows={previewOwned('lock', 'missing')}
        onModify={vi.fn()}
      />
    )
    expect(screen.getByTestId('owned-table')).toHaveTextContent('0.000042')
    expect(screen.getByTestId('owned-table')).toHaveTextContent('$0.00')
    expect(screen.getByTestId('owned-table')).toHaveTextContent('—')
    expect(screen.getByTestId('owned-table')).not.toHaveTextContent('NaN')
  })

  it('retains independent links for every governed asset, including duplicate symbols', () => {
    const row = {
      ...OWNED_LOCKS[1],
      governs: OWNED_LOCKS[1].governs.map((asset) => ({
        ...asset,
        symbol: 'MAG7',
      })),
    }
    render(<OwnedTable family="lock" rows={[row]} onModify={vi.fn()} />)
    const mobile = screen
      .getByTestId('owned-table')
      .querySelector('[data-owned-row]') as HTMLElement
    const trigger = within(mobile).getByRole('button', {
      name: 'Show all 5 governed DTFs',
    })
    expect(trigger).toHaveTextContent(/^\+3$/)
    fireEvent.click(trigger)
    const list = screen.getByRole('dialog', { name: 'Governed DTFs' })
    const links = within(list).getAllByRole('link', { name: /MAG7/ })
    expect(links).toHaveLength(5)
    expect(new Set(links.map((link) => link.getAttribute('href'))).size).toBe(5)
    expect(within(mobile).getAllByRole('link', { name: /MAG7/ })).toHaveLength(
      2
    )
    expect(screen.queryByText('show less')).not.toBeInTheDocument()
    for (const link of links) {
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    }
    fireEvent.keyDown(list, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('removes an open governed list when its row starts loading', () => {
    const row = OWNED_LOCKS[1]
    const { rerender } = render(
      <OwnedTable family="lock" rows={[row]} onModify={vi.fn()} />
    )
    fireEvent.click(
      screen.getAllByRole('button', { name: 'Show all 5 governed DTFs' })[0]
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    rerender(
      <OwnedTable family="lock" rows={[row]} loading onModify={vi.fn()} />
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    rerender(<OwnedTable family="lock" rows={[row]} onModify={vi.fn()} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('sorts numerical balances before applying the five-row limit with an eleven-row list', () => {
    const rows = [2, 11, 3, 20, 4, 30, 5, 40, 6, 50, 100].map((amount) => ({
      ...OWNED_STAKES[0],
      id: String(amount),
      balance: value(String(amount), BigInt(amount)),
      value: value('$1', 100n),
    }))
    const { container } = render(
      <OwnedTable family="stake" rows={rows} onModify={vi.fn()} />
    )
    fireEvent.click(screen.getByTestId('sort-balance'))
    const ids = () =>
      [...container.querySelectorAll<HTMLElement>('[data-owned-row]')].map(
        (row) => row.dataset.ownedRow
      )
    expect(ids()).toEqual(['2', '3', '4', '5', '6'])
    fireEvent.click(screen.getByTestId('table-expand'))
    expect(ids()).toHaveLength(11)
    fireEvent.click(screen.getByTestId('sort-balance'))
    expect(ids().slice(0, 3)).toEqual(['100', '50', '40'])
  })

  it('keeps missing numeric values last in both sort directions', () => {
    const rows = [1, 2].map((amount) => ({
      ...OWNED_STAKES[0],
      id: String(amount),
      value: value(String(amount), BigInt(amount)),
    }))
    const { container } = render(
      <OwnedTable
        family="stake"
        rows={[{ ...rows[0], id: 'unknown', value: null }, ...rows]}
        onModify={vi.fn()}
      />
    )
    const last = () =>
      container
        .querySelector('tbody tr:last-child [data-owned-row]')
        ?.getAttribute('data-owned-row')
    expect(last()).toBe('unknown')
    fireEvent.click(screen.getByTestId('sort-value'))
    expect(last()).toBe('unknown')
  })

  it('does not turn the entire vote-lock row into an action', () => {
    const modify = vi.fn()
    render(
      <OwnedTable family="lock" rows={[OWNED_LOCKS[0]]} onModify={modify} />
    )
    fireEvent.click(screen.getAllByText('vlRSR-LCAP')[0])
    expect(modify).not.toHaveBeenCalled()
    fireEvent.click(
      screen.getAllByRole('button', { name: 'Modify vlRSR-LCAP' })[0]
    )
    expect(modify).toHaveBeenCalledWith(OWNED_LOCKS[0], expect.any(HTMLElement))
  })

  it('keeps staking Modify a native new-tab link with the staking destination', () => {
    render(
      <OwnedTable family="stake" rows={[OWNED_STAKES[0]]} onModify={vi.fn()} />
    )
    for (const link of screen.getAllByRole('link', { name: /Modify/ })) {
      expect(link).toHaveAttribute('href', OWNED_STAKES[0].href)
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
      expect(link).toHaveAttribute('target', '_blank')
    }
  })

  it('disables loading Modify and recovers without changing family', () => {
    render(<OwnedPositionsReview />)
    change('Preview state', 'Loading')
    for (const button of screen.getAllByRole('button', { name: /^Modify/ }))
      expect(button).toBeDisabled()
    change('Preview state', 'Default')
    for (const button of screen.getAllByRole('button', { name: /^Modify/ }))
      expect(button).toBeEnabled()
  })

  it('opens only the non-executing vote-lock boundary', () => {
    render(<OwnedPositionsReview />)
    fireEvent.click(
      screen.getAllByRole('button', { name: 'Modify vlRSR-LCAP' })[0]
    )
    expect(screen.getByRole('dialog')).toHaveTextContent(
      'No wallet is connected'
    )
    expect(screen.getByRole('dialog')).toHaveTextContent(OWNED_LOCKS[0].address)
    expect(screen.getByRole('dialog')).toHaveTextContent('Base (8453)')
    expect(screen.getByRole('dialog')).toHaveTextContent('CF Large Cap Index')
    fireEvent.click(screen.getByRole('button', { name: 'Close preview' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
