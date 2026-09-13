import { Button } from '@/components/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/design-system-v1/popover'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import { cn } from '@/lib/utils'
import { Fact } from './facts'
import type { Asset, DataState } from './fixtures'
import { usdFromCents } from './weights-model'

export function LiquidityDetail({
  token,
  chainId,
  data,
  warnings,
  marketClosed,
  amount,
  retried,
  onRetry,
}: {
  token: Asset
  chainId: number
  data: DataState
  warnings: boolean
  marketClosed: boolean
  amount: bigint
  retried: boolean
  onRetry: () => void
}) {
  const unknown = data !== 'ready'
  const failed = warnings && token.symbol === 'ETH' && !retried
  const low = warnings && token.symbol === 'XRP'
  const ondo = warnings && token.symbol === 'NVDAon'
  const label = unknown
    ? 'Unknown liquidity'
    : failed
      ? 'Zapper error'
      : ondo
        ? marketClosed
          ? 'Market closed'
          : 'Limited'
        : low
          ? 'Low liquidity'
          : 'High liquidity'
  return (
    <div className="flex flex-col items-end gap-x-2 [@container(min-width:32rem)]:flex-row [@container(min-width:32rem)]:flex-wrap [@container(min-width:32rem)]:items-center [@container(min-width:32rem)]:justify-end">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            tone="quiet"
            className={cn(
              type.supporting,
              'min-h-11 px-0',
              low || (ondo && marketClosed)
                ? 'text-destructive'
                : 'text-muted-foreground'
            )}
            aria-label={`${token.symbol} liquidity details`}
            data-testid={`current-liquidity-${token.symbol}`}
          >
            {label}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          className="w-80 space-y-3 overflow-y-auto p-4"
          aria-label={`${token.symbol} liquidity details`}
        >
          <p className={type.itemTitle}>
            {token.symbol} · {label}
          </p>
          {unknown ? (
            <p className={type.supporting}>
              Lab: no liquidity response is available.
            </p>
          ) : failed ? (
            <p className={type.supporting}>Zapper timeout</p>
          ) : ondo ? (
            <>
              <dl className="space-y-2">
                <Fact label="Price">$190 (NVDA)</Fact>
                <Fact label="Market">
                  {marketClosed ? 'Closed' : 'Regular open'}
                </Fact>
                <Fact label={marketClosed ? 'Next open' : 'Closes'}>
                  {marketClosed ? 'Sep 14, 13:30 UTC' : 'Sep 14, 20:00 UTC'}
                </Fact>
                <Fact label="Max trade">$50</Fact>
              </dl>
              <p className={type.supporting}>
                {marketClosed
                  ? 'Trading halted — Market closed'
                  : `Larger than the max single trade — fills as ~${(amount + 4999n) / 5000n} sequential trades.`}
              </p>
              <p className={cn(type.supporting, 'text-muted-foreground')}>
                Earnings — Sep 20, 13:30 UTC
              </p>
              <p className={cn(type.supporting, 'text-muted-foreground')}>
                Ondo tokenized equity. Max trade is the per-account single-trade
                size for the session (theoretical, repeatable) — not market
                depth.
              </p>
            </>
          ) : (
            <>
              <dl className="space-y-2">
                <Fact label="Trade value">{usdFromCents(amount)}</Fact>
                <Fact label="Price impact">{low ? '8.4%' : '0.3%'}</Fact>
                <Fact label="Counterpart">
                  {chainId === 56 ? 'WBNB' : 'WETH'}
                </Fact>
              </dl>
              <p className={cn(type.supporting, 'text-muted-foreground')}>
                Simulated route. Actual auction path may differ.
              </p>
            </>
          )}
          <p className={cn(type.supporting, 'text-muted-foreground')}>
            Lab: illustrative liquidity response.
          </p>
        </PopoverContent>
      </Popover>
      {!unknown && failed && (
        <Button
          tone="secondary"
          data-testid="current-leg-retry"
          onClick={onRetry}
        >
          Retry
        </Button>
      )}
    </div>
  )
}
