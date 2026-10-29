import { X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/button'
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@/components/design-system-v1/segmented-control'
import {
  InlineMessage,
  InlineMessageTitle,
} from '@/components/design-system-v1/inline-message'
import {
  transactionAttachedRegionGeometry,
  transactionTaskGeometry,
} from '@/components/design-system-v1/transaction-task-geometry'
import {
  DialogBody,
  DialogFooter,
  DialogSurface,
  DialogTitle,
} from './story-dialog'
import { IconButton } from '@/components/icon-button'
import { cn } from '@/lib/utils'

import { TransactionCommittedMode } from './transaction-committed-mode'
import { TransactionContainedModal } from './transaction-contained-modal'
import {
  STAKE_DELEGATE,
  StakeDelegationAction,
  StakeDelegationCommittedMode,
  StakeDelegationOutcome,
  StakeDelegationTask,
} from './transaction-composition-stake-delegate'
import { StakeOutcomeDialog } from './transaction-composition-stake-outcome'
import {
  STAKE_DELEGATE_STATES,
  StakeAction,
  StakeProgress,
  type StakeReviewState,
} from './transaction-composition-stake-support'
import { StakeTransactionTask } from './transaction-composition-stake-task'

export const StakeProductContext = ({
  setState,
  state,
}: {
  setState: (state: StakeReviewState) => void
  state: StakeReviewState
}) => {
  const [isOpen, setIsOpen] = useState(true)
  const openButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) openButtonRef.current?.focus()
  }, [isOpen])

  return (
    <div className="relative isolate grid min-h-[680px] w-full grid-cols-1 bg-background">
      {!isOpen && (
        <Button
          ref={openButtonRef}
          className="col-start-1 row-start-1 place-self-center"
          onClick={() => setIsOpen(true)}
        >
          Stake RSR
        </Button>
      )}
      <TransactionContainedModal isOpen={isOpen} onOpenChange={setIsOpen}>
        <StakeDialog
          state={state}
          setState={setState}
          onClose={() => setIsOpen(false)}
        />
      </TransactionContainedModal>
    </div>
  )
}

