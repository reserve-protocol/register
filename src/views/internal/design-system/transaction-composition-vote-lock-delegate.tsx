import { ArrowUpRight, Lock, X } from 'lucide-react'

import { Button } from '@/components/button'
import { ActionGroup } from '@/components/design-system-v1/action-group'
import { CopyableValue } from '@/components/design-system-v1/copyable-value'
import {
  AddressTextInput,
  Field,
  FieldDescription,
  FieldLabel,
  FieldMessage,
} from '@/components/design-system-v1/field'
import { InlineMessage } from '@/components/design-system-v1/inline-message'
import { Link } from '@/components/design-system-v1/link'
import { OrganicBrandSurface } from '@/components/design-system-v1/organic-brand-surface'
import { TransactionAmountObject } from '@/components/design-system-v1/transaction-amount-object'
import { v1Typography } from '@/components/design-system-v1/typography'
import {
  DialogBody,
  DialogFooter,
  DialogSurface,
  DialogTitle,
} from '@/components/dialog'
import { IconButton } from '@/components/icon-button'
import { v1SemanticRecipes as roles } from '@/components/ui/v1-semantic-recipes'
import { cn } from '@/lib/utils'
import { shortenAddress } from '@/utils'

import { transactionOutcomeMotion } from './transaction-outcome-motion'
import { transactionOutcomeGeometry } from '@/components/design-system-v1/transaction-task-geometry'
import { TransactionOutcomeStatus } from './transaction-outcome-status'
import {
  TransactionProgressStepper,
  type TransactionProgressStep,
} from './transaction-progress-stepper'
import {
  VOTE_LOCK_TASK_WIDTH,
  type VoteLockReviewState,
} from './transaction-composition-vote-lock-support'

export const NORMAL_DELEGATE = '0x7F4a7A93C9a5E8f62d6cA9E2f4dCB0eA72B4a018'
export const FAST_DELEGATE = '0x3B06fA7B23C5c83eB8A7F99E42F98d2A79F4b6d1'

const DELEGATION_LOCKED_AMOUNT = '12,843,771.62 RSR'
const DELEGATION_OUTCOME_AMOUNT = '12.84M'
const DELEGATION_OUTCOME_UNIT = 'RSR'
const DELEGATION_OUTCOME_ASSIGNMENT = `${DELEGATION_OUTCOME_AMOUNT} ${DELEGATION_OUTCOME_UNIT} assigned`

const DELEGATION_OUTCOME_CHANGES = {
  voting: {
    delegate: NORMAL_DELEGATE,
    label: 'Voting delegate',
    transactionHref:
      'https://bscscan.com/tx/0x5a61270a74cda50d2ca2d6ee5016f4502e77a7b6e7996345f1684c67d27d56da',
  },
  challenge: {
    delegate: FAST_DELEGATE,
    label: 'Challenge delegate',
    transactionHref:
      'https://bscscan.com/tx/0x8f247ef2459eae296fe77dc784b0f784b4d6428f6852cffc0274302740cb741c',
  },
} as const

