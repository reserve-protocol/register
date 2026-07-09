import { Trans, useLingui } from '@lingui/react/macro'
import { X } from 'lucide-react'
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
  swapUrl: string
  onCta: () => void
  onDismiss: () => void
}

// Capacity and the closed variants are informational — PancakeSwap liquidity is
// as stale as the pools while ondo minting is blocked, so no CTA.
const SWAP_CTA_VARIANTS: PromptVariant[] = ['impact', 'large', 'error']

const badge = (variant: PromptVariant): ReactNode => {
  switch (variant) {
    case 'large':
      return <Trans>Large Order</Trans>
    case 'error':
      return <Trans>No route found</Trans>
    case 'impact':
    case 'closed-impact':
      return <Trans>High price impact</Trans>
    case 'closed-error':
      return <Trans>Trading unavailable</Trans>
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
    default:
      return <Trans>Try PancakeSwap</Trans>
  }
}

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
    case 'large':
      return (
        <Trans>
          For larger orders, a DEX like PancakeSwap may get you a better price
          by routing your trade across multiple sources of liquidity.
        </Trans>
      )
    case 'error':
      return isBuy ? (
        <Trans>
          We couldn't find a good price for this trade right now. We recommend
          using a DEX like PancakeSwap to buy {symbol}.
        </Trans>
      ) : (
        <Trans>
          We couldn't find a good price for this trade right now. We recommend
          using a DEX like PancakeSwap to sell {symbol}.
        </Trans>
      )
    case 'impact':
      return isBuy ? (
        <Trans>
          Your order has unusually high price impact. We recommend buying{' '}
          {symbol} on PancakeSwap to get the best price possible.
        </Trans>
      ) : (
        <Trans>
          Your order has unusually high price impact. We recommend selling{' '}
          {symbol} on PancakeSwap to get the best price possible.
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

// Presentational card body (badge, dismiss, title, description, CTA). Shared by
// every presentation (desktop side-box, modal-attached box, mobile popup).
const LargeMintCardBody = (props: LargeMintCardBodyProps) => {
  const {
    variant,
    tab,
    currentTimeLabel,
    reopenInLabel,
    swapUrl,
    onCta,
    onDismiss,
  } = props
  const { t } = useLingui()
  const isBuy = tab === 'buy'

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <div className="mb-3 inline-flex h-6 items-center rounded-full border border-warning/30 bg-warning/10 px-2.5 text-[11px] font-medium text-warning">
          {badge(variant)}
        </div>
        <button
          type="button"
          className="mb-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          onClick={onDismiss}
          aria-label={t`Dismiss suggestion`}
        >
          <X size={14} />
        </button>
      </div>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-foreground">
          {title(variant)}
        </div>
        <p className="mt-1 text-sm font-light leading-5 text-muted-foreground">
          {description(props)}
        </p>
        {variant === 'closed-impact' && reopenInLabel && (
          <p className="mt-2 text-sm font-light leading-5 text-muted-foreground">
            <Trans>
              US stock market hours are{' '}
              <span className="whitespace-nowrap">9:30 AM</span> to{' '}
              <span className="whitespace-nowrap">4:00 PM</span> Eastern Time.
              Current time is:{' '}
              <span className="whitespace-nowrap">{currentTimeLabel} ET</span>.
              Please try again in{' '}
              <span className="whitespace-nowrap">{reopenInLabel}</span>.
            </Trans>
          </p>
        )}
        {SWAP_CTA_VARIANTS.includes(variant) && (
          <a
            href={swapUrl}
            target="_blank"
            rel="noreferrer"
            onClick={onCta}
            className="mt-4 inline-flex h-8 items-center justify-center rounded-full bg-primary px-4 text-xs font-medium text-primary-foreground no-underline transition-colors hover:bg-primary/90"
          >
            {isBuy ? (
              <Trans>Buy on PancakeSwap</Trans>
            ) : (
              <Trans>Sell on PancakeSwap</Trans>
            )}
          </a>
        )}
      </div>
    </>
  )
}

export default LargeMintCardBody
