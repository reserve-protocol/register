import { type ReactNode } from 'react'
import { Trans, useLingui } from '@lingui/react/macro'
import { ArrowRight, PauseCircle } from 'lucide-react'

import { Skeleton } from '@/components/design-system-v1/loading'
import { candidateSemanticRoles as semanticRoles } from '@/components/design-system-v1/semantic-roles'
import { v1Typography } from '@/components/design-system-v1/typography'
import { v1SemanticRecipes as roles } from '@/components/ui/v1-semantic-recipes'
import { cn } from '@/lib/utils'

import type {
  AutomatedIssuanceChain,
  AutomatedIssuanceOperation,
  FixtureAmount,
  AutomatedMintReviewState,
} from './transaction-composition-staged-fixtures'
import { ordersForState } from './transaction-composition-staged-fixtures'
import { StagedOrderRow } from './transaction-composition-staged-support'

export const AutomatedMintOrdersPanel = ({
  chain,
  inputAmount,
  operation,
  state,
  useExistingCollateral,
}: {
  chain: AutomatedIssuanceChain
  inputAmount: FixtureAmount
  operation: AutomatedIssuanceOperation
  state: AutomatedMintReviewState
  useExistingCollateral: boolean
}) => {
  const orders = ordersForState(
    state,
    useExistingCollateral,
    inputAmount,
    operation,
    chain
  )
  return (
    <section
      className={cn(
        'flex h-full min-w-0 flex-col overflow-hidden',
        semanticRoles.surface.recessedContent
      )}
      data-testid="automated-mint-orders"
    >
      <div
        data-testid="automated-mint-orders-scroll"
        className="min-h-0 flex-1 overflow-y-auto px-2 [overflow-anchor:none]"
      >
        <section aria-labelledby="automated-mint-orders-title">
          <header
            data-testid="staged-orders-header"
            className="flex flex-col items-start justify-between gap-2 p-4 sm:flex-row sm:gap-4"
          >
            <div>
              <h5
                id="automated-mint-orders-title"
                className={v1Typography.itemTitle}
              >
                {state === 'Mint complete' || state === 'Redeem complete' ? (
                  <Trans>Completed orders</Trans>
                ) : (
                  <Trans>Collateral swaps</Trans>
                )}
              </h5>
              <p className={cn(v1Typography.supporting, roles.text.supporting)}>
                {getOrdersDescription(state, operation)}
              </p>
            </div>
          </header>

          <div data-testid="staged-orders-list">
            {state === 'Quote searching' ? (
              <QuoteSearchRows />
            ) : state === 'Quote paused' ? (
              <EmptyOrders
                icon={<PauseCircle aria-hidden="true" className="size-7" />}
                title={<Trans>Quote search paused</Trans>}
                detail={
                  operation === 'mint' ? (
                    <Trans>
                      Resume the search to load the swap orders for this mint.
                    </Trans>
                  ) : (
                    <Trans>
                      Resume the search to load the swap orders for this redeem.
                    </Trans>
                  )
                }
              />
            ) : state === 'Quote unavailable' ? (
              <EmptyOrders
                title={<Trans>Quote unavailable</Trans>}
                detail={<Trans>Some quotes couldn't be fetched.</Trans>}
                tone="danger"
              />
            ) : state === 'No swaps needed' ? (
              <EmptyOrders
                title={<Trans>No swaps needed</Trans>}
                detail={<Trans>You can proceed directly.</Trans>}
              />
            ) : (
              orders.map((order, index) => (
                <StagedOrderRow
                  chain={chain}
                  key={`${order.asset}-${index}`}
                  order={order}
                />
              ))
            )}
          </div>
        </section>
      </div>
    </section>
  )
}

const QuoteSearchRows = () => {
  const { t } = useLingui()

  return (
    <div aria-label={t`Fetching swap quotes`}>
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 bg-transparent px-4 py-2"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="size-8 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <span className="flex size-8 items-center justify-center text-muted-foreground">
            <ArrowRight aria-hidden="true" className="size-4" />
          </span>
          <div className="flex items-center justify-end gap-3">
            <div className="space-y-2">
              <Skeleton className="ml-auto h-3 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="size-8 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

const EmptyOrders = ({
  detail,
  icon,
  title,
  tone = 'default',
}: {
  detail: ReactNode
  icon?: ReactNode
  title: ReactNode
  tone?: 'default' | 'danger'
}) => (
  <div className="flex min-h-72 items-center justify-center bg-transparent px-4 py-10 text-center">
    <div className="flex max-w-80 flex-col items-center gap-2">
      {icon && <span className={roles.text.supporting}>{icon}</span>}
      <h6
        className={cn(
          v1Typography.itemTitle,
          tone === 'danger' && 'text-destructive'
        )}
      >
        {title}
      </h6>
      <p className={cn(v1Typography.supporting, roles.text.supporting)}>
        {detail}
      </p>
    </div>
  </div>
)

const getOrdersDescription = (
  state: AutomatedMintReviewState,
  operation: AutomatedIssuanceOperation
) => {
  if (state === 'Quote searching') {
    return operation === 'mint' ? (
      <Trans>Your input will be split across these basket assets.</Trans>
    ) : (
      <Trans>These basket assets will be sold for your output.</Trans>
    )
  }
  if (state === 'Quote paused') return <Trans>Fetching paused.</Trans>
  if (state === 'Quote unavailable') {
    return <Trans>Some quotes couldn't be fetched.</Trans>
  }
  if (state === 'No swaps needed') {
    return <Trans>All required collateral is already available.</Trans>
  }
  if (state === 'Mint complete' || state === 'Redeem complete') {
    return operation === 'mint' ? (
      <Trans>Collateral swaps for this mint.</Trans>
    ) : (
      <Trans>Collateral swaps for this redeem.</Trans>
    )
  }
  if (
    state === 'Authorizing orders' ||
    state === 'Orders filling' ||
    state === 'Recoverable failure' ||
    state === 'Collateral ready' ||
    state === 'Final mint signing'
  ) {
    return <Trans>Swaps settle via CoW Protocol solvers.</Trans>
  }
  return operation === 'mint' ? (
    <Trans>Your input will be split across these basket assets.</Trans>
  ) : (
    <Trans>These basket assets will be sold for your output.</Trans>
  )
}