export const VoteLockDelegationTask = ({
  fastDelegate,
  normalDelegate,
  onFastDelegateChange,
  onNormalDelegateChange,
  state,
}: {
  fastDelegate: string
  normalDelegate: string
  onFastDelegateChange: (value: string) => void
  onNormalDelegateChange: (value: string) => void
  state: VoteLockReviewState
}) => {
  const isCurrentDelegation = state === 'Delegated to you'
  const isOptimisticGovernance = state !== 'Normal only'
  const isNormalSigning = state === 'Normal signing'
  const isFastSigning = state === 'Fast signing'
  const isFastFailed = state === 'Fast failed'
  const isInvalidAddress = state === 'Invalid address'
  const isUnavailable =
    state === 'No locked balance' || state === 'Wallet disconnected'
  const isExecution = isNormalSigning || isFastSigning
  const hasProcessPanel = isExecution || isFastFailed

  return (
    <div data-testid="vote-lock-delegation-task">
      <section
        data-testid="delegation-fields"
        className={hasProcessPanel ? 'pb-0' : 'pb-4'}
      >
        {isUnavailable && (
          <InlineMessage density="compact" icon={false} className="px-4 py-3">
            <p className={cn(v1Typography.supporting, roles.text.supporting)}>
              {state === 'No locked balance' ? (
                <>
                  <strong className="font-medium text-foreground">
                    Self-delegation happens automatically
                  </strong>{' '}
                  when you vote-lock RSR. Come back here after vote-locking to
                  update delegation.
                </>
              ) : (
                'Connect your wallet to view or change delegates.'
              )}
            </p>
          </InlineMessage>
        )}
        <div
          data-testid="delegation-field-stack"
          className={cn('grid gap-4', isUnavailable && 'mt-4')}
        >
          <Field data-testid="delegation-voting-role-field">
            {isCurrentDelegation ? (
              <div className="px-4">
                <div className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-x-4">
                  <div className="space-y-1">
                    <FieldLabel>Voting delegate</FieldLabel>
                    <FieldDescription>
                      Normal delegates vote on normal proposals.
                    </FieldDescription>
                  </div>
                  <CurrentDelegationValue
                    testId="delegation-voting-current-value"
                    value={NORMAL_DELEGATE}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-1 px-4">
                <FieldLabel htmlFor="vote-lock-normal-delegate">
                  Voting delegate
                </FieldLabel>
                <FieldDescription>
                  {isOptimisticGovernance
                    ? 'Normal delegates vote on normal proposals.'
                    : 'Enter the wallet address that should vote on normal governance proposals.'}
                </FieldDescription>
              </div>
            )}
            {!isCurrentDelegation && (
              <AddressTextInput
                id="vote-lock-normal-delegate"
                value={
                  isUnavailable
                    ? ''
                    : isInvalidAddress
                      ? '0x1234'
                      : normalDelegate
                }
                onChange={(event) => onNormalDelegateChange(event.target.value)}
                disabled={isExecution || isFastFailed || isUnavailable}
                invalid={isInvalidAddress}
                aria-describedby={
                  isInvalidAddress
                    ? 'vote-lock-normal-delegate-error'
                    : undefined
                }
                aria-errormessage={
                  isInvalidAddress
                    ? 'vote-lock-normal-delegate-error'
                    : undefined
                }
                placeholder="Wallet address"
              />
            )}
            {isInvalidAddress && (
              <FieldMessage
                id="vote-lock-normal-delegate-error"
                className="px-4"
              >
                Invalid address
              </FieldMessage>
            )}
          </Field>
          {isOptimisticGovernance && (
            <Field data-testid="delegation-challenge-role-field">
              {isCurrentDelegation ? (
                <div className="px-4">
                  <div className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-x-4">
                    <div className="space-y-1">
                      <FieldLabel>Challenge delegate</FieldLabel>
                      <FieldDescription>
                        Fast delegates can challenge fast proposals.
                      </FieldDescription>
                    </div>
                    <CurrentDelegationValue
                      testId="delegation-challenge-current-value"
                      value={NORMAL_DELEGATE}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1 px-4">
                  <FieldLabel htmlFor="vote-lock-fast-delegate">
                    Challenge delegate
                  </FieldLabel>
                  <FieldDescription>
                    Fast delegates can challenge fast proposals.
                  </FieldDescription>
                </div>
              )}
              {!isCurrentDelegation && (
                <AddressTextInput
                  id="vote-lock-fast-delegate"
                  value={isUnavailable ? '' : fastDelegate}
                  onChange={(event) => onFastDelegateChange(event.target.value)}
                  disabled={isExecution || isUnavailable}
                  placeholder="Wallet address"
                />
              )}
            </Field>
          )}
          {!isUnavailable && (
            <dl className="px-4" data-testid="delegation-locked-context">
              <div className="flex items-center justify-between gap-3">
                <dt
                  className={cn(
                    'flex items-center gap-2',
                    v1Typography.supporting,
                    roles.text.supporting
                  )}
                >
                  <Lock
                    aria-hidden="true"
                    className="size-4 shrink-0"
                    data-testid="delegation-locked-icon"
                  />
                  <span>Current locked amount:</span>
                </dt>
                <dd
                  aria-label={DELEGATION_LOCKED_AMOUNT}
                  className={cn(v1Typography.label, 'tabular-nums')}
                  title={DELEGATION_LOCKED_AMOUNT}
                >
                  12.8M RSR
                </dd>
              </div>
            </dl>
          )}
        </div>
      </section>
    </div>
  )
}

