import { describe, it, expect } from 'vitest'
import {
  INITIAL_MINT_PROMPT_STATE,
  MintPromptSignals,
  MintPromptState,
  reduceMintPrompt,
} from '../large-mint-prompt-state'

const BASE: MintPromptSignals = {
  rawCapacity: false,
  rawImpact: false,
  rawLarge: false,
  rawError: false,
  hasValidQuote: false,
  isApplicable: true,
}

// Signal presets for the common quote phases.
const SIGNALS: Record<string, MintPromptSignals> = {
  // Idle: in context, qualifying input, nothing resolved yet (initial load / refetch).
  refetching: { ...BASE },
  largeQuote: { ...BASE, rawLarge: true, hasValidQuote: true },
  error: { ...BASE, rawError: true },
  smallValidQuote: { ...BASE, hasValidQuote: true },
  notApplicable: { ...BASE, isApplicable: false },
  // Valid quote whose price impact crosses the threshold (any size).
  impactQuote: { ...BASE, rawImpact: true, hasValidQuote: true },
  // Input above the Ondo per-transaction cap; independent of the quote.
  overCapacity: { ...BASE, rawCapacity: true },
  overCapacityWithQuote: { ...BASE, rawCapacity: true, hasValidQuote: true },
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

  it('latches the impact variant on a high-impact valid quote', () => {
    expect(run([SIGNALS.impactQuote])).toEqual({
      variant: 'impact',
      dismissed: false,
    })
  })

  it('keeps the impact variant through a refetch', () => {
    expect(run([SIGNALS.impactQuote, SIGNALS.refetching])).toEqual({
      variant: 'impact',
      dismissed: false,
    })
  })

  it('closes the impact card when a clean quote resolves', () => {
    expect(run([SIGNALS.impactQuote, SIGNALS.smallValidQuote])).toEqual(
      INITIAL_MINT_PROMPT_STATE
    )
  })

  it('latches the capacity variant when the input exceeds the cap', () => {
    expect(run([SIGNALS.overCapacity])).toEqual({
      variant: 'capacity',
      dismissed: false,
    })
  })

  it('clears the capacity card the moment its signal drops, even mid-refetch', () => {
    // Capacity derives from the input value, not the quote, so a refetch
    // (no raw signals) means the condition genuinely stopped holding.
    expect(run([SIGNALS.overCapacity, SIGNALS.refetching])).toEqual(
      INITIAL_MINT_PROMPT_STATE
    )
  })

  it('prioritizes capacity over every other concern', () => {
    const everything: MintPromptSignals = {
      ...BASE,
      rawCapacity: true,
      rawImpact: true,
      rawLarge: true,
      hasValidQuote: true,
    }
    expect(run([everything])).toEqual({
      variant: 'capacity',
      dismissed: false,
    })
    expect(run([{ ...BASE, rawCapacity: true, rawError: true }])).toEqual({
      variant: 'capacity',
      dismissed: false,
    })
  })

  it('prioritizes impact over large when both fire on one quote', () => {
    expect(
      run([{ ...BASE, rawImpact: true, rawLarge: true, hasValidQuote: true }])
    ).toEqual({ variant: 'impact', dismissed: false })
  })

  it('never downgrades impact -> large when consecutive quotes disagree (the flicker fix)', () => {
    // Quote A: impact 1.2% -> impact latches. Quote B: impact 0.9% but still
    // >= $50k -> rawLarge only. The card must stay on impact, not alternate.
    expect(run([SIGNALS.impactQuote, SIGNALS.largeQuote])).toEqual({
      variant: 'impact',
      dismissed: false,
    })
    // ...and it stays put across further oscillation.
    expect(
      run([
        SIGNALS.impactQuote,
        SIGNALS.largeQuote,
        SIGNALS.impactQuote,
        SIGNALS.largeQuote,
      ])
    ).toEqual({ variant: 'impact', dismissed: false })
  })

  it('escalates large -> impact when a later quote crosses the threshold', () => {
    expect(run([SIGNALS.largeQuote, SIGNALS.impactQuote])).toEqual({
      variant: 'impact',
      dismissed: false,
    })
  })

  it('does not let a transient error displace a latched impact or large card', () => {
    expect(run([SIGNALS.impactQuote, SIGNALS.error])).toEqual({
      variant: 'impact',
      dismissed: false,
    })
    expect(run([SIGNALS.largeQuote, SIGNALS.error])).toEqual({
      variant: 'large',
      dismissed: false,
    })
  })

  it('switches to a live concern when the capacity signal drops in the same commit', () => {
    expect(run([SIGNALS.overCapacity, SIGNALS.impactQuote])).toEqual({
      variant: 'impact',
      dismissed: false,
    })
  })

  it('keeps a dismissed capacity card dismissed while over the cap, then resets when under', () => {
    const userDismissed: MintPromptState = {
      variant: 'capacity',
      dismissed: true,
    }
    expect(run([SIGNALS.overCapacityWithQuote], userDismissed)).toEqual({
      variant: 'capacity',
      dismissed: true,
    })
    expect(run([SIGNALS.smallValidQuote], userDismissed)).toEqual(
      INITIAL_MINT_PROMPT_STATE
    )
  })
})
