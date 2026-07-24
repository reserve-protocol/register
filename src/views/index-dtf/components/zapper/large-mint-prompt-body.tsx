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
  onDismiss: () => void
}

const badge = (variant: PromptVariant): ReactNode => {
  switch (variant) {
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

// Presentational card body (badge, dismiss, title, description). Shared by
// every presentation (desktop side-box, modal-attached box, mobile popup).
// Every variant is informational — the zapper itself already quotes every
// RFQ/AMM source, so the card never links out to an external DEX.
const LargeMintCardBody = (props: LargeMintCardBodyProps) => {
  const { variant, currentTimeLabel, reopenInLabel, onDismiss } = props
  const { t } = useLingui()

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
      </div>
    </>
  )
}

export default LargeMintCardBody
