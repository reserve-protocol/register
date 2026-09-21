import {
  SegmentedControl,
  SegmentedControlItem,
} from '@/components/design-system-v1/segmented-control'
import { TransactionAmountObject } from '@/components/design-system-v1/transaction-amount-object'
import {
  InlineMessage,
  InlineMessageTitle,
} from '@/components/design-system-v1/inline-message'
import { v1Typography } from '@/components/design-system-v1/typography'
import { InlineAction } from '@/components/button'
import { v1SemanticRoles as roles } from '@/components/design-system-v1/semantic-roles'
import { cn } from '@/lib/utils'
import { ChainId } from '@/utils/chains'
import {
  manualMaxAmountForOperation,
  manualShareValueForAmount,
  manualAmountExceedsBalance,
  isManualAmountPositive,
  type ManualIssuanceAnchorState,
  type ManualIssuanceOperation,
} from './transaction-composition-manual-fixtures'
import { TransactionAmountAsset } from './transaction-system-assets'
import { ManualIssuanceAction } from './transaction-composition-manual-action'
import { ManualMintStages } from './transaction-composition-manual-mint-stages'
import { TransactionCommittedMode } from './transaction-committed-mode'
import { transactionStageAmountClasses } from './transaction-stage-emphasis'
import {
  manualIsBusy,
  manualSessionAssets,
  type ManualEvent,
  type ManualSession,
} from './transaction-composition-manual-lifecycle'

export const ManualIssuanceTask = ({
  amount,
  onAmountChange,
  onUnlimitedChange,
  onStateChange,
  operation,
  session,
  dispatch,
}: {
  session: ManualSession
  dispatch: (event: ManualEvent) => void
  amount: string
  onAmountChange: (amount: string) => void
  onUnlimitedChange: (isUnlimited: boolean) => void
  onStateChange: (state: ManualIssuanceAnchorState) => void
  operation: ManualIssuanceOperation
}) => {
  const isMint = operation === 'mint'
  const busy = manualIsBusy(session)
  const disabledInput =
    busy ||
    session.gate === 'loading' ||
    (isMint && session.gate === 'restricted')
  const shareValue = manualShareValueForAmount(amount)
  const maximum = manualMaxAmountForOperation(operation)
  const insufficientCollateral =
    isMint &&
    session.gate === 'ready' &&
    manualAmountExceedsBalance(amount, operation)
  const mintActive = ['signing', 'confirming'].includes(session.transaction)
  const currentStage = mintActive
    ? 'mint'
    : busy
      ? 'approvals'
      : session.gate !== 'ready' ||
          !isManualAmountPositive(amount) ||
          insufficientCollateral
        ? 'amount'
        : manualSessionAssets(session).some(
              (asset) => asset.permission !== 'approved'
            )
          ? 'approvals'
          : 'mint'

  return (
    <section
      data-testid="manual-issuance-task"
      className="flex min-w-0 flex-col self-start bg-card p-2"
      aria-label={isMint ? 'Manual mint task' : 'Manual redeem task'}
    >
      <div className="px-2 pt-2">
        {busy ? (
          <TransactionCommittedMode
            assetSymbol="CMC20"
            label={isMint ? 'Mint' : 'Redeem'}
          />
        ) : (
          <SegmentedControl
            aria-label="Manual issuance mode"
            presentation="contained"
            size="compact"
            width="intrinsic"
            value={operation}
            onValueChange={(value) =>
              onStateChange(
                value === 'redeem' ? 'Redeem preview' : 'Mint requirements'
              )
            }
          >
            <SegmentedControlItem
              value="mint"
              disabled={session.gate === 'deprecated'}
            >
              Mint
            </SegmentedControlItem>
            <SegmentedControlItem value="redeem">Redeem</SegmentedControlItem>
          </SegmentedControl>
        )}
      </div>
      <div className="flex flex-col pt-4">
        <div
          data-testid="manual-amount-section"
          aria-current={
            isMint && currentStage === 'amount' ? 'step' : undefined
          }
          className="flex flex-col gap-2"
        >
          <TransactionAmountObject
            label={isMint ? 'Shares to mint' : 'Shares to redeem'}
            amount={amount}
            amountPlaceholder="0"
            onAmountChange={onAmountChange}
            disabled={disabledInput}
            presentation="input"
            className={
              isMint && currentStage !== 'amount'
                ? transactionStageAmountClasses.neutral
                : undefined
            }
            asset={
              <TransactionAmountAsset chain={ChainId.Mainnet} symbol="CMC20" />
            }
            supporting={shareValue ?? '$0.00'}
            balance={`Max ${session.gate === 'disconnected' || session.gate === 'loading' ? '—' : maximum} CMC20`}
            balanceAction={
              <InlineAction
                disabled={disabledInput || session.gate === 'disconnected'}
                onClick={() => onAmountChange(maximum)}
              >
                Use
              </InlineAction>
            }
          />
          {insufficientCollateral && (
            <InlineMessage
              data-testid="manual-collateral-balance-notice"
              tone="danger"
              presentation="summary"
              density="compact"
              role="status"
            >
              <InlineMessageTitle>
                <>Insufficient balance</>
              </InlineMessageTitle>
            </InlineMessage>
          )}
          {!isMint && (
            <ManualIssuanceAction session={session} dispatch={dispatch} />
          )}
          <div
            data-testid="manual-zapper-alternative"
            className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 pb-6 pt-2"
          >
            <p className={cn(v1Typography.supporting, roles.text.supporting)}>
              {isMint ? (
                <>Want to buy with a single token?</>
              ) : (
                <>Having issues redeeming?</>
              )}
            </p>
            <InlineAction
              data-testid="manual-switch-zapper"
              className="ml-auto shrink-0"
              disabled={busy}
            >
              <>Switch to Zapper</>
            </InlineAction>
          </div>
        </div>
        {isMint && (
          <ManualMintStages
            currentStage={currentStage}
            session={session}
            dispatch={dispatch}
            onUnlimitedChange={onUnlimitedChange}
          />
        )}
      </div>
    </section>
  )
}
