import { describe, it, expect } from 'vitest'
import {
  deriveMintPromptSignals,
  INITIAL_MINT_PROMPT_STATE,
  MintPromptInputs,
  MintPromptSignals,
  MintPromptState,
  reduceMintPrompt,
} from '../large-mint-prompt-state'

const BASE: MintPromptSignals = {
  rawCapacity: false,
  rawClosedImpact: false,
  rawClosedError: false,
  rawBetterPrice: false,
  rawImpact: false,
  rawLarge: false,
  rawError: false,
  hasValidQuote: false,
  mintingUnavailable: false,
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
  // Valid quote that PCSX beats outright.
  betterPriceQuote: { ...BASE, rawBetterPrice: true, hasValidQuote: true },
  // PCSX beats a quote that also crosses the impact threshold.
  betterPriceImpactQuote: {
    ...BASE,
    rawBetterPrice: true,
    rawImpact: true,
    hasValidQuote: true,
  },
  // Input above the Ondo per-transaction cap; independent of the quote.
  overCapacity: { ...BASE, rawCapacity: true },
  overCapacityWithQuote: { ...BASE, rawCapacity: true, hasValidQuote: true },
  // Minting unavailable: a high-impact secondary-market quote / no route at all.
  closedImpactQuote: {
    ...BASE,
    rawClosedImpact: true,
    hasValidQuote: true,
    mintingUnavailable: true,
  },
  closedError: { ...BASE, rawClosedError: true, mintingUnavailable: true },
  // Mid-refetch right after minting flipped unavailable.
  refetchingUnavailable: { ...BASE, mintingUnavailable: true },
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

  it('prioritizes better-price over impact when both fire on one quote', () => {
    expect(run([SIGNALS.betterPriceImpactQuote])).toEqual({
      variant: 'better-price',
      dismissed: false,
    })
  })

  it('escalates impact -> better-price and never downgrades back', () => {
    expect(run([SIGNALS.impactQuote, SIGNALS.betterPriceQuote])).toEqual({
      variant: 'better-price',
      dismissed: false,
    })
    expect(
      run([
        SIGNALS.betterPriceQuote,
        SIGNALS.impactQuote,
        SIGNALS.betterPriceQuote,
      ])
    ).toEqual({ variant: 'better-price', dismissed: false })
  })

  it('keeps better-price through a refetch and closes it on a clean quote', () => {
    expect(run([SIGNALS.betterPriceQuote, SIGNALS.refetching])).toEqual({
      variant: 'better-price',
      dismissed: false,
    })
    expect(run([SIGNALS.betterPriceQuote, SIGNALS.smallValidQuote])).toEqual(
      INITIAL_MINT_PROMPT_STATE
    )
  })

  it('prioritizes capacity and the closed variants over better-price', () => {
    expect(
      run([{ ...SIGNALS.betterPriceQuote, rawCapacity: true }])
    ).toEqual({ variant: 'capacity', dismissed: false })
    expect(
      run([SIGNALS.betterPriceQuote, SIGNALS.closedImpactQuote])
    ).toEqual({ variant: 'closed-impact', dismissed: false })
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

  it('latches the closed variants and keeps them through a refetch', () => {
    expect(
      run([SIGNALS.closedImpactQuote, SIGNALS.refetchingUnavailable])
    ).toEqual({
      variant: 'closed-impact',
      dismissed: false,
    })
    expect(run([SIGNALS.closedError, SIGNALS.refetchingUnavailable])).toEqual({
      variant: 'closed-error',
      dismissed: false,
    })
  })

  it('drops a latched CoW card the moment minting flips unavailable, even mid-refetch', () => {
    // Without this, the CoW CTA would point at stale liquidity for a full
    // refetch cycle until the closed signals resolve.
    expect(run([SIGNALS.impactQuote, SIGNALS.refetchingUnavailable])).toEqual(
      INITIAL_MINT_PROMPT_STATE
    )
    expect(run([SIGNALS.largeQuote, SIGNALS.refetchingUnavailable])).toEqual(
      INITIAL_MINT_PROMPT_STATE
    )
    expect(run([SIGNALS.error, SIGNALS.refetchingUnavailable])).toEqual(
      INITIAL_MINT_PROMPT_STATE
    )
  })

  it('closes a closed card when a clean quote resolves', () => {
    // Also models an enso quote resolving while unavailable: rawClosedImpact
    // excludes enso, so the commit looks like a plain valid quote.
    expect(run([SIGNALS.closedImpactQuote, SIGNALS.smallValidQuote])).toEqual(
      INITIAL_MINT_PROMPT_STATE
    )
    expect(run([SIGNALS.closedError, SIGNALS.smallValidQuote])).toEqual(
      INITIAL_MINT_PROMPT_STATE
    )
  })

  it('escalates a latched CoW card when the market flips unavailable', () => {
    expect(run([SIGNALS.impactQuote, SIGNALS.closedImpactQuote])).toEqual({
      variant: 'closed-impact',
      dismissed: false,
    })
    expect(run([SIGNALS.error, SIGNALS.closedError])).toEqual({
      variant: 'closed-error',
      dismissed: false,
    })
    expect(run([SIGNALS.largeQuote, SIGNALS.closedError])).toEqual({
      variant: 'closed-error',
      dismissed: false,
    })
  })

  it('never downgrades closed-impact -> closed-error on a transient error', () => {
    expect(run([SIGNALS.closedImpactQuote, SIGNALS.closedError])).toEqual({
      variant: 'closed-impact',
      dismissed: false,
    })
  })

  it('escalates closed-error -> closed-impact when a quote resolves', () => {
    expect(run([SIGNALS.closedError, SIGNALS.closedImpactQuote])).toEqual({
      variant: 'closed-impact',
      dismissed: false,
    })
  })

  it('replaces a latched closed card with a live CoW concern once minting resumes', () => {
    // A CoW signal firing proves minting is available again — the stale
    // "come back later" card must not outrank it on priority alone.
    expect(run([SIGNALS.closedImpactQuote, SIGNALS.impactQuote])).toEqual({
      variant: 'impact',
      dismissed: false,
    })
    expect(run([SIGNALS.closedError, SIGNALS.largeQuote])).toEqual({
      variant: 'large',
      dismissed: false,
    })
    expect(run([SIGNALS.closedError, SIGNALS.smallValidQuote])).toEqual(
      INITIAL_MINT_PROMPT_STATE
    )
  })

  it('prioritizes capacity over the closed variants', () => {
    expect(
      run([{ ...BASE, rawCapacity: true, rawClosedImpact: true }])
    ).toEqual({ variant: 'capacity', dismissed: false })
  })

  it('hands a latched capacity card over to a closed variant when the market flips', () => {
    expect(run([SIGNALS.overCapacity, SIGNALS.closedImpactQuote])).toEqual({
      variant: 'closed-impact',
      dismissed: false,
    })
    expect(run([SIGNALS.overCapacity, SIGNALS.closedError])).toEqual({
      variant: 'closed-error',
      dismissed: false,
    })
  })

  it('keeps a dismissed closed card dismissed through refetch, then resets on a clean quote', () => {
    const userDismissed: MintPromptState = {
      variant: 'closed-impact',
      dismissed: true,
    }
    expect(
      run([SIGNALS.refetching, SIGNALS.closedImpactQuote], userDismissed)
    ).toEqual({ variant: 'closed-impact', dismissed: true })
    expect(run([SIGNALS.smallValidQuote], userDismissed)).toEqual(
      INITIAL_MINT_PROMPT_STATE
    )
    expect(run([SIGNALS.notApplicable], userDismissed)).toEqual(
      INITIAL_MINT_PROMPT_STATE
    )
  })
})

// In-context defaults: minting available, healthy input, nothing resolved.
const INPUTS: MintPromptInputs = {
  inContext: true,
  inputValue: 1_000,
  hasValidQuote: false,
  hasQuoteError: false,
  source: undefined,
  truePriceImpact: 0,
  mintingAvailable: true,
  mintingUnavailable: false,
  maxMintUsd: 500_000,
  pcsxBetter: false,
}

const closed: Partial<MintPromptInputs> = {
  mintingAvailable: false,
  mintingUnavailable: true,
}

const derive = (overrides: Partial<MintPromptInputs>) =>
  deriveMintPromptSignals({ ...INPUTS, ...overrides })

describe('deriveMintPromptSignals', () => {
  it('raises capacity above the floored weighted max, pre-quote', () => {
    expect(derive({ inputValue: 500_001 }).rawCapacity).toBe(true)
    expect(derive({ inputValue: 500_000 }).rawCapacity).toBe(false)
  })

  it('suppresses capacity while minting is not available or the cap is unknown/zero', () => {
    expect(
      derive({ inputValue: 500_001, mintingAvailable: false }).rawCapacity
    ).toBe(false)
    expect(
      derive({ inputValue: 500_001, maxMintUsd: undefined }).rawCapacity
    ).toBe(false)
    expect(derive({ inputValue: 500_001, ...closed, maxMintUsd: 0 }).rawCapacity).toBe(
      false
    )
  })

  it('raises closed-impact only for high-impact non-enso quotes while unavailable', () => {
    const highImpact: Partial<MintPromptInputs> = {
      ...closed,
      hasValidQuote: true,
      truePriceImpact: 1.2,
    }
    expect(derive({ ...highImpact, source: 'zap' }).rawClosedImpact).toBe(true)
    expect(derive({ ...highImpact, source: 'velora' }).rawClosedImpact).toBe(
      true
    )
    expect(derive({ ...highImpact, source: 'enso' }).rawClosedImpact).toBe(
      false
    )
    expect(
      derive({ ...highImpact, source: 'zap', truePriceImpact: 1 })
        .rawClosedImpact
    ).toBe(false)
    // Positive-for-user impact never warns.
    expect(
      derive({ ...highImpact, source: 'zap', truePriceImpact: -3 })
        .rawClosedImpact
    ).toBe(false)
    // Market open and healthy: the plain impact signal owns it instead.
    expect(
      derive({ hasValidQuote: true, truePriceImpact: 1.2, source: 'zap' })
    ).toMatchObject({ rawClosedImpact: false, rawImpact: true })
  })

  it('raises closed-error instead of error while unavailable', () => {
    expect(derive({ ...closed, hasQuoteError: true })).toMatchObject({
      rawClosedError: true,
      rawError: false,
    })
    expect(derive({ hasQuoteError: true })).toMatchObject({
      rawClosedError: false,
      rawError: true,
    })
  })

  it('gates the CoW signals off while unavailable', () => {
    expect(
      derive({
        ...closed,
        hasValidQuote: true,
        inputValue: 60_000,
        truePriceImpact: 1.2,
        source: 'zap',
      })
    ).toMatchObject({ rawImpact: false, rawLarge: false })
  })

  it('raises better-price only for a resolved quote PCSX beats, while minting is not blocked', () => {
    expect(
      derive({ hasValidQuote: true, pcsxBetter: true }).rawBetterPrice
    ).toBe(true)
    expect(derive({ pcsxBetter: true }).rawBetterPrice).toBe(false)
    expect(
      derive({ ...closed, hasValidQuote: true, pcsxBetter: true })
        .rawBetterPrice
    ).toBe(false)
    expect(
      derive({ hasValidQuote: true, pcsxBetter: true, inputValue: 99 })
        .rawBetterPrice
    ).toBe(false)
  })

  it('raises large on a valid quote at or above the large-order floor', () => {
    expect(derive({ hasValidQuote: true, inputValue: 50_000 }).rawLarge).toBe(
      true
    )
    expect(derive({ hasValidQuote: true, inputValue: 49_999 }).rawLarge).toBe(
      false
    )
  })

  it('keeps every raw signal inside the isApplicable domain (input >= $100)', () => {
    const signals = derive({
      ...closed,
      inputValue: 99,
      hasValidQuote: true,
      hasQuoteError: true,
      truePriceImpact: 10,
      source: 'zap',
    })
    expect(signals.isApplicable).toBe(false)
    expect(signals).toMatchObject({
      rawClosedImpact: false,
      rawClosedError: false,
      rawImpact: false,
      rawError: false,
    })
  })

  it('raises nothing out of context', () => {
    const signals = derive({
      inContext: false,
      inputValue: 1_000_000,
      hasValidQuote: true,
      truePriceImpact: 10,
    })
    expect(signals).toEqual({
      rawCapacity: false,
      rawClosedImpact: false,
      rawClosedError: false,
      rawBetterPrice: false,
      rawImpact: false,
      rawLarge: false,
      rawError: false,
      hasValidQuote: true,
      mintingUnavailable: false,
      isApplicable: false,
    })
  })

  it('leaves a sub-$1k cap (floored to 0) to the quote-failure path', () => {
    // floorOndoMaxUsd(<1000) = 0: no pre-quote warning even though minting is
    // available — the enso failure surfaces as the error card instead.
    expect(derive({ inputValue: 500, maxMintUsd: 0 }).rawCapacity).toBe(false)
  })
})
