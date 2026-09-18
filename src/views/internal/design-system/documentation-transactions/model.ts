import {
  STAKE_DELEGATE_STATES,
  STAKE_RECOVERY_STATES,
  STAKE_STATES,
  UNSTAKE_STATES,
  type StakeReviewState,
} from '../transaction-composition-stake-support'
import {
  AUTOMATED_MINT_STATE_GROUPS,
  type AutomatedIssuanceOperation,
  type AutomatedMintReviewState,
} from '../transaction-composition-staged-fixtures'
import {
  DELEGATION_STATES,
  LOCK_STATES,
  UNLOCK_STATES,
  type VoteLockReviewState,
} from '../transaction-composition-vote-lock-support'
import {
  MANUAL_STATE_GROUPS,
  type ManualReviewState,
} from '../transaction-composition-manual-scenarios'
import type { ZapperReviewState } from '../transaction-composition-rfq'
import { TRANSACTION_DOCUMENTATION_SECTIONS } from './navigation'
import {
  AUTOMATED_STATE_LABELS,
  MANUAL_STATE_LABELS,
  STAKE_STATE_LABELS,
  VOTE_LOCK_STATE_LABELS,
  ZAPPER_STATE_LABELS,
} from './state-labels'

export type TransactionFlowNode<State extends string = string> = {
  operation: string
  operationLabel: MessageDescriptor
  step: string
  stepLabel: MessageDescriptor
  state: State
  stateLabel: MessageDescriptor
  stateSlug: string
}

export type TransactionFamilyDefinition<State extends string = string> = {
  id: string
  title: MessageDescriptor
  description: MessageDescriptor
  owner: string
  defaultState: State
  nodes: readonly TransactionFlowNode<State>[]
}

export const transactionStateSlug = (state: string) =>
  state
    .toLowerCase()
    .replaceAll('·', '')
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/(^-|-$)/g, '')

const nodes = <State extends string>({
  operation,
  operationLabel,
  step,
  stepLabel,
  states,
  stateLabels,
}: {
  operation: string
  operationLabel: MessageDescriptor
  step: string
  stepLabel: MessageDescriptor
  states: readonly State[]
  stateLabels: Record<State, MessageDescriptor>
}): TransactionFlowNode<State>[] =>
  states.map((state) => ({
    operation,
    operationLabel,
    step,
    stepLabel,
    state,
    stateLabel: stateLabels[state],
    stateSlug: transactionStateSlug(state),
  }))

const ZAPPER_LIFECYCLE_STATES = [
  'Pre-quote',
  'Quote search',
  'Review',
  'Approval',
  'Sign order',
  'RFQ execution',
  'Atomic confirmation',
  'RFQ outcome',
  'Atomic outcome',
  'Quote failure',
  'RFQ recovery',
  'Native refund',
] as const satisfies readonly ZapperReviewState[]

const ZAPPER_REVIEW_STATES = [
  'Route selection',
  'High-impact acknowledgment',
  'Market-hours advisory',
  'Capacity advisory',
  'Trading unavailable',
  'CoW redirect · retired',
] as const satisfies readonly ZapperReviewState[]

const ZAPPER_ATTACHMENT_STATES = [
  'Updates',
  'Intro call',
] as const satisfies readonly ZapperReviewState[]

export const ZAPPER_FAMILY: TransactionFamilyDefinition<ZapperReviewState> = {
  id: 'transactions-zapper',
  title: TRANSACTION_DOCUMENTATION_SECTIONS[0].label,
  description: msg`Opaque package-backed quotes preserve their route-specific signing, execution, recovery, and outcome states.`,
  owner: 'ZapperInlineReference',
  defaultState: 'Review',
  nodes: [
    ...nodes({
      operation: 'buy-sell',
      operationLabel: msg`Buy / Sell`,
      step: 'lifecycle',
      stepLabel: msg`Transaction progress`,
      states: ZAPPER_LIFECYCLE_STATES,
      stateLabels: ZAPPER_STATE_LABELS,
    }),
    ...nodes({
      operation: 'buy-sell',
      operationLabel: msg`Buy / Sell`,
      step: 'review-variant',
      stepLabel: msg`Quote and availability`,
      states: ZAPPER_REVIEW_STATES,
      stateLabels: ZAPPER_STATE_LABELS,
    }),
    ...nodes({
      operation: 'buy-sell',
      operationLabel: msg`Buy / Sell`,
      step: 'outcome-attachment',
      stepLabel: msg`Result details`,
      states: ZAPPER_ATTACHMENT_STATES,
      stateLabels: ZAPPER_STATE_LABELS,
    }),
  ],
}

const automatedNodes = AUTOMATED_MINT_STATE_GROUPS.flatMap((group) => {
  const step = transactionStateSlug(group.label)
  const stepLabel = {
    Configure: msg`Configure`,
    Quote: msg`Quote`,
    Execute: msg`Execute`,
    Outcome: msg`Outcome`,
  }[group.label]
  return group.states.flatMap((state) => {
    const operations: readonly AutomatedIssuanceOperation[] =
      state === 'Redeem complete' || state === 'Existing collateral only'
        ? ['redeem']
        : state === 'Mint complete' || state === 'BSC configuration'
          ? ['mint']
          : ['mint', 'redeem']
    return operations.flatMap((operation) =>
      nodes({
        operation,
        operationLabel: operation === 'mint' ? msg`Mint` : msg`Redeem`,
        step,
        stepLabel,
        states: [state],
        stateLabels: AUTOMATED_STATE_LABELS,
      })
    )
  })
})

