import {
  isManualAmountPositive,
  manualAmountExceedsBalance,
  manualAssetsForAmount,
  type ManualIssuanceOperation,
} from './transaction-composition-manual-fixtures'

export type ManualPhase =
  | 'idle'
  | 'signing'
  | 'confirming'
  | 'error'
  | 'success'
export type ManualGate =
  | 'ready'
  | 'loading'
  | 'disconnected'
  | 'wrong-chain'
  | 'restricted'
  | 'deprecated'
export type ManualApproval = {
  action: 'approve' | 'revoke'
  status: ManualPhase
  requestedAllowance: bigint
}
export type ManualSession = {
  amount: string
  operation: ManualIssuanceOperation
  unlimited: boolean
  gate: ManualGate
  allowances: Record<string, bigint>
  approvals: Record<string, ManualApproval>
  transaction: ManualPhase
  error?: string
}
export type ManualEvent =
  | { type: 'amount'; amount: string }
  | { type: 'mode'; operation: ManualIssuanceOperation }
  | { type: 'unlimited'; value: boolean }
  | { type: 'token'; symbol: string }
  | { type: 'wallet-accept' | 'confirm' | 'fail'; symbol?: string }
  | {
      type: 'approve-all' | 'retry' | 'submit' | 'reset' | 'resolve-gate'
    }

export const createManualSession = (
  operation: ManualIssuanceOperation = 'mint',
  amount = '100'
): ManualSession => ({
  amount,
  operation,
  unlimited: true,
  gate: 'ready',
  allowances: {},
  approvals: {},
  transaction: 'idle',
})

export const manualSessionAssets = (s: ManualSession) =>
  manualAssetsForAmount(s.amount, s.allowances)
export const manualIsBusy = (s: ManualSession) =>
  ['signing', 'confirming'].includes(s.transaction) ||
  Object.values(s.approvals).some((a) =>
    ['signing', 'confirming'].includes(a.status)
  )
export const manualIsBlocked = (s: ManualSession) =>
  ['loading', 'disconnected', 'wrong-chain'].includes(s.gate) ||
  (s.operation === 'mint' && ['restricted', 'deprecated'].includes(s.gate))

export const manualReducer = (
  s: ManualSession,
  event: ManualEvent
): ManualSession => {
  const busy = manualIsBusy(s)
  const assets = manualSessionAssets(s)
  if (event.type === 'reset') {
    return {
      ...createManualSession(s.operation, ''),
      gate: s.gate,
      unlimited: s.unlimited,
      allowances: s.allowances,
    }
  }
  if (event.type === 'resolve-gate') {
    return ['loading', 'disconnected', 'wrong-chain'].includes(s.gate)
      ? { ...s, gate: 'ready' }
      : s
  }
  if (event.type === 'amount') {
    return busy ||
      s.gate === 'loading' ||
      (s.operation === 'mint' && ['restricted', 'deprecated'].includes(s.gate))
      ? s
      : { ...s, amount: event.amount, approvals: {}, transaction: 'idle' }
  }
  if (event.type === 'mode') {
    if (busy || (s.gate === 'deprecated' && event.operation === 'mint'))
      return s
    return {
      ...s,
      operation: event.operation,
      approvals: {},
      transaction: 'idle',
    }
  }
  if (event.type === 'unlimited')
    return busy ? s : { ...s, unlimited: event.value }
  if (
    event.type === 'approve-all' ||
    event.type === 'retry' ||
    event.type === 'token'
  ) {
    if (
      busy ||
      manualIsBlocked(s) ||
      s.operation !== 'mint' ||
      !isManualAmountPositive(s.amount)
    )
      return s
    const pending = assets.filter(
      (a) => a.permission === 'approve' || a.permission === 'revoke'
    )
    const selected = pending.filter((a) =>
      event.type === 'token'
        ? a.symbol === event.symbol
        : event.type === 'retry'
          ? s.approvals[a.symbol]?.status === 'error'
          : true
    )
    if (!selected.length) return s
    const approvals = { ...s.approvals }
    for (const asset of selected) {
      approvals[asset.symbol] = {
        action:
          event.type === 'token' && asset.permission === 'revoke'
            ? 'revoke'
            : 'approve',
        status: 'signing',
        requestedAllowance:
          event.type === 'token' && asset.permission === 'revoke'
            ? 0n
            : s.unlimited || (event.type === 'token' && asset.symbol === 'USDT')
              ? (1n << 256n) - 1n
              : asset.requiredAmount * 2n,
      }
    }
    return { ...s, approvals, transaction: 'idle' }
  }
  if (event.type === 'submit') {
    if (
      busy ||
      manualIsBlocked(s) ||
      !isManualAmountPositive(s.amount) ||
      manualAmountExceedsBalance(s.amount, s.operation)
    )
      return s
    if (
      s.operation === 'mint' &&
      assets.some((a) => a.permission !== 'approved')
    )
      return s
    return { ...s, transaction: 'signing', error: undefined }
  }
  if (
    event.type === 'wallet-accept' ||
    event.type === 'confirm' ||
    event.type === 'fail'
  ) {
    const from = event.type === 'wallet-accept' ? 'signing' : 'confirming'
    const to =
      event.type === 'wallet-accept'
        ? 'confirming'
        : event.type === 'confirm'
          ? 'success'
          : 'error'
    if (
      !event.symbol &&
      (s.transaction === from ||
        (event.type === 'fail' && s.transaction === 'signing'))
    )
      return {
        ...s,
        transaction: to,
        error:
          event.type === 'fail'
            ? s.transaction === 'signing'
              ? 'User rejected the request.'
              : 'Execution reverted.'
            : undefined,
      }
    const approvals = { ...s.approvals }
    const allowances = { ...s.allowances }
    for (const [symbol, approval] of Object.entries(approvals)) {
      if (event.symbol && event.symbol !== symbol) continue
      if (
        approval.status !== from &&
        !(event.type === 'fail' && approval.status === 'signing')
      )
        continue
      const asset = assets.find((a) => a.symbol === symbol)!
      // The generic aggregate path does not perform the USDT allowance reset.
      const needsReset =
        approval.action === 'approve' && asset.permission === 'revoke'
      const status = to === 'success' && needsReset ? 'error' : to
      approvals[symbol] = { ...approval, status }
      if (status === 'success') {
        allowances[symbol] = approval.requestedAllowance
      }
    }
    return { ...s, approvals, allowances }
  }
  return s
}
