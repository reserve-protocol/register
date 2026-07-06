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
  cowSwapUrl: string
  onCta: () => void
  onDismiss: () => void
}

// Capacity and the closed variants are informational — CoW Swap liquidity is
// as stale as the pools while ondo minting is blocked, so no CTA.
const COW_CTA_VARIANTS: PromptVariant[] = ['impact', 'large', 'error']

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
      return <Trans>Try CoW Swap</Trans>
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

// closed-impact means the trade works, just worse than usual — frame the
// retry around getting a better price.
const comeBackForBetterPrice = (
  nextOpenLabel: string | null,
  nextSessionLabel: string | null
): ReactNode => {
  if (nextOpenLabel) {
    return (
      <Trans>
        For a better price, come back after the market reopens {nextOpenLabel}.
      </Trans>
    )
  }
  if (nextSessionLabel) {
    return (
      <Trans>
        For a better price, come back during {nextSessionLabel} hours in the
        US.
      </Trans>
    )
  }
  return <Trans>For a better price, come back when trading resumes.</Trans>
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
          For larger orders, a DEX aggregator like CoW Swap may get you a
          better price by routing your trade across multiple sources of
          liquidity.
        </Trans>
      )
    case 'error':
      return isBuy ? (
        <Trans>
          We couldn't find a good price for this trade right now. We recommend
          using a DEX aggregator like CoW Swap to buy {symbol}.
        </Trans>
      ) : (
        <Trans>
          We couldn't find a good price for this trade right now. We recommend
          using a DEX aggregator like CoW Swap to sell {symbol}.
        </Trans>
      )
    case 'impact':
      return isBuy ? (
        <Trans>
          Your order has unusually high price impact. We recommend buying{' '}
          {symbol} on CoW Swap to get the best price possible.
        </Trans>
      ) : (
        <Trans>
          Your order has unusually high price impact. We recommend selling{' '}
          {symbol} on CoW Swap to get the best price possible.
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
      // Deliberately tab-neutral: the trade is possible on both tabs, just at
      // a worse price.
      return (
        <>
          <Trans>
            You're getting a worse price than usual because {symbol}'s
            underlying stocks aren't trading right now.
          </Trans>{' '}
          {comeBackForBetterPrice(nextOpenLabel, nextSessionLabel)}
        </>
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
  const { variant, tab, cowSwapUrl, onCta, onDismiss } = props
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
        {COW_CTA_VARIANTS.includes(variant) && (
          <a
            href={cowSwapUrl}
            target="_blank"
            rel="noreferrer"
            onClick={onCta}
            className="mt-4 inline-flex h-8 items-center justify-center rounded-full bg-primary px-4 text-xs font-medium text-primary-foreground no-underline transition-colors hover:bg-primary/90"
          >
            {isBuy ? (
              <Trans>Buy on CoW Swap</Trans>
            ) : (
              <Trans>Sell on CoW Swap</Trans>
            )}
          </a>
        )}
      </div>
    </>
  )
}

export default LargeMintCardBody
