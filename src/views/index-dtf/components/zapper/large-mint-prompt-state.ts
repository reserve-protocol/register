// Show the PancakeSwap suggestion once the user's input is this large.
export const LARGE_MINT_MIN_INPUT = 50_000
export const ERROR_MINT_MIN_INPUT = 100
// truePriceImpact is a percentage where positive means the user loses value.
export const HIGH_PRICE_IMPACT_THRESHOLD = 1

export type MintPromptVariant =
  | 'capacity'
  | 'closed-impact'
  | 'closed-error'
  | 'impact'
  | 'large'
  | 'error'
  | null

export type MintPromptState = {
  variant: MintPromptVariant
  dismissed: boolean
}

export type MintPromptSignals = {
  // In context + Ondo minting available + input above the weighted per-transaction cap.
  rawCapacity: boolean
  // In context + Ondo minting unavailable + a resolved non-enso quote above the impact threshold.
  rawClosedImpact: boolean
  // In context + Ondo minting unavailable + a quote error.
  rawClosedError: boolean
  // In context + minting not blocked + a resolved quote + price impact above the threshold.
  rawImpact: boolean
  // In context + minting not blocked + a resolved quote + input >= LARGE_MINT_MIN_INPUT.
  rawLarge: boolean
  // In context + minting not blocked + a quote error + input >= ERROR_MINT_MIN_INPUT.
  rawError: boolean
  // A quote has resolved (the zapper found a route).
  hasValidQuote: boolean
  // Ondo minting is currently blocked — a latched CoW card must not survive it.
  mintingUnavailable: boolean
  // In context + input >= ERROR_MINT_MIN_INPUT — the prompt could be relevant.
  isApplicable: boolean
}

export const INITIAL_MINT_PROMPT_STATE: MintPromptState = {
  variant: null,
  dismissed: false,
}

export type MintPromptInputs = {
  // Inline zapper, or the modal zapper while its modal is open.
  inContext: boolean
  // USD value of the user's input.
  inputValue: number
  hasValidQuote: boolean
  hasQuoteError: boolean
  // Winning quote provider — 'enso' mints through the basket, the rest route
  // through secondary pools.
  source: string | undefined
  // Signed percent, positive = the user loses value.
  truePriceImpact: number
  // Ondo minting states: available (market open, every reported cap > 0),
  // unavailable (market closed or an asset paused), or neither (no ondo
  // assets, or missing market data with healthy caps).
  mintingAvailable: boolean
  mintingUnavailable: boolean
  // Weighted per-transaction cap, already floored to the displayed number.
  maxMintUsd: number | undefined
}

export const deriveMintPromptSignals = ({
  inContext,
  inputValue,
  hasValidQuote,
  hasQuoteError,
  source,
  truePriceImpact,
  mintingAvailable,
  mintingUnavailable,
  maxMintUsd,
}: MintPromptInputs): MintPromptSignals => ({
  // Purely input-derived — fires before any quote resolves, getting ahead of
  // the enso mint that will fail above the cap. Only while minting is
  // available: when it isn't, the closed variants own the messaging.
  rawCapacity:
    inContext &&
    mintingAvailable &&
    maxMintUsd !== undefined &&
    maxMintUsd > 0 &&
    inputValue > maxMintUsd,
  // While ondo minting is blocked, quotes defer to secondary pools that can't
  // be arbitraged until minting resumes. A resolved non-enso quote at high
  // impact means the user pays that premium; no quote at all means no route,
  // period. Both say when to come back instead of pushing to PancakeSwap (whose
  // liquidity is equally stale while arbitrage is blocked) — that also keeps
  // the three CoW-CTA signals below gated off while unavailable.
  rawClosedImpact:
    inContext &&
    mintingUnavailable &&
    hasValidQuote &&
    source !== 'enso' &&
    inputValue >= ERROR_MINT_MIN_INPUT &&
    truePriceImpact > HIGH_PRICE_IMPACT_THRESHOLD,
  rawClosedError:
    inContext &&
    mintingUnavailable &&
    hasQuoteError &&
    inputValue >= ERROR_MINT_MIN_INPUT,
  // The input floor keeps every raw signal inside the `isApplicable` domain;
  // without it a sub-$100 high-impact quote would reset and re-latch (and
  // re-pop the mobile dialog) on every refetch cycle.
  rawImpact:
    inContext &&
    !mintingUnavailable &&
    hasValidQuote &&
    inputValue >= ERROR_MINT_MIN_INPUT &&
    truePriceImpact > HIGH_PRICE_IMPACT_THRESHOLD,
  rawLarge:
    inContext &&
    !mintingUnavailable &&
    hasValidQuote &&
    inputValue >= LARGE_MINT_MIN_INPUT,
  rawError:
    inContext &&
    !mintingUnavailable &&
    hasQuoteError &&
    inputValue >= ERROR_MINT_MIN_INPUT,
  hasValidQuote,
  mintingUnavailable,
  isApplicable: inContext && inputValue >= ERROR_MINT_MIN_INPUT,
})

