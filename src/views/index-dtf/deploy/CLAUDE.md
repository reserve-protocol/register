# Index DTF Deploy Wizard — Agent Guide

Context for changing the deploy wizard (`/internal/deploy`). Register deploys
**Folio 6.0.0 only**; the plan and open decisions live in `docs/plans/index-dtf-v6-deploy.md`.

## What this view is

An accordion form (`components/deploy-accordion.tsx`, schema/defaults in `form-fields.ts`) with steps metadata →
basket → governance → fees → roles → auctions → governance-settings, then a drawer with two routes:

- **Manual** (`steps/confirm-deploy/manual/`): approvals to the 6.0.0 FolioDeployer
  (`INDEX_V6_DEPLOYER_ADDRESS`), then `prepareIndexDtfDeploy` / `prepareIndexDtfDeployGoverned` from the SDK.
- **Simple / zap** (`steps/confirm-deploy/simple/`): the zapper's `/deploy` (vault) or `/deploy-ungoverned`
  (wallet) builds one tx to its ZapperDeployer; Register refuses a quote whose `tx.to` or approval target is not
  `INDEX_ZAPPER_DEPLOYER_ADDRESS`.

Both routes build from one place: `utils/v6-deploy-params.ts` (`buildV6DeployParams`, `buildV6Governance`,
`resolveGovernanceRecipient`). The receipt is read with `utils/deployed-folio.ts` (SDK extractor, 6.0.0 deployer
events only).

## Governance options

| Option | Path | Notes |
|---|---|---|
| Existing vault | `governanceVoteLock` | Must be an optimistic 1.x vault (`isOptimisticVault`: `getOptimisticVotes` + timestamp clock). Legacy vote-locks are rejected. |
| New vault | `governanceERC20address` → Create DAO | `prepareIndexDtfDeployStakingVault` (governance deployer 1.1.0 `deployWithNewStakingVault`), then a governed deploy on the new vault. |
| Wallet | `governanceWalletAddress` | Ungoverned `deployFolio`; selecting it resets the governance share to 0. |

## Units and money (Engineer review required when touched)

- Form shares are % of all revenue (sum 100 with platform). 6.0.0 wants `folioFeeForSelf` as holders / non-platform
  and both fee tables (mutable + immutable "permanent recipients") as fractions of what holders leave, summing to
  1e18. The last row absorbs rounding only; a gap throws.
- The governance share goes to the vault's `tokenJar()` (via `governanceRecipientAtom`), never the vault.
- Governance: delays/periods in days, veto window in hours, thresholds/quorum in % → D18; throttle 1–12.

## Did a diff here — which test?

| You changed | Run / extend |
|---|---|
| Schema bounds, defaults | `tests/form-fields.test.ts` |
| Fee/governance mapping | `utils/tests/v6-deploy-params.test.ts` |
| Zap body | `steps/confirm-deploy/simple/tests/atoms.test.ts` |
| Receipt reading | `utils/tests/deployed-folio.test.ts` |
| Anything that reaches the contracts | `FORK_RPC_URL_8453=http://127.0.0.1:8546 pnpm vitest run src/views/index-dtf/deploy/utils/tests/v6-deploy.fork.test.ts` |
| The wizard UI end to end | `FORK_CHAIN_ID=8453 pnpm exec playwright test -c playwright.fork.config.ts e2e/fork/tests/deploy-v6.fork.spec.ts` (add `ZAPPER_LOCAL_URL=http://127.0.0.1:7778 VITE_ZAPPER_DEPLOY_API=/zapper-local/` for the zap test, `CAPTURE=1` for design screenshots) |

There is no offline (mocked) deploy spec yet; the fork lane is the coverage.

## Traps

- The zapper has no CORS: use the dev proxy (`ZAPPER_LOCAL_URL`) with `VITE_ZAPPER_DEPLOY_API=/zapper-local/`; the
  override is ignored outside dev builds.
