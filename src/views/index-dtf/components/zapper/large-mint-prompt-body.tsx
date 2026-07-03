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
  // "Regular" — capacity variant only.
  sessionLabel: string
  cowSwapUrl: string
  onCta: () => void
  onDismiss: () => void
}

const badge = (variant: PromptVariant): ReactNode => {
  switch (variant) {
    case 'large':
      return <Trans>Large Order</Trans>
    case 'error':
      return <Trans>No route found</Trans>
    case 'impact':
      return <Trans>High price impact</Trans>
    case 'capacity':
      return <Trans>Warning</Trans>
  }
}

// Buy/sell wording is kept as whole sentences per tab so each locale can
// translate them independently — never interpolate the verb.
const description = (
  variant: PromptVariant,
  isBuy: boolean,
  symbol: string,
  maxAmountLabel: string,
  sessionLabel: string
): ReactNode => {
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
      return isBuy ? (
        <Trans>
          You can only buy {maxAmountLabel} per-transaction during{' '}
          {sessionLabel} hours in the US.
        </Trans>
      ) : (
        <Trans>
          You can only sell {maxAmountLabel} per-transaction during{' '}
          {sessionLabel} hours in the US.
        </Trans>
      )
  }
}

// Presentational card body (badge, dismiss, title, description, CTA). Shared by
// every presentation (desktop side-box, modal-attached box, mobile popup).
const LargeMintCardBody = ({
  variant,
  tab,
  symbol,
  maxAmountLabel,
  sessionLabel,
  cowSwapUrl,
  onCta,
  onDismiss,
}: LargeMintCardBodyProps) => {
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
          {variant === 'capacity' ? (
            <Trans>Order too large</Trans>
          ) : (
            <Trans>Try CoW Swap</Trans>
          )}
        </div>
        <p className="mt-1 text-sm font-light leading-5 text-muted-foreground">
          {description(variant, isBuy, symbol, maxAmountLabel, sessionLabel)}
        </p>
        {variant !== 'capacity' && (
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
