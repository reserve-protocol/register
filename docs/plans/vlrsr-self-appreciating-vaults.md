# vlRSR Self-Appreciating Vote-Lock Vault Support

## Goal

Register correctly quotes, unlocks, and displays self-appreciating StakingVaults (first: vlRSR `0xE744C8157c346B2931807F42552c8CBc0BB6D34f` on BSC): unlock tab operates in shares via `redeem`, lock tab shows real shares-out, governance and portfolio show exchange rate + redeemable underlying instead of assuming 1:1. Powered by dtf-sdk 0.5.1 (`prepareVoteLockRedeem`, `VoteLockState.shareBalance`/`exchangeRate`, preview hooks).

## Current state

- vlRSR streams tokenJar-converted RSR into the vault (half-life drip); rate ≈ 1.0188, `getAllRewardTokens() = []`.
- Drawer assumes 1:1: `vote-lock.tsx` echoes input as shares out; `vote-unlock.tsx` takes an asset-denominated input labeled as vlRSR (`unlockBalanceAtom` = maxWithdraw); tx = `withdraw(assets)`.
- Governance card: hardcoded `AUTO_ACCRUING_REWARD_VAULTS` Set; "Automatic" branch requires `otherDtfCount > 0`.
- Portfolio rows show API `amount` (shares) priced 1:1 (API bug, out of scope).
- `previewDeposit`/`previewRedeem` are exact and ≈1:1 for legacy vaults → quotes need no vault-type detection.
- Subgraph has no per-user cost basis → no "earned" number until subgraph slice (separate repo).

## Non-goals

- reserve-api share-pricing fix; earn-view "Your lock" valuation; per-user earned before subgraph deploy; tokenJar UI/SDK plumbing; `optimisticStakingVaultAddress` map.

## Acceptance evidence

| Criterion | Evidence |
| --- | --- |
| Unlock = shares → redeem for all vaults | e2e flow decodes `redeem(shares, account, account)` calldata from txLog; visual check bsc/photon + one legacy vault |
| Lock quote shows previewDeposit shares | visual check both vault types (vlRSR ≈ input/1.0188; legacy = input), light+dark |
| Governance card catalog-driven, Automatic decoupled from otherDtfCount, rate/redeemable line | smoke governance spec extended on bsc/photon; visual check |
| Portfolio flagged rows show redeemable + rate, fallback to API on RPC failure | portfolio partial-response spec green; visual check |
| Scoped verify green per slice | `scope.mjs --base <fixed-point>` output; `--gate` at closeout |

## Test seams

- e2e `e2e/helpers/rpc.ts` callOverrides: add `convertToAssets` (`0x07a2d13a`) + per-address `previewDeposit` (`0xef8b30f7`) / `previewRedeem` (`0x4cdad506`) with 1.0188-rate values on bsc/photon vlRSR fixture.
- Drawer submit buttons via wallet fixture + txLog decode.
- SDK-side behavior already unit-tested in dtf-sdk (`vote-lock.test.ts`).

## Slices

- Slice B: drawer shares-based unlock + lock quote (src/components/vote-lock/); blocked by: SDK 0.5.1 (local-linked during dev; pin bump before merge)
- Slice C: catalog in constants + governance card rate/redeemable; blocked by: B (drawer state carries exchangeRate)
- Slice D: portfolio redeemable for flagged rows; blocked by: SDK 0.5.1 only (parallel to C)

## Follow-ups discovered during implementation

- ~~Yield staking table stRSR share-vs-asset bug~~ FIXED same day: `YourStakeCell` reads per-row `exchangeRate()` and mirrors reserve-api portfolioService math (`shares × rate × rsrPrice`); display now RSR-denominated like the TVL column. Verified against portfolioService.ts:606-611.
- MetaMask + BSC EIP-7825 failure mode (documented 2026-07-31): a wallet-node lag on a fresh approval makes the wallet's estimate revert → MetaMask falls back to 35% of block gas limit (19.25M) → BSC's 2²⁴ per-tx cap rejects it. Pre-existing race, fatal only since the Apr 2026 Osaka/Mendel hardfork; not caused by app code (no `gas` is set). Staled by Luis — revisit only if reports recur.

## Unresolved decisions

- e2e preview mocks: central fixed-value vs per-address 1.0188 overrides — decide while writing the drawer flow spec (leaning per-address for a real-rate assertion).
- Engineer review required before ship: SDK calldata surface (dtf-sdk) + withdraw→redeem tx change + governance card (register).
