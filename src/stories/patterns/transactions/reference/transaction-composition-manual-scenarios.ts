import {
  createManualSession,
  manualSessionAssets,
  type ManualApproval,
  type ManualPhase,
  type ManualSession,
} from './transaction-composition-manual-lifecycle'
import {
  isManualAmountPositive,
  manualAmountExceedsBalance,
  type ManualIssuanceOperation,
} from './transaction-composition-manual-fixtures'

export const MANUAL_STATE_GROUPS = [
  { label: 'Review anchors', states: ['Mint requirements', 'Redeem preview'] },
  {
    label: 'Configuration and access',
    states: [
      'Mint empty',
      'Redeem empty',
      'Basket loading',
      'Wallet disconnected',
      'Wrong network',
      'Insufficient collateral',
      'Insufficient shares',
      'Mint restricted',
      'Deprecated DTF',
    ],
  },
  {
    label: 'Permissions',
    states: [
      'Approvals signing',
      'Approvals confirming',
      'Partial approval failure',
      'Revoke signing',
      'Revoke confirming',
      'After revoke',
      'Mint ready',
      'Mixed approval progress',
    ],
  },
  {
    label: 'Mint transaction',
    states: [
      'Mint wallet',
      'Mint confirming',
      'Mint rejected',
      'Mint failed',
      'Mint outcome',
    ],
  },
  {
    label: 'Redeem transaction',
    states: [
      'Redeem wallet',
      'Redeem confirming',
      'Redeem rejected',
      'Redeem failed',
      'Redeem outcome',
    ],
  },
] as const
export type ManualReviewState =
  (typeof MANUAL_STATE_GROUPS)[number]['states'][number]

const MAX_ALLOWANCE = (1n << 256n) - 1n

const approvalFixtures = (
  session: ManualSession,
  status: ManualPhase
): Record<string, ManualApproval> =>
  Object.fromEntries(
    manualSessionAssets(session)
      .filter(
        (asset) =>
          asset.permission === 'approve' || asset.permission === 'revoke'
      )
      .map((asset) => [
        asset.symbol,
        {
          action: 'approve' as const,
          status,
          requestedAllowance: session.unlimited
            ? MAX_ALLOWANCE
            : asset.requiredAmount * 2n,
        },
      ])
  )

const transactionFixture = (
  session: ManualSession,
  transaction: ManualPhase,
  error?: string
): ManualSession => ({
  ...session,
  allowances:
    session.operation === 'mint'
      ? Object.fromEntries(
          manualSessionAssets(session).map((asset) => [
            asset.symbol,
            MAX_ALLOWANCE,
          ])
        )
      : session.allowances,
  transaction,
  error,
})

export const manualScenario = (
  state: ManualReviewState,
  amount: string,
  unlimited: boolean
): ManualSession => {
  const operation: ManualIssuanceOperation =
    state.startsWith('Redeem') ||
    state === 'Insufficient shares' ||
    state === 'Deprecated DTF'
      ? 'redeem'
      : 'mint'
  let s = { ...createManualSession(operation, amount), unlimited }
  if (state.endsWith('empty')) return { ...s, amount: '' }
  if (state === 'Insufficient collateral') return { ...s, amount: '177' }
  if (state === 'Insufficient shares') return { ...s, amount: '125' }
  const gates = {
    'Basket loading': 'loading',
    'Wallet disconnected': 'disconnected',
    'Wrong network': 'wrong-chain',
    'Mint restricted': 'restricted',
    'Deprecated DTF': 'deprecated',
  } as const
  if (state in gates) return { ...s, gate: gates[state as keyof typeof gates] }
  if (
    state !== 'Mint requirements' &&
    state !== 'Redeem preview' &&
    (!isManualAmountPositive(s.amount) ||
      manualAmountExceedsBalance(s.amount, operation))
  )
    s = { ...s, amount: '100' }
  if (state === 'Mixed approval progress') {
    const approvals = approvalFixtures(s, 'signing')
    const allowances = { ...s.allowances }
    if (approvals.WETH) {
      approvals.WETH = { ...approvals.WETH, status: 'success' }
      allowances.WETH = approvals.WETH.requestedAllowance
    }
    if (approvals.AAVE)
      approvals.AAVE = { ...approvals.AAVE, status: 'confirming' }
    return { ...s, approvals, allowances }
  }
  if (state.startsWith('Approvals') || state === 'Partial approval failure') {
    const approvals = approvalFixtures(
      s,
      state === 'Approvals signing' ? 'signing' : 'confirming'
    )
    if (state !== 'Partial approval failure') return { ...s, approvals }
    const allowances = { ...s.allowances }
    for (const asset of manualSessionAssets(s)) {
      const approval = approvals[asset.symbol]
      if (!approval) continue
      const status = asset.permission === 'revoke' ? 'error' : 'success'
      approvals[asset.symbol] = { ...approval, status }
      if (status === 'success')
        allowances[asset.symbol] = approval.requestedAllowance
    }
    return { ...s, approvals, allowances }
  }
  if (state.startsWith('Revoke') || state === 'After revoke') {
    const status =
      state === 'Revoke signing'
        ? 'signing'
        : state === 'Revoke confirming'
          ? 'confirming'
          : 'success'
    return {
      ...s,
      approvals: {
        USDT: { action: 'revoke', status, requestedAllowance: 0n },
      },
      allowances:
        state === 'After revoke' ? { ...s.allowances, USDT: 0n } : s.allowances,
    }
  }
  if (
    state === 'Mint ready' ||
    / (wallet|confirming|rejected|failed|outcome)$/.test(state)
  ) {
    if (state === 'Mint ready') return transactionFixture(s, 'idle')
    if (state.endsWith('wallet')) return transactionFixture(s, 'signing')
    if (state.endsWith('confirming')) return transactionFixture(s, 'confirming')
    if (state.endsWith('rejected'))
      return transactionFixture(s, 'error', 'User rejected the request.')
    if (state.endsWith('failed'))
      return transactionFixture(s, 'error', 'Execution reverted.')
    if (state.endsWith('outcome')) return transactionFixture(s, 'success')
  }
  return s
}
