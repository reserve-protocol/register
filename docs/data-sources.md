# Data Sources & Routing

**Last Updated:** 2026-03-04

Where Register gets its data and why. Source of truth: [`dtf-tools/docs/KNOWLEDGE.md`](https://github.com/reserve-protocol/dtf-tools/blob/main/docs/KNOWLEDGE.md).

## Data Routing Rules

| Data | Source | Why | Register Usage |
|------|--------|-----|----------------|
| Basket tokens + balances | RPC (`totalAssets()`) | Subgraph doesn't index basket | `useReadContract` hooks |
| Token prices | Reserve API (`/current/prices`) | 7-source consensus, MAD outlier removal | React Query via atoms |
| Basket + prices (convenience) | Reserve API (`/current/dtf`) | Single call for display | Overview pages |
| DTF metadata (governance, fees, roles) | Subgraph | Indexed from events | `indexDTFAtom` |
| Rebalance state | RPC (`getRebalance()`) | Real-time, bigint precision | Rebalance view hooks |
| Proposal state | RPC (`governor.state()`) | Subgraph misses DEFEATED/EXPIRED/SUCCEEDED | Governance atoms |
| Historical data (TVL, supply, prices) | Reserve API (`/historical/*`) | Time series | Charts, performance |
| Revenue data | Subgraph + Reserve API | Combined sources | Revenue display |
| Vote-lock yield | Reserve API (`/dtf/daos`) | Computed server-side | Earn/staking views |

## Reserve API

Base URL: `https://api.reserve.org`

### Key Endpoints

| Endpoint | Purpose | Params |
|----------|---------|--------|
| `GET /current/dtf` | Single DTF state + basket | `address`, `chainId` |
| `GET /current/dtfs` | Batch DTF data | `addresses` (comma-sep), `chainId` |
| `GET /current/prices` | Token prices with consensus | `chainId`, `tokens` (comma-sep) |
| `GET /discover/dtf` | DTF listing (paginated) | `chainId`, `sort`, `limit`, `offset` |
| `GET /historical/dtf` | DTF time series (TVL, supply) | `address`, `chainId`, `period` |
| `GET /historical/prices` | Token price history | `chainId`, `tokens`, `period` |
| `GET /dtf/rebalance` | Rebalance history + auction metrics | `address`, `chainId` |
| `GET /dtf/daos` | Vote-lock positions and yields | `chainId` |

**Price consensus**: 7 sources (Coinbase, CMC, Alchemy, DefiLlama, Odos, Moralis, internal). Cached ~60s with 30s stale-while-revalidate.

**Important**: `/current/dtf` basket uses `Folio.toAssets(1e18, 0)` — rounding=0 is Floor.

## DTF Index Subgraph

Hosted on Goldsky. Full schema in [`dtf-tools/docs/subgraph-reference.md`](https://github.com/reserve-protocol/dtf-tools/blob/main/docs/subgraph-reference.md).

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
4. **Proposal states** — DEFEATED/EXPIRED/SUCCEEDED only from RPC `governor.state()`, not subgraph
5. **Governor uses timestamp clock** — All timepoints are unix timestamps, NOT block numbers
6. **Fee recipients format** — Parse with `parseFeeRecipients()` or split on comma then colon
7. **BSC subgraph may be unreliable** — RPC-based reads always work on BSC
8. **V5 `auctions(id)` is incomplete** — Only returns `(rebalanceNonce, startTime, endTime)`, not sell/buy details

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
