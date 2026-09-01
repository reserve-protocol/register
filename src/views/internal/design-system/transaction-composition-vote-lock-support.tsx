import { Button } from '@/components/button'
import { TransactionIdentity } from '@/components/design-system-v1/transaction-identity'
import { v1Typography } from '@/components/design-system-v1/typography'
import { v1SemanticRecipes as roles } from '@/components/ui/v1-semantic-recipes'
import { cn } from '@/lib/utils'
import { ChainId } from '@/utils/chains'
import type { RefObject } from 'react'

import {
  TransactionProgressStepper,
  type TransactionProgressStep,
} from './transaction-progress-stepper'
import { TransactionAssetMark } from './transaction-system-assets'

export const VOTE_LOCK_TRANSACTION = {
  href: 'https://bscscan.com/tx/0x5a61270a74cda50d2ca2d6ee5016f4502e77a7b6e7996345f1684c67d27d56da',
  value: '0x5a61270a74cda50d2ca2d6ee5016f4502e77a7b6e7996345f1684c67d27d56da',
  visibleValue: '0x5a61…56da',
} as const

export const VOTE_LOCK_TASK_WIDTH = 'sm:max-w-[448px]'

export type VoteLockReviewState =
  | 'Lock amount'
  | 'Approval'
  | 'Approval signing'
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
  | 'Delegated to you'
  | 'Delegate ready'
  | 'Normal only'
  | 'Normal signing'
  | 'Fast signing'
  | 'Fast failed'
  | 'Invalid address'
  | 'No locked balance'
  | 'Wallet disconnected'
  | 'Voting delegate updated'
  | 'Delegation updated'

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
  'Approval signing',
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
] as const satisfies readonly VoteLockReviewState[]

export const DELEGATION_STATES = [
  'Delegated to you',
  'Delegate ready',
  'Normal only',
  'Normal signing',
  'Fast signing',
  'Fast failed',
  'Invalid address',
  'No locked balance',
  'Wallet disconnected',
  'Voting delegate updated',
  'Delegation updated',
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
        Approve use of RSR · Step 1 of 2
      </Button>
    )
  }
  if (
    state === 'Approval signing' ||
    state === 'Lock wallet' ||
    state === 'Unlock wallet'
  ) {
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
        : state === 'Lock ready'
          ? 'Vote lock RSR · Step 2 of 2'
          : 'Vote lock RSR'}
    </Button>
  )
}

export const VoteLockProgressStepper = ({
  state,
}: {
  state: VoteLockReviewState
}) => {
  const approvalState: TransactionProgressStep['state'] =
    state === 'Approval signing' ? 'active' : 'complete'
  const lockState: TransactionProgressStep['state'] =
    state === 'Approval signing'
      ? 'upcoming'
      : state === 'Lock ready'
        ? 'actionable'
        : 'active'

  return (
    <TransactionProgressStepper
      label="Vote-lock progress"
      steps={[
        { transaction: 1, label: 'Approve RSR', state: approvalState },
        { transaction: 2, label: 'Vote-lock RSR', state: lockState },
      ]}
    />
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