export const AUTOMATED_FAMILY: TransactionFamilyDefinition<AutomatedMintReviewState> =
  {
    id: 'transactions-automated',
    title: TRANSACTION_DOCUMENTATION_SECTIONS[1].label,
    description: msg`Mint and redeem widen from configuration into a transparent order workspace without collapsing their distinct assets or outcomes.`,
    owner:
      'AutomatedMintEntry · AutomatedMintConfigure · AutomatedMintWorkspace',
    defaultState: 'Initial configuration',
    nodes: automatedNodes,
  }

export const STAKE_FAMILY: TransactionFamilyDefinition<StakeReviewState> = {
  id: 'transactions-stake',
  title: TRANSACTION_DOCUMENTATION_SECTIONS[2].label,
  description: msg`Stake, delayed unstake, and single-role delegation remain separate operations with truthful initiation and completion states.`,
  owner: 'StakeTransactionComposition checkpoint stage',
  defaultState: 'Stake amount',
  nodes: [
    ...nodes({
      operation: 'stake',
      operationLabel: msg`Stake`,
      step: 'stake',
      stepLabel: msg`Stake`,
      states: STAKE_STATES,
      stateLabels: STAKE_STATE_LABELS,
    }),
    ...nodes({
      operation: 'unstake',
      operationLabel: msg`Unstake`,
      step: 'unstake',
      stepLabel: msg`Unstake`,
      states: UNSTAKE_STATES,
      stateLabels: STAKE_STATE_LABELS,
    }),
    ...nodes({
      operation: 'delegate',
      operationLabel: msg`Delegate`,
      step: 'delegation',
      stepLabel: msg`Delegation`,
      states: STAKE_DELEGATE_STATES,
      stateLabels: STAKE_STATE_LABELS,
    }),
    ...STAKE_RECOVERY_STATES.flatMap((state) =>
      nodes({
        operation: state === 'Stake failed' ? 'stake' : 'unstake',
        operationLabel: state === 'Stake failed' ? msg`Stake` : msg`Unstake`,
        step: 'recovery',
        stepLabel: msg`Recovery`,
        states: [state],
        stateLabels: STAKE_STATE_LABELS,
      })
    ),
  ],
}

export const VOTE_LOCK_FAMILY: TransactionFamilyDefinition<VoteLockReviewState> =
  {
    id: 'transactions-vote-lock',
    title: TRANSACTION_DOCUMENTATION_SECTIONS[3].label,
    description: msg`Lock, delayed unlock, and governance delegation retain their own settlement and multi-call distinctions.`,
    owner: 'VoteLockProductContext',
    defaultState: 'Lock amount',
    nodes: [
      ...nodes({
        operation: 'lock',
        operationLabel: msg`Lock`,
        step: 'lock',
        stepLabel: msg`Lock`,
        states: LOCK_STATES,
        stateLabels: VOTE_LOCK_STATE_LABELS,
      }),
      ...nodes({
        operation: 'unlock',
        operationLabel: msg`Unlock`,
        step: 'unlock',
        stepLabel: msg`Unlock`,
        states: UNLOCK_STATES,
        stateLabels: VOTE_LOCK_STATE_LABELS,
      }),
      ...nodes({
        operation: 'delegate',
        operationLabel: msg`Delegate`,
        step: 'delegation',
        stepLabel: msg`Delegation`,
        states: DELEGATION_STATES,
        stateLabels: VOTE_LOCK_STATE_LABELS,
      }),
    ],
  }

const manualOperation = (state: ManualReviewState) =>
  state.startsWith('Redeem') ||
  state === 'Insufficient shares' ||
  state === 'Deprecated DTF'
    ? 'redeem'
    : 'mint'

export const MANUAL_FAMILY: TransactionFamilyDefinition<ManualReviewState> = {
  id: 'transactions-manual',
  title: TRANSACTION_DOCUMENTATION_SECTIONS[4].label,
  description: msg`The full basket, permission, wallet, confirmation, and conservative outcome lifecycle stays inspectable without implying live execution.`,
  owner: 'ManualIssuanceAnchor',
  defaultState: 'Mint requirements',
  nodes: MANUAL_STATE_GROUPS.flatMap((group) =>
    group.states.flatMap((state) => {
      const operation = manualOperation(state)
      return nodes({
        operation,
        operationLabel: operation === 'mint' ? msg`Mint` : msg`Redeem`,
        step: transactionStateSlug(group.label),
        stepLabel: {
          'Review anchors': msg`Overview`,
          'Configuration and access': msg`Amount and access`,
          Permissions: msg`Approvals`,
          'Mint transaction': msg`Mint progress`,
          'Redeem transaction': msg`Redeem progress`,
        }[group.label],
        states: [state],
        stateLabels: MANUAL_STATE_LABELS,
      })
    })
  ),
}

export const TRANSACTION_FAMILIES = [
  ZAPPER_FAMILY,
  AUTOMATED_FAMILY,
  STAKE_FAMILY,
  VOTE_LOCK_FAMILY,
  MANUAL_FAMILY,
] as const

import type { MessageDescriptor } from '@lingui/core'
import { msg } from '@lingui/core/macro'
