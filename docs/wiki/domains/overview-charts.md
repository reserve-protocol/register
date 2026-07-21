---
title: Overview Charts
updated: 2026-07-14
type: domain
sources:
  - src/views/index-dtf/overview/components/charts/**
  - src/views/index-dtf/overview/hooks/use-dtf-price-history.ts
  - src/views/index-dtf/overview/hooks/use-btc-price-history.ts
  - src/utils/chart-downsample.ts
---


# Overview Charts (Index DTF price/candles)

Line + candlestick charts on the Index DTF overview page. The line-chart
timeseries now reads through the **SDK** (`sdk.index.getPriceHistory`, wrapping
the same `historical/dtf` REST endpoint) under the canonical
`dtfQueryKeys.index.priceHistory` key — shared by the chart, factsheet, and
week-ago PnL (`use-dtf-price-history.ts`, `use-week-ago-pnl.ts`). The
register-side hooks keep the product composition on top of the SDK's raw
points: dedupe-by-timestamp, the live current-point append (RPC supply ×
current price), range prefetch, and the 30-min refresh. A shared-key queryFn
must return the raw point array — derive scalars (e.g. week-ago last-positive
price) locally, never inside the cache entry. Candlesticks still use the REST
`v2/historical/dtf/candles` endpoint directly.

## Granularity policy (line chart)

`historicalConfigs` in `price-chart-constants.ts` is the single source of
range → `from`/`to`/`interval`/`bucket`. `interval` is what the API is asked
for; `bucket` (seconds) is the display density applied client-side by
`downsampleToBucket` (`src/utils/chart-downsample.ts`; keeps last point per
bucket plus the first and last points — the last is the live "now" point).
The home featured cards no longer use it: reserve-api serves the
`discover/featured` series as a YTD daily grid, matching the overview default
range and its displayed % (see [[home]]):

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

## Candlestick parity with the line chart

The candle chart (`use-candlestick-data.ts` + `candlestick-chart-body.tsx`)
must keep the line chart's perceived range when toggling chart types:

- Span-based intervals (`1h/4h/1d/7d/30d`) against `v2/historical/dtf/candles/`
  — a different endpoint with wider interval support than the line-chart one.
  Buckets are epoch-aligned server-side (`floor(ts/N)*N`, 7d weeks start on
  Thursdays) and aggregation clips at `from`, so the request `from` is snapped
  to the bucket grid (`snapToBucketStart`) — otherwise the first candle is a
  truncated bucket labeled before the window (YTD used to show "31 Dec").
- Range `all` clamps `from` to `max(0, dtf.timestamp - 1y)`, the same window
  as the line chart, instead of fetching the whole table. The coarse `30d`
  discovery query keeps using the identical snapped `from` so its query key
  still matches the main query when `all` resolves to `30d` candles.
- X-axis ticks reuse `useXAxisTicks` (no `xDomain` — a band scale NaN-drops
  tick values that aren't exact candle timestamps) so both charts label at the
  same proportional 5%–95% positions. Do not reintroduce a numeric skip
  `interval`: it decimates explicit ticks too.
- The "DTF Created" marker (`candlestick-launch-marker.tsx`) locates the
  bucket containing the launch (`locateCandleBucket`) and offsets by
  `fraction * bandwidth`, then feeds the precomputed x to the untouched
  `PriceChartLaunchMarker` via a synthetic single-value scale.
- Residual, accepted (decision): `snapToBucketStart` floors, so the candle
  window can start up to one bucket before the nominal range — most visible as
  a late-December first candle on YTD in years where Jan 1 isn't epoch-week
  aligned (2026 is; 2027+ mostly isn't). Chosen over ceil-snapping (which
  would drop up to one bucket of in-range data) — complete, honestly-labeled
  first candle wins. The right edge lags the line chart's live "now" point by
  ≤1 interval until the 30-min refetch.

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
- BTC data-type mode exists only for the yield-index DTF (BTC+). Its
  historical `priceBTC` level (~1.1) disagrees with the live now-point
  (~0.34) — pre-existing data question, unrelated to granularity (backlog).
- BTC overlay klines come from Binance with the same `1h`/`1d` interval; the
  nearest-neighbor join tolerance is one bucket, and weekly-downsampled DTF
  points still match their same-day daily BTC point.

E2E: charts are covered by [[e2e]] overview specs (`overview-price-chart`, `overview-range-<value>` testids; range buttons render duplicated xl/non-xl — scope locators `:visible`). The api mock serves the candles endpoint line-shaped, so tests exercise the line-chart fallback, not candles.

See [[sdk]] for why other Index DTF data must go through the react-sdk.
