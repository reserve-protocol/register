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
  if (!asset.permission) return null
  const revoking = approval?.action === 'revoke'
  if (approval?.status === 'signing' || approval?.status === 'confirming') {
    return (
      <LifecycleStatusPill role="processing">
        {approval.status === 'confirming' ? (
          <>Confirming...</>
        ) : revoking ? (
          <>Revoking...</>
        ) : (
          <>Signing...</>
        )}
      </LifecycleStatusPill>
    )
  }
  if (asset.permission === 'approved')
    return (
      <LifecycleStatusPill role="success">
        <>Approved</>
      </LifecycleStatusPill>
    )
  const needsRevoke = asset.permission === 'revoke'
  const failed = approval?.status === 'error'
  const failureId = `manual-permission-failure-${asset.symbol}`
  return (
    <div className="flex items-center gap-4">
      {failed && (
        <span id={failureId} className="sr-only">
          <>Approval failed</>
        </span>
      )}
      {needsRevoke && (
        <HelpTooltip
          accessibleLabel={`This is a USDT token or a fork of USDT. You need to revoke the approval before you can approve it.`}
          content={
            <>
              This is a USDT token or a fork of USDT. You need to revoke the
              approval before you can approve it.
            </>
          }
        />
      )}
      {needsRevoke ? (
        <InlineAction
          data-testid="manual-permission-action"
          className="gap-2 text-foreground hover:text-primary"
          disabled={disabled}
          aria-describedby={failed ? failureId : undefined}
          aria-label={`Revoke ${asset.symbol}`}
          onClick={onAction}
        >
          {failed && (
            <CircleAlert
              aria-hidden="true"
              className="size-3.5 text-destructive"
            />
          )}
          <>Revoke</>
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
              ? `Retry ${asset.symbol}`
              : `Approve ${asset.symbol}`
          }
        >
          {approval?.status === 'error' ? <>Retry</> : <>Approve</>}
        </Button>
      )}
    </div>
  )
}