export const VoteLockDelegationAction = ({
  onChangeDelegates,
  state,
}: {
  onChangeDelegates: () => void
  state: VoteLockReviewState
}) => {
  if (state === 'Normal signing') {
    return <DelegationProgressStepper normal="active" fast="upcoming" />
  }

  if (state === 'Fast signing') {
    return <DelegationProgressStepper normal="complete" fast="active" />
  }

  if (state === 'Fast failed') {
    return <DelegationProgressStepper normal="complete" fast="failed" />
  }

  if (state === 'Delegated to you') {
    return (
      <Button className="w-full" tone="secondary" onClick={onChangeDelegates}>
        Change delegates
      </Button>
    )
  }

  if (state === 'Wallet disconnected') {
    return <Button className="w-full">Connect wallet</Button>
  }

  return (
    <Button
      className="w-full"
      disabled={state === 'Invalid address' || state === 'No locked balance'}
    >
      Update delegates
    </Button>
  )
}

const CurrentDelegationValue = ({
  testId,
  value,
}: {
  testId: string
  value: string
}) => (
  <div
    data-testid={testId}
    className="flex min-w-0 items-center justify-between gap-3 sm:flex-col sm:items-end"
  >
    <span className={cn(v1Typography.label, 'text-primary')}>
      Delegated to you
    </span>
    <span
      className={cn(
        'whitespace-nowrap font-mono text-sm',
        roles.text.supporting
      )}
    >
      {shortenAddress(value)}
    </span>
  </div>
)

export const VoteLockDelegationProcessAction = ({
  state,
}: {
  state: VoteLockReviewState
}) => {
  if (state === 'Fast failed') {
    return <Button className="w-full">Retry fast delegation</Button>
  }

  return null
}

const DelegationProgressStepper = ({
  normal,
  fast,
}: {
  normal: TransactionProgressStep['state']
  fast: TransactionProgressStep['state']
}) => (
  <TransactionProgressStepper
    label="Delegation progress"
    steps={[
      { transaction: 1, label: 'Voting delegate', state: normal },
      { transaction: 2, label: 'Challenge delegate', state: fast },
    ]}
  />
)

