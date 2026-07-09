import { Trans } from '@lingui/react/macro'

export const HistoricalPriceDisclaimer = () => (
  <p className="mt-4 px-4 text-xs leading-relaxed text-muted-foreground md:px-8">
    <Trans>
      ✱ Estimated historical price is a hypothetical illustration of how the
      DTF’s launch-day basket would have performed before the DTF was created,
      using historical prices for those assets. The basket did not actually
      exist during this period. The figure assumes a fixed basket — it does not
      reflect actual trading, management fees, slippage, or the rebalancing the
      DTF performs in practice — and is constructed with the benefit of
      hindsight. Hypothetical performance is not indicative of future results
      and is not investment advice.
    </Trans>
  </p>
)
