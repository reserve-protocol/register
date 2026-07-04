---
title: Subgraphs
updated: 2026-07-03
type: context
---

# Subgraphs — Index & Yield indexing

Two separate Goldsky subgraph families. Neither is live truth: **live basket, live proposal state, and live auction state come from RPC** (see `docs/data-sources.md`). Register's client wiring: `src/state/chain/atoms/chainAtoms.ts`.

## Index — [dtf-index-subgraph](https://github.com/reserve-protocol/dtf-index-subgraph)

- Networks: **mainnet, Base, BSC. No Arbitrum.** Goldsky slugs `dtf-index-<network>/prod`. Mustache templating (`subgraph.yaml.mustache` + `networks.json`); deployer addresses/startBlocks per Folio version (1.0/2.0/4.0/5.0; BSC starts at 4.0).
- Entities: `DTF` (Folio; fees, roles as lowercase string arrays, governance links, v5 `bidsEnabled`/`trustedFillerRegistry`), `Token`, `TransferEvent`, `Account`/`AccountBalance`/`Minting`, `Rebalance`→`Auction`→`RebalanceAuctionBid` (v4/v5 model; `Trade`/`AuctionBid` are the deprecated v1/v2 shape), `Governance`/`Proposal`/`Vote` (+ optimistic: `OptimisticProposalMetadata`, selector registry, timelock operations), `StakingToken`/`Delegate`/`Lock`/`RewardClaim`, `RSRBurn`.
- **`TransferEvent.type`** is a string: `"MINT"` (from 0x0), `"REDEEM"` (to 0x0), `"TRANSFER"`. Mint attribution walks receipt logs to find the **true minter** past zappers/routers (`src/token/mappings.ts` `handleMintEvent`); `Minting.firstMintTimestamp` is set once per account+token.
- **No USD anywhere** — all amounts are raw `BigInt`; price externally (Reserve API). **No live basket/holdings entity** — only rebalance target weights.
- IDs: lowercase addresses; immutable event rows keyed `{token}-{txHash}-{logIndex}` (idempotent — reserve-api's mint ingestion relies on this).
- Optimistic vs standard voting power are separate fields on `Delegate`/`StakingToken`/`AccountBalance` — never merge.
- Grafting currently disabled (clean reindexes after a graft couldn't replay pre-prune role grants); `indexerHints: prune auto`.

## Yield — [reserve-subgraph](https://github.com/reserve-protocol/reserve-subgraph)

- Networks: **mainnet, Base, Arbitrum One** (slugs `dtf-yield-*`; register points Arbitrum+BSC yield clients at `reserve-arbitrum/prod`). Uses graph-cli `--network` + `networks.json` (committed `subgraph.yaml` shows Base values — don't trust it for other chains). Note: the protocol repo's deployed-addresses index records only FacadeMonitor on Arbitrum — treat Arbitrum yield as live-but-sparsely-documented.
- Entities: `Protocol` (singleton aggregates), `RToken` (roles, rsrExchangeRate, revenue, basketsNeeded), `Token` (with `lastPriceUSD`), `RTokenContract` (reverse lookup MAIN/BASKET_HANDLER/…), `Trade` (batch kind=1 / dutch kind=0), `Account*` trio, `Entry` (activity log), governance stack, `RTokenHistoricalBaskets`, daily/hourly snapshots.
- **`Entry.type`** values actually emitted: `MINT` (issuance), `REDEEM` (user redemption), `BURN` (Furnace melt — from a known RTokenContract), `TRANSFER`, `STAKE`/`UNSTAKE`/`UNSTAKE_CANCELLED`/`WITHDRAW`. **`ISSUE` and `CLAIM` are defined but never assigned — filtering on them returns nothing.**
- **USD is approximate**: `Entry.amountUSD` = `token.lastPriceUSD × value`, where prices refresh at most hourly (`metrics.ts`) from `Facade.price()` (RTokens) / Chainlink (RSR); a reverting price call falls back to **0**, not last-known. Only RSR + RTokens are priced — collateral tokens aren't.
- Governance across protocol upgrades is re-wired via **hardcoded spell maps** (`src/common/spells.ts` for 3.4.0, `spell4_2_0` dataSource for 4.2.0). An RToken missing from those maps silently loses governance tracking after an upgrade — first suspect when governance data looks frozen.
- No grafting; full reindex from genesis startBlocks.

## Register query surfaces

- Yield views query the subgraph directly (legacy, expected): `src/views/yield-dtf/**`, `src/state/rtoken/**`, explorer/tokens hooks.
- Index views should go through the SDK; direct index-subgraph queries still exist (governed-dtfs, auctions updaters, deploy utils, top100, internal lists) — flagged in [[improvements]] as SDK-first migration targets.
- Shared conventions when querying either: lowercase addresses in IDs, unix-seconds timestamps, `first`/`skip` pagination (max 1000), derived fields can't be filtered server-side.
