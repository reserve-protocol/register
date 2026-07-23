# Data Sources & Routing

**Last Updated:** 2026-07-23

Ownership rules (which layer a read belongs in, SDK vs register): `docs/wiki/sdk.md`. This file is the exact endpoint/source matrix — which file consumes which source, today.

Where Register gets its data and why. Source of truth: [`dtf-tools/docs/KNOWLEDGE.md`](https://github.com/reserve-protocol/dtf-tools/blob/main/docs/KNOWLEDGE.md).

## Data Routing Rules

| Data | Source | Owner | Register Usage |
|------|--------|-------|-----------------|
| DTF snapshot (basket, price, fee, brand) | RPC + Reserve API + catalog, resolved inside the SDK | react-sdk hook `useCurrentIndexDtf` | `src/views/index-dtf/index-dtf-container.tsx` → `indexDTFAtom`, `indexDTFBasketPricesAtom` |
| DTF status (Index DTF pages: overview, issuance, governance) | Static `dtf-catalog` lookup inside the SDK — sync, no fetch | react-sdk hook `useIndexDtfStatus` | same container → `indexDTFStatusAtom` |
| DTF status (nav, home, discover, yield-dtf) | Reserve API `/discover/dtfs` | register direct fetch | `src/hooks/use-dtf-status.ts` (not yet migrated to the SDK hook) |
| DTF platform fee | On-chain registry read via the SDK | react-sdk hook `useIndexDtfPlatformFee` | container → `indexDTFFeeAtom` (`'unavailable'` on read failure, never a fabricated default) |
| Proposal state + list | RPC `governor.state()` resolved into `votingState` by the SDK | react-sdk hooks `useIndexDtfProposalList`, `useIndexDtfProposal` | `src/views/index-dtf/governance/updater.tsx`, `.../views/proposal/hooks/use-proposal-detail.ts` |
| Rebalance state — active/live | RPC `getRebalance()` / `totalAssets()` | register direct RPC (`useReadContracts`) | `src/views/index-dtf/auctions/views/rebalance/hooks/use-rebalance-current-data.ts`, `use-rebalance-initial-data.ts` |
| Rebalance state — completed/history (metrics) | SDK | react-sdk hook `useIndexDtfCompletedRebalance` | `.../rebalance-list/hooks/use-rebalance-metrics.ts` |
| Rebalance/auction lists (full field set incl. bids) | Index subgraph, direct GraphQL | register direct fetch | `src/views/index-dtf/auctions/updater.tsx`, `auctions/legacy/updater.tsx`, `auctions/views/rebalance/hooks/use-rebalance-auctions.ts` |
| Transaction feed (mint/redeem/transfer) | Index subgraph, direct GraphQL | register direct fetch | `src/hooks/useIndexDTFTransactions.ts` |
| Governed DTFs lookup (deploy: existing vote-lock DAO) | Index subgraph, direct GraphQL | register direct fetch | `src/views/index-dtf/governance/hooks/use-governed-dtfs.ts` |
| Historical performance chart (line / % change) | SDK | react-sdk hooks `useIndexDtfPerformance`, `usePrefetchIndexDtfPriceHistory`, `useIndexDtfPriceHistory` | `src/views/index-dtf/overview/hooks/use-dtf-price-history.ts`, `use-week-ago-pnl.ts` |
| Candlestick chart (OHLC) | Reserve API `/v2/historical/dtf/candles` | register direct fetch | `src/views/index-dtf/overview/components/charts/use-candlestick-data.ts` |
| APY history chart (yield-index hybrid DTFs) | Reserve API `/v1/dtf/apy/historical/:id` | register direct fetch | `src/views/index-dtf/overview/hooks/use-dtf-apy-history.ts` |
| Vote-lock state (per-DTF, delegate/voter) | SDK | react-sdk hooks `useIndexDtfVoteLockState`, `useIndexDtfVoterState` | `src/components/vote-lock/*`, `governance/components/governance-account-info.tsx` |
| Vote-lock positions (cross-DAO listing) + staking APY | Reserve API `/dtf/daos` | register direct fetch | `src/views/earn/views/index-dtf/hooks/use-vote-lock-positions.ts`, `overview/hooks/use-staking-vault-apy.ts` |
| Token prices (generic/multi-asset, non-DTF) | Reserve API `/current/prices` | register direct fetch | `src/hooks/useAssetPrices.ts`, `usePrices.ts`, deploy + governance basket-proposal builders, simulated basket preview |
| Portfolio balances | Reserve API `/v1/portfolio/:address` | register direct fetch | `src/views/portfolio-page/hooks/use-portfolio.ts` |
| Portfolio history | Reserve API `/v1/historical/portfolio/:address` | register direct fetch | `src/views/portfolio-page/hooks/use-historical-portfolio.ts` |
| Discover/listing table | Reserve API `/discover/dtfs` (`?performance=true&brand=true`) | register direct fetch | `src/hooks/useIndexDTFList.ts` → home discover table |
| Alias → address resolution (`/dtf/:alias` routes) | SDK catalog | react-sdk hook `useIndexCatalog` | `index-dtf-container.tsx` |

**Mappers**: there are no register-side fee/brand mapper files — that mapping (`mapIndexDtfData`) lives inside `@reserve-protocol/react-sdk` itself. Register's `IndexDTFBrand` type (`src/state/dtf/atoms.ts`) is a straight re-export of the SDK's `IndexDtfBrand` — register stores the SDK shape as-is, no local transform.

**Cache-invalidation escapees**: a few files call `useDtfSdk()` directly (not a read, just for `queryClient.invalidateQueries` with SDK query-key builders) instead of a react-sdk hook — `src/components/vote-lock/hooks/use-vote-lock-refresh.ts`, `src/views/index-dtf/governance/hooks/use-recent-proposal-receipt.ts`, `.../governance/views/propose/shared/hooks/use-proposal-type-eligibility.ts`. Tracked as migration debt in `docs/wiki/sdk.md`.

## Reserve API

Base URL: `https://api.reserve.org`

### Key Endpoints

| Endpoint | Purpose | Params | Consumers |
|----------|---------|--------|-----------|
| `GET /current/dtf` | Single DTF price + basket (legacy convenience path — not used by Overview/Hero, only internal tooling) | `address`, `chainId` | `src/views/internal/dtf-list/hooks/use-dtf-market-caps.ts`, `src/views/top100/api.ts` |
| `GET /current/dtfs` | Batch DTF price data | `addresses` (comma-sep), `chainId` | `src/hooks/usePrices.ts` (`useDTFPrices`) |
| `GET /current/prices` | Token prices with consensus | `chainId`, `tokens` (comma-sep) | `src/hooks/useAssetPrices.ts`, `usePrices.ts`, deploy/governance basket updaters, simulated basket |
| `GET /discover/dtfs` | DTF listing + status (paginated) | `performance`, `brand` query flags | `src/hooks/useIndexDTFList.ts` (discover table), `src/hooks/use-dtf-status.ts` (nav/yield-dtf status) |
| `GET /historical/dtf` | DTF time series (TVL, supply, price) | `address`, `chainId`, `from`, `to`, `interval` | `src/hooks/use-rebalance-basket-preview.ts` (proposal preview snapshot), `src/views/top100/api.ts` |
| `GET /v2/historical/dtf/candles` | Candlestick OHLC series | `address`, `chainId`, `from`, `to`, `interval` | `src/views/index-dtf/overview/components/charts/use-candlestick-data.ts` |
| `GET /v1/dtf/apy/historical/:id` | Yield-index hybrid APY history | `chainId` | `src/views/index-dtf/overview/hooks/use-dtf-apy-history.ts` |
| `GET /historical/prices` | Token price history | `chainId`, `address`, `from`, `to`, `interval` | `src/hooks/useSimulatedBasket.ts` |
| `GET /dtf/daos` | Vote-lock positions + yields (list, or `/dtf/daos/:id` per-DTF) | `chainId` | `src/views/earn/views/index-dtf/hooks/use-vote-lock-positions.ts`, `overview/hooks/use-staking-vault-apy.ts` |
| `GET /v1/portfolio/:address` | Cross-DTF wallet balances | — | `src/views/portfolio-page/hooks/use-portfolio.ts` |
| `GET /v1/historical/portfolio/:address` | Portfolio value history | `period` | `src/views/portfolio-page/hooks/use-historical-portfolio.ts` |

**Price consensus**: 7 sources (Coinbase, CMC, Alchemy, DefiLlama, Odos, Moralis, internal). Cached ~60s with 30s stale-while-revalidate.

**Important**: `/current/dtf` basket uses `Folio.toAssets(1e18, 0)` — rounding=0 is Floor. Only relevant to the legacy consumers above; the SDK snapshot hook does not use this endpoint.

## DTF Index Subgraph

Hosted on Goldsky. Full schema in [`dtf-tools/docs/subgraph-reference.md`](https://github.com/reserve-protocol/dtf-tools/blob/main/docs/subgraph-reference.md).

Register still queries this directly (via `graphql-request`) for reads the SDK hasn't taken over yet: transaction feed, rebalance/auction history lists, and the deploy flow's governed-DTFs lookup (see Data Routing Rules above). DTF metadata/governance/fees/brand no longer come from a register-side subgraph query — they ride in on the SDK snapshot hook instead.

### Endpoints

| Network | URL |
|---------|-----|
| Mainnet | `https://api.goldsky.com/api/public/project_cmgzim3e100095np2gjnbh6ry/subgraphs/dtf-index-mainnet/prod/gn` |
| Base | `https://api.goldsky.com/api/public/project_cmgzim3e100095np2gjnbh6ry/subgraphs/dtf-index-base/prod/gn` |
| BSC | `https://api.goldsky.com/api/public/project_cmgzim3e100095np2gjnbh6ry/subgraphs/dtf-index-bsc/prod/gn` |

### ID Formats

- All IDs are **lowercase hex**
- DTF: `{folio_address}`
- Rebalance: `{dtf}-{nonce_hex}` (nonce 3 = `0x03`)
- Auction: `{dtf}-{auctionId}`
- Governance: `{governor_address}`

### Key Entity Fields

**DTF**: `weightControl` (Boolean), `priceControl` (Int: 0/1/2), `bidsEnabled` (Boolean), `feeRecipients` (string: `"address:portion,address:portion"`, D18 portions)

**Rebalance**: `priceControl` is String (stringified: "0"/"1"/"2") — different from DTF entity which uses Int.

## Gotchas

1. **`availableUntil` for active rebalance check, NOT nonce** — Nonce 0 is valid for first rebalance
2. **`getRebalance()` reverts when empty** — Wrap in try/catch, return null
3. **Subgraph IDs must be lowercase** — Always `.toLowerCase()` when querying
4. **Proposal states** — DEFEATED/EXPIRED/SUCCEEDED are resolved by the SDK's `votingState` (backed by RPC `governor.state()`), not the subgraph — never build a local proposal-state derivation
5. **Governor uses timestamp clock** — All timepoints are unix timestamps, NOT block numbers
6. **BSC subgraph may be unreliable** — RPC-based reads always work on BSC
7. **V5 `auctions(id)` is incomplete** — Only returns `(rebalanceNonce, startTime, endTime)`, not sell/buy details

## Contract Versions

Register detects version via `folio.version()` (returns string like "4.0.0", "5.0.0").

| Version | Status | Notes |
|---------|--------|-------|
| v4.x | Legacy (upgradeable) | Upgrade banner shown automatically |
| v5.x | Current production | New deployments use v5 |

Key V4→V5 differences:
- `startRebalance()`: parallel arrays → struct array (`TokenRebalanceParams[]`)
- `openAuction()`: per-pair → full-token-set
- `bid()`: added explicit `sellToken`/`buyToken` params
- `getRebalance()`: returns `bidsEnabled` flag

See [`dtf-tools/docs/KNOWLEDGE.md`](https://github.com/reserve-protocol/dtf-tools/blob/main/docs/KNOWLEDGE.md) for full V3→V5 diff table.
