import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AtomicTransactionComposition } from '../transaction-composition-atomic'

describe('Manual lifecycle presentation', () => {
  it.each([
    ['Mint empty', 'manual-amount-section'],
    ['Basket loading', 'manual-amount-section'],
    ['Insufficient collateral', 'manual-amount-section'],
    ['Mint requirements', 'manual-approvals-section'],
    ['Approvals confirming', 'manual-approvals-section'],
    ['Partial approval failure', 'manual-approvals-section'],
    ['Mint ready', 'manual-mint-section'],
    ['Mint wallet', 'manual-mint-section'],
    ['Mint failed', 'manual-mint-section'],
  ])('directs attention to the relevant section in %s', (state, section) => {
    render(<AtomicTransactionComposition />)
    fireEvent.click(screen.getByRole('radio', { name: state, exact: true }))
    const task = screen.getByTestId('manual-issuance-task')
    expect(task.querySelectorAll('[aria-current="step"]')).toHaveLength(1)
    expect(screen.getByTestId(section)).toHaveAttribute('aria-current', 'step')
  })

  it('explains insufficient collateral near the input without blocking approvals', () => {
    render(<AtomicTransactionComposition />)
    fireEvent.click(
      screen.getByRole('radio', { name: 'Insufficient collateral' })
    )
    const amount = screen.getByTestId('manual-amount-section')
    expect(within(amount).getByRole('status')).toHaveTextContent(
      'Insufficient balance'
    )
    expect(screen.getByTestId('manual-issuance-primary-action')).toBeEnabled()
    expect(
      screen.getByTestId('manual-issuance-transaction-action')
    ).toBeDisabled()
    expect(
      screen.queryByTestId('manual-mint-prerequisite')
    ).not.toBeInTheDocument()
    fireEvent.click(within(amount).getByRole('button', { name: 'Use' }))
    expect(within(amount).queryByRole('status')).toBeNull()
    expect(screen.getByTestId('manual-approvals-section')).toHaveAttribute(
      'aria-current',
      'step'
    )
  })

  it('keeps insufficient balances distinct from completed permissions', () => {
    render(<AtomicTransactionComposition />)
    fireEvent.click(
      screen.getByRole('radio', { name: 'Mint ready', exact: true })
    )
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '177' } })
    expect(screen.getByTestId('manual-approval-readiness')).toHaveTextContent(
      'Required tokens approved'
    )
    expect(screen.getByTestId('manual-amount-section')).toHaveAttribute(
      'aria-current',
      'step'
    )
    expect(screen.getByTestId('manual-mint-section')).not.toHaveAttribute(
      'aria-current'
    )
    expect(screen.getByTestId('manual-issuance-primary-action')).toBeDisabled()
    expect(
      screen.getByTestId('manual-mint-summary-status')
    ).not.toHaveTextContent('Ready to mint')
    expect(
      within(screen.getByTestId('manual-issuance-task')).getAllByText(
        'Insufficient balance'
      )
    ).toHaveLength(1)
  })

  it('connects amount and approval summaries to a readiness-led Mint step', () => {
    render(<AtomicTransactionComposition />)
    const task = screen.getByTestId('manual-issuance-task')
    expect(
      within(task).getAllByTestId('manual-mint-stage-boundary')
    ).toHaveLength(2)
    expect(
      within(screen.getByTestId('manual-amount-section')).getByTestId(
        'manual-switch-zapper'
      )
    ).toBeVisible()
    expect(
      within(screen.getByTestId('manual-approvals-section')).getByTestId(
        'transaction-amount-primary-row'
      )
    ).toHaveTextContent('2 of 5')
    const mint = screen.getByTestId('manual-mint-section')
    expect(
      within(mint).getByRole('heading', { name: 'Mint', exact: true })
    ).toBeVisible()
    expect(
      within(mint).getByTestId('manual-mint-summary-status')
    ).toHaveTextContent('Approvals needed')
    expect(
      within(mint).getByTestId('manual-mint-summary-description')
    ).toHaveTextContent('Your basket tokens will be exchanged for CMC20.')
    expect(within(mint).queryByTestId('transaction-amount-object')).toBeNull()
    expect(mint).not.toHaveTextContent('$10,041.20')
    expect(
      within(mint).queryByTestId('manual-mint-prerequisite')
    ).not.toBeInTheDocument()
    expect(
      within(mint).getByRole('button', { name: 'Mint 100 CMC20' })
    ).toBeDisabled()
    fireEvent.click(
      screen.getByRole('button', { name: 'About token approvals' })
    )
    expect(screen.getByRole('tooltip')).toHaveTextContent(
      'separate transaction for each token'
    )
  })
  it('keeps token readiness outside the action and removes completed controls', () => {
    render(<AtomicTransactionComposition />)
    expect(screen.getByTestId('manual-approval-progress')).toHaveAccessibleName(
      '2 of 5 tokens approved'
    )
    fireEvent.click(
      screen.getByRole('radio', { name: 'Mint ready', exact: true })
    )
    expect(screen.getByTestId('manual-approval-readiness')).toHaveTextContent(
      'Required tokens approved'
    )
    expect(
      screen.queryByTestId('manual-unlimited-setting')
    ).not.toBeInTheDocument()
    expect(
      screen.getByTestId('manual-approvals-section').querySelector('.invisible')
    ).toBeNull()
    expect(
      screen.queryByTestId('manual-mint-prerequisite')
    ).not.toBeInTheDocument()
  })
  it.each([
    ['Mint empty', 'Mint 0 CMC20', 'Mint CMC20'],
    ['Basket loading', 'Mint 100 CMC20', 'Mint CMC20'],
    ['Insufficient collateral', 'Mint 177 CMC20', 'Mint CMC20'],
    ['Approvals confirming', 'Mint 100 CMC20', 'Approvals needed'],
    ['Mint ready', 'Mint 100 CMC20', 'Ready to mint'],
    ['Mint wallet', 'Please sign in wallet...', 'Mint in progress'],
    ['Mint confirming', 'Confirming transaction...', 'Mint in progress'],
    ['Mint rejected', 'Mint 100 CMC20', 'Ready to mint'],
    ['Mint failed', 'Mint 100 CMC20', 'Ready to mint'],
  ])(
    'distinguishes step readiness from exact wallet/chain feedback in %s',
    (state, action, summary) => {
      render(<AtomicTransactionComposition />)
      fireEvent.click(screen.getByRole('radio', { name: state, exact: true }))
      const mint = screen.getByTestId('manual-mint-section')
      expect(
        within(mint).getByTestId('manual-mint-summary-status')
      ).toHaveTextContent(summary)
      expect(
        screen.queryByTestId('manual-mint-prerequisite')
      ).not.toBeInTheDocument()
      expect(
        within(mint).getByRole('button', { name: action })
      ).toBeInTheDocument()
      expect(
        within(mint).queryByTestId('manual-task-processing-context')
      ).toBeNull()
      expect(
        within(mint).getByTestId('manual-mint-summary')
      ).not.toHaveTextContent('100 CMC20')
      if (state === 'Mint rejected' || state === 'Mint failed') {
        expect(
          within(mint).getByTestId('canonical-inline-message')
        ).toHaveTextContent(
          state === 'Mint rejected' ? 'Signing declined' : 'Transaction failed'
        )
      }
    }
  )
  it('separates the Mint target, approvals, and gated final transaction', () => {
    render(<AtomicTransactionComposition />)
    const amount = screen.getByTestId('manual-amount-section')
    const approvals = screen.getByTestId('manual-approvals-section')
    const mint = screen.getByTestId('manual-mint-section')
    expect(within(amount).getByRole('textbox')).toHaveValue('100')
    expect(within(approvals).getByRole('checkbox')).toBeChecked()
    expect(
      within(approvals).getByRole('button', { name: 'About token approvals' })
    ).toBeVisible()
    expect(
      within(approvals).getByRole('button', { name: 'Approve All (3)' })
    ).toBeEnabled()
    expect(
      within(mint).getByRole('button', { name: 'Mint 100 CMC20' })
    ).toBeDisabled()
    fireEvent.click(
      screen.getByRole('radio', { name: 'Partial approval failure' })
    )
    expect(screen.getByTestId('manual-approvals-section')).toHaveTextContent(
      'Approval failed: USDT'
    )
    expect(screen.getByTestId('manual-mint-section')).not.toHaveTextContent(
      'Approval failed'
    )
    fireEvent.click(
      screen.getByRole('radio', { name: 'Mint ready', exact: true })
    )
    expect(screen.getByTestId('manual-approvals-section')).toHaveTextContent(
      'Required tokens approved'
    )
    expect(
      within(screen.getByTestId('manual-mint-section')).getByRole('button', {
        name: 'Mint 100 CMC20',
      })
    ).toBeEnabled()
    fireEvent.click(
      screen.getByRole('radio', { name: 'Redeem preview', exact: true })
    )
    expect(
      screen.queryByTestId('manual-approvals-section')
    ).not.toBeInTheDocument()
    expect(
      screen.getByTestId('manual-issuance-primary-action')
    ).toHaveTextContent('Redeem 100 CMC20')
  })

  it('previews the Zapper alternative without discarding the manual amount', () => {
    render(<AtomicTransactionComposition />)
    const task = screen.getByTestId('manual-issuance-task')
    fireEvent.change(within(task).getByRole('textbox'), {
      target: { value: '73.25' },
    })
    fireEvent.click(
      within(task).getByRole('button', { name: 'Switch to Zapper' })
    )
    expect(screen.getByTestId('manual-zapper-preview')).toHaveTextContent(
      'No swap is executed'
    )
    expect(within(task).getByRole('textbox')).toHaveValue('73.25')
  })

  it('uses processing context while the amount is locked', () => {
    render(<AtomicTransactionComposition />)
    fireEvent.click(
      screen.getByRole('radio', { name: 'Approvals signing', exact: true })
    )
    expect(
      screen.getByTestId('manual-task-processing-context')
    ).toHaveTextContent('Tokens approved')
    expect(
      within(screen.getByTestId('manual-issuance-task')).getByRole('textbox')
    ).toBeDisabled()
  })
  it.each([
    ['Mint rejected', 'User rejected the request.'],
    ['Mint failed', 'Execution reverted.'],
    ['Redeem rejected', 'User rejected the request.'],
    ['Redeem failed', 'Execution reverted.'],
  ])('retains the underlying reason in %s', (state, reason) => {
    render(<AtomicTransactionComposition />)
    fireEvent.click(screen.getByRole('radio', { name: state, exact: true }))
    const action = screen.getByTestId('manual-action-region')
    fireEvent.click(
      within(action).getByRole('button', {
        name: state.endsWith('rejected')
          ? 'Signing declined'
          : 'Transaction failed',
      })
    )
    expect(screen.getByRole('tooltip')).toHaveTextContent(reason)
    expect(
      within(action).getByTestId('canonical-inline-message')
    ).toHaveAttribute(
      'data-tone',
      state.endsWith('rejected') ? 'information' : 'danger'
    )
    expect(
      within(screen.getByTestId('manual-issuance-task')).getByRole('textbox')
    ).toHaveValue('100')
  })

  it('identifies failed assets without changing the USDT Revoke path', () => {
    render(<AtomicTransactionComposition />)
    fireEvent.click(
      screen.getByRole('radio', { name: 'Partial approval failure' })
    )
    expect(
      within(screen.getByTestId('manual-action-region')).getByRole('status')
    ).toHaveTextContent('Approval failed: USDT')
    const revoke = screen.getByRole('button', { name: 'Revoke USDT' })
    expect(revoke).toHaveAccessibleDescription('Approval failed')
    fireEvent.click(revoke)
    expect(screen.getByText('Revoking...')).toBeVisible()
  })

  it('restores the retained approval setting when an amount is cleared', () => {
    render(<AtomicTransactionComposition />)
    fireEvent.click(
      screen.getByRole('checkbox', { name: 'Approve unlimited token amounts' })
    )
    fireEvent.click(
      screen.getByRole('radio', { name: 'Mint ready', exact: true })
    )
    const task = screen.getByTestId('manual-issuance-task')
    expect(within(task).queryByRole('checkbox')).not.toBeInTheDocument()
    expect(within(task).getByText('Required tokens approved')).toBeVisible()
    fireEvent.change(within(task).getByRole('textbox'), {
      target: { value: '' },
    })
    expect(within(task).getByRole('checkbox')).not.toBeChecked()
    fireEvent.change(within(task).getByRole('textbox'), {
      target: { value: '100' },
    })
    expect(within(task).queryByRole('checkbox')).not.toBeInTheDocument()
  })

  it.each(['Mint outcome', 'Redeem outcome'])(
    'shows completion once and honest basket context in %s',
    (state) => {
      render(<AtomicTransactionComposition />)
      fireEvent.click(screen.getByRole('radio', { name: state, exact: true }))
      const outcome = screen.getByTestId('manual-issuance-outcome')
      expect(within(outcome).getAllByText('Completed')).toHaveLength(1)
      expect(
        within(outcome).getByTestId('transaction-amount-supporting-row')
      ).toBeVisible()
      expect(
        within(outcome).getByTestId('transaction-amount-supporting-row')
      ).toHaveTextContent('$10,041.20')
      const wallet = within(outcome).queryByRole('button', {
        name: 'Track token in your wallet',
      })
      if (state.startsWith('Mint')) {
        expect(wallet).toHaveAttribute('aria-pressed', 'false')
        fireEvent.click(wallet!)
        expect(wallet).toHaveAttribute('aria-pressed', 'true')
      } else {
        expect(wallet).not.toBeInTheDocument()
      }
      expect(
        within(outcome).queryByText('Transaction successful')
      ).not.toBeInTheDocument()
      expect(
        screen.getByRole('heading', {
          name: state.startsWith('Mint')
            ? 'Basket assets used'
            : 'Basket assets received',
        })
      ).toBeVisible()
      expect(screen.getByTestId('manual-issuance-ledger')).toHaveTextContent(
        'Estimated amounts'
      )
      const footer = within(outcome).getByTestId('manual-outcome-footer')
      expect(within(footer).getAllByRole('button')).toHaveLength(2)
      fireEvent.click(
        within(footer).getByRole('button', { name: 'View transaction' })
      )
      expect(screen.getByTestId('manual-navigation-preview')).toHaveTextContent(
        'Etherscan'
      )
      expect(screen.getByTestId('manual-navigation-preview')).toHaveTextContent(
        'no on-chain transaction'
      )
      expect(
        within(outcome).queryByRole('link', { name: /View transaction/ })
      ).not.toBeInTheDocument()
      fireEvent.click(
        within(outcome).getByRole('button', {
          name: state.startsWith('Mint') ? 'New mint' : 'New redeem',
        })
      )
      expect(screen.queryByTestId('manual-issuance-outcome')).toBeNull()
      expect(
        within(screen.getByTestId('manual-issuance-task')).getByRole('textbox')
      ).toHaveValue('')
    }
  )

  it('shows independent progress with one stable high-level action', () => {
    render(<AtomicTransactionComposition />)
    fireEvent.click(
      screen.getByRole('radio', { name: 'Mixed approval progress' })
    )
    const rows = screen.getAllByTestId('transaction-requirement-row')
    const row = (symbol: string) =>
      within(rows.find((r) => r.getAttribute('data-token-symbol') === symbol)!)
    expect(row('WETH').getByTestId('lifecycle-status-pill')).toHaveTextContent(
      'Approved'
    )
    expect(row('AAVE').getByTestId('lifecycle-status-pill')).toHaveTextContent(
      'Confirming'
    )
    expect(row('USDT').getByTestId('lifecycle-status-pill')).toHaveTextContent(
      'Signing'
    )
    expect(screen.getByTestId('manual-issuance-primary-action')).toBeDisabled()
    expect(
      screen.getByTestId('manual-issuance-primary-action')
    ).toHaveTextContent('Awaiting approvals...')
    expect(
      screen.getByTestId('manual-issuance-primary-action')
    ).toHaveAttribute('data-tone', 'primary')
    expect(
      screen.getByTestId('manual-issuance-primary-action')
    ).toHaveAttribute('aria-busy', 'true')
    expect(
      screen.getByTestId('manual-issuance-transaction-action')
    ).toBeDisabled()
    expect(
      screen.getByTestId('manual-issuance-transaction-action')
    ).not.toHaveAttribute('aria-busy')
    expect(screen.getByTestId('manual-approval-progress')).toHaveAccessibleName(
      '3 of 5 tokens approved'
    )
  })

  it('does not claim a permission count before basket reads resolve', () => {
    render(<AtomicTransactionComposition />)
    fireEvent.click(screen.getByRole('radio', { name: 'Basket loading' }))
    expect(screen.getAllByTestId('manual-asset-skeleton')).toHaveLength(5)
    expect(screen.getByTestId('manual-issuance-primary-action')).toBeDisabled()
    expect(
      screen.getByTestId('manual-issuance-primary-action')
    ).not.toHaveTextContent('Approve All')
    expect(
      screen.getByTestId('manual-approvals-section')
    ).not.toHaveTextContent('Approve All (3)')
    fireEvent.click(screen.getByTestId('manual-simulate-reads'))
    expect(
      screen.queryByTestId('manual-asset-skeleton')
    ).not.toBeInTheDocument()
    expect(
      screen.getByTestId('manual-issuance-primary-action')
    ).toHaveTextContent('Approve All (3)')
  })
})
