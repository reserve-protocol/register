---
title: Zapper Prompt
updated: 2026-07-23
type: domain
sources:
  - src/views/index-dtf/components/zapper/**
---

# Zapper Prompt (large-mint-prompt)

Side-card next to the instant zapper (`ZapperWrapper` → `LargeMintPrompt`) that
raises the strongest applicable **Ondo-market** concern about the current
trade. Despite the legacy file names it is purely informational since
react-zapper 2.7.0: the zapper itself quotes RFQ/intent sources (CoW Swap
`cowswap`, PancakeSwap X `pcsx`) alongside the aggregators, so every
redirect-for-price variant (`better-price`, `impact`, `large`, `error`) and the
external CTA were removed — there is no better venue to send the user to.
Renders in both mounts: inline on the issuance route, and portal-attached to
the right edge of the overview zapper modal (mode `modal` gates on the modal
being open; the portal geometry assumes the modal stays `sm:max-w-md`).
BSC-only (Ondo-backed AI DTFs).

## Ondo minting states (drive everything)

From `useOndoLimits` (`GET dtf/ondo`) + basket weights
(`indexDTFBasketSharesAtom`, percent strings keyed by lowercase address):

- **available** — market open and every reported `capacityUsd` > 0.
- **unavailable** — market closed, or any asset paused at `capacityUsd === 0`.
- **neither** — no ondo assets, or missing market data with healthy caps
  (fails open; the two predicates are deliberately not complements —
  `isOndoMintingAvailable`/`isOndoMintingUnavailable` in `utils/dtf-ondo.ts`).

The per-transaction DTF cap is **weighted**: each asset absorbs only its
basket-weight fraction of a mint, so the cap is `min(capacityUsd / weight)`
(`getOndoWeightedMaxUsd`), floored to $10k steps ($1k under $10k,
`floorOndoMaxUsd`) so the warning trigger equals the displayed number. See
[[decisions]] 2026-07-03 — this supersedes the earlier min-cap semantics.

## Variants (priority order, reducer-enforced; all informational, no CTA)

1. `capacity` (2) — input USD > floored weighted cap, **only while minting is
   available**. Pre-quote (input-derived). Copy names the session and invites
   splitting into multiple transactions (limits are per transaction).
2. `closed-impact` (1) — minting unavailable + resolved **non-enso** quote
   with `truePriceImpact > 1`. The user pays an un-arbitraged premium
   (secondary/RFQ liquidity is equally stale while arbitrage is blocked);
   copy says when to come back.
3. `closed-error` (0) — minting unavailable + quote error (no route at all).
   Same come-back copy.

Every quote-derived signal needs input ≥ $100 (`MIN_PROMPT_INPUT`). A high
price impact or quote error while minting is healthy shows nothing — the
zapper already surfaced the best quote across every source, and its own error
state covers no-route.

Come-back label: market closed → `formatOndoTime(market.nextOpen)`; open but
an asset paused → next tradable session (`getNextTradableSession`, cycle
premarket → regular → postmarket → overnight; missing session buckets fall
back to the regular cap, matching the API's `sessionCapacity`; a wrap back to
the current session means "tomorrow" and uses the generic fallback copy).

## Invariants

- Raw signals are derived in the pure `deriveMintPromptSignals`
  (`large-mint-prompt-state.ts`, unit-tested) — the component only feeds it
  atoms/hooks. The enso exclusion, availability gates, and input floors live
  there; regressions are test failures, not silent behavior changes.
- The reducer **latches** through the zapper's periodic refetch where
  `quote`/`error`/`source` transiently clear; only a clean valid quote,
  leaving the applicable domain, a dropped capacity signal, or (for closed
  variants) minting no longer being unavailable resets. Reset also clears
  dismissal.
- A latched variant only **escalates** in priority, never downgrades — except
  capacity, which clears the moment its input-derived signal drops.
- A latched closed card is dropped mid-refetch the moment `mintingUnavailable`
  flips false — the "come back later" copy must not pin through the market
  reopening (Ondo state is endpoint-derived, so the flip is a real transition,
  not a refetch gap).
- Every raw signal must imply `isApplicable` (input ≥ $100), or refetch cycles
  reset+relatch and re-pop the mobile dialog.
- The tab-switch reset effect must stay declared after the reducer effect
  (declaration order decides who wins the commit). Folding the tab into the
  reducer is backlogged in [[progress]].
- Mixpanel: `mint_prompt_shown` / `mint_prompt_dismiss` (props: variant, tab),
  one impression per surfaced variant. The `swap_redirect` CTA event is gone
  with the CTA.
