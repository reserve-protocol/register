---
title: Index Protocol
updated: 2026-07-03
type: context
---

# Index DTF Protocol — Folio ([reserve-index-dtf](https://github.com/reserve-protocol/reserve-index-dtf))

"Folio" is the contract name for an Index DTF: an upgradeable ERC20 share token holding a basket, with mint/redeem, fees, and a rebalance/auction machine. The repo `README.md` + `CHANGELOG.md` are authoritative; unit conventions use braces (`D18`, `D27{buyTok/sellTok}`).

## Version landscape (register must track this)

Releases: 1.0.0 → 2.0.0 → (3.0.0 skipped) → **4.0.0** (rebalance-target model, `AUCTION_APPROVER`→`REBALANCE_MANAGER`, trusted fillers, 24h fee accrual) → **5.0.0** (weight ranges in `startRebalance`, bids can be disabled/restricted to trusted fillers) → 5.1.0 → **6.0.0** ("optimistic governance" release: trade-token allowlist, Folio self-fee, per-auction custom lengths, partial atomic swaps, optimistic deployer).

- On-chain version registry: `FolioVersionRegistry` (`registerVersion`/`getLatestVersion`); upgrades via `FolioProxyAdmin.upgradeToVersion`.
- `startRebalance`/`openAuction`/`bid` signatures changed across versions — register keeps per-version vendored ABIs (`src/abis/dtf-index-abi-v*.ts`) selected by `folio.version()`, and the SDK gates write ABIs by version string (see [[sdk]]).
- StakingVault (vote-lock, ERC4626-style, multi-reward, unstaking delay) and the governance deployers live in the separate `reserve-governor` dependency, not this repo.

## Mechanics that shape UI behavior

- **`totalSupply()` includes pending fee shares** (DAO + recipients) — ignoring them breaks price/share math. `distributeFees()` concretizes.
- Mint pulls basket assets pro-rata (ceil), redeem pays out pro-rata (floor); `redeem`'s `assets[]` must match basket order. Redeem always works, even on deprecated DTFs.
- **Rebalance lifecycle**: `REBALANCE_MANAGER` (trading governor timelock) `startRebalance(tokens, limits, launcherWindow, ttl)` → during the restricted window only `AUCTION_LAUNCHER` opens auctions (may tighten limits/weights/prices within governance-approved ranges) → afterwards anyone may `openAuctionUnrestricted` (spot values) → dutch auction (exponential decay) filled by `bid()` or trusted fills → `closeAuction`/`endRebalance`. One auction at a time.
- **Roles**: `DEFAULT_ADMIN_ROLE` = owner governor timelock (fees, roles, basket edits, deprecation); `REBALANCE_MANAGER` = trading governor timelock; `AUCTION_LAUNCHER` = semi-trusted EOA whose worst case is bounded value leakage.
- Registry addresses (canonical, from `script/Deploy.s.sol`): versionRegistry `0xA665b273997F70b647B66fa7Ed021287544849dB` (ETH+Base; BSC `0x79A4E963378AE34fC6c796a24c764322fC6c9390`); trustedFillerRegistry Base `0x72DB5f49D0599C314E2f2FEDf6Fe33E1bA6C7A18`, ETH `0x279ccF56441fC74f1aAC39E7faC165Dec5A88B3A`, BSC `0x08424d7C52bf9edd4070701591Ea3FE6dca6449B`. Per-DTF addresses: GitHub Releases page of the repo.

## Trusted fillers ([trusted-fillers](https://github.com/reserve-protocol/trusted-fillers))

Async CoW Swap fills for Folio auctions (Folio ≥ some 4.x deployments; register consumes via `@reserve-protocol/trusted-fillers-sdk` in the cowbot at `src/views/index-dtf/auctions/views/rebalance/components/cowbot/`).

- Flow: Folio calls `TrustedFillerRegistry.createTrustedFiller(...)` → deterministic EIP-1167 clone of a governance-approved filler implementation (`CowSwapFiller`) → clone holds sell tokens and validates the CoW settlement via EIP-1271 → funds return on close.
- **Same-block invariant**: a filler is valid only in the block it was initialized — settlement happens pre-hook→settle→post-hook within one block. Don't expect a persistent contract to query; between order placement and solver execution there is nothing on-chain.
- **Fills don't look like bids**: no Folio `bid()` call — the footprint is `TrustedFillerCreated` + CoW settlement events. The index subgraph tracks `AuctionTrustedFillCreated`, but a fill can otherwise be invisible to bid-shaped queries.
- Filler enforces min price (D27), zero fee, receiver==self; `closeFiller`/`emergencyCloseFiller`/`rescueToken` recover funds — a clone or the GenericTokenJar can transiently hold funds.
- GenericTokenJar (Base) is the register-facing signing flow: EIP-712 `FillRequest` signed by an owner Safe via WalletConnect; the SDK's `processJarBalances` wraps it.
