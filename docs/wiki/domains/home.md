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
performance period and density (currently ~90d of **hourly** data, ~2.1k
points per DTF). `normalizeFeaturedItem` downsamples it with
`downsampleForSpan` (`src/utils/chart-downsample.ts`, span→bucket rule shared
with the overview policy) so each card's `PerformanceChart` renders ~92
points instead of thousands — each card draws the series twice (pattern +
stroke overlay), so density is paid double. Percentage/direction labels use
`priceChange` from the server and the series first/last points, both
preserved by the downsample.

The discover table (`useIndexDTFList`, `v1/discover/dtfs?performance=true`)
already returns daily 30d series (~31 pts) — no downsampling needed there.

## Performance invariants (do not break)

- The packing animation is ref-driven (`computePackingFrame` in
  `dtf-packing-animation/geometry.ts`) — no per-frame `setState`.
- `feature-card.tsx` / `feature-card-header.tsx` are `React.memo` with stable
  props so the charts don't re-render on scroll.

See [[overview-charts]] for the full granularity policy and why the API
can't serve intermediate intervals.
