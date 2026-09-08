import {
  createManualSession,
  manualReducer,
  manualSessionAssets,
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
    s = manualReducer(s, { type: 'approve-all' })
    s = manualReducer(s, { type: 'wallet-accept', symbol: 'WETH' })
    s = manualReducer(s, { type: 'confirm', symbol: 'WETH' })
    return manualReducer(s, { type: 'wallet-accept', symbol: 'AAVE' })
  }
  if (state.startsWith('Approvals') || state === 'Partial approval failure') {
    s = manualReducer(s, { type: 'approve-all' })
    if (state !== 'Approvals signing')
      s = manualReducer(s, { type: 'wallet-accept' })
    return state === 'Partial approval failure'
      ? manualReducer(s, { type: 'confirm' })
      : s
  }
  if (state.startsWith('Revoke') || state === 'After revoke') {
    s = manualReducer(s, { type: 'token', symbol: 'USDT' })
    if (state !== 'Revoke signing')
      s = manualReducer(s, { type: 'wallet-accept' })
    return state === 'After revoke' ? manualReducer(s, { type: 'confirm' }) : s
  }
  if (
    state === 'Mint ready' ||
    / (wallet|confirming|rejected|failed|outcome)$/.test(state)
  ) {
    if (operation === 'mint')
      s.allowances = Object.fromEntries(
        manualSessionAssets(s).map((a) => [a.symbol, (1n << 256n) - 1n])
      )
    if (state === 'Mint ready') return s
    s = manualReducer(s, { type: 'submit' })
    if (state.endsWith('rejected')) return manualReducer(s, { type: 'fail' })
    if (!state.endsWith('wallet'))
      s = manualReducer(s, { type: 'wallet-accept' })
    if (state.endsWith('failed')) return manualReducer(s, { type: 'fail' })
    if (state.endsWith('outcome')) return manualReducer(s, { type: 'confirm' })
  }
  return s
}
