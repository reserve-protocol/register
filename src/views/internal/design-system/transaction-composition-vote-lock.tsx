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
import {
  transactionAttachedRegionGeometry,
  transactionTaskGeometry,
} from '@/components/design-system-v1/transaction-task-geometry'
import { IconButton } from '@/components/icon-button'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'
import { useRef, useState } from 'react'

import {
  TransactionCompositionFrame,
  type TransactionCompositionStateGroup,
} from './transaction-composition-frame'
import { VoteLockOutcomeDialog } from './transaction-composition-vote-lock-outcome'
import {
  FAST_DELEGATE,
  NORMAL_DELEGATE,
  VoteLockDelegationAction,
  VoteLockDelegationOutcome,
  VoteLockDelegationProcessAction,
  VoteLockDelegationTask,
} from './transaction-composition-vote-lock-delegate'
import { VoteLockContainedModal } from './transaction-composition-vote-lock-modal'
import { VoteLockAmountTask } from './transaction-composition-vote-lock-task'
import {
  LOCK_STATES,
  DELEGATION_STATES,
  UNLOCK_STATES,
  VoteLockGovernanceContext,
  VoteLockAction,
  VOTE_LOCK_TASK_WIDTH,
  VoteLockProgressStepper,
  type VoteLockReviewState,
} from './transaction-composition-vote-lock-support'

const STATE_GROUPS = [
  { label: 'Vote-lock states', states: LOCK_STATES },
  { label: 'Unlock states', states: UNLOCK_STATES },
  { label: 'Delegation states', states: DELEGATION_STATES },
] as const satisfies readonly TransactionCompositionStateGroup<VoteLockReviewState>[]

