import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { AtomicTransactionComposition } from '../transaction-composition-atomic'

describe('manual issuance design-system anchors', () => {
  it('explains unlimited approval without toggling the setting', () => {
    render(<AtomicTransactionComposition />)
    const task = screen.getByTestId('manual-issuance-task')
    const checkbox = within(task).getByRole('checkbox')
    fireEvent.click(
      within(task).getByRole('button', {
        name: 'About unlimited token approvals',
      })
    )
    expect(screen.getByRole('tooltip')).toHaveTextContent(
      'When selected, approvals set the token spending allowance to its maximum. This does not change the amount you mint.'
    )
    expect(checkbox).toBeChecked()
    fireEvent.click(within(task).getByText('Approve unlimited token amounts'))
    expect(checkbox).not.toBeChecked()
  })

  it('retains token explorer evidence and the production Revoke explanation', () => {
    render(<AtomicTransactionComposition />)
    const ledger = screen.getByTestId('manual-issuance-ledger')
    const links = within(ledger).getAllByRole('link')
    expect(links).toHaveLength(5)
    expect(links[0]).toHaveAttribute(
      'href',
      'https://etherscan.io/token/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'
    )
    expect(links[0]).toHaveAttribute('target', '_blank')
    expect(links[0]).toHaveAccessibleName(/opens in a new tab/)
    const explanation =
      'This is a USDT token or a fork of USDT. You need to revoke the approval before you can approve it.'
    fireEvent.click(within(ledger).getByRole('button', { name: explanation }))
    expect(screen.getByRole('tooltip')).toHaveTextContent(explanation)
    expect(
      within(ledger)
        .getByRole('button', { name: 'Revoke USDT' })
        .querySelector('button')
    ).toBeNull()
    fireEvent.click(
      within(screen.getByTestId('manual-issuance-task')).getByRole('radio', {
        name: 'Redeem',
      })
    )
    expect(within(ledger).getAllByRole('link')).toHaveLength(5)
    expect(
      within(ledger).queryByRole('button', { name: explanation })
    ).not.toBeInTheDocument()
  })

  it('derives a safe Mint maximum and a separate Redeem wallet maximum', () => {
    render(<AtomicTransactionComposition />)
    const task = screen.getByTestId('manual-issuance-task')
    fireEvent.click(within(task).getByRole('button', { name: 'Use' }))
    expect(within(task).getByRole('textbox')).toHaveValue('105.100042')
    expect(screen.queryByText('Insufficient balance')).not.toBeInTheDocument()
    fireEvent.change(within(task).getByRole('textbox'), {
      target: { value: '105.11' },
    })
    expect(within(task).getByText('Insufficient balance')).toBeVisible()
    expect(
      within(screen.getByTestId('manual-issuance-ledger')).getByText(
        'Insufficient balance'
      )
    ).toBeVisible()
    fireEvent.click(within(task).getByRole('radio', { name: 'Redeem' }))
    fireEvent.click(within(task).getByRole('button', { name: 'Use' }))
    expect(within(task).getByRole('textbox')).toHaveValue('124.63')
    fireEvent.change(within(task).getByRole('textbox'), {
      target: { value: '124.64' },
    })
    expect(
      within(task).getByRole('button', { name: /Redeem 124.64/ })
    ).toBeDisabled()
  })

  it('does not show stale permission requirements for empty or zero amounts', () => {
    render(<AtomicTransactionComposition />)
    const input = within(screen.getByTestId('manual-issuance-task')).getByRole(
      'textbox'
    )
    for (const value of ['', '0']) {
      fireEvent.change(input, { target: { value } })
      const ledger = screen.getByTestId('manual-issuance-ledger')
      expect(
        within(ledger).queryByRole('button', { name: /^Approve / })
      ).not.toBeInTheDocument()
      expect(
        within(ledger).queryByRole('button', { name: /^Revoke / })
      ).not.toBeInTheDocument()
      expect(
        within(ledger).queryByText(/approvals and/)
      ).not.toBeInTheDocument()
      expect(within(ledger).getByText('Wrapped Bitcoin')).toBeVisible()
      expect(
        within(screen.getByTestId('manual-amount-section')).getByText('$0.00')
      ).toBeVisible()
    }
  })

  it('labels simulated actions and derives permissions from the edited amount', () => {
    render(<AtomicTransactionComposition />)
    expect(
      screen.getByTestId('manual-issuance-preview-note')
    ).toHaveTextContent('no wallet or on-chain writes')
    const task = screen.getByTestId('manual-issuance-task')
    fireEvent.change(within(task).getByRole('textbox'), {
      target: { value: '0.01' },
    })
    expect(
      within(task).getByRole('button', { name: 'Approve All (2)' })
    ).toBeVisible()
    expect(
      screen.queryByRole('button', { name: /^Revoke / })
    ).not.toBeInTheDocument()
  })

  it('keeps the manual Mint task and each permission boundary visible', () => {
    render(<AtomicTransactionComposition />)

    const composition = screen.getByTestId('transaction-composition-atomic')
    const task = within(composition).getByTestId('manual-issuance-task')
    const ledger = within(composition).getByTestId('manual-issuance-ledger')

    expect(
      within(task).getByRole('textbox', { name: 'Shares to mint amount' })
    ).toHaveValue('100')
    expect(
      within(task).getByRole('button', { name: 'Approve All (3)' })
    ).toBeVisible()
    expect(
      within(task).getByRole('checkbox', {
        name: 'Approve unlimited token amounts',
      })
    ).toBeChecked()
    expect(within(task).getByTestId('canonical-checkbox')).toBe(
      within(task).getByRole('checkbox')
    )
    expect(within(ledger).queryByRole('checkbox')).not.toBeInTheDocument()
    fireEvent.click(within(task).getByText('Approve unlimited token amounts'))
    expect(within(task).getByRole('checkbox')).not.toBeChecked()
    fireEvent.click(within(task).getByRole('radio', { name: 'Redeem' }))
    expect(within(task).queryByRole('checkbox')).not.toBeInTheDocument()
    fireEvent.click(within(task).getByRole('radio', { name: 'Mint' }))
    expect(within(task).getByRole('checkbox')).not.toBeChecked()
    expect(
      within(ledger).getAllByTestId('transaction-requirement-row')
    ).toHaveLength(5)
    expect(
      within(ledger).getAllByRole('button', { name: /^Approve / })
    ).toHaveLength(2)
    expect(
      within(ledger).getByRole('button', { name: 'Revoke USDT' })
    ).toBeVisible()
    expect(within(ledger).getAllByText('Approved')).toHaveLength(2)
  })

  it('turns the same task into a receive-only Redeem review', () => {
    render(<AtomicTransactionComposition />)

    const composition = screen.getByTestId('transaction-composition-atomic')
    fireEvent.click(within(composition).getByRole('radio', { name: 'Redeem' }))

    const task = within(composition).getByTestId('manual-issuance-task')
    const ledger = within(composition).getByTestId('manual-issuance-ledger')

    expect(
      within(task).getByRole('textbox', { name: 'Shares to redeem amount' })
    ).toHaveValue('100')
    expect(
      within(task).getByRole('button', { name: 'Redeem 100 CMC20' })
    ).toBeVisible()
    expect(within(ledger).getByText('You will receive')).toBeVisible()
    expect(within(ledger).getAllByText('Expected')).toHaveLength(5)
    expect(within(ledger).getAllByText('Value')).toHaveLength(5)
    expect(within(ledger).queryByRole('checkbox')).not.toBeInTheDocument()
    expect(
      within(ledger).queryByRole('button', { name: /^Approve / })
    ).not.toBeInTheDocument()
    expect(
      within(ledger).queryByRole('button', { name: /^Revoke / })
    ).not.toBeInTheDocument()
    expect(
      within(ledger).queryByTestId('lifecycle-status-pill')
    ).not.toBeInTheDocument()

    fireEvent.change(
      within(task).getByRole('textbox', { name: 'Shares to redeem amount' }),
      { target: { value: '200' } }
    )
    expect(
      within(ledger).getByText('$19,993.72 estimated basket value')
    ).toBeVisible()
  })
})
