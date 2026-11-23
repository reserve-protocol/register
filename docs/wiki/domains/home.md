---
title: Home
updated: 2026-11-23
type: domain
sources:
  - src/views/home/**
---

# Home (landing page) and Discover

`/` tells the eUSD story through UGLYCASH, the Reserve fintech app: a dotted
globe hero, three live data cards (eUSD held, volume, transactions), the
country coverage map, the UGLYCASH card, a fintech contact card and a link to
Discover. DTFs are no longer promoted on `/`; they live on `/discover`, which
shares this folder (`discover.tsx`, `components/discover-*`). The DTF hero,
packing animation and featured cards were removed 2026-11-23.

## Layout

`home-stage.tsx` is the frame kept from the previous home: sticky sand stage,
hero on the left, a two-column card track that scrolls inside the stage on
`xl` (`use-homepage-hero-scroll` + `use-card-track-scroll`), and the glass
protocol-metrics pill. Cards use `home-card.tsx`, which reuses the
`FEATURE_CARD_*` classes in `highlighted-dtfs/constants.ts` so the home cards
and the Discover mobile cards share one shell.

## UGLYCASH data

`use-uglycash-metrics.ts` reads three reserve-api endpoints in one query
(1 h stale time): `metrics/uglycash/daily`, `metrics/uglycash/monthly` and
`uglycash/onchain-balance`.

- UGLYCASH is custodial: volume and transaction counts are ledger aggregates
  reported by UGLYCASH, not chain reads. The footnote on the page says so.
- The **held** number is different: it is the eUSD in UGLYCASH's wallets
  onchain (`withOnchainHeld` replaces the ledger balance per day and in the
  headline).
- Monthly charts show complete months only; the month in progress would read
  as a drop. A response with no complete month throws and the cards show the
  error state.
- A transaction type appears in a chart's legend, ticker and tooltip only when
  it has activity in that metric (`categories.volume` / `categories.count`).
- Every data card calls the hook itself; react-query dedupes. While loading the
  card keeps its final size with skeletons and crossfades (`Reveal`).

## Countries, map and globe

`data/countries.ts` is the source of truth for service coverage (full
custodial service vs self-custody; the list is a compliance input, do not edit
it from memory). Each entry has the Natural Earth `name` used to tag dots and
an ISO `code` used for the localized name (`Intl.DisplayNames`).

`data/geography.json` is generated: `python3 scripts/home-geography/generate.py`
tags the map and globe dots by country boundary and copies the route
centroids. Its inputs (`world-map.json`, `globe-dots.json`) stay in
`scripts/home-geography/` so they do not ship in the bundle. Regenerate after
changing the country list; `data/tests/countries.test.ts` fails when a listed
country has no dot.

## Theme and locale

- Colors come from tokens only. Category stacks are opacity steps of
  `--primary`, so they hold in dark mode.
- The globe is a canvas and reads tokens per frame. `--border-secondary` is
  near-black in dark mode, so the globe and the map switch their land color
  there.
- All copy goes through Lingui; dates, month names and country names follow
  the active locale. The stage sets `break-keep` for Korean.

## Performance invariants (do not break)

- The globe is one ref-driven canvas loop: no per-frame `setState`, paused
  when off screen or the tab is hidden, one still frame under reduced motion.
- `highlighted-dtfs/feature-card.tsx` / `feature-card-header.tsx` (Discover
  mobile cards) are `React.memo` with stable props so charts don't re-render
  on scroll.

## Discover

The discover table (`useIndexDTFList`, `v1/discover/dtfs?performance=true`)
returns daily 30d series (~31 pts). On mobile, `use-filtered-index-dtf`
requests `exposure` data (`useIndexDTFList({ exposure: !isDesktop })`) and
renders `IndexDTFFeatureCard` instead of the table. The exposure marquee sorts
weight-descending before the `BACKING_LIMIT` slice on both paths
(`mapExposureGroupsToTickers` and the raw-basket fallback).

See [[overview-charts]] for the overview granularity policy.
