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
  hasValidQuote: false,
  mintingUnavailable: false,
  isApplicable: true,
}

// Signal presets for the common quote phases.
const SIGNALS: Record<string, MintPromptSignals> = {
  // Idle: in context, qualifying input, nothing resolved yet (initial load / refetch).
  refetching: { ...BASE },
  smallValidQuote: { ...BASE, hasValidQuote: true },
  notApplicable: { ...BASE, isApplicable: false },
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
  // Mid-refetch while minting stays unavailable (quote signals transiently clear).
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

  it('shows nothing on a clean valid quote', () => {
    expect(run([SIGNALS.smallValidQuote])).toEqual(INITIAL_MINT_PROMPT_STATE)
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

  it('prioritizes capacity over the closed variants', () => {
    expect(run([{ ...BASE, rawCapacity: true, rawClosedImpact: true }])).toEqual(
      { variant: 'capacity', dismissed: false }
    )
    expect(run([{ ...BASE, rawCapacity: true, rawClosedError: true }])).toEqual(
      { variant: 'capacity', dismissed: false }
    )
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

  it('clears a latched closed card once minting is no longer unavailable, even mid-refetch', () => {
    // The "come back later" copy must not pin through the market reopening
    // while the next quote is still loading. Ondo state is not quote-derived,
    // so mintingUnavailable flipping false is a real transition, not a
    // refetch gap.
    expect(run([SIGNALS.closedImpactQuote, SIGNALS.refetching])).toEqual(
      INITIAL_MINT_PROMPT_STATE
    )
    expect(run([SIGNALS.closedError, SIGNALS.refetching])).toEqual(
      INITIAL_MINT_PROMPT_STATE
    )
  })

  it('resets (latch + dismissal) when no longer applicable', () => {
    const userDismissed: MintPromptState = {
      variant: 'closed-error',
      dismissed: true,
    }
    expect(run([SIGNALS.notApplicable], userDismissed)).toEqual(
      INITIAL_MINT_PROMPT_STATE
    )
  })

  it('keeps a dismissed closed card dismissed through refetch, then resets on a clean quote', () => {
    const userDismissed: MintPromptState = {
      variant: 'closed-impact',
      dismissed: true,
    }
    expect(
      run(
        [SIGNALS.refetchingUnavailable, SIGNALS.closedImpactQuote],
        userDismissed
      )
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
    expect(
      derive({ inputValue: 500_001, ...closed, maxMintUsd: 0 }).rawCapacity
    ).toBe(false)
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
    // Market open and healthy: high impact raises nothing — the zapper already
    // quotes every RFQ/AMM source, so there's no better venue to point at.
    expect(
      derive({ hasValidQuote: true, truePriceImpact: 1.2, source: 'zap' })
        .rawClosedImpact
    ).toBe(false)
  })

  it('raises closed-error only while unavailable', () => {
    expect(derive({ ...closed, hasQuoteError: true }).rawClosedError).toBe(true)
    expect(derive({ hasQuoteError: true }).rawClosedError).toBe(false)
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
      hasValidQuote: true,
      mintingUnavailable: false,
      isApplicable: false,
    })
  })

  it('leaves a sub-$1k cap (floored to 0) to the quote-failure path', () => {
    // floorOndoMaxUsd(<1000) = 0: no pre-quote warning even though minting is
    // available — the zapper's own error state surfaces the failed mint.
    expect(derive({ inputValue: 500, maxMintUsd: 0 }).rawCapacity).toBe(false)
  })
})
