import { Button } from '@/components/button'
import { TransactionIdentity } from '@/components/design-system-v1/transaction-identity'
import { ChainId } from '@/utils/chains'

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
  if (state === 'Approval signing') {
    return (
      <Button className="w-full" loading>
        Approval in progress…
      </Button>
    )
  }

  if (state === 'Approval') {
    return (
      <Button className="w-full" disabled={!isAcknowledged || !hasQuote}>
        Approve use of RSR · Step 1 of 2
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
