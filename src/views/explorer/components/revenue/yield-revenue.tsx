import TokenLogoWithChain from '@/components/token-logo/TokenLogoWithChain'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { Plural, Trans, useLingui } from '@lingui/react/macro'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { formatCurrency, getTokenRoute } from 'utils'
import { ROUTES } from 'utils/constants'
import InactiveTag from '../kit/inactive-tag'
import LoadingBar from '../kit/loading-bar'
import Trades, { RunButton } from './trades'
import { type Revenue, type RevenueDetail } from './use-available-revenue'

const TradeCount = ({ data }: { data: RevenueDetail }) => {
  if (!data.n) {
    return (
      <span className="text-legend">
        <Trans>No trades</Trans>
      </span>
    )
  }

  return (
    <span className="text-legend">
      <Plural value={data.n} one="# trade" other="# trades" />
      {' · '}
      <span
        className={cn(data.outstandingTrades > 0 && 'font-semibold text-primary')}
      >
        <Trans>{data.outstandingTrades} available</Trans>
      </span>
    </span>
  )
}

const YieldRevenueRow = ({ data }: { data: RevenueDetail }) => {
  const { t } = useLingui()
  const [isOpen, setOpen] = useState(false)
  const hasAvailable = data.outstandingTrades > 0

  return (
    <li className="border-t border-border" data-testid="explorer-row">
      {/* WHY: a mouse shortcut only; the chevron button is the keyboard and screen-reader control. */}
      <div
        className="flex cursor-pointer items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/50 sm:px-6"
        onClick={() => setOpen(!isOpen)}
        data-testid="explorer-yield-row"
      >
        <TokenLogoWithChain
          symbol={data.symbol}
          address={data.address}
          chain={data.chain}
          src={data.logo}
          width={36}
          height={36}
        />
        <div className="flex min-w-0 flex-col sm:w-56 sm:shrink-0">
          <span className="flex min-w-0 flex-col items-start gap-0.5 sm:flex-row sm:items-center sm:gap-2">
            <a
              href={getTokenRoute(data.address, data.chain, ROUTES.AUCTIONS)}
              target="_blank"
              rel="noreferrer"
              onClick={(event) => event.stopPropagation()}
              className="max-w-full truncate text-[17px] font-semibold text-foreground hover:text-primary sm:text-base"
            >
              {data.symbol}
            </a>
            <InactiveTag address={data.address} />
          </span>
          <span className="text-[13px] sm:hidden">
            <TradeCount data={data} />
          </span>
        </div>
        <span className="hidden sm:block">
          <TradeCount data={data} />
        </span>
        <span
          className={cn(
            'ml-auto shrink-0 text-[17px] font-semibold tabular-nums sm:text-base',
            hasAvailable && 'text-primary'
          )}
        >
          ${formatCurrency(data.total)}
        </span>
        <RunButton
          rToken={data.address}
          chain={data.chain}
          emphasized={hasAvailable}
        />
        <button
          type="button"
          aria-expanded={isOpen}
          aria-label={
            isOpen ? t`Hide ${data.symbol} trades` : t`Show ${data.symbol} trades`
          }
          onClick={(event) => {
            event.stopPropagation()
            setOpen(!isOpen)
          }}
          className={cn(
            'flex h-11 w-9 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-muted sm:h-9',
            isOpen && 'bg-muted'
          )}
        >
          <ChevronDown
            size={16}
            className={cn('transition-transform', isOpen && 'rotate-180')}
            aria-hidden
          />
        </button>
      </div>
      {isOpen && (
        <div
          className="mx-3 mb-3 overflow-hidden rounded-2xl border border-border bg-card sm:mx-5 [&_li:first-child]:border-t-0 [&_thead_tr]:border-t-0 [&_thead_tr]:bg-muted [&>div:first-child]:border-t-0"
          data-testid="explorer-yield-trades"
        >
          <Trades trades={data.trades} nested />
        </div>
      )}
    </li>
  )
}

const YieldRevenue = ({ data }: { data: Revenue | undefined }) => {
  if (!data) {
    return (
      <>
        <LoadingBar active />
        <div className="flex flex-col gap-3 border-t border-border p-5">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-11 w-full" />
          ))}
        </div>
      </>
    )
  }

  return (
    <ul data-testid="explorer-list">
      {data.tokens.map((token) => (
        <YieldRevenueRow data={token} key={`${token.chain}-${token.address}`} />
      ))}
    </ul>
  )
}

export default YieldRevenue
