import { fireEvent, render, screen, within } from '@testing-library/react'
import type { ImgHTMLAttributes } from 'react'
import { describe, expect, it, vi } from 'vitest'

import {
  FAST_DELEGATE,
  NORMAL_DELEGATE,
} from '../transaction-composition-vote-lock-delegate'
import { StakeTransactionTask } from '../transaction-composition-stake-task'
import TransactionTruthSpectrum from '../transaction-truth-spectrum'

// Image fetching is browser-covered; jsdom leaves the production loader pending after teardown.
vi.mock('@/components/token-logo', () => ({
  default: ({
    symbol: _symbol,
    size = 'md',
    address: _address,
    chain: _chain,
    src,
    width,
    height,
    ...props
  }: ImgHTMLAttributes<HTMLImageElement> & {
    symbol?: string
    size?: 'sm' | 'md' | 'lg' | 'xl'
    address?: string
    chain?: number
  }) => {
    const pixels = { sm: 16, md: 20, lg: 24, xl: 32 }[size]
    return (
      <img
        {...props}
        src={src ?? '/svgs/defaultLogo.svg'}
        width={width ?? pixels}
        height={height ?? pixels}
      />
    )
  },
}))

describe('composition-first transaction-system review', () => {
  it('shows Zapper wallet signing as busy while pre-request approval remains actionable', () => {
    render(<TransactionTruthSpectrum />)
    const zapper = screen.getByTestId('transaction-composition-rfq')
    fireEvent.click(within(zapper).getByRole('radio', { name: 'Approval' }))
    expect(
      within(zapper).getByRole('button', { name: 'Approve use of USDC' })
    ).toBeEnabled()
    fireEvent.click(within(zapper).getByRole('radio', { name: 'Sign order' }))
    const signing = within(zapper).getByRole('button', {
      name: 'Pending, sign in wallet',
    })
    expect(signing).toBeDisabled()
    expect(signing).toHaveAttribute('aria-busy', 'true')
    expect(signing).toHaveAttribute('data-tone', 'primary')
    expect(signing.querySelector('svg.animate-spin')).not.toBeNull()
  })
  it('puts direct flow navigation and reviewable compositions before reference material', () => {
    render(<TransactionTruthSpectrum />)

    const board = screen.getByTestId('transaction-system-review')
    const navigation = within(board).getByRole('navigation', {
      name: 'Transaction families in realistic composition',
    })
    expect(
      within(navigation).getByRole('link', {
        name: 'Automated mint workspace',
      })
    ).toHaveAttribute('href', '#transaction-composition-staged')
    expect(
      within(navigation).getByRole('link', {
        name: 'Vote-lock, unlock, and delegate',
      })
    ).toHaveAttribute('href', '#transaction-composition-vote-lock')

    const automatedMint = screen
      .getByTestId('transaction-composition-staged')
      .closest('article')
    const reference = screen.getByTestId('transaction-predecessor-contract')
    expect(automatedMint).toHaveClass('scroll-mt-28')
    expect(automatedMint?.compareDocumentPosition(reference) ?? 0).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    )
  })

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

  it('leads with the established family flows before the focused review and manual mint', () => {
    render(<TransactionTruthSpectrum />)

    const board = screen.getByTestId('transaction-system-review')
    const representativeCompositions = within(board).getByRole('region', {
      name: 'Representative transaction compositions',
    })
    const compositions = within(representativeCompositions).getAllByTestId(
      'transaction-family-composition'
    )

    expect(compositions).toHaveLength(4)
    expect(
      within(representativeCompositions).queryByText('Manual mint')
    ).not.toBeInTheDocument()
    expect(
      within(representativeCompositions).getByText('Instant Zapper')
    ).toBeVisible()
    expect(
      within(representativeCompositions).getByText(
        'Automated mint / redeem workspace'
      )
    ).toBeVisible()
    expect(
      within(representativeCompositions).getByText(
        'Stake, unstake, and delegate'
      )
    ).toBeVisible()
    expect(
      within(representativeCompositions).getByText(
        'Vote-lock, unlock, and delegate'
      )
    ).toBeVisible()
    const pairedReview = screen.getByTestId('transaction-paired-review')
    const manualMint = screen.getByTestId('transaction-composition-atomic')
    expect(
      pairedReview.compareDocumentPosition(manualMint) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()

    expect(within(manualMint).getByText('Required Approvals')).toBeVisible()
    expect(
      within(representativeCompositions).getByText('Buy CMC20')
    ).toBeVisible()
    expect(
      within(representativeCompositions).queryByText('In withdrawal process')
    ).not.toBeInTheDocument()
    expect(
      within(board).getAllByTestId('transaction-amount-pair').length
    ).toBeGreaterThanOrEqual(3)
  })

  it('keeps candidate task widths explicit and shares editable amount actions', () => {
    render(<TransactionTruthSpectrum />)

    const rfq = screen.getByTestId('transaction-composition-rfq')
    const voteLock = screen.getByTestId('transaction-composition-vote-lock')
    const voteLockSurface = within(voteLock)
      .getByRole('group', { name: 'Vote-lock task mode' })
      .closest('[data-testid="canonical-dialog-surface"]')

    expect(within(rfq).getByTestId('zapper-shell')).toHaveClass('max-w-[448px]')
    expect(voteLockSurface).toHaveClass('sm:max-w-[448px]')

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
    expect(
      within(rfq).queryByRole('group', { name: 'Zapper operation' })
    ).not.toBeInTheDocument()
    expect(
      within(rfq).getByTestId('transaction-committed-mode')
    ).toHaveTextContent('Buy')
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
    ).toHaveTextContent('Processing')

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

  it('preserves vote-lock approval, share quotes, and the delayed-initiation handoff in one composition', () => {
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
    ).toHaveClass('px-4', 'py-4')
    expect(
      within(voteLock).getByTestId('vote-lock-acknowledgement')
    ).not.toHaveClass('border-t', 'py-4')

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
      within(voteLock).getByTestId('transaction-amount-pair')
    ).not.toHaveAttribute('data-task-boundary')
    expect(
      within(voteLock).getByRole('button', {
        name: 'Vote lock RSR · Step 2 of 2',
      })
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
      within(voteLock).getByRole('button', {
        name: 'Approve use of RSR · Step 1 of 2',
      })
    ).toBeEnabled()
    expect(
      within(voteLock).queryByTestId('transaction-progress-stepper')
    ).not.toBeInTheDocument()
    expect(
      within(voteLock).getByRole('button', { name: 'Switch to unlock' })
    ).toBeVisible()
    expect(
      within(voteLock).getByRole('textbox', { name: 'You lock: amount' })
    ).toBeEnabled()

    fireEvent.click(
      within(voteLock).getByRole('radio', { name: 'Approval signing' })
    )
    expect(
      within(voteLock).queryByRole('group', {
        name: 'Vote-lock task mode',
      })
    ).not.toBeInTheDocument()
    expect(
      within(voteLock).getByTestId('transaction-committed-mode')
    ).toHaveTextContent('Vote-lock')
    const voteLockApprovalAction = within(voteLock).getByRole('button', {
      name: 'Approval in progress…',
    })
    expect(voteLockApprovalAction).toBeDisabled()
    expect(voteLockApprovalAction).toHaveAttribute('data-tone', 'primary')
    expect(voteLockApprovalAction).toHaveAttribute('aria-busy', 'true')
    expect(
      within(voteLock).queryByTestId('vote-lock-acknowledgement')
    ).not.toBeInTheDocument()
    expect(
      within(voteLock).getByTestId('vote-lock-process-button-region')
    ).toBeVisible()
    const approvalProgress = within(voteLock).getByRole('list', {
      name: 'Vote-lock progress',
    })
    const approvalSteps = within(approvalProgress).getAllByTestId(
      'transaction-progress-step'
    )
    expect(approvalSteps).toHaveLength(2)
    expect(approvalSteps[0]).toHaveAttribute('data-step-state', 'active')
    expect(within(approvalSteps[0]).getByText('Approve RSR')).toBeVisible()
    expect(
      within(approvalSteps[0]).getByTestId('transaction-progress-position')
    ).toHaveTextContent('1/2')
    expect(
      within(approvalSteps[0]).getByTestId('lifecycle-status-pill')
    ).toHaveTextContent('Processing')
    expect(approvalSteps[1]).toHaveAttribute('data-step-state', 'upcoming')
    expect(within(approvalSteps[1]).getByText('Vote-lock RSR')).toBeVisible()
    expect(
      within(approvalSteps[1]).getByTestId('transaction-progress-position')
    ).toHaveTextContent('2/2')
    expect(
      within(approvalSteps[1]).getByTestId('lifecycle-status-pill')
    ).toHaveTextContent('Upcoming')

    fireEvent.click(within(voteLock).getByRole('radio', { name: 'Lock ready' }))
    expect(
      within(voteLock).getByRole('button', {
        name: 'Vote lock RSR · Step 2 of 2',
      })
    ).toBeEnabled()
    const readyProgress = within(voteLock).getByRole('list', {
      name: 'Vote-lock progress',
    })
    const readyCommittedMode = within(voteLock).getByTestId(
      'transaction-committed-mode'
    )
    expect(readyCommittedMode).toHaveAttribute('data-activity', 'static')
    expect(readyCommittedMode).toHaveAttribute('data-asset-symbol', 'RSR')
    expect(
      within(readyCommittedMode).getByTestId('transaction-committed-mode-logo')
    ).not.toHaveClass('motion-safe:animate-[spin_12s_linear_infinite]')
    const readySteps = within(readyProgress).getAllByTestId(
      'transaction-progress-step'
    )
    expect(readySteps[0]).toHaveAttribute('data-step-state', 'complete')
    expect(readySteps[1]).toHaveAttribute('data-step-state', 'actionable')
    expect(within(readySteps[1]).getByText('Vote-lock RSR')).toBeVisible()
    expect(
      within(readySteps[1]).getByTestId('transaction-progress-position')
    ).toHaveTextContent('2/2')
    expect(
      within(readySteps[1]).getByTestId('lifecycle-status-pill')
    ).toHaveTextContent('Ready')
    expect(
      within(voteLock).getByTestId('vote-lock-acknowledgement')
    ).toBeVisible()
    expect(
      within(voteLock).getByTestId('vote-lock-process-button-region')
    ).toHaveClass('pt-0')

    fireEvent.click(
      within(voteLock).getByRole('radio', { name: 'Lock wallet' })
    )
    expect(
      within(voteLock).queryByRole('button', {
        name: 'Pending, sign in wallet',
      })
    ).not.toBeInTheDocument()
    expect(
      within(voteLock).queryByRole('button', { name: 'Switch to unlock' })
    ).not.toBeInTheDocument()
    expect(
      within(voteLock).getByTestId('transaction-amount-relation-indicator')
    ).toBeVisible()
    expect(
      within(voteLock).getByTestId('transaction-committed-mode')
    ).toHaveTextContent('Vote-lock')
    expect(
      within(voteLock).getByTestId('transaction-amount-pair')
    ).toHaveAttribute('data-task-boundary', 'leading')
    expect(
      within(voteLock).queryByTestId('vote-lock-acknowledgement')
    ).not.toBeInTheDocument()

    fireEvent.click(
      within(voteLock).getByRole('radio', { name: 'Lock confirming' })
    )
    expect(within(voteLock).queryByText('Confirming tx...')).toBeNull()
    expect(
      within(voteLock).getByRole('list', { name: 'Vote-lock progress' })
    ).toHaveTextContent('Processing')

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
    expect(
      within(voteLock).getByTestId('vote-lock-outcome-surface')
    ).toHaveClass('origin-bottom')
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
    ).toHaveTextContent('Unlock delay14 days')
    expect(
      within(voteLock).getByTestId('vote-lock-unlock-rewards-end')
    ).toHaveTextContent('Rewards endImmediate')
    expect(
      within(voteLock).queryByText(
        /Come back to your account balance page to withdraw/
      )
    ).not.toBeInTheDocument()

    fireEvent.click(
      within(voteLock).getByRole('radio', { name: 'Unlock processing' })
    )
    const unlockCommittedMode = within(voteLock).getByTestId(
      'transaction-committed-mode'
    )
    expect(unlockCommittedMode).toHaveTextContent('Unlock')
    expect(unlockCommittedMode).toHaveAttribute('data-asset-symbol', 'vlRSR')
    expect(
      within(unlockCommittedMode).getByTestId('transaction-committed-mode-logo')
    ).toHaveClass('motion-safe:animate-[spin_12s_linear_infinite]')
    expect(
      within(voteLock).getByRole('button', {
        name: 'Processing transaction...',
      })
    ).toBeVisible()
    expect(
      within(voteLock).getByTestId('vote-lock-unlock-delay')
    ).toHaveTextContent('Unlock delay14 days')
    expect(
      within(voteLock).getByTestId('vote-lock-unlock-rewards-end')
    ).toHaveTextContent('Rewards endImmediate')
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
      'origin-bottom',
      '[animation:transaction-outcome-surface-in_360ms_ease-out_both]',
      'motion-reduce:animate-none'
    )
    expect(
      within(voteLock).getByTestId('vote-lock-outcome-surface')
    ).toHaveAttribute('data-outcome-surface', 'delayed')
    expect(
      within(voteLock).getByTestId('vote-lock-outcome-surface')
    ).not.toHaveAttribute('data-component', 'organic-brand-surface')
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
    expect(
      within(voteLock).queryByRole('radio', { name: 'Cooldown' })
    ).not.toBeInTheDocument()
    expect(
      within(voteLock).queryByRole('radio', { name: 'Ready' })
    ).not.toBeInTheDocument()
    expect(
      within(voteLock).queryByRole('radio', { name: 'Withdrawn' })
    ).not.toBeInTheDocument()
    fireEvent.click(within(voteLock).getByRole('button', { name: 'Done' }))
    expect(
      within(voteLock).queryByTestId('canonical-dialog-surface')
    ).not.toBeInTheDocument()
    expect(
      within(voteLock).queryByText('Pending Withdrawals')
    ).not.toBeInTheDocument()
  })

  it('reconstructs delegation as the real third Vote Lock mode without forcing amount anatomy', () => {
    render(<TransactionTruthSpectrum />)

    const voteLock = screen.getByTestId('transaction-composition-vote-lock')

    fireEvent.click(
      within(voteLock).getByRole('radio', { name: 'Delegate ready' })
    )

    const dialog = within(voteLock).getByRole('dialog', {
      name: 'Govern PHOTON',
    })
    expect(dialog).toHaveClass('sm:max-w-[448px]', 'min-h-96', 'p-2')
    expect(dialog).not.toHaveClass('ring-2', 'ring-card', 'p-0')
    expect(
      within(dialog).getByRole('radio', { name: 'Delegate', exact: true })
    ).toBeChecked()
    const normalInput = within(dialog).getByLabelText(/Voting delegate/)
    const fastInput = within(dialog).getByLabelText(/Challenge delegate/)
    expect(normalInput).toHaveValue(
      '0x7F4a7A93C9a5E8f62d6cA9E2f4dCB0eA72B4a018'
    )
    expect(fastInput).toHaveValue('0x3B06fA7B23C5c83eB8A7F99E42F98d2A79F4b6d1')
    expect(normalInput.parentElement).toHaveClass('rounded-full')
    expect(fastInput.parentElement).toHaveClass('rounded-full')
    expect(normalInput.parentElement).not.toHaveClass('rounded-none')
    expect(fastInput.parentElement).not.toHaveClass('rounded-none')
    expect(
      within(normalInput.parentElement!.parentElement!).getByText(
        'Normal delegates vote on normal proposals.'
      )
    ).toBeVisible()
    expect(
      within(normalInput.parentElement!.parentElement!).getByText(
        'Normal delegates vote on normal proposals.'
      ).parentElement
    ).toHaveClass('space-y-1', 'px-4')
    expect(
      within(fastInput.parentElement!.parentElement!).getByText(
        'Fast delegates can challenge fast proposals.'
      )
    ).toBeVisible()
    expect(
      within(fastInput.parentElement!.parentElement!).getByText(
        'Fast delegates can challenge fast proposals.'
      ).parentElement
    ).toHaveClass('space-y-1', 'px-4')
    expect(within(dialog).getAllByTestId('canonical-text-input')).toHaveLength(
      2
    )
    expect(within(dialog).getByTestId('delegation-fields')).toHaveClass('pb-4')
    const lockedContext = within(dialog).getByTestId(
      'delegation-locked-context'
    )
    expect(
      within(lockedContext).getByText('Current locked amount:')
    ).toBeVisible()
    const lockedAmount = within(lockedContext).getByText('12.8M RSR')
    expect(lockedAmount).toHaveAccessibleName('12,843,771.62 RSR')
    expect(lockedAmount).toHaveAttribute('title', '12,843,771.62 RSR')
    expect(
      within(lockedContext).getByTestId('delegation-locked-icon')
    ).toHaveAttribute('aria-hidden', 'true')
    expect(lockedContext).toHaveClass('px-4')
    expect(lockedContext).not.toHaveClass('border', 'border-b', 'divide-y')
    expect(within(dialog).getByTestId('delegation-field-stack')).toHaveClass(
      'grid',
      'gap-4'
    )
    expect(
      normalInput.compareDocumentPosition(lockedContext) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
    expect(
      within(dialog).queryByTestId('transaction-amount-pair')
    ).not.toBeInTheDocument()
    expect(
      within(dialog).getByRole('button', { name: 'Update delegates' })
    ).toBeEnabled()
    expect(
      within(dialog).queryByTestId('transaction-progress-stepper')
    ).not.toBeInTheDocument()

    fireEvent.click(
      within(voteLock).getByRole('radio', { name: 'Normal only' })
    )
    expect(
      within(dialog).getByTestId('vote-lock-delegation-task').parentElement
    ).toHaveClass('flex', 'flex-col', 'justify-end')
    expect(within(dialog).getByTestId('delegation-fields')).toHaveClass('pb-4')
    expect(
      within(dialog).getByText(
        'Enter the wallet address that should vote on normal governance proposals.'
      )
    ).toBeVisible()
    expect(within(dialog).getByLabelText(/Voting delegate/)).toBeVisible()
    expect(
      within(dialog).queryByLabelText(/Challenge delegate/)
    ).not.toBeInTheDocument()
    expect(
      within(dialog).queryByTestId('transaction-progress-stepper')
    ).not.toBeInTheDocument()
  })

  it('keeps current self-delegation readable before editing without changing the task structure', () => {
    render(<TransactionTruthSpectrum />)

    const voteLock = screen.getByTestId('transaction-composition-vote-lock')

    fireEvent.click(
      within(voteLock).getByRole('radio', { name: 'Delegated to you' })
    )

    const dialog = within(voteLock).getByRole('dialog', {
      name: 'Govern PHOTON',
    })
    const votingField = within(dialog).getByTestId(
      'delegation-voting-role-field'
    )
    const challengeField = within(dialog).getByTestId(
      'delegation-challenge-role-field'
    )
    const votingValue = within(votingField).getByTestId(
      'delegation-voting-current-value'
    )
    const challengeValue = within(challengeField).getByTestId(
      'delegation-challenge-current-value'
    )

    expect(within(votingField).getByText('Voting delegate')).toBeVisible()
    expect(
      within(votingField).getByText(
        'Normal delegates vote on normal proposals.'
      )
    ).toBeVisible()
    expect(within(challengeField).getByText('Challenge delegate')).toBeVisible()
    expect(
      within(challengeField).getByText(
        'Fast delegates can challenge fast proposals.'
      )
    ).toBeVisible()
    expect(within(votingValue).getByText('Delegated to you')).toHaveClass(
      'text-primary'
    )
    expect(within(challengeValue).getByText('Delegated to you')).toHaveClass(
      'text-primary'
    )
    expect(within(votingValue).getByText('0x7f4A...A018')).toHaveClass(
      'text-supporting-foreground'
    )
    expect(within(challengeValue).getByText('0x7f4A...A018')).toHaveClass(
      'text-supporting-foreground'
    )
    expect(votingValue).toHaveClass(
      'flex',
      'items-center',
      'sm:flex-col',
      'sm:items-end'
    )
    expect(challengeValue).toHaveClass(
      'flex',
      'items-center',
      'sm:flex-col',
      'sm:items-end'
    )
    expect(votingValue.parentElement).toBe(
      within(votingField).getByText('Voting delegate').parentElement
        ?.parentElement
    )
    expect(challengeValue.parentElement).toBe(
      within(challengeField).getByText('Challenge delegate').parentElement
        ?.parentElement
    )
    expect(votingValue.parentElement).toHaveClass(
      'grid',
      'gap-3',
      'sm:grid-cols-[minmax(0,1fr)_auto]',
      'sm:gap-x-4'
    )
    expect(
      within(dialog).getByTestId('vote-lock-delegation-task').parentElement
    ).toHaveClass('flex', 'flex-col', 'justify-end')
    expect(
      within(dialog).queryByTestId('canonical-text-input')
    ).not.toBeInTheDocument()
    expect(within(dialog).getAllByText('0x7f4A...A018')).toHaveLength(2)
    expect(
      within(dialog).queryByRole('button', { name: /Copy .* to clipboard/ })
    ).not.toBeInTheDocument()
    const changeDelegates = within(dialog).getByRole('button', {
      name: 'Change delegates',
    })
    expect(changeDelegates).toBeEnabled()
    expect(changeDelegates).toHaveAttribute('data-tone', 'secondary')
    expect(
      within(dialog).getByTestId('delegation-locked-context')
    ).toBeVisible()

    fireEvent.click(changeDelegates)

    expect(
      within(voteLock).getByRole('radio', { name: 'Delegate ready' })
    ).toBeChecked()
    expect(
      within(dialog).getByTestId('vote-lock-delegation-task').parentElement
    ).toHaveClass('flex', 'flex-col', 'justify-end')
    const votingInput = within(votingField).getByLabelText(/Voting delegate/)
    const challengeInput =
      within(challengeField).getByLabelText(/Challenge delegate/)
    expect(votingInput).toHaveValue(NORMAL_DELEGATE)
    expect(challengeInput).toHaveValue(NORMAL_DELEGATE)
    expect(votingInput.parentElement).toHaveClass('h-11', 'pl-5', 'pr-5')
    expect(challengeInput.parentElement).toHaveClass('h-11', 'pl-5', 'pr-5')
    expect(
      within(dialog).getByRole('button', { name: 'Update delegates' })
    ).toBeEnabled()
    expect(within(votingField).getByText('Voting delegate')).toBeVisible()
    expect(within(challengeField).getByText('Challenge delegate')).toBeVisible()
    expect(
      within(dialog).getByTestId('delegation-locked-context')
    ).toBeVisible()
  })

  it('keeps the two-call delegation sequence truthful and preserves partial success', () => {
    render(<TransactionTruthSpectrum />)

    const voteLock = screen.getByTestId('transaction-composition-vote-lock')

    fireEvent.click(
      within(voteLock).getByRole('radio', { name: 'Normal signing' })
    )
    const delegateCommittedMode = within(voteLock).getByTestId(
      'transaction-committed-mode'
    )
    expect(delegateCommittedMode).toHaveTextContent('Delegate')
    expect(delegateCommittedMode).toHaveAttribute('data-asset-symbol', 'vlRSR')
    expect(
      within(voteLock).queryByRole('button', {
        name: 'Updating normal delegate...',
      })
    ).not.toBeInTheDocument()
    const normalProgress = within(voteLock).getByRole('list', {
      name: 'Delegation progress',
    })
    const processDialog = within(voteLock).getByRole('dialog', {
      name: 'Govern PHOTON',
    })
    expect(processDialog).toHaveClass(
      'overflow-hidden',
      'p-0',
      'ring-2',
      'ring-card',
      'ring-offset-0'
    )
    expect(
      within(processDialog).getByTestId('vote-lock-process-content-frame')
    ).toHaveClass('relative', 'z-10', 'bg-card', 'p-2', 'shadow-sm')
    expect(
      within(processDialog).queryByTestId('vote-lock-process-button-region')
    ).not.toBeInTheDocument()
    expect(within(processDialog).getByTestId('delegation-fields')).toHaveClass(
      'pb-0'
    )
    const processPanel = within(processDialog).getByTestId(
      'vote-lock-action-footer'
    )
    expect(processPanel).toHaveAttribute('data-presentation', 'process-panel')
    expect(processPanel).toHaveClass('bg-substrate-subtle', 'px-6', 'py-4')
    const normalSteps = within(normalProgress).getAllByTestId(
      'transaction-progress-step'
    )
    expect(normalSteps).toHaveLength(2)
    expect(normalSteps[0]).toHaveAttribute('data-step-state', 'active')
    expect(
      within(voteLock).getByTestId('transaction-committed-mode')
    ).toHaveAttribute('data-activity', 'active')
    expect(normalSteps[0]).toHaveAttribute('aria-current', 'step')
    expect(normalSteps[0]).toHaveClass('gap-2', 'py-2')
    expect(normalSteps[0]).not.toHaveClass(
      'h-11',
      'px-2.5',
      'rounded-full',
      'border'
    )
    expect(
      within(normalSteps[0]).getByTestId('transaction-progress-active-dot')
    ).toHaveClass('size-2', 'rounded-full', 'bg-current')
    expect(
      within(normalProgress).getAllByTestId('lifecycle-status-pill')
    ).toHaveLength(2)
    expect(
      within(normalSteps[0]).getByTestId('lifecycle-status-pill')
    ).toHaveAttribute('data-status-role', 'processing')
    expect(normalSteps[0]).toHaveTextContent('Voting delegate · 1/2')
    expect(normalSteps[0]).not.toHaveTextContent('Tx.')
    expect(normalSteps[1]).toHaveAttribute('data-step-state', 'upcoming')
    expect(normalSteps[1]).toHaveClass('gap-2', 'py-2')
    expect(normalSteps[1]).not.toHaveClass(
      'h-11',
      'px-2.5',
      'rounded-full',
      'border',
      'bg-card/50'
    )
    expect(normalProgress.querySelectorAll('li')).toHaveLength(2)
    expect(
      within(normalSteps[1]).getByTestId('transaction-progress-upcoming-dot')
    ).toHaveClass('size-2', 'rounded-full', 'border', 'border-current')
    const sequencePosition = within(normalSteps[0]).getByTestId(
      'transaction-progress-position'
    )
    expect(sequencePosition).toHaveClass('tabular-nums')
    const connector = within(normalProgress).getByTestId(
      'transaction-progress-connector'
    )
    expect(connector).toHaveClass(
      'left-3',
      'top-5',
      'bottom-5',
      '-translate-x-1/2'
    )
    expect(connector.parentElement).toHaveClass('relative')
    for (const indicator of within(normalProgress).getAllByTestId(
      'transaction-progress-indicator'
    )) {
      expect(indicator).toHaveClass('size-6')
    }
    expect(within(voteLock).getByLabelText(/Voting delegate/)).toBeDisabled()
    expect(within(voteLock).getByLabelText(/Challenge delegate/)).toBeDisabled()

    fireEvent.click(
      within(voteLock).getByRole('radio', { name: 'Fast signing' })
    )
    expect(
      within(voteLock).queryByRole('button', {
        name: 'Updating fast delegate...',
      })
    ).not.toBeInTheDocument()
    const inProgress = within(voteLock).getByRole('list', {
      name: 'Delegation progress',
    })
    expect(
      within(inProgress).getByText('Complete', { exact: true })
    ).toBeVisible()
    expect(
      within(inProgress).getByText('Processing', { exact: true })
    ).toBeVisible()

    fireEvent.click(
      within(voteLock).getByRole('radio', { name: 'Fast failed' })
    )
    const recovery = within(voteLock).getByRole('list', {
      name: 'Delegation progress',
    })
    expect(within(voteLock).getByTestId('vote-lock-action-footer')).toHaveClass(
      'bg-substrate-subtle',
      'px-6',
      'py-4'
    )
    expect(within(recovery).getByText('Complete')).toBeVisible()
    expect(within(recovery).getByText('Failed')).toBeVisible()
    expect(
      within(recovery).getAllByTestId('transaction-progress-step')[1]
    ).toHaveClass('py-2')
    expect(
      within(recovery).getAllByTestId('transaction-progress-step')[1]
    ).not.toHaveClass('border', 'rounded-full', 'bg-feedback-danger-surface')
    expect(within(voteLock).getByLabelText(/Voting delegate/)).toBeDisabled()
    expect(within(voteLock).getByLabelText(/Challenge delegate/)).toBeEnabled()
    const retryFastDelegation = within(voteLock).getByRole('button', {
      name: 'Retry fast delegation',
    })
    expect(retryFastDelegation).toBeEnabled()
    expect(
      within(voteLock).getByTestId('vote-lock-process-content-frame')
    ).toContainElement(retryFastDelegation)
    expect(
      within(voteLock).getByTestId('vote-lock-action-footer')
    ).not.toContainElement(retryFastDelegation)

    fireEvent.click(
      within(voteLock).getByRole('radio', { name: 'Delegation updated' })
    )
    expect(
      within(voteLock).getByRole('dialog', { name: 'Govern PHOTON' })
    ).toHaveClass('sm:max-w-[448px]')
    expect(
      within(voteLock).getByTestId('vote-lock-outcome-status')
    ).toHaveTextContent('Completed')
    expect(
      within(voteLock).getByRole('heading', { name: 'Delegation updated' })
    ).toBeVisible()
    expect(
      within(voteLock).getByTestId('delegation-outcome-value')
    ).toHaveTextContent(
      'Voting power delegated12.84MRSRFull voting power for each role'
    )
    expect(
      within(voteLock).getByTestId('delegation-outcome-value')
    ).not.toHaveTextContent('12,843,771.62 RSR')
    const delegationDetails = within(voteLock).getByTestId(
      'delegation-outcome-details'
    )
    expect(within(delegationDetails).getByText('Voting delegate')).toBeVisible()
    expect(within(delegationDetails).getByText('0x7f4A...A018')).toBeVisible()
    expect(delegationDetails).not.toHaveTextContent('Voting transaction')
    expect(
      within(delegationDetails).getByText('Challenge delegate')
    ).toBeVisible()
    expect(within(delegationDetails).getByText('0x3B06...B6d1')).toBeVisible()
    expect(delegationDetails).not.toHaveTextContent('Challenge transaction')
    expect(
      within(delegationDetails).getAllByText('12.84M RSR assigned')
    ).toHaveLength(2)
    const delegatedAmountLine = within(
      within(voteLock).getByTestId('delegation-outcome-value')
    )
      .getByTestId('transaction-amount-unit')
      .parentElement?.textContent?.replaceAll(/\s/g, '')
    expect(delegatedAmountLine).toBe('12.84MRSR')
    expect(delegationDetails.querySelector('dl')).toHaveClass('gap-3')
    const delegationRoleGroups = within(delegationDetails).getAllByTestId(
      'delegation-outcome-role-group'
    )
    expect(delegationRoleGroups).toHaveLength(2)
    for (const roleGroup of delegationRoleGroups) {
      expect(roleGroup).toHaveClass(
        'grid',
        'grid-cols-[minmax(0,1fr)_auto]',
        'gap-x-3',
        'gap-y-1',
        'sm:gap-x-4'
      )
      expect(
        within(roleGroup).getByTestId('delegation-outcome-role-label')
      ).toHaveClass('col-start-1', 'row-start-1')
      expect(
        within(roleGroup).getByRole('link', {
          name: /View .* delegate transaction/,
        }).parentElement
      ).toHaveClass('col-start-2', 'row-start-1', 'flex', 'justify-self-end')
      expect(
        within(roleGroup).getByRole('link', {
          name: /View .* delegate transaction/,
        })
      ).toHaveClass(
        'text-foreground',
        'hover:text-primary',
        'focus-visible:text-primary'
      )
      expect(
        within(roleGroup).getByRole('button', {
          name: /^Copy 0x.* to clipboard$/,
        })
      ).toHaveClass('text-foreground', 'hover:text-primary')
      expect(
        within(roleGroup).getByRole('button', {
          name: /^Copy 0x.* to clipboard$/,
        }).parentElement?.parentElement
      ).toHaveClass('col-start-1', 'row-start-2', 'flex', 'justify-self-start')
      expect(
        within(roleGroup).getByTestId('delegation-outcome-role-result')
      ).toHaveClass('col-start-2', 'row-start-2')
      expect(
        within(roleGroup).getByTestId('delegation-outcome-role-label')
      ).toHaveClass('font-medium', 'text-foreground')
      expect(
        within(roleGroup).getByTestId('delegation-outcome-role-result')
      ).toHaveTextContent('12.84M RSR assigned')
      expect(
        within(roleGroup)
          .getByTestId('delegation-outcome-role-result')
          .textContent?.replace('assigned', '')
          .replaceAll(/\s/g, '')
      ).toBe(delegatedAmountLine)
      expect(
        within(roleGroup).getByTestId('delegation-outcome-role-result')
      ).toHaveClass('font-light', 'text-supporting-foreground')
    }
    expect(within(delegationDetails).getByText(NORMAL_DELEGATE)).toHaveClass(
      'sr-only'
    )
    expect(within(delegationDetails).getByText(FAST_DELEGATE)).toHaveClass(
      'sr-only'
    )
    const delegateCopyActions = within(delegationDetails).getAllByRole(
      'button',
      { name: /^Copy 0x.* to clipboard$/ }
    )
    expect(delegateCopyActions).toHaveLength(2)
    expect(
      new Set(
        delegateCopyActions.map((action) => action.getAttribute('aria-label'))
      ).size
    ).toBe(2)
    for (const copyAction of delegateCopyActions) {
      expect(copyAction).toHaveAttribute('data-testid', 'inline-action')
      expect(copyAction).toHaveClass('h-5', 'gap-2')
      expect(copyAction).not.toHaveAttribute('data-tone', 'quiet')
    }
    const transactionLinks = within(delegationDetails).getAllByRole('link', {
      name: /View .* delegate transaction/,
    })
    expect(transactionLinks).toHaveLength(2)
    expect(transactionLinks[0]).toHaveAccessibleName(
      'View Voting delegate transaction'
    )
    expect(transactionLinks[1]).toHaveAccessibleName(
      'View Challenge delegate transaction'
    )
    expect(transactionLinks[0]).not.toHaveAttribute(
      'href',
      transactionLinks[1].getAttribute('href')
    )
    expect(
      within(delegationDetails).queryByText('Transactions')
    ).not.toBeInTheDocument()
    const delegationOutcome = within(voteLock).getByRole('dialog', {
      name: 'Govern PHOTON',
    })
    expect(
      within(delegationOutcome).queryByText(/approval/i)
    ).not.toBeInTheDocument()
    expect(
      within(voteLock).getByRole('button', { name: 'Done' })
    ).toHaveAttribute('data-tone', 'primary')

    fireEvent.click(
      within(voteLock).getByRole('radio', {
        name: 'Voting delegate updated',
      })
    )
    expect(
      within(voteLock).getByRole('heading', { name: 'Delegation updated' })
    ).toBeVisible()
    expect(
      within(voteLock).getByTestId('delegation-outcome-value')
    ).toHaveTextContent('Voting power delegated12.84MRSR12,843,771.62 RSR')
    expect(
      within(voteLock).getByTestId('delegation-outcome-value')
    ).not.toHaveTextContent('Full voting power for each role')
    const votingOnlyDetails = within(voteLock).getByTestId(
      'delegation-outcome-details'
    )
    expect(within(votingOnlyDetails).getByText('Voting delegate')).toBeVisible()
    expect(within(votingOnlyDetails).getByText('0x7f4A...A018')).toBeVisible()
    const votingOnlyRole = within(votingOnlyDetails).getByTestId(
      'delegation-outcome-role-group'
    )
    expect(
      within(votingOnlyRole).getByRole('button', {
        name: /^Copy 0x.* to clipboard$/,
      }).parentElement?.parentElement
    ).toHaveClass('col-start-2', 'row-start-1', 'justify-self-end')
    expect(
      within(voteLock).queryByText('Challenge delegate')
    ).not.toBeInTheDocument()
    const delegationOutcomeFooter = within(voteLock).getByTestId(
      'delegation-outcome-footer'
    )
    expect(
      within(delegationOutcomeFooter).getByRole('link', {
        name: 'View transaction on BscScan (opens in a new tab)',
      })
    ).toHaveAttribute('data-tone', 'secondary')
    expect(
      within(delegationOutcomeFooter).getByRole('button', { name: 'Done' })
    ).toHaveAttribute('data-tone', 'primary')
    expect(
      within(voteLock).getAllByRole('link', {
        name: /View .*transaction/,
      })
    ).toHaveLength(1)
  })

  it('preserves delegation validation and eligibility boundaries', () => {
    render(<TransactionTruthSpectrum />)

    const voteLock = screen.getByTestId('transaction-composition-vote-lock')

    fireEvent.click(
      within(voteLock).getByRole('radio', { name: 'Invalid address' })
    )
    expect(within(voteLock).getByLabelText(/Voting delegate/)).toHaveAttribute(
      'aria-invalid',
      'true'
    )
    expect(
      within(
        within(voteLock).getByRole('dialog', { name: 'Govern PHOTON' })
      ).getByText('Invalid address')
    ).toBeVisible()
    expect(
      within(voteLock).getByRole('button', { name: 'Update delegates' })
    ).toBeDisabled()

    fireEvent.click(
      within(voteLock).getByRole('radio', { name: 'No locked balance' })
    )
    expect(
      within(voteLock).getByTestId('canonical-inline-message')
    ).toHaveClass('px-4', 'py-3')
    const selfDelegationEmphasis = within(voteLock).getByText(
      'Self-delegation happens automatically'
    )
    expect(selfDelegationEmphasis).toHaveClass('font-medium', 'text-foreground')
    expect(selfDelegationEmphasis.parentElement).toHaveTextContent(
      'Self-delegation happens automatically when you vote-lock RSR. Come back here after vote-locking to update delegation.'
    )
    expect(within(voteLock).getByLabelText(/Voting delegate/)).toBeDisabled()
    expect(within(voteLock).getByLabelText(/Voting delegate/)).toHaveValue('')
    expect(within(voteLock).getByLabelText(/Challenge delegate/)).toBeDisabled()
    expect(within(voteLock).getByLabelText(/Challenge delegate/)).toHaveValue(
      ''
    )
    expect(
      within(voteLock).queryByTestId('delegation-locked-context')
    ).not.toBeInTheDocument()

    fireEvent.click(
      within(voteLock).getByRole('radio', { name: 'Wallet disconnected' })
    )
    expect(
      within(voteLock).getByTestId('canonical-inline-message')
    ).toHaveClass('px-4', 'py-3')
    expect(
      within(voteLock).getByText(
        'Connect your wallet to view or change delegates.'
      )
    ).toBeVisible()
    const connectWallet = within(voteLock).getByRole('button', {
      name: 'Connect wallet',
    })
    expect(connectWallet).toBeEnabled()
    expect(connectWallet).toHaveAttribute('data-tone', 'primary')
    expect(within(voteLock).getByLabelText(/Voting delegate/)).toBeDisabled()
    expect(within(voteLock).getByLabelText(/Voting delegate/)).toHaveValue('')
    expect(within(voteLock).getByLabelText(/Challenge delegate/)).toBeDisabled()
    expect(within(voteLock).getByLabelText(/Challenge delegate/)).toHaveValue(
      ''
    )
    expect(
      within(voteLock).queryByTestId('delegation-locked-context')
    ).not.toBeInTheDocument()
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
      'components/vote-lock/components/delegate.tsx',
      'components/vote-lock/components/submit-delegate-button.tsx',
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

  it('preserves the real manual-mint input and each permission boundary', () => {
    render(<TransactionTruthSpectrum />)

    const atomic = screen.getByTestId('transaction-composition-atomic')

    expect(
      within(atomic).getByRole('textbox', { name: 'Shares to mint amount' })
    ).toHaveValue('100')
    expect(
      within(atomic).getByRole('button', { name: 'Approve All (3)' })
    ).toBeVisible()
    expect(within(atomic).getByText('Max 105.100042 CMC20')).toBeVisible()
    expect(
      within(atomic).queryByText('Balance 124.63 CMC20')
    ).not.toBeInTheDocument()
    expect(
      within(atomic).queryByRole('button', { name: 'Edit amount' })
    ).not.toBeInTheDocument()
    expect(within(atomic).getByRole('button', { name: 'Use' })).toHaveAttribute(
      'data-testid',
      'inline-action'
    )
    expect(within(atomic).getByText('Required Approvals')).toBeVisible()
    expect(
      within(atomic).getByTestId('transaction-requirements-list')
    ).not.toHaveClass('px-1')
    expect(
      within(atomic).getAllByTestId('transaction-requirement-row')
    ).toHaveLength(5)
    expect(
      within(atomic).getAllByRole('button', { name: /^Approve (WETH|AAVE)$/ })
    ).toHaveLength(2)
    expect(
      within(atomic).getByRole('button', { name: 'Revoke USDT' })
    ).toBeVisible()
    expect(within(atomic).getAllByText('Approved')).toHaveLength(2)
  })

  it('preserves automated issuance progressive disclosure instead of forcing one persistent workspace', () => {
    render(<TransactionTruthSpectrum />)

    const staged = screen.getByTestId('transaction-composition-staged')
    fireEvent.click(
      within(staged).getByRole('radio', { name: 'Initial configuration' })
    )
    expect(
      screen.getByTestId('transaction-composition-staged-stage')
    ).toHaveClass('p-0', 'sm:p-6')
    expect(
      within(staged).getByTestId('automated-mint-narrow-stage')
    ).toHaveClass(
      'min-h-[calc(100dvh-3.5rem)]',
      'sm:min-h-0',
      'sm:max-w-[476px]'
    )
    expect(within(staged).getByText('Enter USDC amount')).toBeVisible()
    expect(
      within(staged).queryByText('Enter an amount to fetch quotes')
    ).not.toBeInTheDocument()
    expect(
      within(staged).queryByText('Choose how much USDC to use for this mint.')
    ).not.toBeInTheDocument()
    expect(
      within(staged).getByRole('button', { name: 'Enter amount' })
    ).toBeDisabled()
    expect(
      within(staged).queryByRole('button', { name: 'Select input asset' })
    ).not.toBeInTheDocument()
    expect(within(staged).getByRole('radio', { name: 'Mint' })).toBeChecked()
    expect(within(staged).getByRole('radio', { name: 'Redeem' })).toBeEnabled()
    expect(
      within(
        within(staged).getByTestId('automated-mint-configure-frame')
      ).queryByText('1', { exact: true })
    ).not.toBeInTheDocument()
    expect(
      within(staged)
        .getByTestId('automated-mint-configure-active')
        .querySelector('a')
    ).toHaveTextContent('Switch to manual minting')
    const configureSteps = within(staged).getAllByTestId(
      'automated-configure-step-content'
    )
    expect(configureSteps).toHaveLength(3)
    expect(configureSteps[0]).not.toHaveClass('items-center')
    for (const step of configureSteps.slice(1)) {
      expect(step).toHaveClass('items-center')
      expect(step).not.toHaveClass('items-start')
    }
    expect(
      within(staged).queryByText('Collateral swaps')
    ).not.toBeInTheDocument()

    fireEvent.click(
      within(staged).getByRole('radio', { name: 'Orders filling' })
    )
    fireEvent.click(within(staged).getByRole('button', { name: 'View orders' }))
    expect(
      within(staged).getByTestId('automated-mint-collateral-stage')
    ).toBeVisible()
    const fillingCollateral = within(staged).getByTestId(
      'automated-mint-collateral-stage'
    )
    expect(within(fillingCollateral).getByText('4/5')).toBeVisible()
    expect(
      within(fillingCollateral).getByText('1 order open · expires in 1m 42s')
    ).toBeVisible()
    expect(within(staged).getByText('Mint CMC20')).toBeVisible()
    expect(within(staged).getByText('Step 2 of 2')).toBeVisible()
    expect(
      within(staged).queryByText(/final after collateral trades/)
    ).not.toBeInTheDocument()
  })

  it('keeps the ordinary Zapper quote complete and its supporting controls real', () => {
    render(<TransactionTruthSpectrum />)

    const rfq = screen.getByTestId('transaction-composition-rfq')
    expect(screen.getByTestId('transaction-composition-rfq-stage')).toHaveClass(
      'min-h-[680px]',
      'isolate',
      'items-end',
      'sm:items-center',
      'justify-center',
      'p-0',
      'sm:p-6',
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
    expect(inputAmount).toHaveClass('rounded-lg')
    expect(outputAmount).toHaveClass('rounded-lg')
    expect(inputAmount).not.toHaveClass('rounded-none')
    expect(outputAmount).not.toHaveClass('rounded-none')
    expect(inputIdentity).toHaveClass('text-lg', 'min-[360px]:text-xl')
    expect(outputIdentity).toHaveClass('text-lg', 'min-[360px]:text-xl')
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
    expect(within(outputAmount).getByText('After fees')).toBeVisible()
    expect(
      within(outputAmount).getByRole('button', {
        name: 'About included quote fees',
      })
    ).toBeVisible()
    expect(outputAmount).toHaveClass('rounded-lg')
    expect(outputAmount).not.toHaveClass('border-b')
    expect(outputAmount).not.toHaveClass('rounded-b-none')
    expect(
      within(rfq).getByTestId('zapper-output-details-divider')
    ).toHaveClass(
      'absolute',
      'inset-x-0',
      'bottom-0',
      'h-px',
      'bg-border',
      'opacity-100'
    )
    expect(
      within(outputAmount).queryByText(/final after order fill/)
    ).not.toBeInTheDocument()
    const amountAndDetails = within(rfq).getByTestId(
      'zapper-amount-and-details'
    )
    expect(within(rfq).getByTestId('transaction-amount-pair')).toHaveClass(
      'flex',
      'flex-col'
    )
    expect(within(rfq).getByTestId('transaction-amount-pair')).not.toHaveClass(
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
    expect(within(quoteDetails).getByText('1 USDC = 0.99 CMC20')).toBeVisible()
    expect(within(quoteDetails).getByText('CoW Swap')).toBeVisible()

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
    expect(within(rfq).getByText('0.24%')).toHaveAttribute(
      'data-transaction-metric-tone',
      'neutral'
    )
    expect(within(rfq).getByText('Network estimate')).toBeVisible()
    expect(within(rfq).queryByText('Exchange rate')).toBeNull()
    expect(within(rfq).getAllByText('1 USDC = 0.99 CMC20')).toHaveLength(1)

    fireEvent.click(
      within(rfq).getByRole('button', { name: 'Select input asset' })
    )
    expect(
      screen.getByRole('group', { name: 'Zapper input assets' })
    ).toBeVisible()
    const assetOptions = screen.getByRole('group', {
      name: 'Zapper input assets',
    })
    expect(within(assetOptions).getByText('0x8335…2913')).toBeVisible()
    expect(within(assetOptions).getByText('Native on Base')).toBeVisible()
    expect(within(assetOptions).queryByText('Base · 0x8335…2913')).toBeNull()
    expect(
      within(assetOptions).getByRole('button', {
        name: 'ETH on Base, native asset, balance 0.18 ETH',
      })
    ).toBeVisible()
    const optionRows = within(assetOptions).getAllByTestId(
      'transaction-asset-picker-option'
    )
    expect(optionRows).toHaveLength(4)
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

    fireEvent.click(
      within(rfq).getByRole('button', { name: 'Select input asset' })
    )
    fireEvent.click(within(rfq).getByRole('radio', { name: 'Sell' }))
    fireEvent.click(within(rfq).getByRole('radio', { name: 'RFQ execution' }))
    const sellCommittedMode = within(rfq).getByTestId(
      'transaction-committed-mode'
    )
    expect(sellCommittedMode).toHaveTextContent('Sell')
    expect(sellCommittedMode).toHaveAttribute('data-asset-symbol', 'CMC20')
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
      within(reviewVariants).getByRole('radio', {
        name: 'CoW redirect · retired',
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
    const settingsPanel = screen.getByRole('dialog', {
      name: 'Zapper settings',
    })
    expect(settingsPanel).toBeVisible()
    expect(screen.getByText('Quote Source')).toBeVisible()
    expect(screen.getByText('Best Quote')).toBeVisible()
    expect(screen.getByText('Max. mint slippage')).toBeVisible()
    expect(screen.getByText('Deep liquidity search')).toBeVisible()
    const quoteSource = screen.getByRole('group', { name: 'Quote Source' })
    const slippage = screen.getByRole('group', {
      name: 'Max. mint slippage',
    })
    expect(
      within(quoteSource).getByRole('radio', { name: 'Best Quote' })
    ).toBeChecked()
    expect(
      within(quoteSource).getByRole('radio', { name: 'Best Quote' })
    ).toHaveFocus()
    expect(
      screen.getByRole('button', { name: 'About quote sources' })
    ).not.toHaveFocus()
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    expect(within(slippage).getByRole('radio', { name: '1%' })).toBeChecked()
    fireEvent.click(
      within(quoteSource).getByRole('radio', { name: 'CoW Swap' })
    )
    fireEvent.click(within(slippage).getByRole('radio', { name: '3%' }))
    expect(
      within(quoteSource).getByRole('radio', { name: 'CoW Swap' })
    ).toBeChecked()
    expect(within(slippage).getByRole('radio', { name: '3%' })).toBeChecked()
    expect(
      screen.getByRole('button', { name: 'About quote sources' })
    ).toBeVisible()
    expect(
      screen.getByRole('button', { name: 'About maximum mint slippage' })
    ).toBeVisible()
    expect(
      screen.getByRole('button', { name: 'About deep liquidity search' })
    ).toBeVisible()
    expect(
      screen.getByRole('button', { name: 'About forcing a DTF mint' })
    ).toBeVisible()
    fireEvent.click(
      screen.getByRole('checkbox', { name: 'Deep liquidity search' })
    )
    fireEvent.click(screen.getByRole('checkbox', { name: 'Force DTF mint' }))
    fireEvent.click(
      within(rfq).getByRole('button', { name: 'Open Zapper settings' })
    )
    fireEvent.click(
      within(rfq).getByRole('button', { name: 'Open Zapper settings' })
    )
    expect(
      screen.getByRole('checkbox', { name: 'Deep liquidity search' })
    ).toBeChecked()
    expect(
      screen.getByRole('checkbox', { name: 'Force DTF mint' })
    ).toBeChecked()

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

  it('keeps the retired CoW redirect as labeled evidence with a compact action', () => {
    render(<TransactionTruthSpectrum />)

    const rfq = screen.getByTestId('transaction-composition-rfq')
    fireEvent.click(
      within(rfq).getByRole('radio', { name: 'CoW redirect · retired' })
    )

    const advisory = within(rfq).getByTestId('transaction-review-advisory')
    expect(within(advisory).getByTestId('zapper-review-advisory')).toHaveClass(
      'gap-2'
    )
    expect(within(advisory).getByText('Try CoW Swap')).toBeVisible()
    const cowRedirectEmphasis = within(advisory).getByText(
      'may get you a better price'
    )
    expect(cowRedirectEmphasis).toHaveClass('font-medium', 'text-foreground')
    expect(cowRedirectEmphasis.parentElement).toHaveTextContent(
      'For larger orders, a DEX aggregator like CoW Swap may get you a better price by routing your trade across multiple sources of liquidity.'
    )
    const cowSwapAction = within(advisory).getByRole('link', {
      name: /Open CoW Swap/,
    })
    expect(cowSwapAction).toHaveAttribute('data-link-treatment', 'standalone')
    expect(cowSwapAction).toHaveAttribute('target', '_blank')
    expect(cowSwapAction).toHaveAttribute(
      'rel',
      expect.stringContaining('noopener')
    )
    expect(cowSwapAction).toHaveAttribute(
      'rel',
      expect.stringContaining('noreferrer')
    )
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
    expect(within(rfq).getByText('1 USDC = 0.99 CMC20')).toBeVisible()
    expect(within(rfq).queryByText('Exchange rate')).toBeNull()

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
    expect(within(rfq).getByText('Zaps are experiencing issues')).toBeVisible()
    expect(
      within(rfq).queryByText(
        /we’re having a hard time finding a route that makes sense/
      )
    ).toBeNull()
    fireEvent.click(
      within(rfq).getByRole('button', {
        name: 'About Zapper availability',
      })
    )
    expect(screen.getByRole('tooltip')).toHaveTextContent(
      /we’re having a hard time finding a route that makes sense/
    )
    expect(within(rfq).getByRole('button', { name: 'Refresh' })).toBeVisible()

    fireEvent.click(within(rfq).getByRole('radio', { name: 'Native refund' }))
    const nativeRefundEmphasis = within(rfq).getByText(
      'automatically refund your ETH within a few minutes.'
    )
    expect(nativeRefundEmphasis).toHaveClass('font-medium', 'text-foreground')
    expect(nativeRefundEmphasis.parentElement).toHaveTextContent(
      /CoW Protocol will automatically refund your ETH/
    )
    expect(within(rfq).getByText('ETH')).toBeVisible()
    expect(
      within(rfq).getByRole('textbox', { name: 'You use amount' })
    ).toHaveValue('0.42')
    expect(
      within(rfq).getByRole('textbox', { name: 'You use amount' })
    ).toBeEnabled()
    expect(
      within(rfq).getByRole('button', { name: 'Select input asset' })
    ).toBeEnabled()
    expect(within(rfq).getByRole('button', { name: 'Max' })).toBeEnabled()
    expect(
      within(rfq).getByRole('button', {
        name: 'Swap input and output assets',
      })
    ).toBeEnabled()
    expect(within(rfq).getByText('0.18')).toBeVisible()
    expect(
      within(rfq).getByRole('button', { name: 'Get fresh quote' })
    ).toBeVisible()

    fireEvent.click(
      within(rfq).getByRole('radio', { name: 'High-impact acknowledgment' })
    )
    const priceImpactMessage = within(rfq).getByTestId(
      'canonical-inline-message'
    )
    const acknowledgment = within(priceImpactMessage).getByRole('checkbox', {
      name: 'I understand the 5.8% price impact',
    })
    const acknowledgmentLabel = within(priceImpactMessage).getByText(
      'I understand the 5.8% price impact'
    )
    expect(acknowledgment).toBeVisible()
    expect(acknowledgmentLabel.tagName).toBe('LABEL')
    expect(acknowledgmentLabel).toHaveAttribute('for', acknowledgment.id)
    expect(
      within(rfq).queryByText(/You will get significantly less value/)
    ).toBeNull()
    fireEvent.click(
      within(priceImpactMessage).getByRole('button', {
        name: 'About high price impact',
      })
    )
    expect(screen.getByRole('tooltip')).toHaveTextContent(
      /You will get significantly less value/
    )

    const qualifiedAction = within(rfq).getByRole('button', {
      name: 'Buy anyway',
    })
    expect(qualifiedAction).toBeDisabled()
    expect(qualifiedAction).toHaveAttribute('data-tone', 'primary')

    fireEvent.click(acknowledgmentLabel)
    expect(acknowledgment).toBeChecked()
    expect(qualifiedAction).toBeEnabled()
  })

  it('distinguishes blocking capacity from a cautionary executable quote', () => {
    render(<TransactionTruthSpectrum />)

    const rfq = screen.getByTestId('transaction-composition-rfq')

    fireEvent.click(
      within(rfq).getByRole('radio', { name: 'Capacity advisory' })
    )
    expect(
      within(rfq).getByRole('textbox', { name: 'You use amount' })
    ).toHaveValue('250,000')
    expect(within(rfq).getByText('280,000.00')).toBeVisible()
    expect(
      within(rfq).getByRole('button', { name: 'Buy CMC20' })
    ).toBeDisabled()
    expect(within(rfq).getByText('up to $200,000 per transaction')).toHaveClass(
      'font-medium',
      'text-foreground'
    )

    fireEvent.click(
      within(rfq).getByRole('radio', { name: 'Market-hours advisory' })
    )
    const cautionaryAction = within(rfq).getByRole('button', {
      name: 'Buy anyway',
    })
    expect(cautionaryAction).toBeEnabled()
    expect(cautionaryAction).toHaveAttribute('data-tone', 'secondary')
    expect(within(rfq).getByText('Please try again in 2 hours.')).toHaveClass(
      'font-medium',
      'text-foreground'
    )

    fireEvent.click(
      within(rfq).getByRole('radio', { name: 'Trading unavailable' })
    )
    expect(
      within(rfq).getByRole('button', { name: 'Buy CMC20' })
    ).toBeDisabled()
    expect(
      within(rfq).getByText('Try again later when trading resumes.')
    ).toHaveClass('font-medium', 'text-foreground')
  })

  it('keeps RFQ execution compact while preserving filled and expired evidence', async () => {
    render(<TransactionTruthSpectrum />)

    const rfq = screen.getByTestId('transaction-composition-rfq')

    fireEvent.click(within(rfq).getByRole('radio', { name: 'RFQ execution' }))
    const committedMode = within(rfq).getByTestId('transaction-committed-mode')
    expect(committedMode).toHaveTextContent('Buy')
    expect(committedMode).toHaveAttribute('data-asset-symbol', 'CMC20')
    expect(
      within(committedMode).getByTestId('transaction-committed-mode-logo')
    ).toHaveClass('motion-safe:animate-[spin_12s_linear_infinite]')
    expect(
      within(rfq).queryByRole('button', { name: 'Open Zapper settings' })
    ).not.toBeInTheDocument()
    expect(
      within(rfq).queryByRole('button', { name: 'Refresh quote' })
    ).not.toBeInTheDocument()
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
    ).toHaveClass('relative', 'h-px', 'bg-border')
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
    const outcomeShell = within(rfq).getByTestId('zapper-shell')
    expect(outcomeShell).toHaveClass(
      'relative',
      'z-10',
      'min-h-[26rem]',
      'p-0',
      'ring-2',
      'ring-card'
    )
    expect(outcomeShell.classList.contains('grid')).toBe(true)
    const outcomeStack = within(rfq).getByTestId('zapper-review-stack')
    expect(outcomeStack.classList.contains('flex')).toBe(true)
    expect(outcomeStack.classList.contains('flex-col')).toBe(true)
    const outcomeAmountAndDetails = within(rfq).getByTestId(
      'zapper-amount-and-details'
    )
    expect(outcomeAmountAndDetails.classList.contains('flex-1')).toBe(true)
    expect(
      outcomeAmountAndDetails.classList.contains(
        'grid-rows-[auto_minmax(0,1fr)_auto]'
      )
    ).toBe(true)
    const outcomeSurface = within(rfq).getByTestId('zapper-outcome-surface')
    expect(outcomeSurface).toHaveAttribute(
      'data-component',
      'organic-brand-surface'
    )
    expect(outcomeSurface).toHaveAttribute('aria-hidden', 'true')
    expect(outcomeSurface).toHaveClass(
      'origin-bottom',
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
    const outcomeAmountPair = within(rfq).getByTestId('transaction-amount-pair')
    expect(outcomeAmountPair).toHaveClass('pb-2')
    expect(outcomeAmountPair.classList.contains('flex')).toBe(true)
    expect(outcomeAmountPair.classList.contains('flex-col')).toBe(true)
    expect(outcomeAmountPair.classList.contains('justify-end')).toBe(true)
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
    ).toHaveClass('lucide-bookmark')
    fireEvent.click(walletAction)
    expect(
      within(walletAction).getByTestId('transaction-wallet-tracked-glyph')
    ).toHaveClass('lucide-bookmark', 'fill-current')
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
    expect(within(rfq).getByText('-1.36%')).toHaveAttribute(
      'data-transaction-metric-tone',
      'realized-adverse'
    )
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
    expect(updatesAttachment.querySelector('strong')).toBeNull()
    expect(
      within(updatesAttachment).getByTestId('outcome-attachment-copy')
    ).toHaveClass('px-4', 'pt-4')
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
    ).toHaveClass('flex-col', 'gap-2', '[@container(min-width:440px)]:flex-row')
    expect(
      within(updatesAttachment).getByRole('button', { name: 'Subscribe' })
    ).toHaveClass('w-full', '[@container(min-width:440px)]:w-auto')
    expect(
      within(updatesAttachment).queryByRole('button', {
        name: 'Dismiss invitation',
      })
    ).toBeNull()
    expect(
      within(updatesAttachment).queryByTestId('outcome-attachment-icon')
    ).toBeNull()
    const updatesRegion = within(rfq).getByTestId(
      'transaction-outcome-attachment-region'
    )
    expect(updatesRegion).toHaveClass(
      'relative',
      'z-0',
      'w-full',
      'max-w-none',
      'rounded-none',
      'bg-substrate-subtle',
      'p-2'
    )
    expect(updatesRegion).not.toHaveClass(
      'absolute',
      'bg-gradient-to-b',
      'ring-1',
      'ring-border'
    )
    const outcomeComposition = within(rfq).getByTestId(
      'zapper-outcome-composition'
    )
    expect(outcomeComposition).toHaveClass(
      'relative',
      'max-w-[448px]',
      'min-h-[26rem]',
      'overflow-hidden',
      'ring-2',
      'ring-card'
    )
    expect(within(rfq).getByTestId('zapper-shell')).not.toHaveClass(
      'min-h-[26rem]'
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
    const introApplicabilityEmphasis =
      within(introAttachment).getByText('As a larger holder')
    expect(introApplicabilityEmphasis).toHaveClass(
      'font-medium',
      'text-foreground'
    )
    expect(introApplicabilityEmphasis.parentElement).toHaveTextContent(
      'As a larger holder, you can schedule an intro call with the Reserve team to meet us, get help when needed, and share feedback as we continue to build.'
    )
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
    expect(
      within(introAttachment).queryByRole('button', {
        name: 'Dismiss invitation',
      })
    ).toBeNull()
    expect(within(rfq).getByTestId('zapper-outcome-composition')).toHaveClass(
      'max-w-[448px]'
    )

    fireEvent.click(within(rfq).getByRole('radio', { name: 'RFQ recovery' }))
    expect(
      within(rfq).getByRole('textbox', { name: 'You use amount' })
    ).toBeEnabled()
    expect(
      within(rfq).getByRole('button', { name: 'Select input asset' })
    ).toBeEnabled()
    expect(within(rfq).getByRole('button', { name: 'Max' })).toBeEnabled()
    expect(
      within(rfq).getByRole('button', {
        name: 'Swap input and output assets',
      })
    ).toBeEnabled()
    expect(within(rfq).queryByText(/No purchase completed/)).toBeNull()
    fireEvent.click(
      within(rfq).getByRole('button', { name: 'About the expired order' })
    )
    expect(screen.getByRole('tooltip')).toHaveTextContent(
      /No purchase completed/
    )
    expect(
      within(rfq).queryByText(/Native-input refunds/)
    ).not.toBeInTheDocument()
  })

  it('keeps review and outcome attachments semantically distinct', () => {
    render(<TransactionTruthSpectrum />)

    const rfq = screen.getByTestId('transaction-composition-rfq')

    fireEvent.click(
      within(rfq).getByRole('radio', { name: 'Market-hours advisory' })
    )

    const advisory = within(rfq).getByTestId('transaction-review-advisory')
    expect(advisory).toHaveAttribute('data-entrance', 'immediate')
    expect(advisory).toHaveClass('bg-substrate-subtle', 'p-6')
    expect(
      within(rfq).queryByTestId('transaction-outcome-attachment-region')
    ).toBeNull()
    expect(within(advisory).queryByTestId('lifecycle-status-pill')).toBeNull()
    expect(within(advisory).getByText('Expect a worse price')).toHaveClass(
      'text-feedback-warning-foreground'
    )
    const dismissAdvisory = within(advisory).getByRole('button', {
      name: 'Dismiss suggestion',
    })
    expect(dismissAdvisory).toHaveClass('size-5', 'after:-inset-3')
    expect(dismissAdvisory).not.toHaveAttribute(
      'data-testid',
      'canonical-icon-button'
    )
    expect(
      within(advisory).getByText(
        /CMC20's underlying stocks aren't trading right now/
      )
    ).toBeVisible()
    expect(within(rfq).getByTestId('zapper-outcome-composition')).toHaveClass(
      'overflow-hidden',
      'bg-card',
      'ring-2',
      'ring-card'
    )

    fireEvent.click(within(rfq).getByRole('radio', { name: 'Updates' }))
    const outcome = within(rfq).getByTestId(
      'transaction-outcome-attachment-region'
    )
    expect(outcome).toHaveAttribute('data-entrance', 'with-outcome')
    expect(
      within(outcome).getByText('Stay informed about this DTF')
    ).toBeVisible()
    expect(within(rfq).getByTestId('zapper-outcome-surface')).toHaveClass(
      'bg-brand-deep'
    )
    expect(within(rfq).getByTestId('zapper-outcome-surface')).toHaveAttribute(
      'data-tone',
      'deep'
    )
    expect(within(rfq).queryByRole('button', { name: 'Done' })).toBeNull()

    fireEvent.click(within(rfq).getByRole('radio', { name: 'Intro call' }))
    expect(
      within(rfq).getByRole('link', { name: /Schedule an intro call/ })
    ).toHaveAttribute('data-tone', 'primary')
    expect(within(rfq).queryByRole('button', { name: 'Done' })).toBeNull()
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
    expect(within(outputAmount).getAllByText('—')).toHaveLength(2)
    expect(
      within(outputAmount).queryByText('Get a fresh quote to update')
    ).toBeNull()
    expect(within(outputAmount).queryByText('≈990.00')).toBeNull()
  })

  it('preserves the installed Zapper quote-search composition', () => {
    render(<TransactionTruthSpectrum />)

    const rfq = screen.getByTestId('transaction-composition-rfq')
    fireEvent.click(
      within(rfq).getByRole('button', { name: 'Show quote details' })
    )
    fireEvent.click(within(rfq).getByRole('radio', { name: 'Quote search' }))

    expect(
      within(rfq).getByTestId('transaction-committed-mode')
    ).toHaveTextContent('Buy')
    expect(
      within(rfq).queryByRole('group', { name: 'Zapper operation' })
    ).not.toBeInTheDocument()
    const quoteSearchSurface = within(rfq).getByRole('status', {
      name: 'Finding best quote',
    })
    expect(quoteSearchSurface).toBeVisible()
    expect(quoteSearchSurface).toHaveClass('rounded-lg')
    expect(quoteSearchSurface).not.toHaveClass('rounded-none')
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
    expect(searchingOutput).not.toHaveClass(
      'border-b',
      'border-transparent',
      'border-border'
    )
    expect(
      within(rfq).getByTestId('zapper-output-details-divider')
    ).toHaveClass('bg-border', 'opacity-0')
    expect(within(rfq).getByTestId('zapper-quote-details')).not.toHaveClass(
      'border-t'
    )
    const quoteSearchDetails = within(rfq).getByTestId('zapper-quote-details')
    const quoteSearchDetailsTrigger = within(quoteSearchDetails).getByRole(
      'button',
      { name: 'Hide quote details' }
    )
    expect(quoteSearchDetailsTrigger.firstElementChild).toHaveClass(
      'flex',
      'h-5',
      'items-center'
    )
    expect(quoteSearchDetailsTrigger.lastElementChild).toHaveClass('h-5')
    expect(within(quoteSearchDetails).queryByText('CoW Swap')).toBeNull()
    expect(
      quoteSearchDetails.querySelector(
        '[data-slot="zapper-quote-source-loading"]'
      )
    ).toHaveClass('h-3', 'w-20')
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
    ).toHaveLength(6)
    for (const fact of within(rfq).getAllByTestId('zapper-quote-fact')) {
      expect(fact).toHaveClass('h-5', 'items-center')
    }
    expect(within(rfq).getByTestId('zapper-review-stack')).toHaveClass(
      'space-y-0'
    )
  })

  it('keeps only distinct current Zapper behavior inside the reviewed composition', () => {
    render(<TransactionTruthSpectrum />)

    const rfq = screen.getByTestId('transaction-composition-rfq')

    expect(within(rfq).getByRole('radio', { name: 'Review' })).toBeChecked()
    expect(within(rfq).getByRole('radio', { name: 'Buy' })).toBeVisible()

    fireEvent.click(within(rfq).getByRole('radio', { name: 'Pre-quote' }))
    expect(within(rfq).getByRole('radio', { name: 'Buy' })).toBeVisible()
    expect(
      within(rfq).getByRole('button', { name: 'Close Zapper' })
    ).toBeVisible()
    expect(
      within(rfq).getByRole('button', { name: 'Swap input and output assets' })
    ).toBeVisible()
    expect(within(rfq).getByText('Slippage tolerance')).toBeVisible()
    const preQuoteInput = within(rfq).getByRole('textbox', {
      name: 'Order size amount',
    })
    expect(preQuoteInput).toHaveValue('')
    expect(preQuoteInput).toHaveAttribute('placeholder', '0')
    expect(within(rfq).getByText('Projected proceeds')).toBeVisible()
    expect(within(rfq).getByText('0')).toBeVisible()
    expect(within(rfq).getAllByText('$0.00')).toHaveLength(2)
    expect(within(rfq).getByTestId('zapper-selectable-quote-meta')).toHaveClass(
      'zapper-selectable-quote-meta',
      'py-3'
    )
    const preQuoteMetaRow = within(rfq).getByTestId(
      'zapper-selectable-quote-meta-row'
    )
    expect(
      within(preQuoteMetaRow).getByText('Slippage tolerance')
    ).toBeVisible()
    expect(
      within(preQuoteMetaRow).getByRole('button', {
        name: 'About slippage tolerance',
      })
    ).toBeVisible()
    const preQuoteSlippage = within(preQuoteMetaRow).getByRole('combobox', {
      name: 'Change slippage tolerance',
    })
    expect(preQuoteSlippage).toHaveAttribute('data-size', 'compact')
    expect(preQuoteSlippage).toHaveClass('w-[84px]', 'shrink-0')
    expect(preQuoteSlippage).toHaveTextContent('0.5%')
    fireEvent.click(preQuoteSlippage)
    expect(screen.getByRole('option', { name: '0.1%' })).toBeVisible()
    expect(screen.getByRole('option', { name: '0.5%' })).toBeVisible()
    expect(screen.getByRole('option', { name: '1%' })).toBeVisible()
    expect(screen.getByRole('option', { name: '5%' })).toBeVisible()
    fireEvent.click(screen.getByRole('option', { name: '1%' }))
    expect(preQuoteSlippage).toHaveTextContent('1%')
    expect(
      within(rfq).queryByRole('button', { name: 'Show quote details' })
    ).toBeNull()
    expect(within(rfq).getByTestId('zapper-selectable-route-meta')).toHaveClass(
      'max-h-0',
      'zapper-selectable-route-meta'
    )
    expect(
      within(rfq).getByRole('button', { name: 'Market Buy' })
    ).toBeDisabled()

    fireEvent.click(within(rfq).getByRole('radio', { name: 'Route selection' }))
    expect(within(rfq).getByText('Slippage tolerance')).toBeVisible()
    const currentQuoteOutput = within(rfq)
      .getByText('Projected proceeds')
      .closest('[data-testid="transaction-amount-object"]')
    expect(currentQuoteOutput).not.toBeNull()
    expect(
      within(currentQuoteOutput as HTMLElement).getByText('After fees')
    ).toBeVisible()
    expect(
      within(currentQuoteOutput as HTMLElement).getByRole('button', {
        name: 'About included quote fees',
      })
    ).toBeVisible()

    const currentDetails = within(rfq).getByRole('button', {
      name: 'Show quote details',
    })
    const quoteReadyMetaRow = within(rfq).getByTestId(
      'zapper-selectable-quote-meta-row'
    )
    expect(quoteReadyMetaRow).toHaveClass(
      'flex',
      'flex-col',
      'zapper-selectable-quote-meta-row'
    )
    expect(within(rfq).getByTestId('zapper-selectable-route-meta')).toHaveClass(
      'max-h-11',
      'w-full',
      'shrink-0',
      'zapper-selectable-route-meta'
    )
    expect(quoteReadyMetaRow).toContainElement(currentDetails)
    expect(
      within(quoteReadyMetaRow).getByText('Slippage tolerance')
    ).toBeVisible()
    expect(within(quoteReadyMetaRow).getByText('Via')).toBeVisible()
    expect(within(quoteReadyMetaRow).getByText('CoW Swap')).toBeVisible()
    expect(within(currentDetails).queryByText('CoW Swap')).toBeNull()
    expect(currentDetails).toHaveAttribute(
      'data-testid',
      'canonical-icon-button'
    )
    expect(currentDetails).toHaveAttribute('data-size', 'micro')
    expect(currentDetails).toHaveAttribute('data-tone', 'secondary')
    expect(within(quoteReadyMetaRow).queryByText('Fees included')).toBeNull()
    expect(currentDetails).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(currentDetails)
    expect(currentDetails).toHaveAttribute('aria-expanded', 'true')
    expect(within(rfq).queryByText('Routes')).toBeNull()
    const routeOptions = within(rfq).getByTestId('zapper-route-options')
    expect(routeOptions).toHaveClass('grid-cols-1')
    expect(routeOptions).toHaveClass('px-0', 'pt-2')
    expect(within(rfq).getByText('Best')).toBeVisible()
    const cowRoute = within(rfq).getByRole('button', {
      name: 'Use CoW Swap route',
    })
    expect(cowRoute).toHaveClass('min-h-11', 'rounded-full', 'px-4')
    expect(cowRoute).toHaveClass('border-primary/30')
    const cowRouteValue = within(cowRoute).getByTestId('zapper-route-value')
    expect(cowRouteValue).toHaveClass('flex-row')
    expect(within(cowRouteValue).getByText('990.00')).toBeVisible()
    expect(within(cowRouteValue).getByText('$990.00')).toBeVisible()
    expect(within(rfq).getByText('Current price')).toBeVisible()
    expect(within(rfq).getByText('Projected slippage')).toBeVisible()
    expect(within(rfq).getByText('Max slippage')).toBeVisible()
    expect(within(rfq).getByText('1.00% ($10.00)')).toHaveAttribute(
      'data-transaction-metric-tone',
      'neutral'
    )
    expect(within(rfq).getByText('2.00% ($20.00)')).toHaveAttribute(
      'data-transaction-metric-tone',
      'neutral'
    )
    expect(within(rfq).getByText('Min Amount Out')).toBeVisible()
    const currentQuoteFacts = within(rfq)
      .getByText('Min Amount Out')
      .closest('dl')
    expect(currentQuoteFacts).toHaveClass('pb-2')
    expect(within(rfq).getAllByText('After fees')).toHaveLength(1)
    expect(
      within(currentQuoteFacts as HTMLElement).getByRole('button', {
        name: 'About current price',
      })
    ).toBeVisible()
    expect(
      within(currentQuoteFacts as HTMLElement).getByRole('button', {
        name: 'About projected slippage',
      })
    ).toBeVisible()
    expect(
      within(currentQuoteFacts as HTMLElement).getByRole('button', {
        name: 'About maximum slippage',
      })
    ).toBeVisible()
    expect(
      within(currentQuoteFacts as HTMLElement).getByRole('button', {
        name: 'About minimum amount out',
      })
    ).toBeVisible()
    const veloraRoute = within(rfq).getByRole('button', {
      name: 'Use Velora route',
    })
    fireEvent.click(veloraRoute)
    expect(veloraRoute).toHaveAttribute('aria-pressed', 'true')
    expect(within(quoteReadyMetaRow).getByText('Velora')).toBeVisible()
    expect(within(quoteReadyMetaRow).queryByText('CoW Swap')).toBeNull()

    expect(
      within(rfq).getByRole('radio', { name: 'Quote search' })
    ).toBeVisible()
    expect(
      within(rfq).queryByRole('radio', { name: /Current package/ })
    ).toBeNull()
    expect(within(rfq).queryByText('Current package evidence')).toBeNull()
  })

  it('keeps Stake and Unstake source-grounded while separating task content from its dialog host', () => {
    render(<TransactionTruthSpectrum />)

    const staking = screen.getByTestId('transaction-composition-stake')
    const dialog = within(staking).getByRole('dialog', {
      name: 'Stake, unstake, or delegate RSR',
    })

    expect(dialog).toHaveAttribute('data-width', 'standard')
    expect(within(dialog).getByTestId('stake-transaction-task')).toBeVisible()
    expect(within(dialog).getByText('You stake:')).toBeVisible()
    expect(within(dialog).getByText('You receive:')).toBeVisible()
    expect(
      within(dialog).getByRole('checkbox', {
        name: 'Acknowledge unstake delay',
      })
    ).toBeVisible()
    expect(
      within(dialog).getByText("I'm aware of the 14-day unstake delay")
    ).toBeVisible()
    const stakeAcknowledgement = within(dialog)
      .getByRole('checkbox', { name: 'Acknowledge unstake delay' })
      .closest('div')
    expect(stakeAcknowledgement).toHaveClass('px-4', 'py-4')
    expect(stakeAcknowledgement).not.toHaveClass('pb-2', 'pt-4')
    const stakeFacts = within(dialog).getByTestId('stake-task-facts-region')
    for (const fact of within(stakeFacts).getAllByTestId('stake-task-fact')) {
      expect(fact).toHaveClass('gap-3')
      expect(fact).not.toHaveClass('gap-4', 'min-h-5')
    }
    expect(
      within(dialog).getByRole('button', { name: 'Stake RSR' })
    ).toBeDisabled()
    expect(
      within(dialog).queryByTestId('transaction-progress-stepper')
    ).not.toBeInTheDocument()

    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Switch to unstake' })
    )
    expect(within(dialog).getByText('You unstake:')).toBeVisible()
    expect(
      within(dialog).queryByTestId('transaction-amount-relation-divider')
    ).not.toBeInTheDocument()
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Switch to stake' })
    )
    expect(within(dialog).getByText('You stake:')).toBeVisible()

    fireEvent.click(
      within(dialog).getByRole('checkbox', {
        name: 'Acknowledge unstake delay',
      })
    )
    expect(
      within(dialog).getByRole('button', { name: 'Stake RSR' })
    ).toBeEnabled()
    expect(within(staking).queryByText('Voting delegate')).toBeNull()
    expect(within(staking).queryByText('Delegated to you')).toBeNull()

    fireEvent.click(within(staking).getByRole('radio', { name: 'Approval' }))
    expect(
      within(staking).getByRole('button', {
        name: 'Approve RSR · Step 1 of 2',
      })
    ).toBeVisible()

    fireEvent.click(
      within(staking).getByRole('radio', { name: 'Approval signing' })
    )
    const progress = within(staking).getByTestId('transaction-progress-stepper')
    expect(within(progress).getByText('Approve RSR')).toBeVisible()
    expect(within(progress).getByText('Stake RSR')).toBeVisible()
    const stakeApprovalAction = within(staking).getByRole('button', {
      name: 'Approval in progress…',
    })
    expect(stakeApprovalAction).toBeDisabled()
    expect(stakeApprovalAction).toHaveAttribute('data-tone', 'primary')
    expect(stakeApprovalAction).toHaveAttribute('aria-busy', 'true')
    expect(
      within(staking).queryByRole('checkbox', {
        name: 'Acknowledge unstake delay',
      })
    ).not.toBeInTheDocument()

    fireEvent.click(
      within(staking).getByRole('radio', { name: 'Stake completed' })
    )
    expect(within(staking).getByTestId('canonical-dialog-surface')).toHaveClass(
      'min-h-[35.5rem]'
    )
    expect(within(staking).queryByText('RSR staked successfully!')).toBeNull()
    expect(within(staking).getByText('Staking yield')).toBeVisible()
    expect(within(staking).getByText('Active')).toBeVisible()
    expect(within(staking).getByText('Received')).toBeVisible()
    expect(within(staking).queryByText('You receive:')).toBeNull()
    expect(within(staking).queryByText('Voting delegate')).toBeNull()
    expect(within(staking).queryByText('Delegated to you')).toBeNull()
    expect(
      within(staking).getByRole('link', { name: /View transaction/ })
    ).toBeVisible()
    expect(within(staking).queryByText('Approve RSR')).not.toBeInTheDocument()

    fireEvent.click(
      within(staking).getByRole('radio', { name: 'Unstake amount' })
    )
    expect(within(staking).getByText('You unstake:')).toBeVisible()
    expect(within(staking).getByText('Available after delay:')).toBeVisible()
    const unstakeInput = within(staking).getByTestId('stake-input-amount')
    expect(
      within(unstakeInput as HTMLElement).getByText('$1,672.87')
    ).toBeVisible()
    expect(within(staking).getByText('Staking yield share ends')).toBeVisible()
    expect(within(staking).getByText('Immediate')).toBeVisible()
    expect(
      within(staking).getByRole('button', {
        name: 'Begin unstaking process',
      })
    ).toBeVisible()
    expect(
      within(staking).queryByTestId('transaction-progress-stepper')
    ).not.toBeInTheDocument()

    fireEvent.click(
      within(staking).getByRole('radio', { name: 'Unstaking initiated' })
    )
    expect(within(staking).getByTestId('canonical-dialog-surface')).toHaveClass(
      'min-h-[29.75rem]'
    )
    expect(
      within(staking).queryByText(
        'Unstaking initiated! You can withdraw your RSR after the delay period.'
      )
    ).toBeNull()
    expect(within(staking).getByText('Next action')).toBeVisible()
    expect(within(staking).getByText('Withdraw RSR when ready')).toBeVisible()
    expect(
      within(staking).queryByText('In withdrawal process')
    ).not.toBeInTheDocument()
    expect(
      within(staking).queryByTestId('withdrawal-queue-list')
    ).not.toBeInTheDocument()
    expect(
      within(staking).queryByRole('button', { name: 'Withdraw' })
    ).not.toBeInTheDocument()

    for (const recovery of [
      { state: 'Stake failed', action: 'Stake RSR' },
      { state: 'Unstake failed', action: 'Unstake' },
    ] as const) {
      fireEvent.click(
        within(staking).getByRole('radio', { name: recovery.state })
      )
      const recoveryMessage = within(staking).getByTestId(
        'stake-recovery-message'
      )
      const actionFooter = within(staking).getByTestId('stake-action-footer')
      const retryAction = within(actionFooter).getByRole('button', {
        name: recovery.action,
      })

      expect(within(actionFooter).getByText('Execution failed')).toBeVisible()
      expect(
        within(staking).getByTestId('stake-transaction-task')
      ).not.toContainElement(recoveryMessage)
      expect(
        recoveryMessage.compareDocumentPosition(retryAction) &
          Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy()
    }

    fireEvent.click(
      within(staking).getByRole('radio', { name: 'Current delegate' })
    )
    const currentDelegation = within(staking).getByTestId(
      'stake-delegation-task'
    )
    expect(currentDelegation).toBeVisible()
    expect(
      within(currentDelegation).getByText(
        /Voting on the RToken you are staked on requires you to delegate/
      )
    ).toBeVisible()
    const votingPower = within(currentDelegation).getByTestId(
      'stake-delegation-voting-power'
    )
    expect(within(votingPower).getByText('Voting power')).toBeVisible()
    expect(
      within(votingPower).getByTestId('stake-delegation-voting-power-icon')
    ).toBeVisible()
    expect(
      within(votingPower).getByText('Voting power').parentElement
    ).toHaveClass('flex', 'items-center', 'gap-2')
    expect(within(currentDelegation).getByText('1,420 stRSR')).toBeVisible()
    expect(
      within(currentDelegation).getByText('Delegated to you')
    ).toBeVisible()
    expect(
      within(staking).getByRole('button', { name: 'Change delegate' })
    ).toHaveAttribute('data-tone', 'secondary')

    fireEvent.click(
      within(staking).getByRole('radio', { name: 'Delegate ready' })
    )
    expect(
      within(staking).getByRole('textbox', { name: 'Voting delegate' })
    ).toBeVisible()
    expect(
      within(staking).getByText(
        /Voting on the RToken you are staked on requires you to delegate/
      )
    ).toBeVisible()
    expect(
      within(staking).getByRole('button', { name: 'Update delegate' })
    ).toBeEnabled()

    fireEvent.click(
      within(staking).getByRole('radio', { name: 'Delegate confirming' })
    )
    expect(
      within(staking).getByRole('button', { name: 'Confirming tx...' })
    ).toBeDisabled()
    expect(
      within(staking).queryByTestId('transaction-progress-stepper')
    ).not.toBeInTheDocument()

    fireEvent.click(
      within(staking).getByRole('radio', { name: 'Delegate updated' })
    )
    expect(
      within(staking).getByTestId('stake-delegation-outcome')
    ).toBeVisible()
    expect(within(staking).getByText('Voting power delegated')).toBeVisible()
    expect(
      within(staking).getByRole('link', { name: /View transaction/ })
    ).toBeVisible()
  })

  it('renders the Stake transaction task without inheriting dialog-host behavior', () => {
    render(
      <StakeTransactionTask
        acknowledged={false}
        onAcknowledgedChange={() => undefined}
        onDirectionChange={() => undefined}
        onStakeAmountChange={() => undefined}
        onUnstakeAmountChange={() => undefined}
        stakeAmount="1000"
        state="Stake amount"
        unstakeAmount="250"
      />
    )

    expect(screen.getByTestId('stake-transaction-task')).toBeVisible()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('transaction-contained-modal-layer')
    ).not.toBeInTheDocument()
  })

  it('keeps Stake fixture amounts and values coherent when the input changes', () => {
    const renderTask = (stakeAmount: string, unstakeAmount: string) => (
      <StakeTransactionTask
        acknowledged
        onAcknowledgedChange={() => undefined}
        onDirectionChange={() => undefined}
        onStakeAmountChange={() => undefined}
        onUnstakeAmountChange={() => undefined}
        stakeAmount={stakeAmount}
        state="Stake amount"
        unstakeAmount={unstakeAmount}
      />
    )
    const { rerender } = render(renderTask('1000', '250'))

    expect(
      within(screen.getByTestId('stake-output-amount')).getByText('874.25')
    ).toBeVisible()
    rerender(renderTask('4250', '250'))
    expect(
      within(screen.getByTestId('stake-input-amount')).getByText('$24,862.50')
    ).toBeVisible()
    expect(
      within(screen.getByTestId('stake-output-amount')).getByText('3,715.55')
    ).toBeVisible()

    rerender(
      <StakeTransactionTask
        acknowledged
        onAcknowledgedChange={() => undefined}
        onDirectionChange={() => undefined}
        onStakeAmountChange={() => undefined}
        onUnstakeAmountChange={() => undefined}
        stakeAmount="4250"
        state="Unstake amount"
        unstakeAmount="1420"
      />
    )
    expect(
      within(screen.getByTestId('stake-output-amount')).getByText('1,624.25')
    ).toBeVisible()
    expect(
      within(screen.getByTestId('stake-output-amount')).getByText('$9,501.88')
    ).toBeVisible()
  })

  it('carries the entered Stake amount into the completed outcome', () => {
    render(<TransactionTruthSpectrum />)

    const staking = screen.getByTestId('transaction-composition-stake')
    fireEvent.click(
      within(staking).getByRole('radio', { name: 'Stake amount' })
    )
    fireEvent.change(
      within(staking).getByRole('textbox', { name: 'You stake: amount' }),
      { target: { value: '4250' } }
    )
    fireEvent.click(
      within(staking).getByRole('radio', { name: 'Stake completed' })
    )

    expect(within(staking).getByText('3,715.55')).toBeVisible()
    expect(within(staking).getByText('$24,862.50')).toBeVisible()
    expect(within(staking).getByText('4,250 RSR')).toBeVisible()
  })

  it('uses one address-field treatment and keeps Stake delegation edge states explicit', () => {
    render(<TransactionTruthSpectrum />)

    const staking = screen.getByTestId('transaction-composition-stake')
    const voteLock = screen.getByTestId('transaction-composition-vote-lock')

    fireEvent.click(
      within(staking).getByRole('radio', { name: 'Delegate ready' })
    )
    const stakeAddress = within(staking).getByRole('textbox', {
      name: 'Voting delegate',
    })
    expect(stakeAddress).toHaveClass('font-mono', 'text-sm')

    fireEvent.click(
      within(voteLock).getByRole('radio', { name: 'Delegate ready' })
    )
    for (const address of within(voteLock).getAllByRole('textbox')) {
      expect(address).toHaveClass('font-mono', 'text-sm')
    }

    fireEvent.click(
      within(staking).getByRole('radio', { name: 'Invalid address' })
    )
    expect(
      within(staking).getByText('Invalid address', {
        selector: '#stake-voting-delegate-error',
      })
    ).toBeVisible()
    expect(
      within(staking).getByRole('button', { name: 'Update delegate' })
    ).toBeDisabled()

    fireEvent.click(
      within(staking).getByRole('radio', { name: 'Wallet disconnected' })
    )
    expect(
      within(staking).getByText(
        'Connect your wallet to view or change your voting delegate.'
      )
    ).toBeVisible()
    expect(
      within(staking).getByRole('button', { name: 'Connect wallet' })
    ).toBeEnabled()

    fireEvent.click(
      within(staking).getByRole('radio', { name: 'No staked balance' })
    )
    expect(
      within(staking).getByText(
        'Stake RSR before changing your voting delegate.'
      )
    ).toBeVisible()
    expect(
      within(staking).getByRole('button', { name: 'Update delegate' })
    ).toBeDisabled()

    fireEvent.click(
      within(staking).getByRole('radio', { name: 'Delegate failed' })
    )
    const recovery = within(staking).getByTestId(
      'stake-delegation-recovery-message'
    )
    expect(within(recovery).getByText('Delegation failed')).toBeVisible()
    expect(
      within(staking).getByRole('button', { name: 'Update delegate' })
    ).toBeEnabled()
  })

  it('carries the edited Stake delegate into current and outcome states', () => {
    render(<TransactionTruthSpectrum />)

    const staking = screen.getByTestId('transaction-composition-stake')
    const editedDelegate = '0x1111111111111111111111111111111111111111'

    fireEvent.click(
      within(staking).getByRole('radio', { name: 'Delegate ready' })
    )
    fireEvent.change(
      within(staking).getByRole('textbox', { name: 'Voting delegate' }),
      { target: { value: editedDelegate } }
    )
    fireEvent.click(
      within(staking).getByRole('radio', { name: 'Delegate updated' })
    )
    expect(
      within(staking).getByRole('button', {
        name: `Copy ${editedDelegate} to clipboard`,
      })
    ).toBeVisible()

    fireEvent.click(
      within(staking).getByRole('radio', { name: 'Current delegate' })
    )
    expect(within(staking).getByText('0x1111...1111')).toBeVisible()
  })

  it('uses an interactive direction control only while Stake amounts remain editable', () => {
    const renderTask = (
      state: Parameters<typeof StakeTransactionTask>[0]['state']
    ) => (
      <StakeTransactionTask
        acknowledged
        onAcknowledgedChange={() => undefined}
        onDirectionChange={() => undefined}
        onStakeAmountChange={() => undefined}
        onUnstakeAmountChange={() => undefined}
        stakeAmount="1000"
        state={state}
        unstakeAmount="250"
      />
    )
    const { rerender } = render(renderTask('Stake amount'))

    for (const state of [
      'Stake amount',
      'Approval',
      'Stake ready',
      'Unstake amount',
    ] as const) {
      rerender(renderTask(state))
      expect(
        screen.getByRole('button', {
          name:
            state === 'Unstake amount'
              ? 'Switch to stake'
              : 'Switch to unstake',
        })
      ).toBeVisible()
      expect(
        screen.queryByTestId('transaction-amount-relation-divider')
      ).not.toBeInTheDocument()
      expect(
        screen.queryByTestId('transaction-amount-relation-indicator')
      ).not.toBeInTheDocument()
      expect(screen.getByTestId('transaction-amount-pair')).not.toHaveAttribute(
        'data-task-boundary'
      )
      expect(screen.getByTestId('transaction-amount-pair')).not.toHaveClass(
        'before:h-px',
        'before:bg-border'
      )
    }

    for (const state of [
      'Approval signing',
      'Stake wallet',
      'Stake confirming',
      'Stake processing',
      'Unstake wallet',
      'Unstake confirming',
      'Unstake processing',
      'Stake failed',
      'Unstake failed',
    ] as const) {
      rerender(renderTask(state))
      expect(
        screen.queryByRole('button', { name: /Switch to (?:stake|unstake)/ })
      ).not.toBeInTheDocument()
      expect(
        screen.getByTestId('transaction-amount-relation-divider')
      ).toBeVisible()
      expect(
        screen.getByTestId('transaction-amount-relation-indicator')
      ).toBeVisible()
    }
  })

  it('keeps evidenced operation tabs scoped to the flows that own them', () => {
    render(<TransactionTruthSpectrum />)

    const rfq = screen.getByTestId('transaction-composition-rfq')
    const staged = screen.getByTestId('transaction-composition-staged')
    expect(within(rfq).getByRole('radio', { name: 'Sell' })).toBeEnabled()
    fireEvent.click(
      within(staged).getByRole('radio', { name: 'Initial configuration' })
    )
    expect(within(staged).getByRole('radio', { name: 'Redeem' })).toBeEnabled()
    expect(
      screen.queryByRole('radio', { name: 'Stake', exact: true })
    ).not.toBeInTheDocument()
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
    ).toHaveLength(5)
    for (const row of within(board).getAllByTestId(
      'transaction-requirement-row'
    )) {
      expect(within(row).getByRole('link')).toHaveAttribute('target', '_blank')
      expect(within(row).getByText('Required')).toBeVisible()
      expect(within(row).getByText('Balance')).toBeVisible()
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
    expect(within(pressureTests).getByText('0x8335…2913')).toBeVisible()
    expect(within(pressureTests).queryByText('Base · 0x8335…2913')).toBeNull()

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

    expectInlineCompactHeader('Select an input asset')

    const staking = screen.getByTestId('transaction-composition-stake')
    const stakingMode = within(staking).getByRole('group', {
      name: 'Staking task mode',
    })
    const stakingClose = within(staking).getByRole('button', {
      name: 'Close staking',
    })

    expect(stakingMode).toHaveAttribute('data-size', 'compact')
    expect(stakingMode).toHaveAttribute('data-width', 'intrinsic')
    expect(stakingMode.parentElement).toBe(
      stakingClose.parentElement?.parentElement
    )
    expect(stakingMode.parentElement?.parentElement).toHaveClass('px-2')
    expect(stakingMode.parentElement?.parentElement).not.toHaveClass('px-4')

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
    expect(rows[0].lastElementChild).toHaveClass('w-fit')
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

  it('lets the reviewer compare the receive-only Redeem anchor', () => {
    render(<TransactionTruthSpectrum />)

    const atomic = screen.getByTestId('transaction-composition-atomic')
    fireEvent.click(
      within(atomic).getByRole('radio', { name: 'Redeem preview' })
    )

    expect(within(atomic).getByText('You will receive')).toBeVisible()
    expect(within(atomic).getAllByText('Expected')).toHaveLength(5)
    expect(within(atomic).getAllByText('Value')).toHaveLength(5)
    expect(within(atomic).queryByText('Required Approvals')).toBeNull()
    expect(
      within(atomic).queryByRole('checkbox', {
        name: 'Approve unlimited token amounts',
      })
    ).not.toBeInTheDocument()
    expect(
      within(atomic).queryByRole('button', { name: 'Approve' })
    ).not.toBeInTheDocument()
    expect(
      within(atomic).queryByRole('button', { name: 'Revoke' })
    ).not.toBeInTheDocument()
  })

  it('keeps requirement and staged-progress truth consistent across review states', () => {
    render(<TransactionTruthSpectrum />)

    const staged = screen.getByTestId('transaction-composition-staged')
    fireEvent.click(
      within(staged).getByRole('radio', { name: 'Orders filling' })
    )
    fireEvent.click(within(staged).getByRole('button', { name: 'View orders' }))
    const fillingCollateral = within(staged).getByTestId(
      'automated-mint-collateral-stage'
    )
    expect(within(fillingCollateral).getByText('4/5')).toBeVisible()
    expect(
      within(fillingCollateral).getByText('1 order open · expires in 1m 42s')
    ).toBeVisible()
    expect(within(staged).getByTestId('staged-orders-header')).toHaveClass(
      'p-4'
    )
    expect(within(staged).queryByTestId('staged-orders-summary')).toBeNull()
    for (const direction of within(staged).getAllByTestId(
      'staged-order-direction'
    )) {
      expect(direction).toHaveClass(
        'grid',
        'gap-3',
        'grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]'
      )
    }
    expect(within(staged).queryByText('2 of 3 orders filled')).toBeNull()

    fireEvent.click(
      within(staged).getByRole('radio', { name: 'Mint complete' })
    )
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

  it('keeps upstream and amount-entry boundaries honest across RFQ and staged states', () => {
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
    const atomicInput = within(
      within(atomic).getByTestId('manual-amount-section')
    ).getByTestId('transaction-amount-object')
    expect(atomicInput).toHaveClass('rounded-lg')
    expect(
      within(atomicInput).queryByRole('button', { name: 'Use' })
    ).toBeVisible()

    const staged = screen.getByTestId('transaction-composition-staged')
    fireEvent.click(
      within(staged).getByRole('radio', { name: 'Input only ready' })
    )
    expect(
      within(staged).queryByRole('button', { name: 'Select input asset' })
    ).not.toBeInTheDocument()
    expect(within(staged).queryByRole('button', { name: 'Max' })).toBeNull()

    fireEvent.click(
      within(staged).getByRole('radio', { name: 'Initial configuration' })
    )
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

  it('keeps deferred coverage honest while reflecting rendered transaction states', () => {
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
        /Automated issuance keeps each submitted CoW identity with its quoted sell amount, estimated buy amount, and status/
      )
    ).toBeVisible()
    expect(
      within(coverage).getByText(
        /RFQ, automated, Stake, Unstake, single-role Stake delegation, Vote Lock, Vote Unlock, and Vote Lock delegation one\/two-change outcomes/
      )
    ).toBeVisible()
    expect(
      within(coverage).getByText(
        /Manual Mint and Redeem outcomes are rendered with submitted shares/
      )
    ).toBeVisible()
    expect(
      within(coverage).getByText(
        /Unreviewed standalone static selector specimen/
      )
    ).toBeVisible()
    expect(
      within(coverage).getByText(
        /Persistent cooldown, claimable, cancel, and withdrawal management remain page-owned and deferred/
      )
    ).toBeVisible()
    expect(
      within(coverage).getByText(
        /Vote Lock and Stake use the shared contained lab host/
      )
    ).toBeVisible()
  })

  it('does not import automated execution mechanics into manual issuance', () => {
    render(<TransactionTruthSpectrum />)

    const manualWorkspace = screen.getByTestId('manual-issuance-workspace')
    expect(within(manualWorkspace).queryByText(/CoW/i)).toBeNull()
    expect(within(manualWorkspace).queryByText(/order expires/i)).toBeNull()
    expect(within(manualWorkspace).queryByText(/Step 1 of/i)).toBeNull()
  })

  it('keeps visible fixture values coherent when Max or Use changes the amount', () => {
    render(<TransactionTruthSpectrum />)

    const atomic = screen.getByTestId('transaction-composition-atomic')
    fireEvent.click(within(atomic).getByRole('button', { name: 'Use' }))
    expect(
      within(atomic).getByRole('textbox', { name: 'Shares to mint amount' })
    ).toHaveValue('105.100042')
    expect(within(atomic).getByText('$10,553.31')).toBeVisible()
    const wbtc = within(atomic)
      .getAllByTestId('transaction-requirement-row')
      .find((row) => row.dataset.tokenSymbol === 'WBTC')!
    expect(within(wbtc).getAllByRole('definition')[0]).toHaveTextContent(
      '0.00189 WBTC'
    )
    expect(
      within(atomic).queryByText('Insufficient balance')
    ).not.toBeInTheDocument()

    const rfq = screen.getByTestId('transaction-composition-rfq')
    fireEvent.click(within(rfq).getByRole('radio', { name: 'Review' }))
    fireEvent.click(within(rfq).getByRole('button', { name: 'Max' }))
    expect(within(rfq).getByText('$4,280.16')).toBeVisible()
    expect(within(rfq).getByText('≈4,237.36')).toBeVisible()

    const staged = screen.getByTestId('transaction-composition-staged')
    fireEvent.click(
      within(staged).getByRole('radio', { name: 'Initial configuration' })
    )
    fireEvent.click(within(staged).getByRole('button', { name: 'Max' }))
    expect(within(staged).getByText('$14,802.63')).toBeVisible()

    fireEvent.change(
      within(atomic).getByRole('textbox', { name: 'Shares to mint amount' }),
      { target: { value: '200' } }
    )
    expect(within(atomic).getByText('$20,082.40')).toBeVisible()
    for (const [symbol, amount] of [
      ['WBTC', '0.0036 WBTC'],
      ['WETH', '2.048 WETH'],
      ['USDT', '2,500.00 USDT'],
    ]) {
      const row = within(atomic)
        .getAllByTestId('transaction-requirement-row')
        .find((item) => item.dataset.tokenSymbol === symbol)!
      expect(within(row).getAllByRole('definition')[0]).toHaveTextContent(
        amount
      )
    }

    fireEvent.change(
      within(rfq).getByRole('textbox', { name: 'You use amount' }),
      { target: { value: '200' } }
    )
    const changedQuoteOutput = within(rfq)
      .getByText('Estimated output')
      .closest('[data-testid="transaction-amount-object"]')
    expect(changedQuoteOutput).not.toBeNull()
    expect(
      within(changedQuoteOutput as HTMLElement).getAllByText('—')
    ).toHaveLength(2)
    expect(
      within(rfq).getByRole('button', { name: 'Updating quote…' })
    ).toBeDisabled()

    fireEvent.change(
      within(staged).getByRole('textbox', { name: 'You provide amount' }),
      { target: { value: '200' } }
    )
    expect(within(staged).getByText('$200.00')).toBeVisible()
    expect(
      within(staged).getByRole('button', { name: 'Get quote' })
    ).toBeEnabled()
  })
})
