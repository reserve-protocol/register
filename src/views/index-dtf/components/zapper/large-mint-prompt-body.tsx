import { cn } from '@/lib/utils'
import { Trans, useLingui } from '@lingui/react/macro'
import {
  Ban,
  Clock,
  TrendingDown,
  TriangleAlert,
  X,
  type LucideIcon,
} from 'lucide-react'
import type { ReactNode } from 'react'
import type { MintPromptVariant } from './large-mint-prompt-state'

export type PromptVariant = Exclude<MintPromptVariant, null>

type LargeMintCardBodyProps = {
  variant: PromptVariant
  tab: 'buy' | 'sell'
  symbol: string
  // "$200,000" — capacity variant only.
  maxAmountLabel: string
  // "regular" — capacity variant only.
  sessionLabel: string
  // "Jul 6, 12:05 AM" — closed variants while the market is closed.
  nextOpenLabel: string | null
  // "regular" — closed variants while the market is open but an asset is paused.
  nextSessionLabel: string | null
  // "6:12 PM" — current Eastern Time, for the closed-impact market-hours note.
  currentTimeLabel: string
  // "2 hours" / "45 minutes" until the market reopens; null unless it's closed.
  reopenInLabel: string | null
  onDismiss: () => void
}

const badge = (variant: PromptVariant): ReactNode => {
  switch (variant) {
    case 'closed-impact':
      return <Trans>High price impact</Trans>
    case 'closed-error':
      return <Trans>Trading unavailable</Trans>
    case 'closed-heads-up':
      return <Trans>US market closed</Trans>
    case 'capacity':
      return <Trans>Warning</Trans>
  }
}

const title = (variant: PromptVariant): ReactNode => {
  switch (variant) {
    case 'capacity':
      return <Trans>Order too large</Trans>
    case 'closed-impact':
      return <Trans>Expect a worse price</Trans>
    case 'closed-error':
      return <Trans>Temporarily unavailable</Trans>
    case 'closed-heads-up':
      return <Trans>Pricing may be worse right now</Trans>
  }
}

const icon = (variant: PromptVariant): LucideIcon => {
  switch (variant) {
    case 'capacity':
      return TriangleAlert
    case 'closed-impact':
      return TrendingDown
    case 'closed-error':
      return Ban
    case 'closed-heads-up':
      return Clock
  }
}

// The heads-up shows before the user has done anything, so it stays neutral —
// warning styling on an unprompted notice trains users past the real warnings.
const isNeutral = (variant: PromptVariant): boolean =>
  variant === 'closed-heads-up'

// The closed variants end with when to retry: an exact reopen time while the
// market is closed, the next tradable session when an asset is paused.
// closed-error means nothing fills — a plain retry.
const comeBack = (
  nextOpenLabel: string | null,
  nextSessionLabel: string | null
): ReactNode => {
  if (nextOpenLabel) {
    return <Trans>The market reopens {nextOpenLabel}.</Trans>
  }
  if (nextSessionLabel) {
    return <Trans>Try again during {nextSessionLabel} hours in the US.</Trans>
  }
  return <Trans>Try again later when trading resumes.</Trans>
}

// Buy/sell wording is kept as whole sentences per tab so each locale can
// translate them independently — never interpolate the verb.
const description = ({
  variant,
  tab,
  symbol,
  maxAmountLabel,
  sessionLabel,
  nextOpenLabel,
  nextSessionLabel,
}: LargeMintCardBodyProps): ReactNode => {
  const isBuy = tab === 'buy'

  switch (variant) {
    case 'closed-heads-up':
      // Pre-quote, so it can't promise a number: names the cause and what it
      // costs, and leaves the actual figure to the quote.
      return (
        <Trans>
          {symbol}'s stocks aren't trading, so buys and sells route through
          secondary markets — price impact can be much higher than usual.
        </Trans>
      )

    case 'capacity':
      return (
        <>
          {isBuy ? (
            <Trans>
              You can buy up to {maxAmountLabel} per transaction during{' '}
              {sessionLabel} hours in the US.
            </Trans>
          ) : (
            <Trans>
              You can sell up to {maxAmountLabel} per transaction during{' '}
              {sessionLabel} hours in the US.
            </Trans>
          )}{' '}
          <Trans>
            For larger amounts, split your order into multiple transactions.
          </Trans>
        </>
      )
    case 'closed-impact':
      // Tab-neutral: possible on both tabs, just at a worse price. The
      // market-hours paragraph below (rendered by LargeMintCardBody) owns the
      // "come back" guidance, so nothing is appended here.
      return (
        <Trans>
          You're getting a worse price than usual because {symbol}'s underlying
          stocks aren't trading right now.
        </Trans>
      )
    case 'closed-error':
      return (
        <>
          {isBuy ? (
            <Trans>
              Minting {symbol} is currently unavailable and we couldn't find
              another route to buy it.
            </Trans>
          ) : (
            <Trans>
              Redeeming {symbol} is currently unavailable and we couldn't find
              another route to sell it.
            </Trans>
          )}{' '}
          {comeBack(nextOpenLabel, nextSessionLabel)}
        </>
      )
  }
}

const Fact = ({ label, value }: { label: ReactNode; value: string }) => (
  <div className="flex items-baseline justify-between gap-2">
    <dt className="text-xs text-muted-foreground">{label}</dt>
    <dd className="whitespace-nowrap text-xs font-medium tabular-nums text-foreground">
      {value}
    </dd>
  </div>
)

// Presentational card body: status row (icon + eyebrow + dismiss), headline,
// one explanatory sentence, then the timing facts as a labelled list rather
// than a second paragraph of numbers. Shared by every presentation (desktop
// side-box, modal-attached box, mobile popup/banner). Every variant is
// informational — the zapper itself already quotes every RFQ/AMM source, so
// the card never links out to an external DEX.
const LargeMintCardBody = (props: LargeMintCardBodyProps) => {
  const { variant, currentTimeLabel, reopenInLabel, onDismiss } = props
  const { t } = useLingui()
  const Icon = icon(variant)
  const neutral = isNeutral(variant)
  const showMarketHours =
    (variant === 'closed-impact' || variant === 'closed-heads-up') &&
    !!reopenInLabel

  return (
    <>
      <div className="flex items-center gap-2">
        <div
          className={cn(
            'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
            neutral
              ? 'bg-muted text-muted-foreground'
              : 'bg-warning/10 text-warning'
          )}
        >
          <Icon size={15} />
        </div>
        <div
          className={cn(
            'min-w-0 flex-1 truncate text-[11px] font-semibold uppercase tracking-wider',
            neutral ? 'text-muted-foreground' : 'text-warning'
          )}
        >
          {badge(variant)}
        </div>
        <button
          type="button"
          className="-mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          onClick={onDismiss}
          aria-label={t`Dismiss suggestion`}
        >
          <X size={14} />
        </button>
      </div>
      <div className="mt-3 text-base font-semibold leading-snug tracking-[-0.01em] text-foreground">
        {title(variant)}
      </div>
      <p className="mt-1.5 text-sm font-light leading-5 text-muted-foreground">
        {description(props)}
      </p>
      {showMarketHours && (
        <dl className="mt-4 space-y-1.5 border-t border-border pt-3">
          <Fact label={<Trans>Reopens in</Trans>} value={reopenInLabel} />
          <Fact label={<Trans>Market opens</Trans>} value="9:30 AM ET" />
          <Fact label={<Trans>Now</Trans>} value={`${currentTimeLabel} ET`} />
        </dl>
      )}
    </>
  )
}

export default LargeMintCardBody
