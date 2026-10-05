# Optimistic governance migration (legacy DTFs → governance 1.1.0)

## Goal

Register lets anyone with voting power drive the whole legacy-DTF migration from the UI, and lets
holders move their stake in one guided flow:

1. **Folio upgrade** (done): banner proposes `GovernanceSpell_09_18_2026.upgradeFolio` on the Folio's
   owner governor once the vlRSR singleton runs 1.1.0.
2. **Vault retirement**: banner proposes `transferOwnership(spell)` + `retireOldStakingVault(oldVault)`
   on the old vault's DAO governor, with a warning listing DTFs still governed by that vault
   (button disabled until none remain).
3. **Stake migration**: CTA on overview + governance for holders of a retired old vault; modal stepper
   `redeem` (delay 0 → RSR arrives directly) → `approve(singleton)` → `depositAndDelegate`.

## Current state

- Order: VersionRegistry `registerVersion(1.1.0)` by the RoleRegistry owner → singleton vault/governor upgrades →
  `upgradeFolio` per DTF (except OPEN, ABX and the non-RSR-vault DTFs, which do not migrate) →
  `retireOldStakingVault` per old vault → 6.0.0 upgrade.
- Subgraph: after `upgradeFolio`, `dtf.stToken` moves to the singleton; the old owner governor lands in
  `dtf.legacyAdminGovernances` (`Governance.token` = old vault). `StakingToken.dtfs` only lists DTFs still
  pointing at a vault.
- SDK (dtf-interface `feat/index-dtf-v6-support`): `getLegacyVoteLocks` only reads `stToken.legacyGovernance`;
  proposal governance ids omit legacy admin governors and old-vault DAOs, so post-migration history and the
  retire proposal are invisible.
- Verified on a Base fork: old Ownable vault `redeem` with delay 0 transfers RSR in the same tx; the 1.1.0
  vault exposes `depositAndDelegate(uint256)`.

## Non-goals

- Exiting without re-depositing (the stepper always ends in the singleton).
- Claiming pre-existing unstake locks (portfolio "pending withdrawals" already covers it).
- OPEN/ABX vault paths, 6.0.0 upgrade gating.

## Acceptance evidence

- Base fork e2e (no mocks): banner 1 → execute → banner 2 from the UI → execute (old vault retired, delay 0)
  → migration modal from the UI with a real holder → old shares 0, singleton shares and self-delegated
  votes up by the redeemed RSR.
- SDK unit tests for the new mapping/reads; Register unit tests for every eligibility rule.
- Offline smoke + governance flows stay green.

## Test seams

- SDK: subgraph/RPC client mocks in the existing `legacy-vote-lock.test.ts` style.
- Register: pure eligibility helpers (vitest); UI + writes through the Base fork lane.

## Slices

Status 2026-10-05: all three slices built; Base fork e2e green end to end (uncommitted, engineer review required).

- SDK legacy vote-lock data: `legacyAdminGovernances` in the DTF + proposal-governance queries,
  `getLegacyVoteLocks` includes old admin governors' vaults, proposal ids include legacy admin governors
  and their vault DAOs, new `getVoteLockDependents(vault)` (subgraph `StakingToken.dtfs` + on-chain
  `hasRole(DEFAULT_ADMIN_ROLE, ownerTimelock)`), react hooks; blocked by: none.
- Register retire banner (banner 2) + fork e2e extension; blocked by: SDK slice.
- Register stake-migration CTA + modal stepper + Mixpanel events + fork e2e extension; blocked by: SDK slice.

## Findings

- Independent review (2026-10-05) fixed: retire proposals carry a `#n` nonce (a defeated attempt left the same
  proposal id); dependents also count trading governance (REBALANCE_MANAGER) voting with the vault; the upgrade
  banner mirrors `upgradeFolio`'s role/fee-recipient requires so it never offers a proposal that reverts at
  execute; the stepper resolves receipts against the submitted step and waits for the allowance read; closing the
  modal keeps progress; the retire banner requires the vault owner to be the DAO timelock and checks every old vault.

- DTFs whose vote-lock vault is not an RSR vault (vlPMF, vlVIRTUAL, vlDTF…) do not migrate: the upgrade banner,
  the retire banner and the migration CTA all require an RSR vault.
- Anvil fills `eth_sendTransaction` gas with the exact estimate and the legacy vault `redeem` runs out of gas
  (nested calls, 63/64 rule); real wallets pad estimates. Watch for OOG reports on wallets that don't.
- After on-chain execution and before the subgraph indexes it, the upgrade banner can briefly show again
  (subgraph still reports legacy governors); the executed-proposal check hides it once indexed.

## Unresolved decisions

- `registerVersion(1.1.0)` must land on each chain before the singleton vault upgrades (in progress).
- Final design of the migration CTA/modal (this build is the functional baseline).
- Publishing: SDK release that carries the v6 + migration changes (Register links it locally until then).
