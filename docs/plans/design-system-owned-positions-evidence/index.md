# Owned Portfolio position evidence

Candidate: [slice contract](../design-system-owned-positions-slice.md).
Route: `/internal/design-system/components/table#owned-positions-review`.
Current Review remains Auctions. No production component, shared default,
transaction, preview-port configuration or live data adapter is changed.

The [September 13 checkpoint](../design-system-review-checkpoint-evidence-2026-09-13/README.md)
losslessly externalizes `final/report.json` attachments. Paths are relative to that
report; test outcomes, source provenance and original image bytes are preserved.

## Provenance and limits

Vault identities and underlying/governed tokens come from the retained
[public DAO capture](../design-system-table-family-evidence/earn-source-2026-09-11/daos.json).
Current hidden-symbol filtering is retained. Staking identities are confirmed by
the `symbol()` records in `e2e/snapshots/mainnet/eusd/rtoken-chain-state.json`
and `e2e/snapshots/base/hyusd/rtoken-chain-state.json`. All wallet quantities,
exchange-rate overlays, rates and values are explicitly illustrative. No real
wallet holdings or balances are claimed.

[Source spec](../../../e2e/design-system/owned-positions-source-capture.spec.ts)
uses strict existing offline API/RPC boundaries and zero transaction assertions.
[Source fixtures](../../../e2e/design-system/owned-source-data.ts) retain exact
vault addresses; the appreciating vault is the BSC `e744…d34f` vault, not its
underlying token. Missing fixture reads failed loudly: the initial harness lacked
`asset()` and a proposed `main.stRSR()` snapshot lookup was not recorded. The
correct recorded symbol identity and exact asset override resolved those setup
errors; no broad unmocked allowance was used.

Source loading and empty-result decode failure fall back to the API's share amount/value; successful
live reads show redeemable underlying plus exchange rate and live USD valuation,
including successful zero. Lab pending/unknown cases intentionally expose honest
independent states rather than implementing a production adapter. API eligibility,
live sort keys, denomination and shared-vault drawer context need engineer review
before adoption. The pending claim on the zero-active stake remains a separate
withdrawal, not an owned-position countdown.

## Candidate checks

[Mounted units](../../../src/views/internal/design-system/tests/owned-positions.test.tsx)
exercise eligible/zero/unknown values, independent links including duplicate symbols,
eleven-row numeric sorting before limits, and native-versus-dialog actions.
[Browser regressions](../../../e2e/design-system/owned-positions-lab-regressions.spec.ts)
cover both families and five states at 320/390/1400 in light/dark, no nested
horizontal scrolling, visible value/action bounds, and focus/disclosure recovery.

The initial browser green was insufficient: its outer-width assertion missed a
nested scrolling table. Both reviewers confirmed clipping in phone screenshots.
The correction targets the nested table locally; stronger assertions include the
inner scrolling owner and actual visible text/action bounds. Empty recovery now
remounts the focus owner and clears removed disclosures. The dialog explicitly
shows chain and first-DTF context, without opening a production wallet surface.
The final source failure case replaces an invalid spec-local 503 interception
with the existing exact vault/full-calldata override. It verifies the matching
direct or multicall response is empty before checking fallback. This proves a
decode/read failure, not transport failure, a contract revert or exhausted retries.
The APY track retains its percent sign on one line at the 1024px desktop boundary.

## Run conditions

Node 24.19.0; installed pnpm 11.19.0 (repository requests 11.5.2). Dependency
bootstrap disabled for existing dependencies; no installation. One isolated Vite
preview on port 3047 with a separate temporary dependency cache and the pinned
E2E environment. One browser worker. User's port 3005, origin and tab untouched.

Verification is the V1 bounded/checkpoint cadence, not full CI. Full unit suite,
smoke/full E2E and a full source-capture matrix for unrelated families are not
claimed. Final verification and retained captures are listed at closeout below.

## Final receipt — September 12

- [Browser report](final/report.json): 18/18 passed, zero skipped/failing/flaky.
  Ten owned-lab cases, four rendered-source cases and four cross-table link cases.
- [Unit log](final/unit.log): 74/74 in four files, one worker.
- [Types](final/types.log): `pnpm typecheck` exited 0 (app and E2E).
- [Scoped lint](final/lint.log): exited 0; Prettier check passed.
- [Frame index](final/frames.json): 35 ordinary-viewport images; final visual
  inspection covered 01, 09, 11, 17, 20, 27, 33 and 35. These include both families,
  themes, phone pressure, desktop threshold, successful zero and decode failure.
- [Source manifest](final/source.json): public source digest/files, excluding
  private environment fingerprints. Source guards passed in the six state-matrix
  cases and four source cases; remaining cases ran on the same final snapshot.
- [Sorting RED](final/sort-red.log): newly selected Balance wrongly started with
  100 instead of 2 before restoring the source Portfolio ascending convention.
  The initial missing-composition RED is retained in [red.json](red.json).

Dark/Light re-review confirmed the three UI corrections. The Dark source-proof
caveat is confirmed/fixed by exact empty-result overrides and response decoding;
the patched case passed in the final run. No remaining independent-review blocker.
Visual acceptance and production engineering review are still separate.

Reproduction (use an owned preview with the pinned E2E environment above):

```sh
DESIGN_SYSTEM_BASE_URL=http://127.0.0.1:3047 pnpm exec playwright test --config playwright.design-system.config.ts owned-positions-source-capture.spec.ts owned-positions-lab-regressions.spec.ts table-row-links-lab-regressions.spec.ts --project design-system-review --max-failures=1
pnpm exec vitest run src/views/internal/design-system/tests/owned-positions.test.tsx src/views/internal/design-system/tests/table-family.test.tsx src/views/internal/design-system/tests/earn-family.test.tsx src/views/internal/design-system/tests/component-catalog.test.ts --maxWorkers=1
pnpm typecheck
pnpm exec oxlint src/views/internal/design-system/table-family/owned-*.tsx src/views/internal/design-system/table-family/owned-fixtures.ts src/views/internal/design-system/tests/owned-positions.test.tsx src/views/internal/design-system/components-pages.tsx src/views/internal/design-system/component-catalog-support.ts e2e/design-system/owned-*.ts
```

Scope inventory reports medium/correctness/product and no red flags. It is a
dry-run inventory, not a full gate result; the V1 bounded verification cadence
applies. Earlier setup errors are not green evidence: the final failure decoder
needed a TypeScript union guard, then types passed; one browser invocation
omitted the external preview variable, was interrupted, and its owned 3022
server was identified and stopped. Only the final 3047 run is retained as proof.
Existing unit dependencies emitted remote-config/deprecation warnings without
test failures. No dependencies, shared mock helpers or production sources changed.

Closeout: relative links and source digest match; wiki-lint reports 20 pages
green; diff whitespace check passes. Both owned test previews are stopped.
The existing 3005 listener remains and answers HTTP 200; no user-tab navigation
or explicit refresh was performed. No commit or push.
