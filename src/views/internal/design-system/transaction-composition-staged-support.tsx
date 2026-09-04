import { ArrowRight, ArrowUpRight } from 'lucide-react'
import type { MessageDescriptor } from '@lingui/core'
import { msg } from '@lingui/core/macro'
import { Trans, useLingui } from '@lingui/react/macro'
import type { ReactNode } from 'react'

import { Button } from '@/components/button'
import { CopyableValue } from '@/components/design-system-v1/copyable-value'
import { Link } from '@/components/design-system-v1/link'
import { v1Typography } from '@/components/design-system-v1/typography'
import {
  LifecycleStatusPill,
  type LifecycleStatusRole,
} from '@/components/lifecycle-status'
import { v1SemanticRecipes as roles } from '@/components/ui/v1-semantic-recipes'
import { cn } from '@/lib/utils'
import { ChainId } from '@/utils/chains'

import type {
  AutomatedIssuanceChain,
  AutomatedIssuanceOperation,
  AutomatedMintOrderFixture,
  AutomatedMintOrderStatus,
} from './transaction-composition-staged-fixtures'
import {
  FINAL_MINT_TRANSACTION,
  FINAL_REDEEM_TRANSACTION,
  formatFixtureAmount,
} from './transaction-composition-staged-fixtures'
import { TransactionOutcomeDetailRow } from './transaction-outcome-detail-row'
import { TransactionAssetLogo } from './transaction-system-assets'

const ORDER_STATUS_ROLES: Record<
  AutomatedMintOrderStatus,
  LifecycleStatusRole
> = {
  'Quote ready': 'actionable',
  Prepared: 'waiting',
  Pending: 'processing',
  Filled: 'success',
  Failed: 'unsuccessful',
  Expired: 'unsuccessful',
  Cancelled: 'unsuccessful',
  'Quote unavailable': 'unsuccessful',
}

const ORDER_STATUS_LABELS: Record<AutomatedMintOrderStatus, MessageDescriptor> =
  {
    'Quote ready': msg`Quote ready`,
    Prepared: msg`Prepared`,
    Pending: msg`Pending`,
    Filled: msg`Filled`,
    Failed: msg`Failed`,
    Expired: msg`Expired`,
    Cancelled: msg`Cancelled`,
    'Quote unavailable': msg`Quote unavailable`,
  }

export const StagedOrderRow = ({
  chain,
  order,
}: {
  chain: AutomatedIssuanceChain
  order: AutomatedMintOrderFixture
}) => {
  const { t } = useLingui()
  const quoteUnavailable = order.status === 'Quote unavailable'
  const showsOrderMetadata =
    !quoteUnavailable && (order.status !== 'Quote ready' || order.orderId)

  return (
    <article
      data-order-asset={order.asset}
      data-order-status={order.status}
      data-testid="staged-order-row"
      className="bg-transparent px-4 py-2"
    >
      {quoteUnavailable ? (
        <div className="flex min-h-16 items-center gap-3">
          <TransactionAssetLogo
            chain={chain}
            size="xl"
            symbol={order.bought.symbol}
          />
          <div className="min-w-0">
            <p className={v1Typography.label}>
              <Trans>Buying {order.bought.symbol}</Trans>
            </p>
            <p className={cn(v1Typography.supporting, 'text-destructive')}>
              <Trans>Quote unavailable</Trans>
            </p>
          </div>
        </div>
      ) : (
        <div
          data-testid="staged-order-direction"
          className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3"
        >
          <div
            data-testid="staged-order-sell"
            className="flex min-w-0 items-center gap-3"
          >
            <TransactionAssetLogo
              chain={chain}
              size="xl"
              symbol={order.sold.symbol}
            />
            <OrderAmount
              label={
                order.boughtIsEstimate ? (
                  <Trans>Sell quote</Trans>
                ) : (
                  <Trans>Sold</Trans>
                )
              }
              value={formatFixtureAmount(order.sold)}
            />
          </div>
          <span className="flex size-8 items-center justify-center text-muted-foreground">
            <ArrowRight aria-hidden="true" className="size-4" />
          </span>
          <div
            data-testid="staged-order-buy"
            className="flex min-w-0 items-center justify-end gap-3 text-right"
          >
            <OrderAmount
              align="right"
              label={
                order.boughtIsEstimate ? (
                  <Trans>Buy quote</Trans>
                ) : (
                  <Trans>Bought</Trans>
                )
              }
              value={`${order.boughtIsEstimate ? '~' : ''}${formatFixtureAmount(
                order.bought
              )}`}
            />
            <TransactionAssetLogo
              chain={chain}
              size="xl"
              symbol={order.bought.symbol}
            />
          </div>
        </div>
      )}
      {showsOrderMetadata && (
        <div
          data-testid="staged-order-metadata"
          className="mt-3 flex flex-wrap items-center gap-3"
        >
          <LifecycleStatusPill role={ORDER_STATUS_ROLES[order.status]}>
            {t(ORDER_STATUS_LABELS[order.status])}
          </LifecycleStatusPill>
          {order.orderId && (
            <div
              data-testid="staged-order-inspection"
              className="ml-auto flex flex-wrap items-center justify-end gap-3"
            >
              <CopyableValue
                value={order.orderId}
                visibleValue={`${order.orderId.slice(0, 6)}…${order.orderId.slice(-4)}`}
                treatment="inline"
                tone="neutral"
              />
              <Button
                asChild
                size="micro"
                tone="secondary"
                trailingIcon={<ArrowUpRight aria-hidden="true" />}
              >
                <a
                  href={`https://explorer.cow.fi/orders/${order.orderId}`}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Trans>View order</Trans>
                  <span className="sr-only">
                    {t`Opens CoW Explorer in a new tab`}
                  </span>
                </a>
              </Button>
            </div>
          )}
        </div>
      )}
    </article>
  )
}

const OrderAmount = ({
  align = 'left',
  label,
  value,
}: {
  align?: 'left' | 'right'
  label: ReactNode
  value: string
}) => (
  <div className={cn('min-w-0', align === 'right' && 'text-right')}>
    <p className={cn(v1Typography.supporting, roles.text.supporting)}>
      {label}
    </p>
    <p className={cn(v1Typography.label, 'mt-0.5 tabular-nums')}>{value}</p>
  </div>
)

export const AutomatedMintIdentity = ({
  chain,
  operation,
}: {
  chain: AutomatedIssuanceChain
  operation: AutomatedIssuanceOperation
}) => {
  const { t } = useLingui()
  const transaction =
    operation === 'mint' ? FINAL_MINT_TRANSACTION : FINAL_REDEEM_TRANSACTION

  return (
    <TransactionOutcomeDetailRow
      testId="automated-mint-final-transaction"
      label={
        operation === 'mint' ? (
          <Trans>Final mint transaction</Trans>
        ) : (
          <Trans>Final redeem transaction</Trans>
        )
      }
      value={
        <span className="flex flex-wrap items-center justify-end gap-2">
          <CopyableValue
            treatment="inline"
            tone="neutral"
            value={transaction}
            visibleValue={operation === 'mint' ? '0x4B99…01AE' : '0x7195…EF2D'}
          />
          <Link
            external
            externalAnnouncement={
              chain === ChainId.BSC
                ? t`Opens BscScan in a new tab`
                : t`Opens Basescan in a new tab`
            }
            href={`https://${chain === ChainId.BSC ? 'bscscan.com' : 'basescan.org'}/tx/${transaction}`}
            treatment="standalone"
          >
            <Trans>View transaction</Trans>
          </Link>
        </span>
      }
    />
  )
}
