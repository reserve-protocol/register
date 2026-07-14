# Overview View — Agent Guide

Self-contained context for changing this view. Mock mechanics live in
`e2e/CLAUDE.md` (cookbook); architecture in `docs/wiki/domains/e2e.md`.
Chart/mcap semantics are NOT repeated here — read
`docs/wiki/domains/overview-charts.md` (price/candle granularity, downsampling)
and `docs/wiki/domains/basket-overview.md` (the two-mcap invariant) before
touching charts or the Holdings table. `docs/wiki/sdk.md` governs any Index DTF
hook/updater here.

## What this view is

The Index DTF landing page: hero stats (name/symbol/price), the price chart
across time ranges, the Holdings table (Exposure/Collateral tabs), plus
about/cover/creator/socials/metrics blocks. Name/symbol/price provenance is
split and load-bearing: **name/symbol come from the SDK** (`GetIndexDTF`
snapshot → mappers), **price comes from the reserve-api REST endpoint**
(`current/dtf` in `use-dtf-price.ts`), **chart series from `historical/dtf`
REST** — none of these three is the subgraph. Basket rows are RPC
`totalAssets` + token metadata joined with api prices. Don't move live state
into the subgraph mock to "fix" a test.

## Did a diff here — which test?

| You changed | Run / extend |
|---|---|
| Hero name/symbol/price render | `e2e/tests/smoke/overview.spec.ts` (base/bsc/mainnet matrix) |
| SDK data path / mappers / atoms | `e2e/tests/smoke/dtf-data.spec.ts` (the canary) |
| Holdings table, Exposure/Collateral tabs, mcap cell | `e2e/tests/flows/overview.spec.ts` (holdings test) |
| Price chart, time-range selector, ranges | `e2e/tests/flows/overview.spec.ts` (chart test) |
| Deprecated/inactive-state rendering | `e2e/tests/flows/overview.spec.ts` (deprecated test) |
| Anything in hooks/atoms shared across the above | smoke + full: `pnpm exec playwright test e2e/tests/flows/overview.spec.ts` |

Quick loop: `pnpm e2e:smoke` (overview + dtf-data smokes, seconds); full flow
`pnpm exec playwright test e2e/tests/flows/overview.spec.ts`.

## The multichain matrix (only one in the suite)

`overview.spec.ts` @smoke loops base/lcap, bsc/cmc20, mainnet/open — the
suite's ONLY per-chain matrix. It proves the RPC/subgraph/api mocks answer per
the URL's chain (mainnet/open is a genuine v4.0.0 DTF), not one Base-shaped
answer. If you touch chain-conditional overview logic, this matrix is the guard
— keep all three.

## How to mock this domain's states

- **Prices (hero + chart)**: served from snapshots by identity — `current/dtf`
  → `current-price.json`, `historical/dtf` → `historical-price.json`
  (`e2e/helpers/api.ts`). For real per-asset magnitudes overlay
  `overrides.api({ pathname: '/historical/prices', search: { address } }, ...)`
  — that branch **echoes the requested address** and defaults to an empty
  `timeseries` (consumer reads empty as price 0), so a mismatched address 500s
  loud rather than silently serving another asset's series.
- **Ranges**: buttons carry `data-testid="overview-range-<value>"` and
  `data-active="true|false"` (`time-range-selector.tsx`). Footer is duplicated
  for xl/non-xl layouts — always scope locators `:visible`. Each switch refetch
  hits `historical/dtf` with a different `from`/`to`/`interval`; assert the
  request window (`from < to`, interval ∈ `5m|1h|1d`), not point counts.
- **No frozen clock here.** Overview specs run on real time (unlike governance)
  — ranges compute `from`/`to` from `Date.now()`, so keep assertions relative
  (`from < to`), never pin absolute timestamps.
- **Deprecated/inactive**: driven by the discover/dtfs snapshot `status`; the
  Inactive badge (`overview-inactive-badge`, rendered in `chart-overlay.tsx`)
  keys on the testid — label is Lingui-translated, never assert copy.

## The mcap framing trap (do not cross the two numbers)

Full semantics in `docs/wiki/domains/basket-overview.md`. In tests: Exposure
crypto rows show the **native/tradfi asset** mcap (`group.marketCap` via
coingeckoId); Collateral rows show the **tokenized wrapper's own** mcap
(`token.marketCap`). Deliberately different numbers for the same top asset —
the holdings test flips tabs and asserts the mcap value changes and restores.
A test where both tabs read the same mcap is the regression, not a passing
test. Chart downsampling is shared (`src/utils/chart-downsample.ts`); the api
mock serves candles line-shaped, so specs exercise the line-chart fallback.

## Coverage ledger (honest)

- **Covered**: name/symbol/price @smoke on all three chains; the dtf-data
  canary (raw SDK snapshot shape — first suspect when every surface renders
  skeletons); Exposure↔Collateral mcap framing; price chart across ranges with
  request-window/interval/identity + real area-curve `d` assertions;
  deprecated-DTF inactive badge.
- **Not covered — planned**: chart empty / young-DTF states; performance vs
  BTC/ETH denominations (BTC data-type mode is BTC+ yield-index only).
- **Not covered — deferred**: the factsheet route
  (`index-factsheet-overview.tsx`, parallel range map — see overview-charts
  wiki; don't half-sync it).

## Edge cases to keep covered (or consciously skip)

- Every chain in the smoke matrix (drop none — it's the chain-mock guard).
- Tab round-trip: Exposure → Collateral → Exposure must restore Exposure mcaps,
  not stick on Collateral values.
- Ranges not offered for a DTF: loop skips absent `overview-range-*` buttons —
  don't assert a fixed range set.
- Zero-weight exposure groups drop; nasdaq/nyse groups flatten to per-stock
  rows (mirror `buildExposureRows`, don't hardcode row counts).

Behavior changes to on-chain/SDK data flow here are an engineer-review surface
(repo stop-condition) — tests passing is not sign-off.