export const VoteLockTransactionComposition = () => (
  <TransactionCompositionFrame<VoteLockReviewState>
    id="vote-lock"
    model="Approval + delayed settlement + sequential settings update"
    title="Vote-lock, unlock, and delegate"
    description="The candidate preserves the current three-mode shell: quote-backed Lock and Unlock, the configured delay and later Portfolio withdrawal, plus explicit normal and fast governance delegation. Delegate reuses the transaction task geometry without being forced into amount-pair anatomy; first-lock self-delegation remains an SDK-owned side effect, not a separate user step."
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
      {
        label: 'Delegate addresses and one/two-call sequence',
        status: 'Retained current',
      },
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

  return (
    <div className="relative -mx-4 min-h-[680px] w-[calc(100%+2rem)] max-w-4xl overflow-hidden bg-background p-0 sm:mx-auto sm:w-full sm:p-6">
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
  const isDelegate = isDelegationState(state)
  const mode = isDelegate
    ? 'delegate'
    : state.startsWith('Unlock')
      ? 'unlock'
      : 'lock'
  const [lockAmount, setLockAmount] = useState('1')
  const [unlockAmount, setUnlockAmount] = useState('1')
  const [normalDelegate, setNormalDelegate] = useState(NORMAL_DELEGATE)
  const [fastDelegate, setFastDelegate] = useState(FAST_DELEGATE)
  const [isAcknowledged, setIsAcknowledged] = useState(false)
  const effectiveAcknowledgement =
    state === 'Approval signing' ||
    state === 'Lock ready' ||
    state === 'Lock wallet' ||
    state === 'Lock confirming' ||
    state === 'Lock processing'
      ? true
      : isAcknowledged
  const hasFixtureQuote =
    (mode === 'unlock' ? unlockAmount : lockAmount) === '1'
  const isInteractionLocked =
    state === 'Approval signing' ||
    state === 'Lock wallet' ||
    state === 'Lock confirming' ||
    state === 'Lock processing' ||
    state === 'Unlock wallet' ||
    state === 'Unlock confirming' ||
    state === 'Unlock processing' ||
    state === 'Normal signing' ||
    state === 'Fast signing'
  const hasDelegationProcessPanel =
    isDelegate &&
    (state === 'Normal signing' ||
      state === 'Fast signing' ||
      state === 'Fast failed')
  const hasVoteLockProcessPanel =
    mode === 'lock' &&
    (state === 'Approval signing' ||
      state === 'Lock ready' ||
      state === 'Lock wallet' ||
      state === 'Lock confirming' ||
      state === 'Lock processing')
  const hasProcessPanel = hasDelegationProcessPanel || hasVoteLockProcessPanel
  const hasProcessAction =
    (isDelegate && state === 'Fast failed') ||
    (!isDelegate && state === 'Lock ready')
  if (state === 'Voting delegate updated' || state === 'Delegation updated') {
    return (
      <VoteLockDelegationOutcome
        variant={state === 'Voting delegate updated' ? 'voting-only' : 'both'}
        onClose={onClose}
        onDone={() => setState('Delegate ready')}
      />
    )
  }

  if (state === 'Locked' || state === 'Unlock initiated') {
    return (
      <VoteLockOutcomeDialog
        kind={state === 'Locked' ? 'lock' : 'unlock'}
        onClose={onClose}
        onDone={() => {
          setState(state === 'Locked' ? 'Lock amount' : 'Unlock amount')
          if (state === 'Unlock initiated') onClose()
        }}
      />
    )
  }

  const taskContent = (
    <>
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
            onValueChange={(value) => {
              if (value === 'delegate') {
                setState('Delegated to you')
              } else {
                setState(value === 'unlock' ? 'Unlock amount' : 'Lock amount')
              }
            }}
          >
            <SegmentedControlItem value="lock" disabled={isInteractionLocked}>
              Vote-lock
            </SegmentedControlItem>
            <SegmentedControlItem value="unlock" disabled={isInteractionLocked}>
              Unlock
            </SegmentedControlItem>
            <SegmentedControlItem
              value="delegate"
              disabled={isInteractionLocked}
            >
              Delegate
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
      <DialogBody
        className={cn(
          'px-0 pb-0',
          (state === 'Normal only' ||
            state === 'Delegated to you' ||
            state === 'Delegate ready') &&
            'flex flex-col justify-end'
        )}
      >
        {isDelegate ? (
          <VoteLockDelegationTask
            state={state}
            normalDelegate={normalDelegate}
            fastDelegate={fastDelegate}
            onNormalDelegateChange={setNormalDelegate}
            onFastDelegateChange={setFastDelegate}
          />
        ) : (
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
        )}
      </DialogBody>
      {hasProcessAction && (
        <DialogFooter
          className="px-0 pb-0 pt-4"
          data-testid="vote-lock-process-button-region"
        >
          {hasDelegationProcessPanel ? (
            <VoteLockDelegationProcessAction state={state} />
          ) : (
            <VoteLockAction
              state={state}
              isAcknowledged={effectiveAcknowledgement}
              hasQuote={hasFixtureQuote}
            />
          )}
        </DialogFooter>
      )}
    </>
  )

  return (
    <DialogSurface
      width="standard"
      className={cn(
        VOTE_LOCK_TASK_WIDTH,
        'outline-none',
        isDelegate && 'min-h-96',
        hasProcessPanel && cn(transactionAttachedRegionGeometry.frame, 'p-0')
      )}
      role="dialog"
      tabIndex={-1}
      aria-modal="true"
      aria-label="Govern PHOTON"
    >
      {hasProcessPanel ? (
        <div
          className={cn(
            transactionAttachedRegionGeometry.content,
            'p-2 shadow-sm'
          )}
          data-testid="vote-lock-process-content-frame"
        >
          {taskContent}
        </div>
      ) : (
        taskContent
      )}
      <DialogFooter
        data-testid="vote-lock-action-footer"
        data-presentation={hasProcessPanel ? 'process-panel' : 'action'}
        className={
          hasProcessPanel
            ? cn(transactionAttachedRegionGeometry.surface, 'px-6 py-4')
            : transactionTaskGeometry.actionFooter
        }
      >
        {isDelegate ? (
          <VoteLockDelegationAction
            state={state}
            onChangeDelegates={() => {
              setNormalDelegate(NORMAL_DELEGATE)
              setFastDelegate(NORMAL_DELEGATE)
              setState('Delegate ready')
            }}
          />
        ) : hasVoteLockProcessPanel ? (
          <VoteLockProgressStepper state={state} />
        ) : (
          <VoteLockAction
            state={state}
            isAcknowledged={effectiveAcknowledgement}
            hasQuote={hasFixtureQuote}
          />
        )}
      </DialogFooter>
    </DialogSurface>
  )
}

const isDelegationState = (state: VoteLockReviewState) =>
  DELEGATION_STATES.some((delegationState) => delegationState === state)
