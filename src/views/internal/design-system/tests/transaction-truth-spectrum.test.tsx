import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import TransactionTruthSpectrum from '../transaction-truth-spectrum'

describe('composition-first transaction-system review', () => {
  it('routes the strongest predecessor and makes its transfer contract inspectable', () => {
    render(<TransactionTruthSpectrum />)

    const contract = screen.getByTestId('transaction-predecessor-contract')

    expect(
      within(contract).getByText(
        'src/views/internal/design-system/zapper-modal-study.tsx'
      )
    ).toBeVisible()
    expect(
      within(contract).getByText(
        'src/views/index-dtf/components/zapper/zapper-wrapper.tsx'
      )
    ).toBeVisible()
    expect(within(contract).getByText('Strong visual evidence')).toBeVisible()
    expect(within(contract).getByText('Not canonical authority')).toBeVisible()
    expect(
      within(contract).getByText('Package-owned control internals')
    ).toBeVisible()
    expect(
      within(contract).getByText(/not package settings, selectors/)
    ).toBeVisible()
    expect(
      within(contract).getAllByText('Intentionally not transferred')
    ).toHaveLength(2)
    expect(within(contract).getByText(/Removal rule:/)).toBeVisible()
  })

  it('leads with the four family anchors and the focused vote-lock flow', () => {
    render(<TransactionTruthSpectrum />)

    const board = screen.getByTestId('transaction-system-review')
    const representativeCompositions = within(board).getByRole('region', {
      name: 'Representative transaction compositions',
    })
    const compositions = within(representativeCompositions).getAllByTestId(
      'transaction-family-composition'
    )

    expect(compositions).toHaveLength(5)
    expect(
      within(representativeCompositions).getByText('Manual mint')
    ).toBeVisible()
    expect(
      within(representativeCompositions).getByText('Instant Zapper')
    ).toBeVisible()
    expect(
      within(representativeCompositions).getByText('Automated mint workspace')
    ).toBeVisible()
    expect(
      within(representativeCompositions).getByText('Unstake and withdraw')
    ).toBeVisible()
    expect(
      within(representativeCompositions).getByText('Vote-lock and unlock')
    ).toBeVisible()

    expect(
      within(representativeCompositions).getByText('Required approvals')
    ).toBeVisible()
    expect(
      within(representativeCompositions).getByText('Buy CMC20')
    ).toBeVisible()
    expect(
      within(representativeCompositions).getByText('Collateral swaps')
    ).toBeVisible()
    expect(
      within(representativeCompositions).getByText('In withdrawal process')
    ).toBeVisible()
    expect(
      within(board).getAllByTestId('transaction-amount-pair').length
    ).toBeGreaterThanOrEqual(3)
  })

  it('shares the hardened substantial-task geometry and editable amount actions', () => {
    render(<TransactionTruthSpectrum />)

    const rfq = screen.getByTestId('transaction-composition-rfq')
    const voteLock = screen.getByTestId('transaction-composition-vote-lock')
    const voteLockSurface = within(voteLock)
      .getByRole('group', { name: 'Vote-lock task mode' })
      .closest('[data-testid="canonical-dialog-surface"]')

    expect(within(rfq).getByTestId('zapper-shell')).toHaveClass('max-w-[432px]')
    expect(voteLockSurface).toHaveClass('sm:max-w-[432px]')

    expect(
      within(voteLock).getByRole('button', { name: 'Max' })
    ).toHaveAttribute('data-testid', 'inline-action')
    fireEvent.click(
      within(voteLock).getByRole('radio', { name: 'Unlock amount' })
    )
    expect(
      within(voteLock).getByRole('button', { name: 'Max' })
    ).toHaveAttribute('data-testid', 'inline-action')

    fireEvent.click(
      within(voteLock).getByRole('radio', { name: 'Lock confirming' })
    )
    const voteLockBoundary = within(voteLock).getByTestId(
      'transaction-amount-pair'
    )
    expect(voteLockBoundary).toHaveAttribute('data-task-boundary', 'leading')
    expect(voteLockBoundary).toHaveClass(
      'before:top-0',
      'before:h-px',
      'before:bg-border'
    )

    fireEvent.click(
      within(rfq).getByRole('radio', { name: 'Atomic confirmation' })
    )
    const zapperBoundary = within(rfq).getByTestId('transaction-amount-pair')
    expect(zapperBoundary).toHaveAttribute('data-task-boundary', 'leading')
    expect(zapperBoundary).toHaveClass(
      'before:top-0',
      'before:h-px',
      'before:bg-border'
    )
  })

  it('presents the four Zapper and Vote Lock review slices as direct comparisons', () => {
    render(<TransactionTruthSpectrum />)

    const pairedReview = screen.getByTestId('transaction-paired-review')
    expect(
      within(pairedReview).getByTestId('paired-zapper-stage')
    ).toHaveTextContent('Buy CMC20')
    expect(
      within(pairedReview).getByTestId('paired-vote-lock-stage')
    ).toHaveTextContent('Vote lock RSR')

    fireEvent.click(
      within(pairedReview).getByRole('radio', {
        name: 'Submitted',
        exact: true,
      })
    )
    expect(
      within(pairedReview).getByTestId('paired-zapper-stage')
    ).toHaveTextContent('Confirming transaction')
    expect(
      within(pairedReview).getByTestId('paired-vote-lock-stage')
    ).toHaveTextContent('Confirming tx...')

    fireEvent.click(
      within(pairedReview).getByRole('radio', {
        name: 'Delayed initiation',
        exact: true,
      })
    )
    const pairedZapperStage = within(pairedReview).getByTestId(
      'paired-zapper-stage'
    )
    const pairedVoteLockStage = within(pairedReview).getByTestId(
      'paired-vote-lock-stage'
    )
    expect(
      within(pairedZapperStage).getByTestId('zapper-outcome-status')
    ).toHaveTextContent('Completed')
    expect(
      within(pairedVoteLockStage).getByTestId('vote-lock-outcome-status')
    ).toHaveTextContent('Unlocking·13d 23h')
    expect(
      within(pairedReview).getByTestId('paired-vote-lock-stage')
    ).toHaveTextContent('Withdraw RSR when ready')
  })

  it('preserves vote-lock approval, share quotes, and delayed withdrawal states in one composition', () => {
    render(<TransactionTruthSpectrum />)

    const voteLock = screen.getByTestId('transaction-composition-vote-lock')

    expect(within(voteLock).getByText('You lock:')).toBeVisible()
    expect(within(voteLock).getByText('0.98155')).toBeVisible()
    expect(
      within(voteLock).getAllByText('1 vlRSR = 1.0188 RSR')[0]
    ).toBeVisible()
    expect(
      within(voteLock).getByText('I understand unlocking takes 14 days')
    ).toBeVisible()
    expect(
      within(voteLock).queryByText(/If you decide to unlock RSR in the future/)
    ).not.toBeInTheDocument()
    fireEvent.click(
      within(voteLock).getByRole('button', {
        name: 'About the 14-day unlock delay',
      })
    )
    expect(
      screen
        .getAllByRole('tooltip')
        .some((node) =>
          node.textContent?.includes(
            'If you decide to unlock RSR in the future'
          )
        )
    ).toBe(true)
    expect(
      within(voteLock).getByRole('button', { name: 'Vote lock RSR' })
    ).toBeDisabled()
    expect(
      within(voteLock).getByRole('group', { name: 'Vote-lock task mode' })
    ).toHaveAttribute('data-width', 'intrinsic')
    const taskSurface = within(voteLock)
      .getByRole('group', { name: 'Vote-lock task mode' })
      .closest('[data-testid="canonical-dialog-surface"]')
    expect(taskSurface).not.toBeNull()
    const taskHeader = within(taskSurface as HTMLElement).getByRole('group', {
      name: 'Vote-lock task mode',
    }).parentElement?.parentElement
    expect(taskHeader).toHaveClass('px-2', 'pb-4', 'pt-2')
    expect(taskHeader).not.toHaveClass('px-4')
    expect(
      within(taskSurface as HTMLElement).getByTestId('vote-lock-action-footer')
    ).toHaveClass('pt-0')
    expect(
      within(taskSurface as HTMLElement).getByTestId('vote-lock-action-footer')
    ).not.toHaveClass('pt-3')
    expect(
      within(voteLock).getByRole('button', {
        name: 'Switch to unlock',
      })
    ).toBeVisible()
    fireEvent.click(
      within(voteLock).getByRole('button', { name: 'Switch to unlock' })
    )
    expect(within(voteLock).getByText('You unlock:')).toBeVisible()
    fireEvent.click(
      within(voteLock).getByRole('button', { name: 'Switch to vote-lock' })
    )
    expect(within(voteLock).getByText('You lock:')).toBeVisible()
    expect(
      within(voteLock).getByTestId('vote-lock-task-facts-region')
    ).toHaveClass('border-t', 'border-border', 'divide-y', 'divide-border')
    expect(within(voteLock).getByTestId('vote-lock-task-details')).toHaveClass(
      'grid',
      'gap-2',
      'px-4',
      'py-4'
    )
    expect(
      within(voteLock).getByTestId('vote-lock-exchange-rate')
    ).not.toHaveClass('border-t', 'px-4', 'py-4')
    expect(
      within(voteLock).getByTestId('vote-lock-acknowledgement')
    ).not.toHaveClass('border-t')

    const lockAmount = within(voteLock).getByRole('textbox', {
      name: 'You lock: amount',
    })
    fireEvent.change(lockAmount, { target: { value: '2' } })
    expect(lockAmount).toHaveValue('2')
    expect(within(voteLock).queryByText('0.98155')).not.toBeInTheDocument()
    fireEvent.change(lockAmount, { target: { value: '1' } })

    fireEvent.click(within(voteLock).getByRole('radio', { name: 'Lock ready' }))
    expect(
      within(voteLock).getByRole('checkbox', {
        name: 'Acknowledge unlock delay',
      })
    ).toBeChecked()
    expect(
      within(voteLock).getByRole('button', { name: 'Vote lock RSR' })
    ).toBeEnabled()

    fireEvent.click(
      within(voteLock).getByRole('radio', { name: 'Lock amount' })
    )
    fireEvent.click(
      within(voteLock).getByRole('checkbox', {
        name: 'Acknowledge unlock delay',
      })
    )

    fireEvent.click(within(voteLock).getByRole('radio', { name: 'Approval' }))
    expect(
      within(voteLock).getByRole('button', { name: 'Approve use of RSR' })
    ).toBeEnabled()
    expect(
      within(voteLock).getByRole('button', { name: 'Switch to unlock' })
    ).toBeVisible()
    expect(
      within(voteLock).getByRole('textbox', { name: 'You lock: amount' })
    ).toBeEnabled()

    fireEvent.click(
      within(voteLock).getByRole('radio', { name: 'Lock wallet' })
    )
    expect(
      within(voteLock).getByRole('button', { name: 'Pending, sign in wallet' })
    ).toBeVisible()
    expect(
      within(voteLock).queryByRole('button', { name: 'Switch to unlock' })
    ).not.toBeInTheDocument()
    expect(
      within(voteLock).getByTestId('transaction-amount-relation-indicator')
    ).toBeVisible()
    expect(
      within(voteLock).getByRole('radio', {
        name: 'Vote-lock',
        exact: true,
      })
    ).toBeDisabled()
    expect(
      within(voteLock).getByRole('radio', { name: 'Unlock', exact: true })
    ).toBeDisabled()

    fireEvent.click(
      within(voteLock).getByRole('radio', { name: 'Lock confirming' })
    )
    expect(within(voteLock).getAllByText('Confirming tx...')).toHaveLength(1)

    fireEvent.click(within(voteLock).getByRole('radio', { name: 'Locked' }))
    expect(
      within(voteLock).getByTestId('vote-lock-outcome-status')
    ).toHaveTextContent('Completed')
    expect(within(voteLock).getByText('Received')).toBeVisible()
    const voteLockOutcomeValue = within(
      within(voteLock).getByTestId('vote-lock-outcome-value-region')
    )
    expect(
      voteLockOutcomeValue.queryByTestId('transaction-amount-asset-identity')
    ).toBeNull()
    const voteLockOutcomeUnit = voteLockOutcomeValue.getByTestId(
      'transaction-amount-unit'
    )
    expect(voteLockOutcomeUnit).toHaveTextContent('vlRSR')
    expect(voteLockOutcomeUnit).toHaveClass('text-brand-foreground/70')
    expect(voteLockOutcomeUnit.parentElement).toHaveTextContent('0.98155vlRSR')
    expect(
      voteLockOutcomeValue.queryByRole('button', {
        name: 'Track token in your wallet',
      })
    ).toBeNull()
    expect(
      within(voteLock).getByTestId('vote-lock-outcome-surface')
    ).toHaveAttribute('data-component', 'organic-brand-surface')
    const lockOutcomeSurface = within(voteLock)
      .getByTestId('vote-lock-outcome-status')
      .closest('[data-testid="canonical-dialog-surface"]')
    expect(lockOutcomeSurface).toHaveClass('flex', 'min-h-[26rem]', 'flex-col')
    expect(within(voteLock).getByTestId('vote-lock-outcome-hero')).toHaveClass(
      'flex',
      'flex-1',
      'flex-col'
    )
    expect(
      within(voteLock).getByTestId('vote-lock-outcome-value-region')
    ).toHaveClass('flex', 'flex-col', 'justify-end', 'pb-2')
    const lockOutcomeDetails = within(voteLock).getByTestId(
      'vote-lock-outcome-details'
    )
    expect(lockOutcomeDetails.firstElementChild).toHaveClass('pb-4', 'pt-4')
    expect(
      within(lockOutcomeDetails).queryByText('Vote lock successful')
    ).not.toBeInTheDocument()
    expect(within(lockOutcomeDetails).queryByText('Transaction')).toBeNull()
    expect(within(lockOutcomeDetails).queryByText('0x5a61…56da')).toBeNull()
    expect(
      within(voteLock).queryByRole('button', { name: 'Copy to clipboard' })
    ).toBeNull()
    expect(
      within(voteLock).getByRole('link', { name: /View transaction/ })
    ).toHaveAttribute('data-tone', 'secondary')
    expect(
      within(voteLock).getByRole('link', { name: /View transaction/ })
    ).toHaveAttribute(
      'href',
      'https://bscscan.com/tx/0x5a61270a74cda50d2ca2d6ee5016f4502e77a7b6e7996345f1684c67d27d56da'
    )
    expect(
      within(voteLock).getByRole('button', { name: 'Done' })
    ).toHaveAttribute('data-tone', 'primary')
    expect(within(voteLock).getByTestId('canonical-action-group')).toHaveClass(
      'gap-2'
    )

    fireEvent.click(
      within(voteLock).getByRole('radio', { name: 'Unlock amount' })
    )
    expect(within(voteLock).getByText('You unlock:')).toBeVisible()
    expect(within(voteLock).getByText('1.0188')).toBeVisible()
    expect(
      within(voteLock).getByRole('button', {
        name: 'Begin 14-day unlock delay',
      })
    ).toBeVisible()
    expect(
      within(voteLock).getByTestId('vote-lock-unlock-delay')
    ).toHaveTextContent('Unlock delay14 days · rewards stop')
    expect(
      within(voteLock).queryByText(
        /Come back to your account balance page to withdraw/
      )
    ).not.toBeInTheDocument()

    fireEvent.click(
      within(voteLock).getByRole('radio', { name: 'Unlock processing' })
    )
    expect(
      within(voteLock).getByRole('button', {
        name: 'Processing transaction...',
      })
    ).toBeVisible()
    expect(
      within(voteLock).queryByText(
        /A 14-day unlock delay period begins & you stop accumulating rewards/
      )
    ).not.toBeInTheDocument()

    fireEvent.click(
      within(voteLock).getByRole('radio', { name: 'Unlock initiated' })
    )
    const delayedOutcomeStatus = within(voteLock).getByTestId(
      'vote-lock-outcome-status'
    )
    expect(delayedOutcomeStatus).toHaveAttribute(
      'data-outcome-status',
      'delayed'
    )
    expect(delayedOutcomeStatus).toHaveAccessibleName(
      'Unlocking, 13 days 23 hours remaining'
    )
    expect(
      within(delayedOutcomeStatus).getByTestId('transaction-outcome-progress')
    ).toHaveClass('animate-spin', 'motion-reduce:animate-none')
    expect(
      within(delayedOutcomeStatus).getByTestId('transaction-outcome-progress')
        .parentElement
    ).toHaveClass('bg-foreground/10', 'text-foreground')
    expect(
      within(voteLock).getByTestId('vote-lock-outcome-surface')
    ).toHaveClass(
      '[animation:transaction-outcome-surface-in_360ms_ease-out_both]',
      'motion-reduce:animate-none'
    )
    expect(
      within(voteLock).getByTestId('vote-lock-outcome-header')
    ).toHaveClass(
      'motion-safe:[animation:transaction-outcome-content-in_360ms_ease-out_both]'
    )
    expect(
      within(voteLock).getByTestId('vote-lock-outcome-value-region')
    ).toHaveClass(
      'motion-safe:[animation:transaction-outcome-content-in_360ms_ease-out_both]'
    )
    expect(
      within(delayedOutcomeStatus).getByTestId('transaction-outcome-remaining')
    ).toHaveTextContent('13d 23h')
    expect(
      within(voteLock).getByTestId('vote-lock-outcome-value-region')
    ).toHaveTextContent('Pending withdrawal')
    const unlockOutcomeDetails = within(voteLock).getByTestId(
      'vote-lock-outcome-details'
    )
    expect(
      within(unlockOutcomeDetails).queryByText('Unlock initiated successfully')
    ).not.toBeInTheDocument()
    expect(
      within(unlockOutcomeDetails).getByTestId(
        'vote-lock-unlock-next-action-fact'
      )
    ).toHaveTextContent('Next actionWithdraw RSR when ready')
    expect(
      within(unlockOutcomeDetails).queryByText(
        /Come back to your account balance page/
      )
    ).not.toBeInTheDocument()
    fireEvent.click(within(voteLock).getByRole('button', { name: 'Done' }))
    expect(within(voteLock).getByText('Pending Withdrawals')).toBeVisible()

    fireEvent.click(within(voteLock).getByRole('radio', { name: 'Cooldown' }))
    expect(within(voteLock).getByText('Pending Withdrawals')).toBeVisible()
    expect(
      within(voteLock).getByTestId('vote-lock-pending-withdrawal-section')
    ).not.toHaveClass('mt-5')
    expect(within(voteLock).getByText('13d 23h')).toBeVisible()
    expect(
      within(voteLock).getByRole('button', { name: 'Withdraw' })
    ).toBeDisabled()

    fireEvent.click(within(voteLock).getByRole('radio', { name: 'Ready' }))
    expect(
      within(voteLock).getByRole('button', { name: 'Withdraw' })
    ).toBeEnabled()

    fireEvent.click(within(voteLock).getByRole('radio', { name: 'Withdrawn' }))
    expect(within(voteLock).getByText('Withdrawal successful')).toBeVisible()
    expect(
      within(voteLock).getByTestId('vote-lock-pending-withdrawal-section')
    ).toHaveClass('mt-5')
    expect(
      within(voteLock).getByRole('button', { name: 'Withdrawn' })
    ).toBeDisabled()
  })

  it('lets the contained Vote Lock modal close, reopen, and dismiss with Escape', () => {
    render(<TransactionTruthSpectrum />)

    const voteLock = screen.getByTestId('transaction-composition-vote-lock')
    const dialog = within(voteLock).getByRole('dialog', {
      name: 'Govern PHOTON',
    })
    expect(dialog).toHaveAttribute('aria-modal', 'true')

    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Close Vote Lock' })
    )
    expect(
      within(voteLock).queryByRole('dialog', { name: 'Govern PHOTON' })
    ).not.toBeInTheDocument()
    expect(
      within(voteLock).getByRole('button', { name: 'Vote-lock $RSR' })
    ).toHaveFocus()

    fireEvent.click(
      within(voteLock).getByRole('button', { name: 'Vote-lock $RSR' })
    )
    const reopened = within(voteLock).getByRole('dialog', {
      name: 'Govern PHOTON',
    })
    expect(reopened).toHaveFocus()
    expect(
      within(reopened).getByRole('button', { name: 'Close Vote Lock' })
    ).not.toHaveFocus()

    fireEvent.keyDown(reopened, { key: 'Escape' })
    expect(
      within(voteLock).queryByRole('dialog', { name: 'Govern PHOTON' })
    ).not.toBeInTheDocument()
  })

  it('routes direct product implementations and makes the conservative reconciliation explicit', () => {
    render(<TransactionTruthSpectrum />)

    const contract = screen.getByTestId('transaction-current-flow-contract')

    for (const source of [
      'issuance/manual/components/index-manual-issuance.tsx',
      'components/zapper/zapper-wrapper.tsx',
      'async-mint/steps/quote-summary.tsx',
      'staking/components/unstake/unstake-modal.tsx',
      'components/vote-lock/drawer.tsx',
      'components/vote-lock/components/vote-lock.tsx',
      'components/vote-lock/components/vote-unlock.tsx',
      'components/vote-lock/hooks/use-vote-lock-quotes.ts',
      'governance/components/governance-vote-lock.tsx',
      'portfolio-page/components/pending-withdrawals.tsx',
    ]) {
      expect(within(contract).getByText(new RegExp(source))).toBeVisible()
    }

    for (const disposition of [
      'Preserve',
      'Standardize visually',
      'Consolidate',
      'Deliberately improve',
      'Do not touch yet',
    ]) {
      expect(within(contract).getAllByText(disposition)[0]).toBeVisible()
    }

    expect(
      within(contract).getByText(/No separate global timeline/)
    ).toBeVisible()
    expect(
      within(contract).getAllByText(/narrow configure step expands/)[0]
    ).toBeVisible()
    expect(
      within(contract).getByText(/input page, review modal, and durable queue/)
    ).toBeVisible()
  })

  it('preserves the real manual-mint input and approval-to-mint action slot', () => {
    render(<TransactionTruthSpectrum />)

    const atomic = screen.getByTestId('transaction-composition-atomic')

    expect(
      within(atomic).getByRole('textbox', { name: 'Shares to mint amount' })
    ).toHaveValue('100')
    expect(
      within(atomic).getByRole('button', { name: 'Approve all (2)' })
    ).toBeVisible()
    expect(within(atomic).getByText('Max 24.63 CMC20')).toBeVisible()
    expect(
      within(atomic).queryByText('Balance 24.63 CMC20')
    ).not.toBeInTheDocument()
    expect(
      within(atomic).queryByRole('button', { name: 'Edit amount' })
    ).not.toBeInTheDocument()
    expect(within(atomic).getByRole('button', { name: 'Use' })).toHaveAttribute(
      'data-testid',
      'inline-action'
    )
    expect(within(atomic).getByText('Required approvals')).toBeVisible()
    expect(
      within(atomic).getByTestId('transaction-requirements-list')
    ).not.toHaveClass('px-1')
    expect(
      within(atomic).getByTestId('transaction-requirements-header')
    ).toHaveClass('grid', 'gap-4', 'sm:grid-cols-[minmax(0,1fr)_auto]')

    fireEvent.click(within(atomic).getByRole('radio', { name: 'Outcome' }))
    expect(within(atomic).getByText('Estimated basket value')).toBeVisible()
    expect(within(atomic).getByText('Minted shares')).toBeVisible()
    expect(within(atomic).queryByText('Basket value spent')).toBeNull()
  })

  it('preserves automated mint progressive disclosure instead of forcing one persistent workspace', () => {
    render(<TransactionTruthSpectrum />)

    const staged = screen.getByTestId('transaction-composition-staged')
    fireEvent.click(within(staged).getByRole('radio', { name: 'Configure' }))

    expect(within(staged).getByText('Enter USDC amount')).toBeVisible()
    expect(
      within(staged).getByRole('button', { name: 'Get quote' })
    ).toBeVisible()
    expect(
      within(staged).queryByRole('button', { name: 'Select input asset' })
    ).not.toBeInTheDocument()
    expect(within(staged).getByText('1')).toBeVisible()
    const configureSteps = within(staged).getAllByTestId(
      'automated-configure-step-content'
    )
    expect(configureSteps).toHaveLength(3)
    for (const step of configureSteps) {
      expect(step).toHaveClass('items-center')
      expect(step).not.toHaveClass('items-start')
    }
    expect(
      within(staged).queryByText('Collateral swaps')
    ).not.toBeInTheDocument()

    fireEvent.click(within(staged).getByRole('radio', { name: 'Execution' }))
    expect(within(staged).getByText('Collateral swaps')).toBeVisible()
    expect(within(staged).getByText('1 of 2 orders filled')).toBeVisible()
    expect(within(staged).getByText('Estimated output')).toBeVisible()
    expect(
      within(staged).queryByText(/final after collateral trades/)
    ).not.toBeInTheDocument()
  })

  it('keeps the ordinary Zapper quote complete and its supporting controls real', () => {
    render(<TransactionTruthSpectrum />)

    const rfq = screen.getByTestId('transaction-composition-rfq')
    expect(screen.getByTestId('transaction-composition-rfq-stage')).toHaveClass(
      'h-[980px]',
      '[@container(min-width:980px)]:h-[760px]',
      'items-center',
      'justify-center',
      'bg-background'
    )
    expect(rfq.closest('article')).toHaveClass('[container-type:inline-size]')
    expect(
      screen.getByTestId('transaction-composition-rfq-overlay')
    ).toHaveClass('absolute', 'inset-0', 'bg-black/50')

    expect(within(rfq).getByText('Instant Zapper')).toBeVisible()
    expect(within(rfq).getByText('≈$990.00')).toBeVisible()
    expect(within(rfq).getByRole('button', { name: 'Buy CMC20' })).toBeVisible()
    expect(
      within(rfq).getByRole('button', { name: 'Close Zapper' })
    ).toBeVisible()
    expect(within(rfq).getByRole('radio', { name: 'Buy' })).toBeChecked()
    const maxAction = within(rfq).getByRole('button', { name: 'Max' })
    expect(maxAction).toHaveAttribute('data-testid', 'inline-action')
    expect(maxAction).toHaveClass('h-5', 'p-0', 'text-primary')

    const [inputAmount, outputAmount] = within(rfq).getAllByTestId(
      'transaction-amount-object'
    )
    const inputIdentity = within(inputAmount).getByTestId(
      'transaction-amount-asset-identity'
    )
    const outputIdentity = within(outputAmount).getByTestId(
      'transaction-amount-asset-identity'
    )
    expect(inputIdentity).toHaveClass('text-xl')
    expect(outputIdentity).toHaveClass('text-xl')
    expect(
      within(inputAmount).getByTestId('canonical-chain-badged-logo')
    ).toBeVisible()
    expect(
      within(outputAmount).getByTestId('canonical-chain-badged-logo')
    ).toBeVisible()
    expect(within(outputAmount).getByText('Estimated output')).toBeVisible()
    expect(
      within(outputAmount).getByTestId('zapper-output-value-delta')
    ).toHaveTextContent('(-1.00%)')
    expect(outputAmount).toHaveClass('border-b', 'rounded-b-none')
    expect(
      within(outputAmount).queryByText(/final after order fill/)
    ).not.toBeInTheDocument()
    const amountAndDetails = within(rfq).getByTestId(
      'zapper-amount-and-details'
    )
    expect(within(rfq).getByTestId('transaction-amount-pair')).toHaveClass(
      'space-y-1'
    )
    expect(within(rfq).getByTestId('transaction-amount-pair')).not.toHaveClass(
      'before:bg-border'
    )
    expect(maxAction.parentElement?.parentElement).toHaveClass('min-h-5')
    expect(
      within(rfq)
        .getAllByTestId('transaction-amount-object')[0]
        .children.item(1)
    ).toHaveClass('min-h-10')
    const quoteDetails = within(rfq).getByTestId('zapper-quote-details')
    expect(quoteDetails).not.toHaveClass('border-t')
    expect(within(rfq).getByTestId('zapper-review-stack')).toHaveClass(
      'min-w-0',
      'space-y-0'
    )
    expect(within(rfq).getByTestId('zapper-review-stack')).not.toHaveClass(
      'grid'
    )
    expect(quoteDetails.parentElement).toBe(amountAndDetails)
    expect(quoteDetails.previousElementSibling).toHaveAttribute(
      'data-testid',
      'transaction-amount-pair'
    )
    expect(
      within(quoteDetails).getByRole('button', {
        name: 'Show quote details',
      })
    ).toHaveClass('py-4')
    expect(
      within(quoteDetails).getByTestId('zapper-fees-label').querySelector('svg')
    ).not.toBeInTheDocument()

    fireEvent.click(within(rfq).getByRole('radio', { name: 'Sell' }))
    expect(within(rfq).getByText('You use')).toBeVisible()
    expect(
      within(rfq).getByRole('button', { name: 'Sell CMC20' })
    ).toBeVisible()
    expect(
      within(rfq).getByTestId('zapper-output-value-delta')
    ).toHaveTextContent('(-0.36%)')
    expect(
      within(rfq).getByRole('button', { name: 'Select output asset' })
    ).toBeVisible()
    expect(
      within(rfq).getByTestId('transaction-asset-picker-indicator')
    ).toHaveClass('size-6')
    expect(
      within(rfq)
        .getByTestId('transaction-asset-picker-indicator')
        .querySelector('svg')
    ).toHaveClass('size-4')
    expect(
      within(rfq).getByTestId('transaction-asset-picker-indicator')
    ).not.toHaveClass('rounded-full', 'border-border', 'bg-card')
    expect(
      within(rfq).getByTestId('transaction-asset-picker-trigger')
    ).toHaveClass('h-10', 'gap-1', 'border-input', 'bg-card', 'px-2')
    fireEvent.click(within(rfq).getByRole('radio', { name: 'Buy' }))

    fireEvent.click(
      within(rfq).getByRole('button', { name: 'Show quote details' })
    )
    expect(within(rfq).getByText('Minimum output')).toBeVisible()
    expect(within(rfq).getByText('Price impact')).toBeVisible()
    expect(within(rfq).getByText('Network estimate')).toBeVisible()

    fireEvent.click(
      within(rfq).getByRole('button', { name: 'Select input asset' })
    )
    expect(
      screen.getByRole('group', { name: 'Zapper input assets' })
    ).toBeVisible()
    const assetOptions = screen.getByRole('group', {
      name: 'Zapper input assets',
    })
    expect(within(assetOptions).getByText('Base · 0x8335…2913')).toBeVisible()
    const optionRows = within(assetOptions).getAllByTestId(
      'transaction-asset-picker-option'
    )
    expect(optionRows).toHaveLength(3)
    expect(optionRows[0]).toHaveAttribute('aria-pressed', 'true')
    expect(optionRows[0]).toHaveClass('bg-accent/60')
    expect(optionRows[0]).not.toHaveClass('ring-1', 'ring-inset')
    expect(optionRows[1]).toHaveAttribute('aria-pressed', 'false')
    expect(
      within(assetOptions).queryByTestId('transaction-asset-picker-check')
    ).toBeNull()
    for (const option of optionRows) {
      const identity = within(option).getByTestId('canonical-entity-identity')
      const copy = identity.lastElementChild
      const name = copy?.firstElementChild
      const supporting = copy?.lastElementChild
      const balance = within(option).getByTestId(
        'transaction-asset-picker-balance'
      )

      expect(option).toHaveClass('p-3')
      expect(identity).toHaveClass(
        '[&_[data-slot=entity-identity-name]]:leading-4',
        '[&_[data-slot=entity-identity-supporting]]:leading-4'
      )
      expect(name).toHaveClass('text-sm', 'font-medium', 'leading-5')
      expect(supporting).toHaveClass('text-sm', 'font-light', 'leading-5')
      expect(supporting).not.toHaveClass('mt-1', 'text-xs', 'leading-tight')
      expect(balance).toHaveClass('text-sm', 'leading-4')
    }
  })

  it('separates Zapper lifecycle, review variants, and outcome attachments', () => {
    render(<TransactionTruthSpectrum />)

    const rfq = screen.getByTestId('transaction-composition-rfq')
    const lifecycle = within(rfq).getByRole('group', {
      name: 'Instant Zapper lifecycle state',
    })
    const reviewVariants = within(rfq).getByRole('group', {
      name: 'Instant Zapper review variant',
    })
    const outcomeAttachments = within(rfq).getByRole('group', {
      name: 'Instant Zapper outcome attachment',
    })

    expect(
      within(lifecycle).getByRole('radio', { name: 'Review' })
    ).toBeChecked()
    expect(
      within(lifecycle).getByRole('radio', { name: 'Atomic confirmation' })
    ).toBeVisible()
    expect(
      within(lifecycle).getByRole('radio', { name: 'RFQ execution' })
    ).toBeVisible()
    expect(
      within(lifecycle).getByRole('radio', { name: 'Quote failure' })
    ).toBeVisible()
    expect(
      within(lifecycle).getByRole('radio', { name: 'Native refund' })
    ).toBeVisible()
    expect(
      within(reviewVariants).getByRole('radio', {
        name: 'High-impact acknowledgment',
      })
    ).toBeVisible()
    expect(
      within(reviewVariants).getByRole('radio', {
        name: 'Market-hours advisory',
      })
    ).toBeVisible()
    expect(
      within(outcomeAttachments).getByRole('radio', { name: 'Updates' })
    ).toBeVisible()
  })

  it('keeps visible Zapper settings and direction controls functional', () => {
    render(<TransactionTruthSpectrum />)

    const rfq = screen.getByTestId('transaction-composition-rfq')
    fireEvent.click(
      within(rfq).getByRole('button', { name: 'Open Zapper settings' })
    )
    expect(
      screen.getByRole('dialog', { name: 'Zapper settings' })
    ).toBeVisible()
    expect(screen.getByText('Quote Source')).toBeVisible()
    expect(screen.getByText('Best Quote')).toBeVisible()
    expect(screen.getByText('Max. mint slippage')).toBeVisible()
    expect(screen.getByText('Deep liquidity search')).toBeVisible()

    fireEvent.click(
      within(rfq).getByRole('button', {
        name: 'Swap input and output assets',
      })
    )
    expect(within(rfq).getByRole('radio', { name: 'Sell' })).toBeChecked()
    expect(
      within(rfq).getByRole('button', { name: 'Select output asset' })
    ).toBeVisible()
  })

  it('restores a dismissed Zapper review advisory when its state is revisited', () => {
    render(<TransactionTruthSpectrum />)

    const rfq = screen.getByTestId('transaction-composition-rfq')
    fireEvent.click(
      within(rfq).getByRole('radio', { name: 'Market-hours advisory' })
    )
    fireEvent.click(
      within(rfq).getByRole('button', { name: 'Dismiss suggestion' })
    )
    expect(within(rfq).queryByTestId('zapper-review-advisory')).toBeNull()

    fireEvent.click(within(rfq).getByRole('radio', { name: 'Review' }))
    fireEvent.click(
      within(rfq).getByRole('radio', { name: 'Market-hours advisory' })
    )
    expect(within(rfq).getByTestId('zapper-review-advisory')).toBeVisible()
  })

  it('covers atomic confirmation, quote failure, and native RFQ refund truth', () => {
    render(<TransactionTruthSpectrum />)

    const rfq = screen.getByTestId('transaction-composition-rfq')

    fireEvent.click(
      within(rfq).getByRole('radio', { name: 'Atomic confirmation' })
    )
    expect(
      within(rfq).getByRole('button', { name: 'Confirming transaction' })
    ).toHaveAttribute('aria-busy', 'true')
    expect(within(rfq).queryByText('CoW Swap')).toBeNull()
    expect(within(rfq).getByText('Enso')).toBeVisible()
    expect(within(rfq).getByText('Exchange rate')).toBeVisible()

    fireEvent.click(within(rfq).getByRole('radio', { name: 'Atomic outcome' }))
    expect(within(rfq).getByText('Executed via')).toBeVisible()
    expect(within(rfq).getByText('Enso')).toBeVisible()
    expect(within(rfq).queryByText('0x7fc2…92ad')).toBeNull()
    expect(
      within(rfq).queryByRole('button', { name: 'Copy to clipboard' })
    ).toBeNull()
    expect(
      within(rfq).getByRole('link', { name: /View transaction/ })
    ).toHaveAttribute('data-tone', 'secondary')
    expect(
      within(rfq).getByRole('link', { name: /View transaction/ })
    ).toHaveAttribute(
      'href',
      'https://basescan.org/tx/0x7fc2e37d2b9fb28674640223e7655f1d8ca8c3044b52e85523a62fb85e5b92ad'
    )
    expect(within(rfq).getByRole('button', { name: 'Done' })).toHaveAttribute(
      'data-tone',
      'primary'
    )

    fireEvent.click(within(rfq).getByRole('radio', { name: 'Quote failure' }))
    expect(
      within(rfq).getByText('Zaps are currently experiencing issues')
    ).toBeVisible()
    expect(within(rfq).getByRole('button', { name: 'Refresh' })).toBeVisible()

    fireEvent.click(within(rfq).getByRole('radio', { name: 'Native refund' }))
    expect(
      within(rfq).getByText(/CoW Protocol will automatically refund your ETH/)
    ).toBeVisible()
    expect(within(rfq).getByText('ETH')).toBeVisible()

    fireEvent.click(
      within(rfq).getByRole('radio', { name: 'High-impact acknowledgment' })
    )
    const priceImpactMessage = within(rfq).getByTestId(
      'canonical-inline-message'
    )
    expect(
      within(priceImpactMessage).getByRole('checkbox', {
        name: 'High price impact: 5.8%',
      })
    ).toBeVisible()
  })

  it('keeps RFQ execution compact while preserving filled and expired evidence', async () => {
    render(<TransactionTruthSpectrum />)

    const rfq = screen.getByTestId('transaction-composition-rfq')

    fireEvent.click(within(rfq).getByRole('radio', { name: 'RFQ execution' }))
    expect(within(rfq).getByRole('radio', { name: 'Buy' })).toBeDisabled()
    expect(within(rfq).getByRole('radio', { name: 'Sell' })).toBeDisabled()
    expect(
      within(rfq).getByRole('button', { name: 'Open Zapper settings' })
    ).toBeDisabled()
    expect(
      within(rfq).getByRole('button', { name: 'Refresh quote' })
    ).toBeDisabled()
    expect(
      within(rfq).getByRole('button', {
        name: 'Waiting for order to fill…',
      })
    ).toHaveAttribute('aria-busy', 'true')
    const [submittedInput] = within(rfq).getAllByTestId(
      'transaction-amount-object'
    )
    expect(submittedInput).toHaveClass('bg-card')
    expect(submittedInput).not.toHaveClass('bg-muted')
    expect(within(submittedInput).getByText('You use')).not.toHaveClass(
      'text-primary'
    )
    expect(within(submittedInput).getByText('1,000')).toHaveClass(
      'text-foreground'
    )
    expect(
      within(rfq).getByTestId('transaction-amount-relation-divider')
    ).toHaveClass('inset-x-0', 'h-px', 'bg-border')
    expect(
      within(rfq).getByTestId('transaction-amount-relation-indicator')
    ).toHaveClass('size-8', 'bg-card', 'ring-card')
    expect(
      within(rfq).getByTestId('transaction-amount-relation-indicator')
    ).not.toHaveClass('border', 'bg-muted')
    expect(within(rfq).getByTestId('transaction-amount-pair')).toHaveClass(
      'before:inset-x-0',
      'before:top-0',
      'before:h-px',
      'before:bg-border'
    )
    expect(within(rfq).queryByText('0x71A4…8C2F')).not.toBeInTheDocument()
    expect(within(rfq).queryByText(/Expires in/)).not.toBeInTheDocument()
    expect(
      within(rfq).queryByRole('link', { name: /View order/ })
    ).not.toBeInTheDocument()

    fireEvent.click(within(rfq).getByRole('radio', { name: 'RFQ outcome' }))
    expect(within(rfq).getByTestId('zapper-outcome-status')).toHaveTextContent(
      'Completed'
    )
    expect(within(rfq).getByTestId('zapper-shell')).toHaveClass(
      'relative',
      'z-10',
      'p-0',
      'ring-2',
      'ring-card'
    )
    const outcomeSurface = within(rfq).getByTestId('zapper-outcome-surface')
    expect(outcomeSurface).toHaveAttribute(
      'data-component',
      'organic-brand-surface'
    )
    expect(outcomeSurface).toHaveAttribute('aria-hidden', 'true')
    expect(outcomeSurface).toHaveClass(
      'rounded-lg',
      'bg-brand',
      '[animation:transaction-outcome-surface-in_360ms_ease-out_both]'
    )
    expect(within(rfq).getByTestId('zapper-outcome-status')).toHaveClass(
      'bg-card'
    )
    expect(
      within(rfq).getByRole('button', { name: 'Close Zapper' })
    ).toHaveAttribute('data-tone', 'secondary')
    expect(within(rfq).getByTestId('zapper-input-transition')).toHaveAttribute(
      'aria-hidden',
      'true'
    )
    expect(within(rfq).getByTestId('zapper-input-transition')).toHaveClass(
      'grid-rows-[0fr]',
      'opacity-0'
    )
    expect(
      within(rfq).getByTestId('transaction-amount-relation-divider')
    ).toHaveClass('opacity-0')
    const outcomeOutput = within(rfq).getByTestId('zapper-output-transition')
    expect(within(rfq).getByTestId('transaction-amount-pair')).toHaveClass(
      'pb-2'
    )
    expect(within(outcomeOutput).getByText('Received')).toBeVisible()
    expect(within(outcomeOutput).getByText('986.42')).toBeVisible()
    expect(within(outcomeOutput).queryByText('Estimated output')).toBeNull()
    expect(
      within(outcomeOutput).getByTestId('transaction-amount-object')
    ).toHaveAttribute('data-tone', 'inverse')
    expect(
      within(outcomeOutput).getByTestId('transaction-amount-object')
    ).toHaveClass('px-6')
    expect(
      within(outcomeOutput).queryByTestId('transaction-amount-asset-identity')
    ).toBeNull()
    const rfqOutcomeUnit = within(outcomeOutput).getByTestId(
      'transaction-amount-unit'
    )
    expect(rfqOutcomeUnit).toHaveTextContent('CMC20')
    expect(rfqOutcomeUnit).toHaveClass('text-brand-foreground/70')
    expect(rfqOutcomeUnit.parentElement).toHaveTextContent('986.42CMC20')
    const walletAction = within(outcomeOutput).getByRole('button', {
      name: 'Track token in your wallet',
    })
    expect(walletAction).toHaveAttribute('data-size', 'compact')
    expect(walletAction).toHaveAttribute('data-tone', 'secondary')
    expect(
      within(walletAction).getByTestId('transaction-wallet-add-glyph')
    ).toBeVisible()
    fireEvent.click(walletAction)
    expect(
      within(walletAction).getByTestId('transaction-wallet-tracked-glyph')
    ).toBeVisible()
    const outcomeFacts = within(rfq).getByTestId('zapper-outcome-facts')
    expect(outcomeFacts).toHaveClass('gap-2', 'pb-4', 'pt-4')
    expect(within(outcomeFacts).getByText('Filled via')).toBeVisible()
    expect(within(outcomeFacts).getByText('CoW Swap')).toBeVisible()
    expect(within(outcomeFacts).queryByText('Order')).toBeNull()
    expect(
      within(outcomeFacts).queryByRole('link', { name: /View order/ })
    ).toBeNull()
    expect(within(rfq).queryByText('Order filled')).toBeNull()
    expect(within(rfq).queryByText('Transaction successful')).toBeNull()
    expect(
      within(rfq).queryByRole('button', { name: /outcome details/i })
    ).not.toBeInTheDocument()
    expect(within(rfq).getByTestId('zapper-quote-details')).toHaveClass('mx-2')
    expect(within(rfq).getByText('Used')).toBeVisible()
    expect(within(rfq).getByText('1,000 USDC')).toBeVisible()
    expect(within(rfq).getByText('Final vs input')).toBeVisible()
    expect(within(rfq).getByText('Value received')).toBeVisible()
    const viewOrder = within(rfq).getByRole('link', { name: /View order/ })
    expect(viewOrder).toHaveAttribute('data-tone', 'secondary')
    expect(viewOrder.getAttribute('href')).toMatch(
      /^https:\/\/explorer\.cow\.fi\/orders\/0x[0-9a-f]{112}$/
    )
    expect(within(rfq).getByRole('button', { name: 'Done' })).toHaveAttribute(
      'data-tone',
      'primary'
    )
    expect(within(rfq).getByTestId('zapper-outcome-action-inset')).toHaveClass(
      'mx-2',
      'pb-2'
    )
    expect(within(rfq).queryByText('Returned')).not.toBeInTheDocument()

    fireEvent.click(within(rfq).getByRole('radio', { name: 'Updates' }))
    const updatesAttachment = await within(rfq).findByTestId(
      'zapper-outcome-attachment'
    )
    expect(updatesAttachment).toHaveAttribute('data-attachment', 'updates')
    expect(
      within(updatesAttachment).getByText('Stay informed about this DTF')
    ).toHaveClass('text-base', 'font-medium', 'leading-6', 'text-primary')
    expect(
      within(updatesAttachment).getByRole('textbox', {
        name: 'Email',
      })
    ).toHaveAttribute('type', 'email')
    expect(within(updatesAttachment).getByText('Email')).toHaveClass('sr-only')
    expect(
      within(updatesAttachment).getByRole('button', { name: 'Subscribe' })
    ).toHaveClass('w-full')
    expect(
      within(updatesAttachment).getByTestId('outcome-attachment-email-actions')
    ).toHaveClass('flex-col', 'gap-2')
    expect(
      within(updatesAttachment).getByRole('button', {
        name: 'Dismiss invitation',
      })
    ).toHaveAttribute('data-tone', 'secondary')
    expect(
      within(updatesAttachment).getByTestId('outcome-attachment-icon')
    ).toHaveClass('size-8', 'text-foreground', '[&>svg]:size-5')
    expect(
      within(updatesAttachment).getByTestId('outcome-attachment-icon')
    ).not.toHaveClass('rounded-full', 'bg-muted')
    const updatesSidecar = within(rfq).getByTestId('transaction-sidecar')
    expect(updatesSidecar).toHaveClass(
      'relative',
      'z-0',
      'rounded-none',
      'bg-gradient-to-b',
      'from-secondary',
      'to-card',
      'justify-between',
      '[@container(min-width:980px)]:bottom-6',
      '[@container(min-width:980px)]:top-6',
      '[@container(min-width:980px)_and_(max-width:1159px)]:w-[272px]',
      '[@container(min-width:1160px)]:w-[360px]'
    )
    expect(updatesSidecar).not.toHaveClass('ring-1', 'ring-border')
    expect(within(rfq).getByTestId('zapper-outcome-composition')).toHaveClass(
      'relative',
      'max-w-[432px]'
    )
    expect(within(rfq).getByText('986.42')).toBeVisible()

    fireEvent.click(within(rfq).getByRole('radio', { name: 'Intro call' }))
    const introAttachment = await within(rfq).findByTestId(
      'zapper-outcome-attachment'
    )
    expect(introAttachment).toHaveAttribute('data-attachment', 'intro-call')
    expect(
      within(introAttachment).getByText('A direct line to the team')
    ).toHaveClass('text-primary')
    expect(
      within(introAttachment).getByRole('link', {
        name: /Schedule an intro call/,
      })
    ).toHaveAttribute('target', '_blank')
    expect(
      within(introAttachment).queryByRole('textbox', {
        name: 'Email',
      })
    ).not.toBeInTheDocument()
    fireEvent.click(
      within(introAttachment).getByRole('button', {
        name: 'Dismiss invitation',
      })
    )
    expect(
      within(rfq).queryByTestId('zapper-outcome-attachment')
    ).not.toBeInTheDocument()
    expect(within(rfq).getByTestId('zapper-outcome-composition')).toHaveClass(
      'max-w-[432px]'
    )

    fireEvent.click(within(rfq).getByRole('radio', { name: 'RFQ recovery' }))
    expect(within(rfq).getByText(/No purchase completed/)).toBeVisible()
    expect(
      within(rfq).queryByText(/Native-input refunds/)
    ).not.toBeInTheDocument()
  })

  it('uses one sidecar shell while sequencing review and outcome entrances', () => {
    vi.useFakeTimers()

    try {
      render(<TransactionTruthSpectrum />)

      const rfq = screen.getByTestId('transaction-composition-rfq')

      fireEvent.click(
        within(rfq).getByRole('radio', { name: 'Market-hours advisory' })
      )

      const advisory = within(rfq).getByTestId('transaction-sidecar')
      expect(advisory).toHaveAttribute('data-sidecar-kind', 'advisory')
      expect(advisory).toHaveAttribute('data-entrance', 'immediate')
      const warningPill = within(advisory).getByTestId('lifecycle-status-pill')
      expect(warningPill).toHaveAttribute('data-status-role', 'actionable')
      expect(warningPill).toHaveClass('h-6', 'text-xs')
      expect(
        warningPill.querySelector('[data-status-icon="warning"]')
      ).toBeVisible()
      expect(within(warningPill).getByText('High price impact')).toBeVisible()
      expect(within(advisory).getByText('Expect a worse price')).toHaveClass(
        'text-feedback-warning-foreground'
      )
      expect(
        within(advisory).getByText(
          /CMC20's underlying stocks aren't trading right now/
        )
      ).toBeVisible()

      fireEvent.click(within(rfq).getByRole('radio', { name: 'Updates' }))
      expect(within(rfq).queryByTestId('transaction-sidecar')).toBeNull()

      act(() => vi.advanceTimersByTime(359))
      expect(within(rfq).queryByTestId('transaction-sidecar')).toBeNull()

      act(() => vi.advanceTimersByTime(1))
      const outcome = within(rfq).getByTestId('transaction-sidecar')
      expect(outcome).toHaveAttribute('data-sidecar-kind', 'outcome')
      expect(outcome).toHaveAttribute('data-entrance', 'after-outcome')
      expect(
        within(outcome).getByText('Stay informed about this DTF')
      ).toBeVisible()
    } finally {
      vi.useRealTimers()
    }
  })

  it('keeps the Zapper close action functional and recoverable in the lab', () => {
    render(<TransactionTruthSpectrum />)

    const rfq = screen.getByTestId('transaction-composition-rfq')
    fireEvent.click(within(rfq).getByRole('button', { name: 'Close Zapper' }))
    expect(
      within(rfq).getByRole('button', { name: 'Open Zapper' })
    ).toBeVisible()
    fireEvent.click(within(rfq).getByRole('button', { name: 'Open Zapper' }))
    expect(within(rfq).getByRole('radio', { name: 'Buy' })).toBeChecked()

    fireEvent.click(within(rfq).getByRole('radio', { name: 'RFQ outcome' }))
    fireEvent.click(within(rfq).getByRole('button', { name: 'Done' }))
    expect(
      within(rfq).getByRole('button', { name: 'Open Zapper' })
    ).toBeVisible()
  })

  it('does not present an expired Zapper quote as a current estimate', () => {
    render(<TransactionTruthSpectrum />)

    const rfq = screen.getByTestId('transaction-composition-rfq')
    fireEvent.click(within(rfq).getByRole('radio', { name: 'RFQ recovery' }))

    const [, outputAmount] = within(rfq).getAllByTestId(
      'transaction-amount-object'
    )
    expect(within(outputAmount).getByText('Estimated output')).toBeVisible()
    expect(within(outputAmount).getByText('—')).toBeVisible()
    expect(
      within(outputAmount).getByText('Get a fresh quote to update')
    ).toBeVisible()
    expect(within(outputAmount).queryByText('≈990.00')).toBeNull()
  })

  it('preserves the installed Zapper quote-search composition', () => {
    render(<TransactionTruthSpectrum />)

    const rfq = screen.getByTestId('transaction-composition-rfq')
    fireEvent.click(
      within(rfq).getByRole('button', { name: 'Show quote details' })
    )
    fireEvent.click(within(rfq).getByRole('radio', { name: 'Quote search' }))

    const quoteSearchSurface = within(rfq).getByRole('status', {
      name: 'Finding best quote',
    })
    expect(quoteSearchSurface).toBeVisible()
    expect(quoteSearchSurface).not.toHaveClass('border')
    expect(within(rfq).getByTestId('zapper-quote-status-pill')).toHaveClass(
      'gap-1'
    )
    expect(within(rfq).getByTestId('zapper-quote-counter')).toHaveClass(
      'min-w-4'
    )
    expect(within(rfq).getByTestId('zapper-quote-spinner')).toHaveAttribute(
      'width',
      '16'
    )
    expect(within(rfq).getByTestId('zapper-quote-animation')).toHaveAttribute(
      'src',
      'https://storage.reserve.org/loading5.webp'
    )
    const [, searchingOutput] = within(rfq).getAllByTestId(
      'transaction-amount-object'
    )
    expect(
      within(searchingOutput).queryByTestId('zapper-output-value-delta')
    ).toBeNull()
    expect(searchingOutput).not.toHaveClass('border-b')
    expect(within(rfq).getByTestId('zapper-quote-details')).not.toHaveClass(
      'border-t'
    )
    expect(within(rfq).getByText('Searching DEX liquidity')).toBeVisible()
    expect(
      within(rfq).getByRole('button', { name: 'Updating quote…' })
    ).toBeDisabled()
    expect(
      within(rfq).getByRole('button', { name: 'Select input asset' })
    ).toBeDisabled()
    expect(within(rfq).getByRole('button', { name: 'Max' })).toBeDisabled()
    expect(
      within(rfq).getByRole('textbox', { name: 'You use amount' })
    ).toBeDisabled()
    expect(
      within(rfq).getByRole('button', {
        name: 'Swap input and output assets',
      })
    ).toHaveClass('z-20')
    expect(
      within(rfq).getByRole('status', { name: 'Finding best quote' })
    ).toHaveClass('z-10')
    expect(
      within(rfq).getByRole('button', { name: 'Hide quote details' })
    ).toBeVisible()
    expect(
      within(rfq)
        .getByTestId('zapper-quote-details')
        .querySelectorAll('[data-testid="v1-skeleton"]')
    ).toHaveLength(5)
    for (const fact of within(rfq).getAllByTestId('zapper-quote-fact')) {
      expect(fact).toHaveClass('h-5', 'items-center')
    }
    expect(within(rfq).getByTestId('zapper-review-stack')).toHaveClass(
      'space-y-0'
    )
  })

  it('keeps delayed initiation concise and makes the durable queue primary after confirmation', () => {
    render(<TransactionTruthSpectrum />)

    const delayed = screen.getByTestId('transaction-composition-delayed')

    expect(within(delayed).getByText('Unstake RSR')).toBeVisible()
    expect(within(delayed).getByText('Unstake')).toBeVisible()
    expect(within(delayed).queryByText('Unstake 250 stRSR')).toBeNull()
    expect(within(delayed).getByText('In withdrawal process')).toBeVisible()
    expect(within(delayed).getAllByText('stRSR').length).toBeGreaterThan(0)
    expect(within(delayed).getAllByText('≈286.42').length).toBeGreaterThan(0)
    expect(within(delayed).getAllByText('You unstake')).toHaveLength(2)
    expect(
      within(delayed).getAllByText('Available to withdraw later')
    ).toHaveLength(2)
    expect(
      within(delayed).getAllByText('Estimated at the current exchange rate')
    ).toHaveLength(2)
    expect(within(delayed).getByText('Current cooldown')).toBeVisible()
    expect(within(delayed).getByText('14 days')).toBeVisible()
    const amountAndDetails = within(delayed).getByTestId(
      'unstake-amount-and-details'
    )
    const unstakeDetails = within(delayed).getByTestId('unstake-details')
    expect(unstakeDetails.parentElement).toBe(amountAndDetails)
    expect(unstakeDetails.previousElementSibling).toHaveAttribute(
      'data-testid',
      'transaction-amount-pair'
    )
    expect(unstakeDetails).toHaveClass('border-t', 'px-4', 'py-4')
    expect(unstakeDetails).not.toHaveClass('pb-1')
    expect(unstakeDetails).not.toHaveClass('border-y')
    expect(
      within(delayed).getByRole('button', { name: 'Start 14-day cooldown' })
        .parentElement
    ).toHaveClass('pt-0')
    expect(within(delayed).queryByText('Rate-derived')).toBeNull()
    expect(within(delayed).queryByText('This starts the cooldown')).toBeNull()

    fireEvent.click(within(delayed).getByRole('radio', { name: 'Execution' }))
    expect(within(delayed).getByText('Confirm unstake in wallet')).toBeVisible()
    expect(
      within(delayed).getByText('Wallet confirmation required')
    ).toBeVisible()
    expect(within(delayed).getByTestId('unstake-execution-status')).toHaveClass(
      'px-4'
    )
    expect(
      within(delayed).queryByText('Transaction submitted')
    ).not.toBeInTheDocument()
    expect(
      within(delayed).getByRole('button', { name: 'Cancel unstake' })
    ).toHaveAttribute('data-tone', 'destructive')

    fireEvent.click(within(delayed).getByRole('radio', { name: 'Outcome' }))
    expect(within(delayed).getByText('Cooldown started')).toBeVisible()
    expect(within(delayed).getByText('286.42 RSR')).toBeVisible()
    expect(within(delayed).getByTestId('withdrawal-queue-list')).toHaveClass(
      'divide-y',
      'border-y'
    )
    for (const row of within(delayed).getAllByTestId('withdrawal-queue-row')) {
      expect(row).toHaveClass('py-4')
      expect(row).not.toHaveClass('border', 'p-4')
    }
    expect(within(delayed).queryByText('Review unstake')).toBeNull()
    expect(
      within(delayed).queryByTestId('canonical-dialog-surface')
    ).not.toBeInTheDocument()
  })

  it('keeps real Zapper operation tabs while omitting unrendered alternates elsewhere', () => {
    render(<TransactionTruthSpectrum />)

    const rfq = screen.getByTestId('transaction-composition-rfq')
    expect(within(rfq).getByRole('radio', { name: 'Sell' })).toBeEnabled()
    expect(screen.queryByText('Redeem')).not.toBeInTheDocument()
    expect(screen.queryByText('Stake')).not.toBeInTheDocument()
  })

  it('makes missing shared work intentional and keeps real ownership visible', () => {
    render(<TransactionTruthSpectrum />)

    const board = screen.getByTestId('transaction-system-review')

    for (const status of [
      'Current baseline',
      'Retained current',
      'Proposed candidate',
      'Flow-owned',
      'Upstream-owned',
      'Deferred',
    ]) {
      expect(within(board).getAllByText(status)[0]).toBeVisible()
    }

    expect(
      within(board).getAllByTestId('transaction-amount-object').length
    ).toBeGreaterThan(1)
    expect(
      within(board).getAllByTestId('transaction-requirement-row')
    ).toHaveLength(3)
    for (const row of within(board).getAllByTestId(
      'transaction-requirement-row'
    )) {
      expect(row).toHaveClass('grid-cols-[minmax(0,1fr)_auto]')
      expect(
        within(row).getByTestId('transaction-requirement-identity')
      ).toHaveClass('min-w-0')
    }
    expect(
      within(board).getByText('Package interaction and internals')
    ).toBeVisible()
    expect(within(board).getByText('Confirm Deploy result truth')).toBeVisible()
  })

  it('includes bounded task-shell and selector pressure tests', () => {
    render(<TransactionTruthSpectrum />)

    const board = screen.getByTestId('transaction-system-review')
    const pressureTests = within(board).getByTestId(
      'transaction-pressure-tests'
    )
    expect(pressureTests).toHaveAttribute('id', 'transaction-pressure-tests')

    expect(within(pressureTests).queryByText('Vote unlock task')).toBeNull()
    expect(
      within(pressureTests).getAllByText('Select an input asset')[0]
    ).toBeVisible()
    expect(
      within(pressureTests).getByPlaceholderText('Search assets')
    ).toBeVisible()
    expect(within(pressureTests).getByText('USD Coin')).toBeVisible()
    expect(within(pressureTests).getByText('Wrapped Ether')).toBeVisible()

    const fullSelector = within(pressureTests).getByRole('group', {
      name: 'Available input assets',
    })
    const fullSelectorIdentity = within(
      within(fullSelector).getAllByTestId('transaction-asset-picker-option')[0]
    ).getByTestId('canonical-entity-identity')
    expect(
      fullSelectorIdentity.lastElementChild?.firstElementChild
    ).toHaveClass('text-base', 'font-medium', 'leading-6')
    expect(fullSelectorIdentity.lastElementChild?.lastElementChild).toHaveClass(
      'text-sm',
      'font-light',
      'leading-5'
    )
  })

  it('keeps compact transaction headers on the same row as close', () => {
    render(<TransactionTruthSpectrum />)

    const expectInlineCompactHeader = (titleText: string) => {
      const title = screen
        .getAllByText(titleText)
        .find((element) =>
          element.closest('[data-testid="canonical-dialog-surface"]')
        )

      if (!title) throw new Error(`Missing dialog title: ${titleText}`)
      const surface = title.closest('[data-testid="canonical-dialog-surface"]')

      expect(surface).not.toBeNull()
      const close = within(surface as HTMLElement).getByRole('button', {
        name: 'Close preview',
      })

      expect(title).toHaveClass('text-base', 'font-medium', 'leading-6')
      expect(title.parentElement).toBe(close.parentElement?.parentElement)
      expect(title.parentElement?.parentElement).toHaveClass('px-4')
    }

    expectInlineCompactHeader('Unstake')
    expectInlineCompactHeader('Select an input asset')

    const voteLock = screen.getByTestId('transaction-composition-vote-lock')
    const mode = within(voteLock).getByRole('group', {
      name: 'Vote-lock task mode',
    })
    const close = within(voteLock).getByRole('button', {
      name: 'Close Vote Lock',
    })

    expect(mode).toHaveAttribute('data-size', 'compact')
    expect(mode).toHaveAttribute('data-width', 'intrinsic')
    expect(mode.parentElement).toBe(close.parentElement?.parentElement)
    expect(mode.parentElement?.parentElement).toHaveClass('px-2')
    expect(mode.parentElement?.parentElement).not.toHaveClass('px-4')
  })

  it('maps audited requirements to compositions, canonical owners, or explicit deferral', () => {
    render(<TransactionTruthSpectrum />)

    const coverage = screen.getByTestId('transaction-coverage-map')
    const rows = within(coverage).getAllByTestId('transaction-coverage-item')

    expect(rows.length).toBeGreaterThanOrEqual(12)
    expect(
      within(coverage).getByText('Amount and input/output anatomy')
    ).toBeVisible()
    expect(
      within(coverage).getByText('Approval and requirement rows')
    ).toBeVisible()
    expect(
      within(coverage).getByText('Transparent staged progress')
    ).toBeVisible()
    expect(
      within(coverage).getByText('Delayed settlement across visits')
    ).toBeVisible()
    expect(
      within(coverage).getByText('Guarded dismissal and restoration')
    ).toBeVisible()
  })

  it('lets the reviewer inspect a different credible state without changing the composition', () => {
    render(<TransactionTruthSpectrum />)

    const atomic = screen.getByTestId('transaction-composition-atomic')
    fireEvent.click(within(atomic).getByRole('radio', { name: 'Outcome' }))

    expect(within(atomic).getByText('Mint complete')).toBeVisible()
    expect(within(atomic).getByText('100 CMC20 minted')).toBeVisible()
    expect(within(atomic).getByText('Mint transaction')).toBeVisible()
    expect(
      within(atomic).queryByTestId('transaction-outcome-summary')
    ).toBeNull()
    expect(
      within(atomic).queryByText('Deliberate improvement candidate')
    ).toBeNull()
    expect(
      within(atomic).queryByTestId('transaction-amount-object')
    ).not.toBeInTheDocument()
    expect(within(atomic).getByText('Permissions complete')).toBeVisible()
    expect(within(atomic).getByText('Basket assets used')).toBeVisible()
    expect(within(atomic).getAllByText('Starting balance')).toHaveLength(3)
    expect(within(atomic).queryByText('Required approvals')).toBeNull()
    expect(
      within(atomic).queryByText('2 approvals needed')
    ).not.toBeInTheDocument()
    expect(
      within(atomic).queryByRole('button', { name: 'Approve' })
    ).not.toBeInTheDocument()
  })

  it('keeps requirement and staged-progress truth consistent across review states', () => {
    render(<TransactionTruthSpectrum />)

    const atomic = screen.getByTestId('transaction-composition-atomic')
    fireEvent.click(within(atomic).getByRole('radio', { name: 'Recovery' }))

    expect(within(atomic).getByText('1 approval needed')).toBeVisible()
    expect(within(atomic).getByText('Approval declined')).toBeVisible()
    expect(
      within(atomic).queryByRole('button', { name: 'Approve' })
    ).not.toBeInTheDocument()

    const staged = screen.getByTestId('transaction-composition-staged')
    expect(within(staged).getByText('1 of 2 orders filled')).toBeVisible()
    expect(within(staged).getByTestId('staged-orders-header')).toHaveClass(
      'grid',
      'gap-4',
      'sm:grid-cols-[minmax(0,1fr)_auto]'
    )
    expect(within(staged).getByTestId('staged-orders-summary')).toHaveClass(
      'justify-self-start',
      'sm:justify-self-end'
    )
    for (const row of within(staged).getAllByTestId('staged-order-row')) {
      expect(row).toHaveClass(
        'grid-cols-[minmax(0,1fr)_auto]',
        'gap-x-3',
        'gap-y-2'
      )
    }
    expect(within(staged).queryByText('2 of 3 orders filled')).toBeNull()

    fireEvent.click(within(staged).getByRole('radio', { name: 'Outcome' }))
    expect(within(staged).getByText('Completed orders')).toBeVisible()
    expect(within(staged).queryByText('3 of 3 filled')).toBeNull()
  })

  it('keeps deterministic output specimens out of the tab order without claiming an incomplete listbox', () => {
    render(<TransactionTruthSpectrum />)

    const atomic = screen.getByTestId('transaction-composition-atomic')
    expect(
      within(atomic).getByRole('textbox', { name: 'Shares to mint amount' })
    ).toHaveValue('100')
    expect(
      within(atomic).queryByRole('button', { name: 'Select output DTF' })
    ).not.toBeInTheDocument()

    const selector = screen.getByRole('group', {
      name: 'Available input assets',
    })
    expect(within(selector).getAllByRole('button')).toHaveLength(3)
    expect(within(selector).queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('keeps upstream and fixed-input boundaries honest across RFQ and staged states', () => {
    render(<TransactionTruthSpectrum />)

    const rfq = screen.getByTestId('transaction-composition-rfq')
    fireEvent.click(within(rfq).getByRole('radio', { name: 'RFQ execution' }))
    expect(
      within(rfq).queryByRole('button', { name: 'Select input asset' })
    ).not.toBeInTheDocument()
    expect(
      within(rfq).queryByRole('button', {
        name: 'Swap input and output assets',
      })
    ).not.toBeInTheDocument()
    expect(within(rfq).queryByRole('button', { name: 'Max' })).toBeNull()

    const atomic = screen.getByTestId('transaction-composition-atomic')
    fireEvent.click(within(atomic).getByRole('radio', { name: 'Execution' }))
    const atomicInput = within(atomic).getByTestId('transaction-amount-object')
    expect(atomicInput).toHaveClass('bg-card')
    expect(
      within(atomicInput).queryByRole('button', { name: 'Use' })
    ).toBeNull()

    const staged = screen.getByTestId('transaction-composition-staged')
    expect(
      within(staged).queryByRole('button', { name: 'Select input asset' })
    ).not.toBeInTheDocument()
    expect(within(staged).queryByRole('button', { name: 'Max' })).toBeNull()

    fireEvent.click(within(staged).getByRole('radio', { name: 'Configure' }))
    expect(
      within(staged).queryByRole('button', { name: 'Select input asset' })
    ).not.toBeInTheDocument()
    expect(within(staged).getByRole('button', { name: 'Max' })).toHaveAttribute(
      'data-testid',
      'inline-action'
    )

    fireEvent.click(within(rfq).getByRole('radio', { name: 'Review' }))
    const rfqAssetTrigger = within(rfq).getByRole('button', {
      name: 'Select input asset',
    })
    expect(rfqAssetTrigger).toHaveClass('border', 'border-input', 'bg-card')
    expect(within(rfq).getByRole('button', { name: 'Max' })).toHaveAttribute(
      'data-testid',
      'inline-action'
    )
    expect(within(rfq).queryByText('Signing creates an order')).toBeNull()
    expect(within(rfq).queryByRole('button', { name: 'Sign order' })).toBeNull()
    expect(within(rfq).getByRole('button', { name: 'Buy CMC20' })).toBeVisible()
  })

  it('keeps deferred coverage honest while reflecting rendered vote-lock states', () => {
    render(<TransactionTruthSpectrum />)

    const coverage = screen.getByTestId('transaction-coverage-map')

    expect(
      within(coverage).getByText(
        /Loading, empty, and unsupported selector states remain deferred/
      )
    ).toBeVisible()
    expect(
      within(coverage).getByText(/Fee and estimate qualifiers are visible/)
    ).toBeVisible()
    expect(
      within(coverage).getByText(
        /Atomic, automated, and Vote Lock outcomes show transaction identity/
      )
    ).toBeVisible()
    expect(
      within(coverage).getByText(
        /Atomic, RFQ, automated, Vote Lock, cooldown-start, claimable, and final-withdrawal outcomes/
      )
    ).toBeVisible()
    expect(
      within(coverage).getByText(
        /static Vote Lock and selector surfaces validate Dialog content hierarchy/
      )
    ).toBeVisible()
  })

  it('describes the atomic execution step without overstating mint progress', () => {
    render(<TransactionTruthSpectrum />)

    const atomic = screen.getByTestId('transaction-composition-atomic')
    fireEvent.click(within(atomic).getByRole('radio', { name: 'Execution' }))

    expect(within(atomic).getByText('Approving basket assets')).toBeVisible()
    expect(within(atomic).queryByText('Minting 100 CMC20')).toBeNull()
  })

  it('keeps visible fixture values coherent when Max or Use changes the amount', () => {
    render(<TransactionTruthSpectrum />)

    const atomic = screen.getByTestId('transaction-composition-atomic')
    fireEvent.click(within(atomic).getByRole('button', { name: 'Use' }))
    expect(
      within(atomic).getByRole('textbox', { name: 'Shares to mint amount' })
    ).toHaveValue('24.63')
    expect(
      within(atomic).getByText('$2,473.15 estimated basket value')
    ).toBeVisible()
    expect(within(atomic).getByText('0.00044 WBTC')).toBeVisible()

    const rfq = screen.getByTestId('transaction-composition-rfq')
    fireEvent.click(within(rfq).getByRole('radio', { name: 'Review' }))
    fireEvent.click(within(rfq).getByRole('button', { name: 'Max' }))
    expect(within(rfq).getByText('$4,280.16')).toBeVisible()
    expect(within(rfq).getByText('≈4,237.36')).toBeVisible()

    const staged = screen.getByTestId('transaction-composition-staged')
    fireEvent.click(within(staged).getByRole('radio', { name: 'Configure' }))
    fireEvent.click(within(staged).getByRole('button', { name: 'Max' }))
    expect(within(staged).getByText('$14,802.63')).toBeVisible()

    fireEvent.change(
      within(atomic).getByRole('textbox', { name: 'Shares to mint amount' }),
      { target: { value: '200' } }
    )
    expect(
      within(atomic).getByText('$20,082.40 estimated basket value')
    ).toBeVisible()
    expect(within(atomic).getByText('0.0036 WBTC')).toBeVisible()
    expect(within(atomic).getByText('2.048 WETH')).toBeVisible()
    expect(within(atomic).getByText('12,974.40 USDC')).toBeVisible()

    fireEvent.change(
      within(rfq).getByRole('textbox', { name: 'You use amount' }),
      { target: { value: '200' } }
    )
    expect(
      within(rfq).getByText('Updates after the package returns a quote')
    ).toBeVisible()
    expect(
      within(rfq).getByRole('button', { name: 'Updating quote…' })
    ).toBeDisabled()

    fireEvent.change(
      within(staged).getByRole('textbox', { name: 'You provide amount' }),
      { target: { value: '200' } }
    )
    expect(
      within(staged).getByRole('button', { name: 'Updating amount…' })
    ).toBeDisabled()
  })
})
