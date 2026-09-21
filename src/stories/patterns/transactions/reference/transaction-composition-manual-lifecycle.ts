import {
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
