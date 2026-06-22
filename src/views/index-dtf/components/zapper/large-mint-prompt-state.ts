export type MintPromptVariant = 'large' | 'error' | null

export type MintPromptState = {
  variant: MintPromptVariant
  dismissed: boolean
}

export type MintPromptSignals = {
  // Buy context + a resolved quote + input >= LARGE_MINT_MIN_INPUT.
  rawLarge: boolean
  // Buy context + a quote error + input >= ERROR_MINT_MIN_INPUT.
  rawError: boolean
  // A quote has resolved (the zapper found a route).
  hasValidQuote: boolean
  // Buy context + input >= ERROR_MINT_MIN_INPUT — the prompt could be relevant.
  isApplicable: boolean
}

export const INITIAL_MINT_PROMPT_STATE: MintPromptState = {
  variant: null,
  dismissed: false,
}

// Latches which suggestion (if any) the card shows. The card must persist through
// the zapper's periodic refetch, where `error`/`quote` momentarily clear: in that
// transient window none of the raw signals are true, so we keep the previous state.
export const reduceMintPrompt = (
  prev: MintPromptState,
  signals: MintPromptSignals
): MintPromptState => {
  const { rawLarge, rawError, hasValidQuote, isApplicable } = signals

  // A large valid quote always wins; an error means no quote, so the two are
  // mutually exclusive and the badge stays accurate.
  if (rawLarge) return { variant: 'large', dismissed: prev.dismissed }
  if (rawError) return { variant: 'error', dismissed: prev.dismissed }

  // Definite "no longer applicable": a valid route resolved, or the user left the
  // buy context / cleared the input below the threshold. Reset the latch and the
  // dismissal so a future qualifying state can show again.
  if (hasValidQuote || !isApplicable) {
    return INITIAL_MINT_PROMPT_STATE
  }

  // Otherwise we're mid-refetch with no resolved quote — keep showing.
  return prev
}