export const VoteLockDelegationOutcome = ({
  onClose,
  onDone,
  variant,
}: {
  onClose: () => void
  onDone: () => void
  variant: 'voting-only' | 'both'
}) => {
  const changes =
    variant === 'voting-only'
      ? [DELEGATION_OUTCOME_CHANGES.voting]
      : [
          DELEGATION_OUTCOME_CHANGES.voting,
          DELEGATION_OUTCOME_CHANGES.challenge,
        ]

  return (
    <DialogSurface
      width="standard"
      className={cn(
        VOTE_LOCK_TASK_WIDTH,
        transactionOutcomeGeometry.minimumSurfaceHeight,
        'overflow-hidden p-0 outline-none ring-2 ring-card'
      )}
      role="dialog"
      tabIndex={-1}
      aria-modal="true"
      aria-label="Govern PHOTON"
    >
      <div className="relative isolate flex flex-1 flex-col text-brand-foreground">
        <OrganicBrandSurface
          className={cn(
            'absolute inset-0 rounded-lg bg-brand',
            transactionOutcomeMotion.surface
          )}
        />
        <header
          className={cn(
            'relative z-10 flex min-h-8 items-center justify-between gap-4 px-4 pb-4 pt-4',
            transactionOutcomeMotion.content
          )}
        >
          <TransactionOutcomeStatus
            label="Completed"
            status="complete"
            testId="vote-lock-outcome-status"
          />
          <IconButton
            label="Close Vote Lock"
            icon={<X />}
            size="compact"
            onClick={onClose}
          />
        </header>
        <DialogBody
          className={cn(
            'relative z-10 flex flex-col justify-end px-0 pb-2',
            transactionOutcomeMotion.content
          )}
        >
          <DialogTitle className="sr-only">Delegation updated</DialogTitle>
          <TransactionAmountObject
            data-testid="delegation-outcome-value"
            label="Voting power delegated"
            amount={DELEGATION_OUTCOME_AMOUNT}
            readOnly
            presentation="output"
            tone="inverse"
            className="bg-transparent px-6"
            unit={DELEGATION_OUTCOME_UNIT}
            supporting={
              variant === 'both'
                ? 'Full voting power for each role'
                : DELEGATION_LOCKED_AMOUNT
            }
          />
        </DialogBody>
      </div>

      <section
        className="mx-2 bg-card"
        data-testid="delegation-outcome-details"
      >
        <dl className="grid gap-3 px-4 py-4">
          {changes.map((change) => (
            <DelegationOutcomeRole
              key={change.label}
              change={change}
              showTransaction={variant === 'both'}
            />
          ))}
        </dl>
      </section>

      <DialogFooter
        data-testid="delegation-outcome-footer"
        className="px-2 pb-2 pt-0"
      >
        {variant === 'voting-only' ? (
          <ActionGroup className="w-full">
            <Button
              asChild
              className="flex-1"
              tone="secondary"
              trailingIcon={<ArrowUpRight />}
            >
              <a
                aria-label="View transaction on BscScan (opens in a new tab)"
                href={DELEGATION_OUTCOME_CHANGES.voting.transactionHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                View transaction
                <span className="sr-only">
                  {' '}
                  on BscScan (opens in a new tab)
                </span>
              </a>
            </Button>
            <Button className="flex-1" onClick={onDone}>
              Done
            </Button>
          </ActionGroup>
        ) : (
          <Button className="w-full" onClick={onDone}>
            Done
          </Button>
        )}
      </DialogFooter>
    </DialogSurface>
  )
}

const DelegationOutcomeRole = ({
  change,
  showTransaction,
}: {
  change: (typeof DELEGATION_OUTCOME_CHANGES)[keyof typeof DELEGATION_OUTCOME_CHANGES]
  showTransaction: boolean
}) => (
  <div
    data-testid="delegation-outcome-role-group"
    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 sm:gap-x-4"
  >
    <dt
      data-testid="delegation-outcome-role-label"
      className={cn(
        'col-start-1 row-start-1',
        v1Typography.label,
        roles.text.primary
      )}
    >
      {change.label}
    </dt>
    {showTransaction && (
      <dd className="col-start-2 row-start-1 flex justify-self-end">
        <Link
          aria-label={`View ${change.label} transaction`}
          external
          externalAnnouncement="Opens transaction on BscScan in a new tab"
          href={change.transactionHref}
          treatment="standalone"
          className="text-foreground hover:text-primary focus-visible:text-primary active:text-primary-pressed"
        >
          View transaction
        </Link>
      </dd>
    )}
    <dd
      className={cn(
        'flex',
        showTransaction
          ? 'col-start-1 row-start-2 justify-self-start'
          : 'col-start-2 row-start-1 justify-self-end'
      )}
    >
      <CopyableValue
        treatment="inline"
        tone="neutral"
        value={change.delegate}
      />
    </dd>
    {showTransaction && (
      <dd
        data-testid="delegation-outcome-role-result"
        className={cn(
          'col-start-2 row-start-2',
          v1Typography.supporting,
          roles.text.supporting,
          'text-right'
        )}
      >
        {DELEGATION_OUTCOME_ASSIGNMENT}
      </dd>
    )}
  </div>
)
