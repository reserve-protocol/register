import { Button } from '@/components/button'
import { HelpTooltip } from '@/components/design-system-v1/help-tooltip'
import {
  InlineMessage,
  InlineMessageTitle,
} from '@/components/design-system-v1/inline-message'
import {
  manualAmountExceedsBalance,
  isManualAmountPositive,
} from './transaction-composition-manual-fixtures'
import {
  manualIsBlocked,
  manualIsBusy,
  manualSessionAssets,
  type ManualEvent,
  type ManualSession,
} from './transaction-composition-manual-lifecycle'

export const ManualIssuanceAction = ({
  session: s,
  dispatch,
  stage,
}: {
  session: ManualSession
  dispatch: (event: ManualEvent) => void
  stage?: 'approvals' | 'transaction'
}) => {
  const assets = manualSessionAssets(s)
  const pending = assets.filter(
    (a) => a.permission === 'approve' || a.permission === 'revoke'
  )
  const statuses = Object.values(s.approvals)
  const failedSymbols = Object.entries(s.approvals)
    .filter(([, a]) => a.status === 'error')
    .map(([symbol]) => symbol)
  const failed = failedSymbols.length
  const failedTokens = failedSymbols.join(', ')
  const signingDeclined =
    s.transaction === 'error' && s.error === 'User rejected the request.'
  const isMint = s.operation === 'mint'
  const busy = manualIsBusy(s)
  const insufficient = manualAmountExceedsBalance(s.amount, s.operation)
  const approvalBusy = statuses.some(
    (a) => a.status === 'signing' || a.status === 'confirming'
  )
  const needsApproval = isMint && s.gate !== 'loading' && pending.length > 0
  const isWalletGate = s.gate === 'disconnected' || s.gate === 'wrong-chain'
  const approvalAction = stage === 'approvals' || (!stage && needsApproval)
  const nextIsApproval =
    isMint && (needsApproval || approvalBusy || failed > 0 || isWalletGate)
  const isNextAction = !stage || approvalAction === nextIsApproval
  const walletAction = isWalletGate && isNextAction
  const loading =
    stage === 'approvals'
      ? approvalBusy
      : stage === 'transaction'
        ? ['signing', 'confirming'].includes(s.transaction)
        : busy
  const message =
    failed && stage !== 'transaction'
      ? failed === 1
        ? `Approval failed: ${failedTokens}`
        : `Approvals failed: ${failedTokens}`
      : s.transaction === 'error' && stage !== 'approvals'
        ? signingDeclined
          ? `Signing declined`
          : `Transaction failed`
        : insufficient && !needsApproval && !stage
          ? `Insufficient balance`
          : null
  const unavailable =
    !isManualAmountPositive(s.amount) ||
    manualIsBlocked(s) ||
    (!needsApproval && insufficient)
  const stageUnavailable =
    stage === 'transaction'
      ? needsApproval || approvalBusy || failed > 0
      : stage === 'approvals'
        ? pending.length === 0 || s.transaction !== 'idle'
        : false
  const action = () =>
    dispatch({
      type: walletAction
        ? 'resolve-gate'
        : failed && approvalAction
          ? 'retry'
          : approvalAction
            ? 'approve-all'
            : 'submit',
    })

  return (
    <div
      className="flex flex-col gap-2"
      data-testid={
        isNextAction ? 'manual-action-region' : `manual-${stage}-action-region`
      }
    >
      {message && !busy && !isWalletGate && (
        <InlineMessage
          tone={signingDeclined && !failed ? 'information' : 'danger'}
          presentation="summary"
          density="compact"
          role="status"
        >
          <InlineMessageTitle className="min-w-0 flex-1">
            {message}
          </InlineMessageTitle>
          {failed > 0 && (
            <HelpTooltip
              className="focus-visible:ring-offset-[var(--inline-message-surface)]"
              accessibleLabel={`One or more approvals failed`}
              content={
                <>Click retry or use individual approve buttons below.</>
              }
            />
          )}
          {s.transaction === 'error' && s.error && (
            <HelpTooltip
              className="focus-visible:ring-offset-[var(--inline-message-surface)]"
              accessibleLabel={
                signingDeclined ? `Signing declined` : `Transaction failed`
              }
              content={s.error}
            />
          )}
        </InlineMessage>
      )}
      <Button
        data-testid={
          isNextAction
            ? 'manual-issuance-primary-action'
            : `manual-issuance-${stage}-action`
        }
        className="w-full whitespace-normal"
        tone="primary"
        loading={loading}
        disabled={!walletAction && (unavailable || stageUnavailable)}
        onClick={action}
      >
        {walletAction && s.gate === 'disconnected' ? (
          <>Connect Wallet</>
        ) : walletAction && s.gate === 'wrong-chain' ? (
          <>Switch to Ethereum</>
        ) : approvalAction && approvalBusy ? (
          `Awaiting approvals...`
        ) : !approvalAction && s.transaction === 'signing' ? (
          <>Please sign in wallet...</>
        ) : !approvalAction && s.transaction === 'confirming' ? (
          <>Confirming transaction...</>
        ) : approvalAction && failed ? (
          <>
            {failed === 1
              ? `Retry ${failed} approval`
              : `Retry ${failed} approvals`}
          </>
        ) : approvalAction ? (
          pending.length && s.gate !== 'loading' ? (
            `Approve All (${pending.length})`
          ) : (
            `Approve All`
          )
        ) : isMint ? (
          `Mint ${s.amount || '0'} CMC20`
        ) : (
          `Redeem ${s.amount || '0'} CMC20`
        )}
      </Button>
    </div>
  )
}
