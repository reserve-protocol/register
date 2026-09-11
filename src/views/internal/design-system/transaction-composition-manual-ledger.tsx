import { v1SemanticRoles as semanticRoles } from '@/components/design-system-v1/semantic-roles'
import { v1Typography } from '@/components/design-system-v1/typography'
import { cn } from '@/lib/utils'
import { Trans } from '@lingui/react/macro'

import {
  manualBasketValueForAmount,
  type ManualIssuanceOperation,
} from './transaction-composition-manual-fixtures'
import { ManualAssetRow } from './transaction-composition-manual-asset-row'
import { Skeleton } from '@/components/design-system-v1/loading'
import {
  manualIsBusy,
  manualIsBlocked,
  manualSessionAssets,
  type ManualSession,
  type ManualEvent,
} from './transaction-composition-manual-lifecycle'

export const ManualIssuanceLedger = ({
  amount,
  operation,
  session,
  dispatch,
}: {
  amount: string
  operation: ManualIssuanceOperation
  session: ManualSession
  dispatch: (event: ManualEvent) => void
}) => {
  const unknownWallet = session.gate === 'disconnected'
  const assets = manualSessionAssets(session).map((asset) =>
    unknownWallet
      ? { ...asset, balance: '—', permission: null, isInsufficient: false }
      : asset
  )
  const basketValue = manualBasketValueForAmount(amount)
  const basketTotal = basketValue ?? '—'
  const outcome = session.transaction === 'success'
  const isMint = operation === 'mint' && !outcome
  const approveCount = assets.filter(
    (asset) => asset.permission === 'approve'
  ).length
  const revokeCount = assets.filter(
    (asset) => asset.permission === 'revoke'
  ).length
  const hasAmount = assets.some((asset) => asset.permission !== null)

  return (
    <section
      data-testid="manual-issuance-ledger"
      className={cn(
        'flex min-h-full min-w-0 flex-col lg:min-h-0 lg:overflow-y-auto',
        semanticRoles.surface.recessedContent
      )}
      aria-labelledby="manual-issuance-ledger-title"
    >
      <header className="shrink-0 px-6 pb-2 pt-6">
        <h5
          id="manual-issuance-ledger-title"
          className={v1Typography.itemTitle}
        >
          {isMint ? (
            'Required Approvals'
          ) : outcome ? (
            operation === 'mint' ? (
              <Trans>Basket assets used</Trans>
            ) : (
              <Trans>Basket assets received</Trans>
            )
          ) : (
            'You will receive'
          )}
        </h5>
        <p
          className={cn(v1Typography.supporting, semanticRoles.text.supporting)}
        >
          {session.gate === 'loading' ? (
            '—'
          ) : isMint ? (
            hasAmount ? (
              approveCount + revokeCount === 0 ? (
                'Approved'
              ) : (
                `${approveCount} approvals and ${revokeCount} revoke required`
              )
            ) : (
              '—'
            )
          ) : outcome ? (
            <Trans>Estimated amounts · {basketTotal} total</Trans>
          ) : (
            `${basketValue ?? '—'} estimated basket value`
          )}
        </p>
      </header>
      <div
        data-testid="transaction-requirements-list"
        className="mx-2 mb-2 shrink-0 py-1"
        aria-busy={session.gate === 'loading'}
      >
        {session.gate === 'loading'
          ? Array.from({ length: 5 }, (_, index) => (
              <div
                key={index}
                className="px-4 py-3 [container-type:inline-size]"
                data-testid="manual-asset-skeleton"
              >
                <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 [@container(max-width:20rem)]:grid-cols-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <Skeleton className="size-8 shrink-0 rounded-full" />
                    <Skeleton className="h-11 min-w-0 flex-1" />
                  </div>
                  <div className="flex min-h-7 items-center justify-end">
                    <Skeleton className="h-7 w-20 rounded-full" />
                  </div>
                </div>
                {isMint && (
                  <div className="mt-2 flex justify-between gap-4">
                    <Skeleton className="h-11 w-24" />
                    <Skeleton className="h-11 w-24" />
                  </div>
                )}
              </div>
            ))
          : assets.map((asset) => (
              <ManualAssetRow
                key={asset.address}
                asset={asset}
                operation={outcome ? 'redeem' : operation}
                approval={session.approvals[asset.symbol]}
                disabled={manualIsBusy(session) || manualIsBlocked(session)}
                onAction={() =>
                  dispatch({ type: 'token', symbol: asset.symbol })
                }
              />
            ))}
      </div>
    </section>
  )
}
