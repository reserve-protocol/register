import { describe, it, expect } from 'vitest'
import {
  INITIAL_MINT_PROMPT_STATE,
  MintPromptSignals,
  MintPromptState,
  reduceMintPrompt,
} from '../large-mint-prompt-state'

// Signal presets for the common quote phases.
const SIGNALS: Record<string, MintPromptSignals> = {
  // Idle: in buy context, qualifying input, nothing resolved yet (initial load / refetch).
  refetching: {
    rawLarge: false,
    rawError: false,
    hasValidQuote: false,
    isApplicable: true,
  },
  largeQuote: {
    rawLarge: true,
    rawError: false,
    hasValidQuote: true,
    isApplicable: true,
  },
  error: {
    rawLarge: false,
    rawError: true,
    hasValidQuote: false,
    isApplicable: true,
  },
  smallValidQuote: {
    rawLarge: false,
    rawError: false,
    hasValidQuote: true,
    isApplicable: true,
  },
  notApplicable: {
    rawLarge: false,
    rawError: false,
    hasValidQuote: false,
    isApplicable: false,
  },
}

// Fold a sequence of signal phases onto the initial state.
const run = (
  phases: MintPromptSignals[],
  start: MintPromptState = INITIAL_MINT_PROMPT_STATE
) => phases.reduce(reduceMintPrompt, start)

describe('reduceMintPrompt', () => {
  it('shows nothing initially / while loading with no resolved quote', () => {
    expect(run([SIGNALS.refetching])).toEqual(INITIAL_MINT_PROMPT_STATE)
  })

  it('latches the large variant on a large valid quote', () => {
    expect(run([SIGNALS.largeQuote])).toEqual({
      variant: 'large',
      dismissed: false,
    })
  })

  it('latches the error variant on a quote error', () => {
    expect(run([SIGNALS.error])).toEqual({ variant: 'error', dismissed: false })
  })

  it('keeps the error variant through a refetch (the flicker fix)', () => {
    // error -> refetch (everything transiently clears) -> error again
    const afterRefetch = run([SIGNALS.error, SIGNALS.refetching])
    expect(afterRefetch).toEqual({ variant: 'error', dismissed: false })
    expect(run([SIGNALS.error, SIGNALS.refetching, SIGNALS.error])).toEqual({
      variant: 'error',
      dismissed: false,
    })
  })

  it('keeps the large variant through a refetch', () => {
    expect(run([SIGNALS.largeQuote, SIGNALS.refetching])).toEqual({
      variant: 'large',
      dismissed: false,
    })
  })

  it('closes the error card when a valid (small) quote resolves', () => {
    expect(run([SIGNALS.error, SIGNALS.smallValidQuote])).toEqual(
      INITIAL_MINT_PROMPT_STATE
    )
  })

  it('switches error -> large when a valid large quote resolves', () => {
    expect(run([SIGNALS.error, SIGNALS.largeQuote])).toEqual({
      variant: 'large',
      dismissed: false,
    })
  })

  it('keeps an error card dismissed through refetch, then resets on a valid quote', () => {
    const dismissedError = reduceMintPrompt(run([SIGNALS.error]), SIGNALS.error)
    const userDismissed: MintPromptState = { ...dismissedError, dismissed: true }

    // Stays dismissed across refetch + repeated errors.
    const stillDismissed = run([SIGNALS.refetching, SIGNALS.error], userDismissed)
    expect(stillDismissed).toEqual({ variant: 'error', dismissed: true })

    // A valid quote fully resets, so the prompt can show again later.
    expect(run([SIGNALS.smallValidQuote], userDismissed)).toEqual(
      INITIAL_MINT_PROMPT_STATE
    )
  })

  it('keeps the large card dismissed while the large condition holds', () => {
    const userDismissed: MintPromptState = { variant: 'large', dismissed: true }
    expect(run([SIGNALS.largeQuote, SIGNALS.refetching], userDismissed)).toEqual({
      variant: 'large',
      dismissed: true,
    })
  })

  it('resets (latch + dismissal) when no longer applicable', () => {
    const userDismissed: MintPromptState = { variant: 'error', dismissed: true }
    expect(run([SIGNALS.notApplicable], userDismissed)).toEqual(
      INITIAL_MINT_PROMPT_STATE
    )
  })
})
