import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { AtomicTransactionComposition } from '../transaction-composition-atomic'

describe('manual issuance design-system anchors', () => {
  it('keeps the manual Mint task and each permission boundary visible', () => {
    render(<AtomicTransactionComposition />)

    const composition = screen.getByTestId('transaction-composition-atomic')
    const task = within(composition).getByTestId('manual-issuance-task')
    const ledger = within(composition).getByTestId('manual-issuance-ledger')

    expect(
      within(task).getByRole('textbox', { name: 'Shares to mint amount' })
    ).toHaveValue('100')
    expect(
      within(task).getByRole('button', { name: 'Approve All (2)' })
    ).toBeVisible()
    expect(
      within(ledger).getByRole('checkbox', { name: 'Unlimited approval' })
    ).toBeChecked()
    expect(
      within(ledger).getAllByTestId('transaction-requirement-row')
    ).toHaveLength(5)
    expect(
      within(ledger).getAllByRole('button', { name: 'Approve' })
    ).toHaveLength(2)
    expect(within(ledger).getByRole('button', { name: 'Revoke' })).toBeVisible()
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
      within(ledger).queryByRole('button', { name: 'Approve' })
    ).not.toBeInTheDocument()
    expect(
      within(ledger).queryByRole('button', { name: 'Revoke' })
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
