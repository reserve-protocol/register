---
title: Home
updated: 2026-07-08
type: domain
sources:
  - src/views/home/**
---

# Home (landing page)

Marketing landing: hero + packing animation, highlighted (featured) DTF
cards, discover table, metrics.

## Featured cards data

`use-featured-dtfs.ts` reads `v1/discover/featured` — the server decides the
performance period and density. Since 2026-07-08 the period is **YTD on a
daily grid** (reserve-api `discover/featured` route passes
`performancePeriod: "ytd", performanceInterval: "daily"`), deliberately
matching the overview page's default YTD range: same Jan-1-UTC window, same
`historical_dtf_price` daily grid, and `priceChange` = first-vs-last finite
daily point with **no live-price append** — numerically equal to the overview
overlay's (penultimate − first)/first, which skips its synthetic now-point.
~190–366 pts/card; `downsampleForSpan` is a no-op at daily density.
`normalizeFeaturedItem` passes `performance` through untouched. Each card
draws the series twice (pattern + stroke overlay), so density is paid double —
keep the server series light. Card order is server-driven (`order` array =
reserve-api `FEATURED_TOKENS`); the skeleton `featured-dtfs.ts` list mirrors
it so cards don't reshuffle when live data lands.

The exposure marquee sorts weight-descending at the client choke point
(`mapExposureGroupsToTickers` + basket fallback, before the `BACKING_LIMIT`
slice — top-N by weight, not first-N in basket order); the server also emits
`exposure` groups/tokens weight-descending.

The discover table (`useIndexDTFList`, `v1/discover/dtfs?performance=true`)
returns daily 30d series (~31 pts) — the same server-side downsample is a
no-op there.

## Performance invariants (do not break)

- The packing animation is ref-driven (`computePackingFrame` in
  `dtf-packing-animation/geometry.ts`) — no per-frame `setState`.
- `feature-card.tsx` / `feature-card-header.tsx` are `React.memo` with stable
  props so the charts don't re-render on scroll.

See [[overview-charts]] for the overview granularity policy and why
`historical/dtf` can't serve intermediate intervals.
