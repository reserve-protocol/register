import TokenLogo from '@/components/token-logo'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { Token } from '@/types'
import { formatCurrency } from '@/utils'
import {
  AsyncZapExecutionStep,
  AsyncZapLeg,
  AsyncZapOrderState,
  fetchTokenPrices,
} from '@reserve-protocol/async-zap-sdk'
import { Trans, useLingui } from '@lingui/react/macro'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowRight, ArrowUpRight, Check, Loader, X } from 'lucide-react'
import { useMemo } from 'react'
import { Address, formatUnits } from 'viem'
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
  fillAnimationActive?: boolean
}

// A single basket leg, rendered the same whether it's a pre-submit quote or a
// live/finished order. The main row keeps the pay/receive amounts balanced,
// with status, price impact, and the CoW link grouped as secondary metadata.
const LegRow = ({
  leg,
  inputToken,
  chainId,
  executionStep,
  order,
  impact,
  loading,
  quoteError,
  fillAnimationActive,
}: LegRowProps) => {
  const { t } = useLingui()
  const sell = leg.side === 'sell'
  const negativeImpact = impact !== undefined && impact < 0
  const positiveImpact = impact !== undefined && impact > 0
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
      ? t`Filled`
      : orderFailed
        ? String(order.status) === 'expired'
          ? t`Expired`
          : String(order.status) === 'cancelled'
            ? t`Cancelled`
            : t`Failed`
        : signing
          ? t`Signing…`
          : t`Pending`
  const cowUrl = order?.orderUid
    ? `https://explorer.cow.fi/orders/${order.orderUid}`
    : undefined
  const quoteTokenUnits = Number(
    formatUnits(leg.quoteTokenAmount, inputToken.decimals)
  )
  const assetTokenUnits = Number(
    formatUnits(leg.assetAmount, leg.asset.decimals)
  )
  const quoteTokenAmount = `${formatCurrency(quoteTokenUnits)} ${
    inputToken.symbol
  }`
  const assetTokenAmount = `${formatTokenBalance(
    leg.assetAmount,
    leg.asset.decimals
  )} ${leg.asset.symbol}`
  const payAmount = sell ? assetTokenAmount : quoteTokenAmount
  const receiveAmount = sell ? quoteTokenAmount : assetTokenAmount
  const payToken = sell ? leg.asset : inputToken
  const receiveToken = sell ? inputToken : leg.asset
  const payUnits = sell ? assetTokenUnits : quoteTokenUnits
  const receiveUnits = sell ? quoteTokenUnits : assetTokenUnits
  const priceAddresses = useMemo(
    () => [payToken.address.toLowerCase(), receiveToken.address.toLowerCase()],
    [payToken.address, receiveToken.address]
  )
  const queryClient = useQueryClient()
  const { data: tokenPrices, isLoading: pricesLoading } = useQuery({
    queryKey: [
      'async-mint/leg-row-prices',
      chainId,
      [...priceAddresses].sort().join(','),
    ],
    queryFn: () =>
      fetchTokenPrices(
        queryClient,
        priceAddresses.map((address) => ({
          chainId,
          tokenAddress: address as Address,
        }))
      ),
    enabled: !loading && !quoteFailed,
    staleTime: 60_000,
  })
  const priceOf = (address: string) =>
    tokenPrices?.find(
      (price) => price.address.toLowerCase() === address.toLowerCase()
    )?.price
  const payUsd = payUnits * (priceOf(payToken.address) ?? 0)
  const receiveUsd = receiveUnits * (priceOf(receiveToken.address) ?? 0)

  return (
    <div
      className={cn(
        '-mx-2 rounded-[18px] border px-4 py-3',
        loading && 'border-border/70 bg-background',
        !loading && !failed && 'border-border/70 bg-background',
        failed && 'border-destructive/25 bg-destructive/5',
        fillAnimationActive &&
          'motion-safe:animate-[async-mint-order-filled_1800ms_ease-out]'
      )}
    >
      <div className="flex flex-col gap-2">
        {loading ? (
          <div className="grid grid-cols-2 items-center gap-4">
            <div className="flex items-center gap-3">
              <Skeleton className="size-8 rounded-full" />
              <div>
                <Skeleton className="mb-2 h-3 w-10" />
                <Skeleton className="h-5 w-24" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3">
              <div className="flex flex-col items-end">
                <Skeleton className="mb-2 h-3 w-14" />
                <Skeleton className="h-5 w-24" />
              </div>
              <Skeleton className="size-8 rounded-full" />
            </div>
          </div>
        ) : quoteFailed ? (
          <div className="flex items-center gap-3">
            <TokenLogo
              address={leg.asset.address}
              symbol={leg.asset.symbol}
              chain={chainId}
              size="xl"
            />
            <div>
              <div className="font-medium text-base truncate">
                {sell
                  ? t`Selling ${leg.asset.symbol}`
                  : t`Buying ${leg.asset.symbol}`}
              </div>
              <div className="text-sm text-destructive/70">
                {quoteError || t`Quote unavailable`}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <TokenLogo
                address={payToken.address}
                symbol={payToken.symbol}
                chain={chainId}
                size="xl"
              />
              <div className="flex min-w-0 flex-col gap-0.5">
                <div className="truncate text-base font-medium">
                  {payAmount}
                </div>
                {pricesLoading ? (
                  <Skeleton className="h-3 w-16" />
                ) : (
                  <div className="truncate text-sm font-light text-muted-foreground">
                    ${formatCurrency(payUsd)}
                  </div>
                )}
              </div>
            </div>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center text-muted-foreground">
              <ArrowRight size={18} strokeWidth={1.7} />
            </div>
            <div className="flex min-w-0 items-center justify-end gap-3 text-right">
              <div className="flex min-w-0 flex-col gap-0.5">
                <div className="truncate text-base font-medium">
                  ~{receiveAmount}
                </div>
                {pricesLoading ? (
                  <Skeleton className="ml-auto h-3 w-16" />
                ) : (
                  <div className="truncate text-sm font-light text-muted-foreground">
                    ~${formatCurrency(receiveUsd)}
                    {impact !== undefined && (
                      <span
                        className={cn(
                          'ml-1',
                          highImpact && 'text-destructive',
                          negativeImpact && !highImpact && 'text-destructive',
                          positiveImpact && 'text-primary',
                          !negativeImpact &&
                            !positiveImpact &&
                            'text-muted-foreground'
                        )}
                      >
                        ({formatPriceImpact(impact)})
                      </span>
                    )}
                  </div>
                )}
              </div>
              <TokenLogo
                address={receiveToken.address}
                symbol={receiveToken.symbol}
                chain={chainId}
                size="xl"
              />
            </div>
          </div>
        )}

        {!loading && !quoteFailed && order && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            <span
              className={cn(
                'inline-flex min-w-[72px] items-center justify-center gap-1 rounded-full px-2 py-0.5 font-medium',
                orderSettled && 'bg-primary/10 text-primary',
                orderFailed && 'bg-destructive/10 text-destructive',
                orderPending && 'bg-muted text-muted-foreground'
              )}
            >
              <span className="flex size-3 shrink-0 items-center justify-center">
                {orderSettled && (
                  <Check
                    size={12}
                    className={cn(
                      fillAnimationActive &&
                        'motion-safe:animate-[async-mint-check-pop_360ms_cubic-bezier(0.2,0.8,0.2,1)]'
                    )}
                  />
                )}
                {orderFailed && <X size={12} />}
                {orderPending && <Loader size={12} className="animate-spin" />}
              </span>
              {statusLabel}
            </span>
            {cowUrl && (
              <a
                href={cowUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-0.5 text-primary hover:underline"
              >
                <Trans>View on CoW Swap</Trans>
                <ArrowUpRight size={11} />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default LegRow
