import { Button } from '@/components/button'

import {
  TransactionProgressStepper,
  type TransactionProgressStep,
} from './transaction-progress-stepper'

export type StakeReviewState =
  | 'Stake amount'
  | 'Approval'
  | 'Approval signing'
  | 'Stake ready'
  | 'Stake wallet'
  | 'Stake confirming'
  | 'Stake processing'
  | 'Stake completed'
  | 'Unstake amount'
  | 'Unstake wallet'
  | 'Unstake confirming'
  | 'Unstake processing'
  | 'Unstaking initiated'
  | 'Current delegate'
  | 'Delegate ready'
  | 'Delegate wallet'
  | 'Delegate confirming'
  | 'Delegate processing'
  | 'Delegate failed'
  | 'Invalid address'
  | 'No staked balance'
  | 'Wallet disconnected'
  | 'Delegate updated'
  | 'Stake failed'
  | 'Unstake failed'

export const STAKE_STATES = [
  'Stake amount',
  'Approval',
  'Approval signing',
  'Stake ready',
  'Stake wallet',
  'Stake confirming',
  'Stake processing',
  'Stake completed',
] as const satisfies readonly StakeReviewState[]

export const UNSTAKE_STATES = [
  'Unstake amount',
  'Unstake wallet',
  'Unstake confirming',
  'Unstake processing',
  'Unstaking initiated',
] as const satisfies readonly StakeReviewState[]

export const STAKE_DELEGATE_STATES = [
  'Current delegate',
  'Delegate ready',
  'Delegate wallet',
  'Delegate confirming',
  'Delegate processing',
  'Delegate failed',
  'Invalid address',
  'No staked balance',
  'Wallet disconnected',
  'Delegate updated',
] as const satisfies readonly StakeReviewState[]

export const STAKE_RECOVERY_STATES = [
  'Stake failed',
  'Unstake failed',
] as const satisfies readonly StakeReviewState[]

export const STAKE_TRANSACTION = {
  href: 'https://etherscan.io/tx/0x7fc2e37d2b9fb28674640223e7655f1d8ca8c3044b52e85523a62fb85e5b92ad',
} as const

export const StakeAction = ({
  acknowledged,
  state,
}: {
  acknowledged: boolean
  state: StakeReviewState
}) => {
  if (state === 'Approval signing') {
    return (
      <Button
        data-testid="stake-action-button"
        className="w-full"
        tone="secondary"
        loading
      >
        Approval in progress…
      </Button>
    )
  }

  if (state === 'Approval') {
    return (
      <Button
        data-testid="stake-action-button"
        className="w-full"
        disabled={!acknowledged}
      >
        Approve RSR · Step 1 of 2
      </Button>
    )
  }

  if (state === 'Stake wallet' || state === 'Unstake wallet') {
    return (
      <Button data-testid="stake-action-button" className="w-full" loading>
        Pending, sign in wallet
      </Button>
    )
  }

  if (state === 'Stake confirming' || state === 'Unstake confirming') {
    return (
      <Button data-testid="stake-action-button" className="w-full" loading>
        Confirming tx...
      </Button>
    )
  }

  if (state === 'Stake processing' || state === 'Unstake processing') {
    return (
      <Button data-testid="stake-action-button" className="w-full" loading>
        Processing transaction...
      </Button>
    )
  }

  if (state === 'Stake failed') {
    return (
      <Button data-testid="stake-action-button" className="w-full">
        Stake RSR
      </Button>
    )
  }

  if (state === 'Unstake failed') {
    return (
      <Button data-testid="stake-action-button" className="w-full">
        Unstake
      </Button>
    )
  }

  if (state === 'Unstake amount') {
    return (
      <Button data-testid="stake-action-button" className="w-full">
        Begin unstaking process
      </Button>
    )
  }

  return (
    <Button
      data-testid="stake-action-button"
      className="w-full"
      disabled={!acknowledged}
    >
      {state === 'Stake ready' ? 'Stake RSR · Step 2 of 2' : 'Stake RSR'}
    </Button>
  )
}

export const StakeProgress = ({ state }: { state: StakeReviewState }) => {
  const approvalState: TransactionProgressStep['state'] =
    state === 'Approval signing' ? 'active' : 'complete'
  const stakeState: TransactionProgressStep['state'] =
    state === 'Approval signing'
      ? 'upcoming'
      : state === 'Stake ready'
        ? 'actionable'
        : 'active'

  return (
    <TransactionProgressStepper
      label="Staking progress"
      steps={[
        { transaction: 1, label: 'Approve RSR', state: approvalState },
        { transaction: 2, label: 'Stake RSR', state: stakeState },
      ]}
    />
  )
}
