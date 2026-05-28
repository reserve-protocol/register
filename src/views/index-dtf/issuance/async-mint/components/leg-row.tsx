import TokenLogoWithChain from '@/components/token-logo/TokenLogoWithChain'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { Token } from '@/types'
import { formatCurrency } from '@/utils'
import {
  AsyncZapExecutionStep,
  AsyncZapLeg,
  AsyncZapOrderState,
} from '@reserve-protocol/async-zap-sdk'
import { ArrowUpRight, Check, Loader, X } from 'lucide-react'
import { formatUnits } from 'viem'
import {
  formatPriceImpact,
  formatTokenBalance,
  HIGH_PRICE_IMPACT,
} from '../quote-utils'

type LegRowProps = {
  leg: AsyncZapLeg
  inputToken: Token
  chainId: number
  executionStep: AsyncZapExecutionStep
  order?: AsyncZapOrderState
  impact?: number
  // Quote still resolving (show skeletons) / quote errored (no amounts).
  loading?: boolean
  quoteError?: string
}

// A single basket leg, rendered the same whether it's a pre-submit quote or a
// live/finished order. Once an order exists the subtitle becomes a status pill
// (Signing / Pending / Filled / Failed) with a "View on CoW Swap" link beneath.
const LegRow = ({
  leg,
  inputToken,
  chainId,
  executionStep,
  order,
  impact,
  loading,
  quoteError,
}: LegRowProps) => {
  const sell = leg.side === 'sell'
  const highImpact = impact !== undefined && impact < -HIGH_PRICE_IMPACT

  const orderSettled = order?.phase === 'fulfilled'
  const orderFailed = order?.phase === 'failed'
  const orderPending = !!order && !orderSettled && !orderFailed
  const quoteFailed = !!quoteError
  const failed = quoteFailed || orderFailed

  const signing =
    orderPending &&
    (executionStep === 'submitting_and_signing' ||
      executionStep === 'waiting_submit_and_sign' ||
      order?.phase === 'submitting' ||
      order?.phase === 'signing')
  const statusLabel = !order
    ? undefined
    : orderSettled
      ? 'Filled'
      : orderFailed
        ? String(order.status) === 'expired'
          ? 'Expired'
          : String(order.status) === 'cancelled'
            ? 'Cancelled'
            : 'Failed'
        : signing
          ? 'Signing…'
          : 'Pending'
  const cowUrl = order?.orderUid
    ? `https://explorer.cow.fi/orders/${order.orderUid}`
    : undefined

  return (
    <div
      className={cn(
        '-mx-2 rounded-[18px] border px-4 py-3 transition-colors',
        loading && 'border-border/70 bg-background',
        !loading && !failed && 'border-primary/35 bg-primary/5',
        failed && 'border-destructive/25 bg-destructive/5'
      )}
    >
      <div className="flex items-center gap-4">
        <TokenLogoWithChain
          address={leg.asset.address}
          symbol={leg.asset.symbol}
          chain={chainId}
          size="xl"
        />
        <div className="min-w-0 flex-1">
          <div className="font-medium text-base truncate">{leg.asset.name}</div>
          {order ? (
            <div className="mt-1 flex flex-col items-start gap-1">
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                  orderSettled && 'bg-primary/10 text-primary',
                  orderFailed && 'bg-destructive/10 text-destructive',
                  orderPending && 'bg-muted text-muted-foreground'
                )}
              >
                {orderSettled && <Check size={12} />}
                {orderFailed && <X size={12} />}
                {orderPending && <Loader size={12} className="animate-spin" />}
                {statusLabel}
              </span>
              {cowUrl && (
                <a
                  href={cowUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-0.5 text-xs text-primary hover:underline"
                >
                  View on CoW Swap
                  <ArrowUpRight size={11} />
                </a>
              )}
            </div>
          ) : (
            <div
              className={cn(
                'text-sm font-light truncate',
                failed ? 'text-destructive/70' : 'text-muted-foreground'
              )}
            >
              {loading
                ? `Fetching ${leg.asset.symbol} quote…`
                : quoteFailed
                  ? quoteError || 'Quote unavailable'
                  : sell
                    ? `Selling ${leg.asset.symbol} for ${inputToken.symbol}`
                    : `Buying ${leg.asset.symbol} with ${inputToken.symbol}`}
            </div>
          )}
        </div>
        <div className="min-w-[156px] text-right">
          {loading ? (
            <div className="flex flex-col items-end gap-1.5">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          ) : quoteFailed ? (
            <div className="text-sm text-destructive/70">—</div>
          ) : (
            <>
              <div className="text-base font-medium">
                {sell ? '+' : '-'}
                {formatCurrency(
                  Number(formatUnits(leg.quoteTokenAmount, inputToken.decimals))
                )}{' '}
                {inputToken.symbol}
              </div>
              <div className="text-sm text-muted-foreground font-light">
                {sell ? '-' : '+'}
                {formatTokenBalance(leg.assetAmount, leg.asset.decimals)}{' '}
                {leg.asset.symbol}
              </div>
              {impact !== undefined && (
                <div
                  className={cn(
                    'text-xs font-light mt-0.5',
                    highImpact ? 'text-destructive' : 'text-muted-foreground'
                  )}
                >
                  Price impact: {formatPriceImpact(impact)}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default LegRow
