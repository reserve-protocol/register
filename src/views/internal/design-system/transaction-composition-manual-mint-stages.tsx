import { Trans, useLingui } from '@lingui/react/macro'
import { Check } from 'lucide-react'
import { HelpTooltip } from '@/components/design-system-v1/help-tooltip'
import { TransactionAmountObject } from '@/components/design-system-v1/transaction-amount-object'
import { v1Typography } from '@/components/design-system-v1/typography'
import { cn } from '@/lib/utils'
import { ChainId } from '@/utils/chains'
import { ManualApprovalSetting } from './transaction-composition-manual-approval-setting'
import { ManualIssuanceAction } from './transaction-composition-manual-action'
import {
  isManualAmountPositive,
  manualAmountExceedsBalance,
} from './transaction-composition-manual-fixtures'
import {
  manualSessionAssets,
  type ManualEvent,
  type ManualSession,
} from './transaction-composition-manual-lifecycle'
import { TransactionStageBoundary } from './transaction-stage-boundary'
import { transactionStageAmountClasses } from './transaction-stage-emphasis'
import { TransactionAssetMark } from './transaction-system-assets'

export const ManualMintStages = ({
  currentStage,
  session,
  dispatch,
  onUnlimitedChange,
}: {
  currentStage: 'amount' | 'approvals' | 'mint'
  session: ManualSession
  dispatch: (event: ManualEvent) => void
  onUnlimitedChange: (value: boolean) => void
}) => {
  const { t } = useLingui()
  const assets = manualSessionAssets(session)
  const approved = assets.filter(
    (asset) => asset.permission === 'approved'
  ).length
  const total = assets.length
  const canShowReadiness =
    session.gate === 'ready' && isManualAmountPositive(session.amount)
  const approvalsReady = canShowReadiness && approved === total
  const approvalsActive = Object.values(session.approvals).some((approval) =>
    ['signing', 'confirming'].includes(approval.status)
  )
  const approvalStatus = canShowReadiness
    ? t`${approved} of ${total} tokens approved`
    : t`Token approvals`
  const mintSummary = ['signing', 'confirming'].includes(session.transaction)
    ? t`Mint in progress`
    : !canShowReadiness ||
        manualAmountExceedsBalance(session.amount, session.operation)
      ? t`Mint CMC20`
      : !approvalsReady ||
          approvalsActive ||
          Object.values(session.approvals).some((a) => a.status === 'error')
        ? t`Approvals needed`
        : t`Ready to mint`

  return (
    <div className="-mx-2 flex flex-col">
      <TransactionStageBoundary testId="manual-mint-stage-boundary" />
      <section
        data-testid="manual-approvals-section"
        aria-label={t`Token approvals`}
        aria-current={currentStage === 'approvals' ? 'step' : undefined}
        className={cn('bg-card p-2', !approvalsReady && 'pb-6')}
      >
        <div
          data-testid={
            approvalsReady
              ? 'manual-approval-readiness'
              : 'manual-approval-progress'
          }
          role="status"
          aria-label={approvalStatus}
        >
          <TransactionAmountObject
            label={t`Token approvals`}
            amount={canShowReadiness ? t`${approved} of ${total}` : '—'}
            readOnly
            presentation="output"
            className={
              transactionStageAmountClasses[
                currentStage === 'approvals'
                  ? 'current'
                  : approvalsReady
                    ? 'neutral'
                    : 'upcoming'
              ]
            }
            supporting={
              <span
                className={cn(
                  'inline-flex items-center gap-2',
                  approvalsReady && 'text-foreground'
                )}
              >
                {approvalsReady ? (
                  <>
                    <Check
                      aria-hidden="true"
                      className="size-4 shrink-0 text-feedback-success-foreground"
                    />
                    <Trans>Required tokens approved</Trans>
                  </>
                ) : (
                  <>
                    <span
                      data-testid={
                        approvalsActive
                          ? 'manual-task-processing-context'
                          : undefined
                      }
                    >
                      <Trans>Tokens approved</Trans>
                    </span>
                    <HelpTooltip
                      accessibleLabel={t`About token approvals`}
                      content={
                        <Trans>
                          Approve All starts a separate transaction for each
                          token. You can also approve tokens individually.
                        </Trans>
                      }
                    />
                  </>
                )}
              </span>
            }
          />
        </div>
        {!approvalsReady && (
          <div className="pt-2">
            <ManualApprovalSetting
              session={session}
              onChange={onUnlimitedChange}
            >
              <ManualIssuanceAction
                session={session}
                dispatch={dispatch}
                stage="approvals"
              />
            </ManualApprovalSetting>
          </div>
        )}
      </section>
      <TransactionStageBoundary testId="manual-mint-stage-boundary" />
      <section
        data-testid="manual-mint-section"
        aria-label={t`Mint`}
        aria-current={currentStage === 'mint' ? 'step' : undefined}
        className="bg-card p-2"
      >
        <div
          data-testid="manual-mint-summary"
          className={cn('p-4', session.transaction === 'error' && 'pb-2')}
        >
          <h3
            className={cn(
              v1Typography.body,
              currentStage === 'mint' ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <Trans>Mint</Trans>
          </h3>
          <div className="mt-0.5 flex min-h-10 items-center gap-3">
            <p
              data-testid="manual-mint-summary-status"
              role="status"
              className={cn(
                'min-w-0 flex-1 text-[22px] font-light leading-7 min-[360px]:text-[28px] min-[360px]:leading-8 sm:text-[32px] sm:leading-[38px]',
                currentStage === 'mint' ? 'text-primary' : 'text-foreground'
              )}
            >
              {mintSummary}
            </p>
            <TransactionAssetMark chain={ChainId.Mainnet} symbol="CMC20" />
          </div>
          <p
            data-testid="manual-mint-summary-description"
            className={cn(
              'mt-1 text-muted-foreground',
              v1Typography.supporting
            )}
          >
            <Trans>Your basket tokens will be exchanged for CMC20.</Trans>
          </p>
        </div>
        <div className="pt-2">
          <ManualIssuanceAction
            session={session}
            dispatch={dispatch}
            stage="transaction"
          />
        </div>
      </section>
    </div>
  )
}
