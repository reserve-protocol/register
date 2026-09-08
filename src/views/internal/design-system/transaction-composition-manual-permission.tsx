import { Trans, useLingui } from '@lingui/react/macro'
import { Button, InlineAction } from '@/components/button'
import { HelpTooltip } from '@/components/design-system-v1/help-tooltip'
import { LifecycleStatusPill } from '@/components/lifecycle-status'
import { CircleAlert } from 'lucide-react'
import type { ManualAssetFixture } from './transaction-composition-manual-fixtures'
import type { ManualApproval } from './transaction-composition-manual-lifecycle'

export const ManualPermission = ({
  asset,
  approval,
  disabled,
  onAction,
}: {
  asset: ManualAssetFixture
  approval?: ManualApproval
  disabled: boolean
  onAction: () => void
}) => {
  const { t } = useLingui()
  if (!asset.permission) return null
  const revoking = approval?.action === 'revoke'
  if (approval?.status === 'signing' || approval?.status === 'confirming') {
    return (
      <LifecycleStatusPill role="processing">
        {approval.status === 'confirming' ? (
          <Trans>Confirming...</Trans>
        ) : revoking ? (
          <Trans>Revoking...</Trans>
        ) : (
          <Trans>Signing...</Trans>
        )}
      </LifecycleStatusPill>
    )
  }
  if (asset.permission === 'approved')
    return (
      <LifecycleStatusPill role="success">
        <Trans>Approved</Trans>
      </LifecycleStatusPill>
    )
  const needsRevoke = asset.permission === 'revoke'
  const failed = approval?.status === 'error'
  const failureId = `manual-permission-failure-${asset.symbol}`
  return (
    <div className="flex items-center gap-4">
      {failed && (
        <span id={failureId} className="sr-only">
          <Trans>Approval failed</Trans>
        </span>
      )}
      {needsRevoke && (
        <HelpTooltip
          accessibleLabel={t`This is a USDT token or a fork of USDT. You need to revoke the approval before you can approve it.`}
          content={
            <Trans>
              This is a USDT token or a fork of USDT. You need to revoke the
              approval before you can approve it.
            </Trans>
          }
        />
      )}
      {needsRevoke ? (
        <InlineAction
          data-testid="manual-permission-action"
          className="gap-2 text-foreground hover:text-primary"
          disabled={disabled}
          aria-describedby={failed ? failureId : undefined}
          aria-label={t`Revoke ${asset.symbol}`}
          onClick={onAction}
        >
          {failed && (
            <CircleAlert
              aria-hidden="true"
              className="size-3.5 text-destructive"
            />
          )}
          <Trans>Revoke</Trans>
        </InlineAction>
      ) : (
        <Button
          data-testid="manual-permission-action"
          size="micro"
          tone="quiet"
          disabled={disabled}
          aria-describedby={failed ? failureId : undefined}
          leadingIcon={
            failed ? <CircleAlert className="text-destructive" /> : undefined
          }
          className={
            !disabled
              ? 'bg-primary/10 text-primary hover:bg-primary/20 active:bg-primary/25'
              : undefined
          }
          onClick={onAction}
          aria-label={
            approval?.status === 'error'
              ? t`Retry ${asset.symbol}`
              : t`Approve ${asset.symbol}`
          }
        >
          {approval?.status === 'error' ? (
            <Trans>Retry</Trans>
          ) : (
            <Trans>Approve</Trans>
          )}
        </Button>
      )}
    </div>
  )
}
