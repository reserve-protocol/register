---
title: Basket Overview (Exposure / Collateral tabs)
updated: 2026-07-08
type: domain
sources:
  - src/views/index-dtf/overview/components/basket-overview/**
---

The Holdings table on the Index DTF overview page. Two tabs over the same
basket: **Exposure** groups tokens by underlying asset (per-stock rows for
nasdaq/nyse groups, one aggregated row per crypto native), **Collateral**
lists the on-chain basket tokens. All data comes from the reserve-api
`dtf/exposure` endpoint via `indexDTFExposureDataAtom` (fetched in
`index-dtf-container.tsx`, refetched every 60s); live basket shares come from
`indexDTFBasketAtom`/`indexDTFBasketSharesAtom`.

## Market cap semantics (the invariant that was once a bug)

Two different numbers, one per tab — do not cross them:

- **Exposure** stock rows read `token.underlyingMarketCap` (real company mcap,
  served by reserve-api from Ondo GM `GET /v1/assets/all/market`). There is
  deliberately NO fallback to the tokenized mcap — absent data renders `—`.
  Crypto group rows read `native.coingeckoId → group.marketCap` via
  `indexDTFExposureMCapMapAtom` (unchanged path).
- **Collateral** rows read `marketCaps[token.address.toLowerCase()]` — the
  tokenized wrapper's own mcap (`token.marketCap`: CoinGecko-by-address or
  totalSupply×price). Keys in the map are lowercased; always lowercase lookups.

Gotchas:

- reserve-api's exposure route zod schema emits `additionalProperties: false` —
  new fields the service adds are silently stripped until added to
  `exposureTokenSchema` (`reserve-api src/routes/dtf/exposure/index.ts`).
- The route is CDN-cached (1h maxAge + 30m stale-while-revalidate): after an
  api deploy, exposure mcaps can lag up to the cache window.
- Exchange groups are flattened to per-stock rows (`buildExposureRows`), so a
  group-level mcap cannot represent them — per-token fields only.
- `MarketCapCell` is the shared desktop cell (both tabs); mobile rows repeat
  the label/value block inline (2 copies — extraction threshold is 3).

Weight/performance sorting is client-side in `index.tsx`; mcap is display-only
(not sortable). Bridge affordances come from [[zapper]]-adjacent `BridgeLabel`
scanning exposure groups by address.
