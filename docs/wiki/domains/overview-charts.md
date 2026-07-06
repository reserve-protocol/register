---
title: Overview Charts
updated: 2026-07-06
type: domain
sources:
  - src/views/index-dtf/overview/components/charts/**
  - src/views/index-dtf/overview/hooks/use-dtf-price-history.ts
  - src/views/index-dtf/overview/hooks/use-btc-price-history.ts
  - src/utils/chart-downsample.ts
---

# Overview Charts (Index DTF price/candles)

Line + candlestick charts on the Index DTF overview page. Data comes from the
Reserve API REST endpoints, not the SDK and not the subgraph.

## Granularity policy (line chart)

`historicalConfigs` in `price-chart-constants.ts` is the single source of
range → `from`/`to`/`interval`/`bucket`. `interval` is what the API is asked
for; `bucket` (seconds) is the display density applied client-side by
`downsampleToBucket` (`src/utils/chart-downsample.ts` — shared because the
home page needs it too; keeps last point per bucket plus the first and last
points — the last is the live "now" point):

- 24H → fetch `5m`, bucket 15m (~97 pts)
- 7D → fetch `1h`, no bucket (~169 pts)
- 1M → fetch `1h`, bucket 6h (~121 pts)
- 3M/YTD/1Y → fetch `1d`, no bucket (91–366 pts)
- All → fetch `1d`, weekly bucket only past 400 points (multi-year DTFs)

Why the client-side buckets: `historical/dtf` accepts **only** `5m`/`1h`/`1d`
(anything else is HTTP 400 — 15m/6h/1w do not exist server-side), and the
NAV-estimate series flips direction on ~50% of consecutive points, so raw
hourly beyond ~7 days (or raw daily-only on short ranges) reads badly: 1M at
raw `1h` was 721 points of fuzz, at `1d` only 31 points.

Do not reintroduce a "young DTF → force hourly" override: AI DTFs ship with
backfilled NAV, so long ranges are selectable at launch and the old <30d
override made YTD/1Y request 4.5k–8.8k hourly points (the "crazy chart" bug).

## Gotchas

- The API sometimes returns duplicate-timestamp rows and irregular gaps;
  `dedupeByTimestamp` (keep last) in `use-dtf-price-history.ts` cleans both
  fetch paths before the synthetic "now" point is appended. If a priced and
  an unpriced row ever share a timestamp, keep-last may drop the priced one —
  unobserved in real data so far.
- The factsheet has a parallel range map (`factsheet/utils/constants.ts`
  `getRangeParams`) that deliberately stays coarser (24h→1h, 1m→1d) until
  unified with `historicalConfigs` — that unification is in the
  [[progress]] backlog; don't half-sync it.
- Candlestick uses its own span-based intervals (`1h/4h/1d/7d/30d`) against
  `v2/historical/dtf/candles/` — a different endpoint with wider interval
  support than the line-chart one.
- BTC data-type mode exists only for the yield-index DTF (BTC+). Its
  historical `priceBTC` level (~1.1) disagrees with the live now-point
  (~0.34) — pre-existing data question, unrelated to granularity (backlog).
- BTC overlay klines come from Binance with the same `1h`/`1d` interval; the
  nearest-neighbor join tolerance is one bucket, and weekly-downsampled DTF
  points still match their same-day daily BTC point.

See [[sdk]] for why other Index DTF data must go through the react-sdk.
