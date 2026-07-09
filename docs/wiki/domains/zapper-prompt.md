---
title: Zapper Prompt
updated: 2026-07-03
type: domain
sources:
  - src/views/index-dtf/components/zapper/**
---

# Zapper Prompt (large-mint-prompt)

Side-card next to the instant zapper (`ZapperWrapper` → `LargeMintPrompt`) that
raises the strongest applicable concern about the current trade. Despite the
legacy file names, since cowswap-prompt-rework it recommends **CoW Swap**, not
the internal automated mint. Renders in both mounts: inline on the issuance
route, and portal-attached to the right edge of the overview zapper modal
(mode `modal` gates on the modal being open; the portal geometry assumes the
modal stays `sm:max-w-md`).

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

## Variants (priority order, reducer-enforced)

1. `capacity` (5) — input USD > floored weighted cap, **only while minting is
   available**. Pre-quote (input-derived). No CTA; copy names the session and
   invites splitting into multiple transactions (limits are per transaction).
2. `closed-impact` (4) — minting unavailable + resolved **non-enso** quote
   with `truePriceImpact > 1`. The user pays an un-arbitraged-pool premium;
   copy says when to come back. No CTA.
3. `closed-error` (3) — minting unavailable + quote error (no route at all).
   Same come-back copy. No CTA.
4. `impact` (2) — minting not unavailable, valid quote, `truePriceImpact > 1`.
5. `large` (1) — minting not unavailable, valid quote, input ≥ $50k.
6. `error` (0) — minting not unavailable, quote error, input ≥ $100.

Come-back label: market closed → `formatOndoTime(market.nextOpen)`; open but
an asset paused → next tradable session (`getNextTradableSession`, cycle
premarket → regular → postmarket → overnight; missing session buckets fall
back to the regular cap, matching the API's `sessionCapacity`; a wrap back to
the current session means "tomorrow" and uses the generic fallback copy).

CTA (impact/large/error only): external
`swap.cow.fi/#/{chainId}/swap/{sell}[/{buy}]` link via `cow-swap.ts`; native
placeholder `0xeeee…eeee` maps to ETH/BNB symbols. Both buy and sell tabs;
verbs are separate lingui messages, never interpolated.

**Off-hours rule (PM):** while minting is unavailable the three CoW-CTA
variants are suppressed and never rendered — off-hours the tokenized-stock
legs can't be arbitraged, so CoW's secondary liquidity is as stale as the
pools. An enso quote resolving while unavailable (or any quote ≤ 1% impact)
shows nothing: the user is fine.

## Invariants

- Raw signals are derived in the pure `deriveMintPromptSignals`
  (`large-mint-prompt-state.ts`, unit-tested) — the component only feeds it
  atoms/hooks. The enso exclusion, availability gates, and input floors live
  there; regressions are test failures, not silent behavior changes.
- The reducer **latches** through the zapper's periodic refetch where
  `quote`/`error`/`source` transiently clear; only a clean valid quote,
  leaving the applicable domain, a dropped capacity signal, or (for CoW
  variants) a flip to minting-unavailable resets. Reset also clears dismissal.
- A latched variant only **escalates** in priority, never downgrades — with
  two exceptions: capacity clears the moment its input-derived signal drops,
  and a live CoW winner replaces a latched closed variant (a CoW signal firing
  proves minting resumed; otherwise the stale "come back later" card would pin
  through the reopen).
- A latched CoW card is dropped mid-refetch the moment `mintingUnavailable`
  flips true — it must not point at stale CoW liquidity for even one cycle.
- Every raw signal must imply `isApplicable` (input ≥ $100), or refetch cycles
  reset+relatch and re-pop the mobile dialog.
- The tab-switch reset effect must stay declared after the reducer effect
  (declaration order decides who wins the commit). Folding the tab into the
  reducer is backlogged in [[progress]].
- Mixpanel CTA label is `cowswap_redirect` (props: variant, tab).
