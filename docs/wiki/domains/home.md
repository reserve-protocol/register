---
title: Home
updated: 2026-07-23
type: domain
sources:
  - src/views/home/**
---

# Home (landing page)

Marketing landing: hero + packing animation, highlighted (featured) DTF
cards, discover table, metrics. (The hero's "Watch explainer" button and the
DTF explainer dialog were removed 2026-07.) The highlighted card's transcript
preview still opens a `VideoModal` explainer, instrumented via
`trackClick('home' | 'discover', 'video', address)` on open.

## Featured cards data

`use-featured-dtfs.ts` reads `${RESERVE_API}v1/discover/featured` (prod by
default; staging only when `VITE_STAGING_API` is set) — the server decides the
performance period and density. Since 2026-07-08 the period is **YTD on a
daily grid** (reserve-api `discover/featured` route passes
`performancePeriod: "ytd", performanceInterval: "daily"`), deliberately
matching the overview page's default YTD range: same Jan-1-UTC window, same
`historical_dtf_price` daily grid, and `priceChange` = first-vs-last finite
daily point with **no live-price append** — numerically equal to the overview
overlay's (penultimate − first)/first, which skips its synthetic now-point.
~190–366 pts/card; `downsampleForSpan` is a no-op at daily density.
`normalizeFeaturedItem` passes `performance` through untouched; the period
label falls back to `YTD` (not 1M) when the server omits it. Each card
draws the series twice (pattern + stroke overlay), so density is paid double —
keep the server series light. Card order is server-driven (`order` array =
reserve-api `FEATURED_TOKENS`); the skeleton `featured-dtfs.ts` list mirrors
it so cards don't reshuffle when live data lands.

The exposure marquee sorts weight-descending before the `BACKING_LIMIT`
slice — top-N by weight, not first-N in source order — on **both** paths:
`mapExposureGroupsToTickers` and the raw-basket fallback
(`getBasketTickerAssets`).

The discover table (`useIndexDTFList`, `v1/discover/dtfs?performance=true`)
returns daily 30d series (~31 pts) — the same server-side downsample is a
no-op there. On mobile, `use-filtered-index-dtf` requests `exposure` data
(`useIndexDTFList({ exposure: !isDesktop })`) to render the basket/exposure
column that desktop shows via hover.

## Performance invariants (do not break)

- The packing animation is ref-driven (`computePackingFrame` in
  `dtf-packing-animation/geometry.ts`) — no per-frame `setState`.
- `feature-card.tsx` / `feature-card-header.tsx` are `React.memo` with stable
  props so the charts don't re-render on scroll.

See [[overview-charts]] for the overview granularity policy and why
`historical/dtf` can't serve intermediate intervals.
