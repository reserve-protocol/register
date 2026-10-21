# Optimistic governance migration (Index DTFs → governance 1.1.0)

## Goal

Register lets anyone with voting power drive the governance 1.1.0 rollout from the UI, and lets holders
move their stake in one guided flow:

1. **Vote-lock upgrade**: banner proposes the vlRSR singleton's vault, governor and timelock upgrade to 1.1.0.
2. **Folio upgrade**: banner proposes `upgradeFolio` on the Folio's owner governor once the target vault
   runs 1.1.0. Shared vlRSR for most DTFs; OPEN moves into vlSQUILL through `GovernanceSpell_10_19_2026`
   and ABX into vlALTT through the shared spell.
3. **DTF governance upgrade** (AI DTFs, MAG7): after the vlRSR singleton runs 1.1.0, a banner proposes on
   the DTF's governor `upgradeToAndCall` of that governor and its timelock, with `initializeVersionRegistry`.
4. **Vault retirement**: banner proposes `transferOwnership(spell)` + `retireOldStakingVault(oldVault)` on
   the old vault's DAO governor. It is a separate proposal because the vault's own timelock owns it. It
   shows after the page's DTF has upgraded, and stays disabled while any other DTF still votes with that vault.
5. **Pre-upgrade lock**: a Governance card lets holders lock in the new vault before the upgrade executes.
6. **Stake migration**: card + modal on Governance, Overview and Portfolio for holders of a retired vault:
   `redeem` (delay 0 → tokens arrive in the same tx) → `approve` when short → `deposit`/`depositAndDelegate`.

## Current state

- Order: VersionRegistry `registerVersion(1.1.0)` → singleton vault upgrades → `upgradeFolio` per legacy DTF
  and the DTF governance upgrade per AI DTF → `retireOldStakingVault` per old vault.
- Subgraph: after `upgradeFolio`, `dtf.stToken` moves to the new vault; the old owner governor lands in
  `dtf.legacyAdminGovernances` (`Governance.token` = old vault). `StakingToken.dtfs` only lists DTFs still
  pointing at a vault.
- SDK 0.7.0: `getLegacyVoteLocks` also reads the old admin governors' vaults, and proposal governance ids
  include legacy admin governors and old-vault DAOs, so post-migration history and the retire proposal show.
- All banners and cards show only for active DTFs (catalog status).

## Decisions

- Delegation is preserved: standard = existing new-vault delegate, else the old vault's `delegates(account)`,
  else self; optimistic = existing optimistic delegate, else the standard one. When the account already
  delegates both on the new vault, it deposits plainly so its delegation is untouched.
- Recovery: a per-viewer `localStorage` record (chain, old vault, account) holds the redeem hash, the
  received amount, the delegate captured before redeeming and the pending hash. The redeem receipt is
  re-read on load; storage alone never advances a step. A failed receipt wait or a redeem without a
  `Withdraw` log from the old vault frees the step for a retry.
- Amount locked = min(received, wallet balance). Approval is exact and only when allowance is short. With
  nothing left to lock, the modal offers Close and acknowledges the migration.
- DTFs whose vault is neither RSR-backed nor OPEN/ABX do not migrate.

## Non-goals

- Exiting without re-depositing.
- Claiming pre-existing unstake locks (Portfolio "pending withdrawals" covers it).
- Migrating positions of other accounts (Portfolio impersonation shows no action).
- 6.0.0 upgrade gating.

## Acceptance evidence

- Unit: eligibility for every banner, proposal encoding, record parsing, step derivation, delegate choice.
- Fork lanes (no mocks): LCAP, ABX (Base) and OPEN (Ethereum) lock from the pre-upgrade card, execute
  `upgradeFolio`, retire the old vault and migrate a holder; POWER (BSC) executes the DTF governance
  upgrade and the 1.1.0 governor accepts a new proposal.
- Offline smoke and the proposal-detail e2e for the upgrade calls stay green.

## Findings

- Retire proposals carry a `#n` nonce (a defeated attempt left the same proposal id); dependents also count
  trading governance voting with the vault; the upgrade banner mirrors `upgradeFolio`'s role and
  fee-recipient requires so it never offers a proposal that reverts at execute.
- The 1.1.0 governor reads `getPastAverageVotes` from its vault, so the DTF governance upgrade must wait for
  the vault upgrade or every pessimistic proposal reverts.
- Anvil fills `eth_sendTransaction` gas with the exact estimate and the legacy vault `redeem` runs out of gas
  (nested calls, 63/64 rule); real wallets pad estimates.
- After execution and before the subgraph indexes it, the upgrade banner and the pre-upgrade card can show
  briefly; they hide once indexed.
- MAG7 does not load on Anvil (a basket token's `totalAssets` reverts), so its fork lane uses POWER.

## Unresolved decisions

None blocking. Engineer review required (governance calldata, vote-lock writes, delegation).
