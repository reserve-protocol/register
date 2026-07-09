---
title: Yield Protocol
updated: 2026-07-03
type: context
---

# Yield DTF Protocol — RToken ([protocol](https://github.com/reserve-protocol/protocol))

Legacy-but-live protocol behind `src/views/yield-dtf/**`. Maintenance mode: releases are spell upgrades + collateral plugins, not new features. Production code is `contracts/p1/` (`p0` is the reference spec). Latest release 4.2.0; most live RTokens run 3.4.0. Docs: `docs/overview.md`, `docs/system-design.md`, `docs/deployed-addresses/` (per-version, per-RToken; `index.json` is the source of truth).

## Components (one line each)

`Main` (hub/roles/pause-freeze) · `RToken` (ERC20, issue/redeem + throttles) · `BackingManager` (collateral custody, recollateralization auctions) · `BasketHandler` (basket config, `status()` SOUND/IFFY/DISABLED, `refreshBasket()`) · `StRSR`/`StRSRVotes` (RSR staking, unstaking delay + draft queue, governance token) · `Distributor` (revenue split) · two `RevenueTrader`s · `Furnace` (melts RToken revenue) · `Broker` + `GnosisTrade` (batch) / `DutchTrade` (dutch, 3.0+) · `AssetRegistry` (collateral plugins).

## Facades — what register actually calls

Modern (3.x+) design is one diamond-style `Facade` with facets: **ReadFacet** (`issue()`, `redeem()`, `basketBreakdown()`, `backingOverview()`, `pendingUnstakings()`, `price()`, `auctionsSettleable()`, `primeBasket()`), **ActFacet** (`claimRewards`, `runRevenueAuctions`, `revenueOverview`, `nextRecollateralizationAuction`), **MaxIssuableFacet**, plus FacadeWrite (one-tx RToken + governance deploy) and FacadeMonitor. Pre-3.x had separate FacadeRead/FacadeAct monoliths — register's vendored `src/abis/FacadeRead/Act/Write.ts` reflect this; resolve the right facade per RToken version, don't assume one global.

## Version facts that shape UI

- **Issuance/redemption throttles** (per-block amount+percent, refilling): read `issuanceAvailable()`/`redemptionAvailable()` before enabling buttons.
- **`redeem()` reverts when not fully collateralized** ("partial redemption; use redeemCustom") — `redeemCustom()` (3.x) takes eras+portions. Check `basketHandler.fullyCollateralized()` to pick the path.
- 4.x adds `issuancePremium` (issue cost > 1 basket when collateral under peg), DAO fee in Distributor, registries (Version/AssetPlugin/DAOFee/Role). Every component exposes `version()` — branch on it.
- **Governance**: standard OZ Governor + TimelockController over `StRSRVotes`; `proposalThreshold` is micro-percent of elastic stRSR supply; proposals from a pre-seizure era are invalid (`startedInSameEra`). Spell upgrades (3.4.0, 4.2.0) swap governor/timelock — register vendors `Spell3_4_0.ts`/`Spell4_2_0.ts`, and the yield subgraph re-wires governance via hardcoded spell maps (see [[subgraphs]] — an unmapped RToken freezes there).
- **Collateral status drives warnings**: plugin `status()` SOUND/IFFY/DISABLED refreshed by `AssetRegistry.refresh()`; basket status = worst collateral; DISABLED triggers backup-basket switch + recollateralization auctions (and possible stRSR seizure). Any non-SOUND state (or within `warmupPeriod`) should gate issuance and surface a warning.
- **Chains**: mainnet (full stack: eUSD, ETH+, hyUSD, USDC+, USD3, dgnETH), Base (hyUSD, Vaya, bsdETH). Arbitrum: the repo's deployed-addresses index records only FacadeMonitor — see [[subgraphs]] for the indexing status.
- Auctions: batch trades settle on Gnosis EasyAuction (external UI); dutch trades are on-chain falling-price with direct `bid`. `Broker` can disable a trade kind per-token after a violation.
