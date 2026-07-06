---
title: Home
updated: 2026-07-06
type: domain
sources:
  - src/views/home/**
---

# Home (landing page)

Marketing landing: hero + packing animation, highlighted (featured) DTF
cards, discover table, metrics.

## Featured cards data

`use-featured-dtfs.ts` reads `v1/discover/featured` — the server decides the
performance period and density. reserve-api downsamples the series
server-side (`downsampleForSpan` in its `src/lib/chart-downsample.ts`,
span→bucket rule mirroring the overview policy: 3m span → daily, ~92 pts;
young DTFs keep hourly density), so `normalizeFeaturedItem` passes
`performance` through untouched. Each card draws the series twice (pattern +
stroke overlay), so density is paid double — keep the server series light.
Percentage/direction labels use `priceChange` from the server, which the API
computes from the full hourly series before downsampling.

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
