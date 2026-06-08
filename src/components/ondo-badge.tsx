import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/utils'
import { OndoInfo, OndoMarket } from '@/utils/rebalance-liquidity'
import { msg } from '@lingui/core/macro'
import { Trans, useLingui } from '@lingui/react/macro'
import type { MessageDescriptor } from '@lingui/core'
import { CalendarClock } from 'lucide-react'

type OndoStatus = 'open' | 'limited' | 'closed'

// True when an Ondo asset is untradeable now or the leg is larger than the
// max single Ondo trade for the session — drives the aggregate warning.
export const ondoHasProblem = (ondo: OndoInfo): boolean =>
  !ondo.tradingOpen || !ondo.withinCapacity

const getStatus = (ondo: OndoInfo): OndoStatus => {
  if (!ondo.tradingOpen) return 'closed'
  if (!ondo.withinCapacity) return 'limited'
  // Upcoming events (earnings, dividends) are informational only — they're
  // listed in the tooltip but don't limit a trade that's open and within cap.
  return 'open'
}

const statusConfig: Record<
  OndoStatus,
  { label: MessageDescriptor; dot: string; pill: string; text: string }
> = {
  open: {
    label: msg`Tradeable`,
    dot: 'bg-green-500',
    pill: 'bg-green-500/10 text-green-600',
    text: 'text-green-600',
  },
  limited: {
    label: msg`Limited`,
    dot: 'bg-yellow-500',
    pill: 'bg-yellow-500/10 text-yellow-600',
    text: 'text-yellow-600',
  },
  closed: {
    label: msg`Market closed`,
    dot: 'bg-red-500',
    pill: 'bg-red-500/10 text-red-600',
    text: 'text-red-600',
  },
}

const formatTime = (iso: string | null): string => {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '—'
  }
}

// Ondo event/reason messages arrive as snake_case (earnings, cash_dividend,
// stock_split) — render them as words.
const humanizeEvent = (s?: string): string =>
  (s ?? '')
    .split('_')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')

const Row = ({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) => (
  <div className="flex items-center justify-between gap-2">
    <span className="text-muted-foreground">{label}</span>
    <span className="text-right">{children}</span>
  </div>
)

const OndoBadge = ({
  ondo,
  market,
  amountUsd,
}: {
  ondo: OndoInfo
  market: OndoMarket | null
  amountUsd: number
}) => {
  const { t } = useLingui()
  const config = statusConfig[getStatus(ondo)]

  return (
    <HoverCard openDelay={0} closeDelay={200}>
      <HoverCardTrigger asChild>
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium cursor-pointer',
            config.pill
          )}
        >
          <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} />
          Ondo
        </span>
      </HoverCardTrigger>
      <HoverCardContent className="w-[260px] rounded-3xl border-2 border-secondary p-3">
        <div className="flex flex-col gap-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold">{ondo.symbol}</span>
            <span className={cn('font-medium', config.text)}>
              {t(config.label)}
            </span>
          </div>

          {ondo.price !== undefined && (
            <Row label={t`Price`}>
              ${formatCurrency(ondo.price)}{' '}
              {ondo.ticker && (
                <span className="text-muted-foreground">({ondo.ticker})</span>
              )}
            </Row>
          )}

          {market && (
            <Row label={t`Market`}>
              <span className="capitalize">{market.session}</span>{' '}
              {market.isOpen ? t`open` : t`closed`}
            </Row>
          )}

          {market && !market.isOpen && market.nextOpen && (
            <Row label={t`Next open`}>{formatTime(market.nextOpen)}</Row>
          )}
          {market && market.isOpen && market.nextClose && (
            <Row label={t`Closes`}>{formatTime(market.nextClose)}</Row>
          )}

          {ondo.capacityUsd !== undefined && (
            <Row label={t`Max trade`}>
              <span className={cn(!ondo.withinCapacity && 'text-yellow-600')}>
                ${formatCurrency(ondo.capacityUsd)}
              </span>
            </Row>
          )}

          {!ondo.withinCapacity && !!ondo.capacityUsd && (
            <p className="text-yellow-600">
              <Trans>
                Larger than the max single trade — fills as ~
                {Math.ceil(amountUsd / ondo.capacityUsd)} sequential trades.
              </Trans>
            </p>
          )}

          {!ondo.tradingOpen && (
            <p className="text-red-600">
              {ondo.reason?.message
                ? t`Halted — ${humanizeEvent(ondo.reason.message)}`
                : t`Trading halted`}
            </p>
          )}

          {ondo.upcoming.length > 0 && (
            <div className="flex flex-col gap-0.5 border-t pt-1">
              {ondo.upcoming.map((u) => (
                <div
                  key={`${u.code ?? u.message ?? ''}-${u.start ?? ''}-${u.end ?? ''}`}
                  className="flex items-start gap-1 text-muted-foreground"
                >
                  <CalendarClock size={12} className="mt-0.5 shrink-0" />
                  <span>
                    {humanizeEvent(u.message) || u.code || t`Scheduled event`}
                    {u.start && ` — ${formatTime(u.start)}`}
                    {u.end && `–${formatTime(u.end)}`}
                  </span>
                </div>
              ))}
            </div>
          )}

          <p className="text-[10px] leading-tight text-muted-foreground">
            <Trans>
              Ondo tokenized equity. Max trade is the per-account single-trade
              size for the session (theoretical, repeatable) — not market depth.
            </Trans>
          </p>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}

export default OndoBadge
