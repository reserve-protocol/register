import { Button } from '@/components/button'
import {
  InlineMessage,
  InlineMessageTitle,
} from '@/components/design-system-v1/inline-message'
import { TransactionIdentity } from '@/components/design-system-v1/transaction-identity'
import { v1Typography } from '@/components/design-system-v1/typography'
import { LifecycleStatusPill } from '@/components/lifecycle-status'
import { v1SemanticRecipes as roles } from '@/components/ui/v1-semantic-recipes'
import { cn } from '@/lib/utils'
import { ChainId } from '@/utils/chains'
import type { RefObject } from 'react'

import { TransactionAssetMark } from './transaction-system-assets'

export const VOTE_LOCK_TRANSACTION = {
  href: 'https://bscscan.com/tx/0x5a61270a74cda50d2ca2d6ee5016f4502e77a7b6e7996345f1684c67d27d56da',
  value: '0x5a61270a74cda50d2ca2d6ee5016f4502e77a7b6e7996345f1684c67d27d56da',
  visibleValue: '0x5a61…56da',
} as const

export type VoteLockReviewState =
  | 'Lock amount'
  | 'Approval'
  | 'Lock ready'
  | 'Lock wallet'
  | 'Lock confirming'
  | 'Lock processing'
  | 'Locked'
  | 'Unlock amount'
  | 'Unlock wallet'
  | 'Unlock confirming'
  | 'Unlock processing'
  | 'Unlock initiated'
  | 'Cooldown'
  | 'Ready'
  | 'Withdrawn'

export const ContextFact = ({
  label,
  value,
}: {
  label: string
  value: string
}) => (
  <div className="bg-card p-3">
    <dt className={cn(v1Typography.supporting, roles.text.supporting)}>
      {label}
    </dt>
    <dd className={cn(v1Typography.label, 'mt-1')}>{value}</dd>
  </div>
)

export const VoteLockGovernanceContext = ({
  onOpen,
  openButtonRef,
}: {
  onOpen: () => void
  openButtonRef: RefObject<HTMLButtonElement>
}) => (
  <section className="mx-auto max-w-md bg-card p-4 sm:p-6">
    <p className={cn(v1Typography.label, 'text-primary')}>6.42% APY</p>
    <h4 className="mt-6 text-xl font-medium">Govern PHOTON</h4>
    <p className={cn('mt-1', v1Typography.supporting, roles.text.supporting)}>
      Vote-lock $RSR in $vlRSR to govern and earn from this DTF&apos;s TVL fee.
    </p>
    <dl className="mt-6 grid grid-cols-2 gap-px bg-border">
      <ContextFact label="Rewards in" value="$RSR" />
      <ContextFact label="Claiming" value="Automatic" />
      <ContextFact label="Exchange rate" value="1 vlRSR = 1.0188 RSR" />
      <ContextFact label="Your redeemable" value="1,018.8 RSR" />
    </dl>
    <Button ref={openButtonRef} className="mt-6 w-full" onClick={onOpen}>
      Vote-lock $RSR
    </Button>
  </section>
)

export const LOCK_STATES = [
  'Lock amount',
  'Approval',
  'Lock ready',
  'Lock wallet',
  'Lock confirming',
  'Lock processing',
  'Locked',
] as const satisfies readonly VoteLockReviewState[]

export const UNLOCK_STATES = [
  'Unlock amount',
  'Unlock wallet',
  'Unlock confirming',
  'Unlock processing',
  'Unlock initiated',
  'Cooldown',
  'Ready',
  'Withdrawn',
] as const satisfies readonly VoteLockReviewState[]

export const VoteLockAction = ({
  state,
  isAcknowledged,
  hasQuote,
}: {
  state: VoteLockReviewState
  isAcknowledged: boolean
  hasQuote: boolean
}) => {
  if (state === 'Approval') {
    return (
      <Button className="w-full" disabled={!isAcknowledged || !hasQuote}>
        Approve use of RSR
      </Button>
    )
  }
  if (state === 'Lock wallet' || state === 'Unlock wallet') {
    return (
      <Button className="w-full" loading>
        Pending, sign in wallet
      </Button>
    )
  }
  if (state === 'Lock confirming' || state === 'Unlock confirming') {
    return (
      <Button className="w-full" loading>
        Confirming tx...
      </Button>
    )
  }
  if (state === 'Lock processing' || state === 'Unlock processing') {
    return (
      <Button className="w-full" loading>
        Processing transaction...
      </Button>
    )
  }
  return (
    <Button
      className="w-full"
      disabled={
        !hasQuote ||
        ((state === 'Lock amount' || state === 'Lock ready') && !isAcknowledged)
      }
    >
      {state === 'Unlock amount'
        ? 'Begin 14-day unlock delay'
        : 'Vote lock RSR'}
    </Button>
  )
}

export const VoteLockTransactionIdentity = ({
  label = 'Transaction',
}: {
  label?: string
}) => (
  <TransactionIdentity
    label={label}
    value={VOTE_LOCK_TRANSACTION.value}
    visibleValue={VOTE_LOCK_TRANSACTION.visibleValue}
    network="BSC"
    networkMark={<TransactionAssetMark chain={ChainId.BSC} symbol="RSR" />}
    explorerLabel="View on explorer"
    explorerHref={VOTE_LOCK_TRANSACTION.href}
    externalAnnouncement="Opens transaction in a new tab"
  />
)

export const VoteLockPendingWithdrawal = ({
  state,
}: {
  state: 'Cooldown' | 'Ready' | 'Withdrawn'
}) => {
  const isReady = state === 'Ready'
  const isWithdrawn = state === 'Withdrawn'

  return (
    <div className="mx-auto w-full max-w-4xl bg-background p-4 sm:p-6">
      {isWithdrawn && (
        <InlineMessage tone="success">
          <InlineMessageTitle>Withdrawal successful</InlineMessageTitle>
        </InlineMessage>
      )}
      <section
        data-testid="vote-lock-pending-withdrawal-section"
        className={cn('bg-card p-4 sm:p-6', isWithdrawn && 'mt-5')}
      >
        <h4 className="text-xl font-medium">Pending Withdrawals</h4>
        <p
          className={cn('mt-1', v1Typography.supporting, roles.text.supporting)}
        >
          Unstaking and unlock cooldown periods.
        </p>
        <div className="mt-4 border-y border-border py-4">
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <div className="flex min-w-0 items-center gap-3">
              <TransactionAssetMark chain={ChainId.BSC} symbol="RSR" />
              <div className="min-w-0">
                <p className={v1Typography.label}>1.0188 RSR</p>
                <p
                  className={cn(
                    'mt-1',
                    v1Typography.supporting,
                    roles.text.supporting
                  )}
                >
                  Source vlRSR · $8.34
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <LifecycleStatusPill
                role={
                  isReady ? 'actionable' : isWithdrawn ? 'success' : 'waiting'
                }
              >
                {isReady ? 'Ready' : isWithdrawn ? 'Withdrawn' : '13d 23h'}
              </LifecycleStatusPill>
              <Button size="compact" tone="secondary" disabled={!isReady}>
                {isWithdrawn ? 'Withdrawn' : 'Withdraw'}
              </Button>
            </div>
          </div>
          {isWithdrawn && (
            <div className="mt-4 border-t border-border pt-4">
              <VoteLockTransactionIdentity label="Transaction" />
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
