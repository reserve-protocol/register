export type MintPromptVariant =
  | 'capacity'
  | 'impact'
  | 'large'
  | 'error'
  | null

export type MintPromptState = {
  variant: MintPromptVariant
  dismissed: boolean
}

export type MintPromptSignals = {
  // In context + Ondo capacity applies + input above the per-transaction cap.
  rawCapacity: boolean
  // In context + a resolved quote + price impact above the threshold.
  rawImpact: boolean
  // In context + a resolved quote + input >= LARGE_MINT_MIN_INPUT.
  rawLarge: boolean
  // In context + a quote error + input >= ERROR_MINT_MIN_INPUT.
  rawError: boolean
  // A quote has resolved (the zapper found a route).
  hasValidQuote: boolean
  // In context + input >= ERROR_MINT_MIN_INPUT — the prompt could be relevant.
  isApplicable: boolean
}

export const INITIAL_MINT_PROMPT_STATE: MintPromptState = {
  variant: null,
  dismissed: false,
}

const VARIANT_PRIORITY: Record<Exclude<MintPromptVariant, null>, number> = {
  capacity: 3,
  impact: 2,
  large: 1,
  error: 0,
}

// Latches which suggestion (if any) the card shows. The card must persist through
// the zapper's periodic refetch, where `error`/`quote` momentarily clear: in that
// transient window none of the raw signals are true, so we keep the previous state.
export const reduceMintPrompt = (
  prev: MintPromptState,
  signals: MintPromptSignals
): MintPromptState => {
  const {
    rawCapacity,
    rawImpact,
    rawLarge,
    rawError,
    hasValidQuote,
    isApplicable,
  } = signals

  // The hard Ondo cap overrides everything while it holds. Its signal derives
  // from the always-present input value — never the quote — so unlike the
  // others it can't flicker during refetch: the moment it drops (input below
  // the cap, market closed, context left) the latch must clear.
  if (rawCapacity) return { variant: 'capacity', dismissed: prev.dismissed }
  const base = prev.variant === 'capacity' ? INITIAL_MINT_PROMPT_STATE : prev

  // `rawError` means no quote, so it never competes with impact/large within
  // one commit.
  const winner = rawImpact
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
    const keep =
      base.variant !== null &&
      VARIANT_PRIORITY[base.variant] > VARIANT_PRIORITY[winner]
    return { variant: keep ? base.variant : winner, dismissed: base.dismissed }
  }

  // Definite "no longer applicable": a valid route resolved with no concern
  // raised above, or the user left the context / cleared the input below the
  // threshold. Reset the latch and the dismissal so a future qualifying state
  // can show again.
  if (hasValidQuote || !isApplicable) {
    return INITIAL_MINT_PROMPT_STATE
  }

  // Otherwise we're mid-refetch with no resolved quote — keep showing.
  return base
}
