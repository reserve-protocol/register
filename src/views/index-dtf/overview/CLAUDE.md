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
about/cover/creator/socials/metrics blocks. Name/symbol/price all come from
the SDK's `GetIndexDTF` snapshot (`useCurrentIndexDtf()` in
`index-dtf-container.tsx` → `indexDTFAtom`/`indexDTFBasketPricesAtom`); hero
price is `indexDTFPriceAtom`, the DTF's own basket price keyed off that same
snapshot (`state/dtf/atoms.ts`) — `overview/hooks/use-dtf-price.ts` (a
standalone `current/dtf` fetch) has zero importers, dead code. Chart series
is the SDK's price-history query (`use-dtf-price-history.ts` →
`useIndexDtfPerformance`, still backed by `historical/dtf` under the hood) —
none of these three is the subgraph. Basket rows are RPC `totalAssets` +
token metadata (same SDK snapshot) joined with api prices. Don't move live
state into the subgraph mock to "fix" a test.

## Layout: content column + xl rail

`index.tsx` renders the content column (chart, About section, basket, fees,
governance, creator notes, transactions, disclosure) and, at xl only,
`components/landing-mint` — the rail: the **inline** Zapper first
(`overview-inline-zapper`; the container skips its modal mount on `/overview`
at xl — one Zapper per route, `docs/wiki/zapper.md`), then the cover slot
(collapses when there is no brand cover, e2e-guarded), About this DTF, Ask Reserve AI (embedded chat,
`overview-ask-ai`; the floating launcher hides on this route at xl), About
Reserve. Below xl the same cards render in the content column; on mobile the
basket leads unless the About card is the compact video library.
Below xl the floating action bar (`index-ctas-overview-mobile.tsx`, portal
to body) carries Buy/Sell + chat on the overview — `xl:hidden` here,
`lg:hidden` on every other DTF route — and the chat launcher hides below xl
on this route (`dtf-chat-hide-launcher-below-xl`).

**About this DTF** (`components/about-dtf.tsx`): DTFs with their own explainer
cut render the video library (`components/video-library`, three shared cuts +
one `Meet $SYMBOL` cut per DTF in `MEET_VIDEO_BY_SYMBOL`, all on
`storage.reserve.org`, poster = `<same base name>.jpg`); every other DTF keeps
the written description (`index-about-overview.tsx`, mandate/brand
description + cover + downloadable resources).

**Equity-backed copy** (`dtf-categories.ts`, TEMPORARY until the backend serves
categories): `isStocksDTF` gates the "100% backed by real stocks" badge and the
stock-specific Ask Reserve AI chips; other DTFs get the generic chips.

## Did a diff here — which test?

| You changed                                                                        | Run / extend                                                                                             |
| ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Hero name/symbol/price render                                                      | `e2e/tests/smoke/overview.spec.ts` (base/bsc/mainnet matrix)                                             |
| Hero loading lifecycle (skeleton→content, no reflow), chart island independence    | `e2e/tests/index-dtf/overview/lifecycle.spec.ts`                                                         |
| SDK data path / mappers / atoms                                                    | `e2e/tests/smoke/dtf-data.spec.ts` (the canary)                                                          |
| Holdings table, Exposure/Collateral tabs, mcap cell                                | `e2e/tests/flows/overview.spec.ts` (holdings test)                                                       |
| Price chart, time-range selector, ranges                                           | `e2e/tests/flows/overview.spec.ts` (chart test)                                                          |
| Degenerate chart/holdings data (empty/single-point history, 0-supply, zeroed mcap) | `e2e/tests/flows/overview-edge.spec.ts`, `e2e/tests/index-dtf/overview/edge-cases.spec.ts`               |
| Deprecated/inactive-state rendering                                                | `e2e/tests/index-dtf/overview/state-space.spec.ts`, `e2e/tests/flows/overview.spec.ts` (deprecated test) |
| Unbranded DTF / cover slot                                                         | `e2e/tests/index-dtf/overview/edge-cases.spec.ts`                                                        |
| Anything in hooks/atoms shared across the above                                    | smoke + full: `pnpm exec playwright test e2e/tests/flows/overview.spec.ts`                               |

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
- **Deprecated/inactive**: `useIndexDtfStatus(identity)` is a SYNCHRONOUS
  lookup in `@reserve-protocol/dtf-catalog` — no fetch, not mockable via
  api/subgraph override; a DTF must genuinely be curated deprecated in the
  catalog package to render the badge (see the `deprecated` registry entry).
  Feeds `indexDTFStatusAtom` (`index-dtf-container.tsx`), consumed via the
  pure `isInactiveDTF()` predicate (`@/hooks/use-dtf-status.ts` — that file's
  own `useDTFStatus`/discover-fetch/KNOWN_DEPRECATED path isn't used here, it
  backs the Discover/Earn views instead). The Inactive badge
  (`overview-inactive-badge`, rendered in `chart-overlay.tsx`) keys on the
  testid — label is Lingui-translated, never assert copy.
- **Unbranded DTF**: `overrides.api({ pathname: '/folio-manager/read' }, {})`
  → the SDK settles brand as undefined and the cover slot collapses
  (`overview-cover-slot` / `overview-cover-skeleton`) — a settled state, not a
  loading one. Covered in `e2e/tests/index-dtf/overview/edge-cases.spec.ts`.
- **Stat cards**: `overview-mcap` / `overview-tx-volume` (+`-loading`) live in
  `fees-stats.tsx`, which renders mobile AND desktop copies — always scope
  locators `:visible`. Market cap derives from the `/historical/dtf` series;
  tx volume from the anonymous transferEvents subgraph query.

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

- **Covered**: name/symbol/price @smoke on all three chains; hero L1→L3
  loading lifecycle + no-reflow, chart island resolving independently of the
  hero; the dtf-data canary (raw SDK snapshot shape — first suspect when every
  surface renders skeletons); Exposure↔Collateral mcap framing; price chart
  across ranges with request-window/interval/identity + real area-curve `d`
  assertions; deprecated-DTF inactive badge; a 0-supply DTF still resolves the
  chart instead of hanging on a truthy-totalSupply guard; unbranded DTF
  collapses the cover skeleton once loaded; empty/single-point price history
  and a zeroed-mcap Holdings table degrade without blanking the hero or
  crashing.
- **Not covered — known bug (`test.fixme`)**: selecting the Market
  Cap/Supply data-type only swaps the chart's Y-axis — the hero keeps
  showing the unit price, because `PriceValue` in `chart-overlay.tsx` always
  reads `indexDTFPriceAtom` regardless of data-type.
- **Not covered — planned**: performance vs BTC/ETH denominations (BTC
  data-type mode is BTC+ yield-index only).
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