const VARIANT_PRIORITY: Record<Exclude<MintPromptVariant, null>, number> = {
  capacity: 5,
  'closed-impact': 4,
  'closed-error': 3,
  impact: 2,
  large: 1,
  error: 0,
}

// Variants that only apply while Ondo minting is unavailable (market closed or
// an asset paused) — the mutually exclusive counterpart of the CoW variants.
const CLOSED_VARIANTS = new Set<Exclude<MintPromptVariant, null>>([
  'closed-impact',
  'closed-error',
])

// Latches which suggestion (if any) the card shows. The card must persist through
// the zapper's periodic refetch, where `error`/`quote` momentarily clear: in that
// transient window none of the raw signals are true, so we keep the previous state.
export const reduceMintPrompt = (
  prev: MintPromptState,
  signals: MintPromptSignals
): MintPromptState => {
  const {
    rawCapacity,
    rawClosedImpact,
    rawClosedError,
    rawImpact,
    rawLarge,
    rawError,
    hasValidQuote,
    mintingUnavailable,
    isApplicable,
  } = signals

  // The hard Ondo cap overrides everything while it holds. Its signal derives
  // from the always-present input value — never the quote — so unlike the
  // others it can't flicker during refetch: the moment it drops (input below
  // the cap, minting unavailable, context left) the latch must clear.
  if (rawCapacity) return { variant: 'capacity', dismissed: prev.dismissed }
  const base = prev.variant === 'capacity' ? INITIAL_MINT_PROMPT_STATE : prev

  // `rawError`/`rawClosedError` mean no quote, so they never compete with the
  // resolved-quote signals within one commit.
  const winner = rawClosedImpact
    ? ('closed-impact' as const)
    : rawClosedError
      ? ('closed-error' as const)
      : rawImpact
        ? ('impact' as const)
        : rawLarge
          ? ('large' as const)
          : rawError
            ? ('error' as const)
            : null

  if (winner) {
    // Quotes race providers and refetch, so consecutive quotes can raise
    // different concerns (impact 1.2%, then 0.9% on a still-large order, then
    // a transient error). A latched card only escalates in priority — never
    // downgrades — or its copy flickers between variants on every quote.
    // Exception: a live CoW winner proves minting is available again, so it
    // replaces a latched closed variant despite its lower priority — otherwise
    // a stale "come back later" card would pin through the market reopening.
    const keep =
      base.variant !== null &&
      VARIANT_PRIORITY[base.variant] > VARIANT_PRIORITY[winner] &&
      !(CLOSED_VARIANTS.has(base.variant) && !CLOSED_VARIANTS.has(winner))
    return { variant: keep ? base.variant : winner, dismissed: base.dismissed }
  }

  // Definite "no longer applicable": a valid route resolved with no concern
  // raised above, or the user left the context / cleared the input below the
  // threshold. Reset the latch and the dismissal so a future qualifying state
  // can show again.
  if (hasValidQuote || !isApplicable) {
    return INITIAL_MINT_PROMPT_STATE
  }

  // Otherwise we're mid-refetch with no resolved quote — keep showing. One
  // exception: a CoW-CTA card latched right before minting flipped unavailable
  // must not point at CoW's equally stale liquidity for even one cycle; drop
  // it now and let the closed signals take over when the next quote resolves.
  if (
    mintingUnavailable &&
    base.variant !== null &&
    !CLOSED_VARIANTS.has(base.variant)
  ) {
    return INITIAL_MINT_PROMPT_STATE
  }
  return base
}
