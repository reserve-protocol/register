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

## Variants (priority order, reducer-enforced)

1. `capacity` — input USD > min `capacityUsd` across the DTF's Ondo assets
   ([[sdk]]-independent; data via `useOndoLimits` → `GET dtf/ondo`). Fires
   pre-quote (input-derived), market open or closed — off-hours the API
   reports regular-session caps and the copy labels them "Regular".
   Suppressed only when min cap is 0 (per-asset pause — the async-mint
   trading-paused banner owns that). No CTA. Min-cap (not weight-adjusted)
   semantics were the confirmed product ask.
2. `impact` — valid quote with `truePriceImpact > 1` (percent, positive = user
   loses value — zapper convention).
3. `large` — valid quote, input ≥ $50k.
4. `error` — quote error, input ≥ $100.

CTA (all but capacity): external `swap.cow.fi/#/{chainId}/swap/{sell}[/{buy}]`
link via `cow-swap.ts`; native placeholder `0xeeee…eeee` maps to ETH/BNB
symbols. Both buy and sell tabs; verbs are separate lingui messages, never
interpolated.

**Ondo off-hours inversion** (PM rule): on DTFs with Ondo assets, the three
CoW-CTA variants are suppressed while `market.isOpen === false` — off-hours
the tokenized-stock legs can't be arbitraged, so pushing users to CoW's stale
secondary liquidity is harmful. The capacity warning is the exact inverse: it
fires off-hours too (no CTA, informational). Missing market data fails open.

## Invariants

- The reducer (`large-mint-prompt-state.ts`, unit-tested) **latches** through
  the zapper's periodic refetch where `quote`/`error` transiently clear; only
  a clean valid quote, leaving the applicable domain, or a dropped capacity
  signal resets (reset also clears dismissal so the card can return).
- A latched variant only **escalates** in priority, never downgrades: racing
  providers and refetches produce consecutive quotes with different concerns
  (impact 1.2% → 0.9%+large → transient error), and re-latching the latest
  signal made the card flicker between variants. Capacity is the exception —
  it clears the moment its input-derived signal drops.
- Every raw signal must imply `isApplicable` (input ≥ $100), or refetch cycles
  reset+relatch and re-pop the mobile dialog — the impact signal carries an
  explicit input floor for this.
- The tab-switch reset effect must stay declared after the reducer effect
  (declaration order decides who wins the commit). Folding the tab into the
  reducer is backlogged in [[progress]].
- Mixpanel CTA label is `cowswap_redirect` (props: variant, tab); the old
  `compare_automated_mint` label died with the rework.
