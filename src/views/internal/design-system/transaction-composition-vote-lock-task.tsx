import { ArrowUpDown } from 'lucide-react'

import { InlineAction } from '@/components/button'
import { Checkbox } from '@/components/checkbox'
import { HelpTooltip } from '@/components/design-system-v1/help-tooltip'
import {
  TransactionAmountObject,
  TransactionAmountPair,
  TransactionAmountRelation,
} from '@/components/design-system-v1/transaction-amount-object'
import { transactionTaskGeometry } from '@/components/design-system-v1/transaction-task-geometry'
import { v1Typography } from '@/components/design-system-v1/typography'
import { IconButton } from '@/components/icon-button'
import { v1SemanticRecipes as roles } from '@/components/ui/v1-semantic-recipes'
import { cn } from '@/lib/utils'
import { ChainId } from '@/utils/chains'

import { type VoteLockReviewState } from './transaction-composition-vote-lock-support'
import { TransactionAmountAsset } from './transaction-system-assets'

export const VoteLockAmountTask = ({
  state,
  lockAmount,
  unlockAmount,
  isAcknowledged,
  onLockAmountChange,
  onUnlockAmountChange,
  onAcknowledgedChange,
  onDirectionChange,
}: {
  state: VoteLockReviewState
  lockAmount: string
  unlockAmount: string
  isAcknowledged: boolean
  onLockAmountChange: (value: string) => void
  onUnlockAmountChange: (value: string) => void
  onAcknowledgedChange: (checked: boolean) => void
  onDirectionChange: () => void
}) => {
  const isUnlock = state.startsWith('Unlock')
  const isInputState =
    state === 'Lock amount' ||
    state === 'Approval' ||
    state === 'Lock ready' ||
    state === 'Unlock amount'
  const amount = isUnlock ? unlockAmount : lockAmount
  const hasFixtureQuote = amount === '1'
  const showAcknowledgement =
    state === 'Lock amount' || state === 'Approval' || state === 'Lock ready'
  const isSubmittedState =
    state === 'Lock confirming' ||
    state === 'Lock processing' ||
    state === 'Unlock confirming' ||
    state === 'Unlock processing'

  return (
    <div>
      <TransactionAmountPair
        className={cn(
          isSubmittedState && transactionTaskGeometry.submittedContentBoundary
        )}
        data-task-boundary={isSubmittedState ? 'leading' : undefined}
      >
        <TransactionAmountObject
          label={isUnlock ? 'You unlock:' : 'You lock:'}
          amount={amount}
          {...(isInputState
            ? {
                onAmountChange: isUnlock
                  ? onUnlockAmountChange
                  : onLockAmountChange,
              }
            : { readOnly: true })}
          presentation="input"
          asset={
            <TransactionAmountAsset
              chain={ChainId.BSC}
              symbol={isUnlock ? 'vlRSR' : 'RSR'}
            />
          }
          supporting={hasFixtureQuote ? (isUnlock ? '$8.34' : '$8.18') : '—'}
          balance={isUnlock ? 'Balance 1,000 vlRSR' : 'Balance 1,000 RSR'}
          balanceAction={
            isInputState ? (
              <InlineAction
                onClick={() =>
                  isUnlock
                    ? onUnlockAmountChange('1000')
                    : onLockAmountChange('1000')
                }
              >
                Max
              </InlineAction>
            ) : undefined
          }
        />
        <TransactionAmountObject
          label="You receive:"
          amount={hasFixtureQuote ? (isUnlock ? '1.0188' : '0.98155') : '—'}
          readOnly
          presentation="output"
          asset={
            <TransactionAmountAsset
              chain={ChainId.BSC}
              symbol={isUnlock ? 'RSR' : 'vlRSR'}
            />
          }
          supporting={hasFixtureQuote ? (isUnlock ? '$8.34' : '$8.18') : '—'}
        />
        {isInputState ? (
          <IconButton
            label={isUnlock ? 'Switch to vote-lock' : 'Switch to unlock'}
            icon={<ArrowUpDown />}
            size="compact"
            onClick={onDirectionChange}
            className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 ring-2 ring-card"
          />
        ) : (
          <TransactionAmountRelation />
        )}
      </TransactionAmountPair>
      <div
        data-testid="vote-lock-task-facts-region"
        className={transactionTaskGeometry.factsRegion}
      >
        <dl
          data-testid="vote-lock-task-details"
          className="grid gap-2 px-4 py-4"
        >
          <TaskFact
            label="Exchange rate"
            value="1 vlRSR = 1.0188 RSR"
            testId="vote-lock-exchange-rate"
          />
          {state === 'Unlock amount' && (
            <TaskFact
              label="Unlock delay"
              value="14 days · rewards stop"
              testId="vote-lock-unlock-delay"
            />
          )}
        </dl>
        {showAcknowledgement && (
          <LockAcknowledgement
            checked={isAcknowledged}
            onCheckedChange={onAcknowledgedChange}
          />
        )}
      </div>
    </div>
  )
}

const TaskFact = ({
  label,
  value,
  testId,
}: {
  label: string
  value: string
  testId: string
}) => (
  <div data-testid={testId} className="flex items-center justify-between gap-3">
    <dt className={cn(v1Typography.supporting, roles.text.supporting)}>
      {label}
    </dt>
    <dd className={cn(v1Typography.label, 'text-right')}>{value}</dd>
  </div>
)

const LockAcknowledgement = ({
  checked,
  onCheckedChange,
}: {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) => (
  <div
    data-testid="vote-lock-acknowledgement"
    className="flex items-center gap-2 px-4 py-4"
  >
    <Checkbox
      id="vote-lock-delay-acknowledgement"
      checked={checked}
      onCheckedChange={onCheckedChange}
      aria-label="Acknowledge unlock delay"
    />
    <label
      htmlFor="vote-lock-delay-acknowledgement"
      className={cn(v1Typography.label, 'min-w-0 flex-1 cursor-pointer')}
    >
      I understand unlocking takes 14 days
    </label>
    <HelpTooltip
      accessibleLabel="About the 14-day unlock delay"
      side="top"
      content={
        <span>
          If you decide to unlock RSR in the future, you&apos;ll need to wait 14
          days until you can complete the withdrawal
        </span>
      }
    />
  </div>
)
