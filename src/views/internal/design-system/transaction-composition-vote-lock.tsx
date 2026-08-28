import {
  SegmentedControl,
  SegmentedControlItem,
} from '@/components/design-system-v1/segmented-control'
import {
  DialogBody,
  DialogFooter,
  DialogSurface,
  DialogTitle,
} from '@/components/dialog'
import { transactionTaskGeometry } from '@/components/design-system-v1/transaction-task-geometry'
import { IconButton } from '@/components/icon-button'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'
import { useRef, useState } from 'react'

import {
  TransactionCompositionFrame,
  type TransactionCompositionStateGroup,
} from './transaction-composition-frame'
import { VoteLockOutcomeDialog } from './transaction-composition-vote-lock-outcome'
import { VoteLockContainedModal } from './transaction-composition-vote-lock-modal'
import { VoteLockAmountTask } from './transaction-composition-vote-lock-task'
import {
  LOCK_STATES,
  UNLOCK_STATES,
  VoteLockGovernanceContext,
  VoteLockPendingWithdrawal,
  VoteLockAction,
  type VoteLockReviewState,
} from './transaction-composition-vote-lock-support'

const STATE_GROUPS = [
  { label: 'Vote-lock states', states: LOCK_STATES },
  { label: 'Unlock states', states: UNLOCK_STATES },
] as const satisfies readonly TransactionCompositionStateGroup<VoteLockReviewState>[]

export const VoteLockTransactionComposition = () => (
  <TransactionCompositionFrame<VoteLockReviewState>
    id="vote-lock"
    model="Approval + delayed settlement · current Vote Lock structure"
    title="Vote-lock and unlock"
    description="The candidate preserves the Lock and Unlock modes, quote-backed share conversion, approval-to-deposit sequence, configured delay, reward consequence, and later Portfolio withdrawal. The existing Delegate sibling remains unchanged and outside this focused V1. Self-delegation remains an SDK-owned side effect of the first lock, not a separate user step."
    defaultState="Lock amount"
    stateGroups={STATE_GROUPS}
    parts={[
      {
        label: 'Dialog, Button, amount, status, identity',
        status: 'Current baseline',
      },
      {
        label: 'Quote, approval, redeem, delay, Portfolio claim',
        status: 'Retained current',
      },
      { label: 'Existing Delegate sibling mode', status: 'Retained current' },
      {
        label: 'Focused modal and in-context outcomes',
        status: 'Proposed candidate',
      },
      { label: 'SDK and transaction mechanics', status: 'Deferred' },
    ]}
  >
    {(state, setState) => (
      <VoteLockProductContext state={state} setState={setState} />
    )}
  </TransactionCompositionFrame>
)

export const VoteLockProductContext = ({
  state,
  setState,
}: {
  state: VoteLockReviewState
  setState: (state: VoteLockReviewState) => void
}) => {
  const [isOpen, setIsOpen] = useState(true)
  const openButtonRef = useRef<HTMLButtonElement>(null)
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) openButtonRef.current?.focus()
  }

  if (state === 'Cooldown' || state === 'Ready' || state === 'Withdrawn') {
    return <VoteLockPendingWithdrawal state={state} />
  }

  return (
    <div className="relative mx-auto min-h-[680px] w-full max-w-4xl overflow-hidden bg-background p-4 sm:p-6">
      <VoteLockGovernanceContext
        openButtonRef={openButtonRef}
        onOpen={() => setIsOpen(true)}
      />
      <VoteLockContainedModal isOpen={isOpen} onOpenChange={handleOpenChange}>
        <VoteLockDialog
          state={state}
          setState={setState}
          onClose={() => handleOpenChange(false)}
        />
      </VoteLockContainedModal>
    </div>
  )
}

const VoteLockDialog = ({
  state,
  setState,
  onClose,
}: {
  state: VoteLockReviewState
  setState: (state: VoteLockReviewState) => void
  onClose: () => void
}) => {
  const mode = state.startsWith('Unlock') ? 'unlock' : 'lock'
  const [lockAmount, setLockAmount] = useState('1')
  const [unlockAmount, setUnlockAmount] = useState('1')
  const [isAcknowledged, setIsAcknowledged] = useState(false)
  const effectiveAcknowledgement =
    state === 'Lock ready' ? true : isAcknowledged
  const hasFixtureQuote =
    (mode === 'unlock' ? unlockAmount : lockAmount) === '1'
  const isInteractionLocked =
    state === 'Lock wallet' ||
    state === 'Lock confirming' ||
    state === 'Lock processing' ||
    state === 'Unlock wallet' ||
    state === 'Unlock confirming' ||
    state === 'Unlock processing'

  if (state === 'Locked' || state === 'Unlock initiated') {
    return (
      <VoteLockOutcomeDialog
        kind={state === 'Locked' ? 'lock' : 'unlock'}
        onClose={onClose}
        onDone={() => setState(state === 'Locked' ? 'Lock amount' : 'Cooldown')}
      />
    )
  }

  return (
    <DialogSurface
      width="standard"
      className="outline-none"
      role="dialog"
      tabIndex={-1}
      aria-modal="true"
      aria-label="Govern PHOTON"
    >
      <header
        className={cn('shrink-0', transactionTaskGeometry.compactHeaderInset)}
      >
        <div className={transactionTaskGeometry.compactHeaderRow}>
          <DialogTitle className="sr-only">Govern PHOTON</DialogTitle>
          <SegmentedControl
            aria-label="Vote-lock task mode"
            presentation="contained"
            size="compact"
            width="intrinsic"
            value={mode}
            onValueChange={(value) =>
              setState(value === 'unlock' ? 'Unlock amount' : 'Lock amount')
            }
          >
            <SegmentedControlItem value="lock" disabled={isInteractionLocked}>
              Vote-lock
            </SegmentedControlItem>
            <SegmentedControlItem value="unlock" disabled={isInteractionLocked}>
              Unlock
            </SegmentedControlItem>
          </SegmentedControl>
          <div className="ml-auto">
            <IconButton
              label="Close Vote Lock"
              icon={<X />}
              size="compact"
              tone="secondary"
              onClick={onClose}
            />
          </div>
        </div>
      </header>
      <DialogBody className="px-0 pb-0">
        <VoteLockAmountTask
          state={state}
          lockAmount={lockAmount}
          unlockAmount={unlockAmount}
          isAcknowledged={effectiveAcknowledgement}
          onLockAmountChange={setLockAmount}
          onUnlockAmountChange={setUnlockAmount}
          onAcknowledgedChange={setIsAcknowledged}
          onDirectionChange={() =>
            setState(mode === 'lock' ? 'Unlock amount' : 'Lock amount')
          }
        />
      </DialogBody>
      <DialogFooter
        data-testid="vote-lock-action-footer"
        className={transactionTaskGeometry.actionFooter}
      >
        <VoteLockAction
          state={state}
          isAcknowledged={effectiveAcknowledgement}
          hasQuote={hasFixtureQuote}
        />
      </DialogFooter>
    </DialogSurface>
  )
}