const StakeDialog = ({
  onClose,
  setState,
  state,
}: {
  onClose: () => void
  setState: (state: StakeReviewState) => void
  state: StakeReviewState
}) => {
  const [stakeAmount, setStakeAmount] = useState('1000')
  const [unstakeAmount, setUnstakeAmount] = useState('250')
  const [delegate, setDelegate] = useState(STAKE_DELEGATE)
  const [acknowledged, setAcknowledged] = useState(false)
  const isUnstake = state.startsWith('Unstake')
  const isDelegate = STAKE_DELEGATE_STATES.some(
    (delegateState) => delegateState === state
  )
  const isOutcome =
    state === 'Stake completed' ||
    state === 'Unstaking initiated' ||
    state === 'Delegate updated'
  const isFailure = state === 'Stake failed' || state === 'Unstake failed'
  const isInteractionLocked =
    state === 'Approval signing' ||
    state === 'Stake wallet' ||
    state === 'Stake confirming' ||
    state === 'Stake processing' ||
    state === 'Unstake wallet' ||
    state === 'Unstake confirming' ||
    state === 'Unstake processing' ||
    state === 'Delegate wallet' ||
    state === 'Delegate confirming' ||
    state === 'Delegate processing'
  const isModeCommitted =
    isInteractionLocked ||
    state === 'Stake ready' ||
    state === 'Stake failed' ||
    state === 'Unstake failed' ||
    state === 'Delegate failed'
  const hasStakeProcessPanel =
    state === 'Approval signing' ||
    state === 'Stake ready' ||
    state === 'Stake wallet' ||
    state === 'Stake confirming' ||
    state === 'Stake processing'
  const effectiveAcknowledgement =
    hasStakeProcessPanel || state === 'Stake failed' ? true : acknowledged

  if (isOutcome) {
    if (state === 'Delegate updated') {
      return (
        <StakeDelegationOutcome
          delegate={delegate}
          onClose={onClose}
          onDone={() => setState('Current delegate')}
        />
      )
    }

    return (
      <StakeOutcomeDialog
        amount={state === 'Stake completed' ? stakeAmount : unstakeAmount}
        kind={state === 'Stake completed' ? 'stake' : 'unstake'}
        onClose={onClose}
        onDone={() =>
          setState(
            state === 'Stake completed' ? 'Stake amount' : 'Unstake amount'
          )
        }
      />
    )
  }

  const taskContent = (
    <>
      <header
        data-testid="stake-task-header"
        className={cn('shrink-0', transactionTaskGeometry.compactHeaderInset)}
      >
        <div
          data-testid="stake-task-header-row"
          className={cn(
            transactionTaskGeometry.compactHeaderRow,
            'max-[359px]:gap-2'
          )}
        >
          <DialogTitle className="sr-only">
            Stake, unstake, or delegate RSR
          </DialogTitle>
          {isModeCommitted ? (
            isDelegate ? (
              <StakeDelegationCommittedMode active={isInteractionLocked} />
            ) : (
              <TransactionCommittedMode
                assetSymbol={isUnstake ? 'stRSR' : 'RSR'}
                isActive={isInteractionLocked}
                label={isUnstake ? 'Unstake' : 'Stake RSR'}
              />
            )
          ) : (
            <SegmentedControl
              aria-label="Staking task mode"
              presentation="contained"
              size="compact"
              width="intrinsic"
              value={isDelegate ? 'delegate' : isUnstake ? 'unstake' : 'stake'}
              onValueChange={(value) =>
                setState(
                  value === 'unstake'
                    ? 'Unstake amount'
                    : value === 'delegate'
                      ? 'Current delegate'
                      : 'Stake amount'
                )
              }
            >
              <SegmentedControlItem value="stake" className="max-[359px]:px-2">
                <span>
                  Stake<span className="max-[359px]:hidden"> RSR</span>
                </span>
              </SegmentedControlItem>
              <SegmentedControlItem
                value="unstake"
                className="max-[359px]:px-2"
              >
                Unstake
              </SegmentedControlItem>
              <SegmentedControlItem
                value="delegate"
                className="max-[359px]:px-2"
              >
                Delegate
              </SegmentedControlItem>
            </SegmentedControl>
          )}
          <div className="ml-auto">
            <IconButton
              label="Close staking"
              icon={<X />}
              size="compact"
              tone="secondary"
              onClick={onClose}
            />
          </div>
        </div>
      </header>
      <DialogBody
        className={cn('px-0 pb-0', isDelegate && 'flex flex-col justify-end')}
      >
        {isDelegate ? (
          <StakeDelegationTask
            delegate={delegate}
            onChange={setDelegate}
            state={state}
          />
        ) : (
          <StakeTransactionTask
            acknowledged={effectiveAcknowledgement}
            onAcknowledgedChange={setAcknowledged}
            onDirectionChange={() =>
              setState(isUnstake ? 'Stake amount' : 'Unstake amount')
            }
            onStakeAmountChange={setStakeAmount}
            onUnstakeAmountChange={setUnstakeAmount}
            stakeAmount={stakeAmount}
            state={state}
            unstakeAmount={unstakeAmount}
          />
        )}
      </DialogBody>
      {(state === 'Approval signing' || state === 'Stake ready') && (
        <DialogFooter className="px-0 pb-0 pt-0">
          <StakeAction acknowledged={effectiveAcknowledgement} state={state} />
        </DialogFooter>
      )}
    </>
  )

  return (
    <DialogSurface
      width="standard"
      className={cn(
        'outline-none',
        isDelegate && 'min-h-[24rem]',
        hasStakeProcessPanel &&
          cn(transactionAttachedRegionGeometry.frame, 'p-0')
      )}
      role="dialog"
      tabIndex={-1}
      aria-modal="true"
      aria-label="Stake, unstake, or delegate RSR"
    >
      {hasStakeProcessPanel ? (
        <div
          className={cn(
            transactionAttachedRegionGeometry.content,
            transactionTaskGeometry.shellInset,
            'shadow-sm'
          )}
          data-testid="stake-process-content-frame"
        >
          {taskContent}
        </div>
      ) : (
        taskContent
      )}
      <DialogFooter
        data-testid="stake-action-footer"
        data-presentation={hasStakeProcessPanel ? 'process-panel' : 'action'}
        className={
          hasStakeProcessPanel
            ? cn(transactionAttachedRegionGeometry.surface, 'px-6 py-4')
            : transactionTaskGeometry.actionFooter
        }
      >
        {hasStakeProcessPanel ? (
          <StakeProgress state={state} />
        ) : isDelegate ? (
          <StakeDelegationAction
            state={state}
            onChangeDelegate={() => setState('Delegate ready')}
          />
        ) : isFailure ? (
          <div className="w-full space-y-3">
            <InlineMessage
              data-testid="stake-recovery-message"
              tone="danger"
              density="compact"
              presentation="summary"
            >
              <InlineMessageTitle>Execution failed</InlineMessageTitle>
            </InlineMessage>
            <StakeAction
              acknowledged={effectiveAcknowledgement}
              state={state}
            />
          </div>
        ) : (
          <StakeAction acknowledged={effectiveAcknowledgement} state={state} />
        )}
      </DialogFooter>
    </DialogSurface>
  )
}
