# Index DTF 6.0.0 deploy

Fixed points: Register `feat/index-dtf-v6` at `00217d8f0`; SDK `feat/index-dtf-v6-support` at `e476103`; zapper-api `feat/folio-6` at `f012f952` (Jorge, unmerged); subgraph `feat/index-dtf-v6-indexing-sandbox` (1.11.2-test).

## Goal

Register deploys Folio 6.0.0 DTFs only, on both routes (manual = FolioDeployer from the wallet; simple = zapper `/deploy`), governed by an existing optimistic vault, a new vault, or a wallet (ungoverned), and lands on the new DTF from the deploy receipt.

## Current state

- Register deploy is 5.0.0 end to end: v5 deployer for writes/approvals/platform fee, owner+trading governance params, `auctionLength`, one fee table; Create DAO deploys a legacy vote-lock (rejected by 6.0.0); the zap body is the 5.0.0 shape the new zapper rejects.
- Existing bug: "Existing DAO" deploys look for `FolioDeployed` instead of `GovernedFolioDeployed`, so the receipt is never matched and there's no redirect.
- SDK: 6.0.0 `prepareIndexDtfDeploy*` builders and `extractIndexDtfDeployedAddress` exist and are fork-tested; no builder for a new 1.x staking vault (governance deployer 1.1.0 `deployWithNewStakingVault`), no 1.1.0 deployer constants, missing bounds checks (governor params, fee caps, zero amounts, zero selector, throttle 1–12, stToken must be an optimistic vault).
- Subgraph: indexes 6.0.0 deploys and the 1.1.0 governance deployer on all chains; non-blocking gaps (timelock type label, `voteExtension` not indexed, `proposalThreshold` units at creation vs update to verify).
- Zapper: `feat/folio-6` replaces the 5.0.0 body on the same paths (single `govParams`, `maxAuctionLength`, `immutableFeeRecipients`, `folioFeeForSelf`, non-zero optimistic `stToken`); response is one tx to the ZapperDeployer; no CORS; local on 127.0.0.1:7778 over Tailscale (optimizer + internal nodes), needs pricing API keys.

## Non-goals

5.0.0 deploys; deploying the zapper; DTF settings/governance pages (already v6-aware).

## Decisions

- 6.0.0 only, both routes (user, 2026-10-08).
- The permissionless `/deploy-index` route is removed; `/internal/deploy` is the only deploy wizard (user, 2026-10-08).
- Governance options: existing optimistic vault (validated on chain), new vault via `deployWithNewStakingVault` (creates the vault and its own DAO, as the legacy Create DAO did) then `deployGovernedFolio`, or a wallet (ungoverned) (user, 2026-10-08).
- UI built functionally from existing deploy and v6 settings components; Erik approved the screens (2026-10-08).
- Zap target: dev-only `VITE_ZAPPER_DEPLOY_API` override plus a Vite proxy (`ZAPPER_LOCAL_URL`) to the local zapper (no CORS on the zapper). Local zapper per Jorge: `ZAPPER_SEARCH_OPTIMIZER_URL=http://192.168.100.155:7780 ZAPPER_PRICING_URL=http://192.168.100.159:7791 pnpm run cli zapper service --chains eth --chains base --chains bsc --hostname 127.0.0.1 --port 7778 --request-timeout 120000` (Tailscale on; no pricing keys needed).
- Governance fee share goes to the vault's `tokenJar()` (swaps fees into the vault asset), not the vault itself as in 5.0.0; a zero or unreadable jar blocks the deploy. **Engineer review required** (fee routing).
- A governance share without a vault, or shares that don't fill the pool, throw in the builder instead of landing on the last (possibly permanent) recipient.
- The new vault's own DAO reuses the form's governance params, guardians and optimistic proposers, with no optimistic selectors.

## Acceptance evidence

- SDK unit tests for the new vault builder/extractor and every new bound; SDK fork test creating a vault then a governed Folio through the builders.
- Register unit tests: schema bounds, fee tables (mutable + immutable + self fee), manual call args against the SDK, zap body, receipt event choice (incl. the existing-DAO fix).
- Base fork lane: manual governed (existing vlRSR), manual governed (new vault, two txs), manual ungoverned — each deployed from the UI and read back on chain (version 6.0.0, roles, fees, governor params), redirect to the new DTF.
- Zap: quote from the local zapper-api for a governed and an ungoverned body; the returned tx executed on a Base fork from the UI; Folio read back as 6.0.0.
- Screenshots for Erik (desktop + phone) of the new form sections.

## Test seams

SDK builders/extractors (pure, unit); Register form schema and payload atoms (jotai store tests); the Base fork lane for wallet + receipt; the local zapper for the zap contract.

## Slices

- Slice 1 — SDK: 1.1.0 governance deployer constants, new-vault builder + receipt extractor, bounds checks, tests, build; blocked by: none.
- Slice 2 — Register form: schema/defaults/steps for `maxAuctionLength`, immutable recipients, self fee, unified governance (standard + veto + selectors + proposers + guardians + timelock + throttle); blocked by: none.
- Slice 3 — Register manual route: SDK 6.0.0 builders, v6 deployer for approvals and platform fee, Create DAO on the new builder, existing-vault preflight, receipt via the SDK extractor; blocked by: 1, 2.
- Slice 4 — Register zap route: 6.0.0 body, target/spender checks, local zapper wiring; blocked by: 2.
- Slice 5 — Base fork lane + local zapper run + screenshots; blocked by: 3, 4.
- Slice 6 — Subgraph: confirm `proposalThreshold` units for 6.0.0 governors and fix if Register shows the wrong value; blocked by: none.

## Unresolved decisions

- Subgraph `proposalThreshold` units: creation stores `proposalThreshold()` = ratio × vote supply (tokens), updates store the D18 ratio, and the SDK maps it as a D18 percentage. A 6.0.0 DTF on an existing vault with supply (vlRSR) would show a wrong threshold until the first update. Live MAG7 governors show 1e15 (0.1%) today. Fix in the subgraph (read `proposalThreshold` ratio via storage-free path or derive from supply) — pending owner.
- Release order: zapper-api `feat/folio-6` must deploy before Register's zap route (production zapper still expects the 5.0.0 body).
