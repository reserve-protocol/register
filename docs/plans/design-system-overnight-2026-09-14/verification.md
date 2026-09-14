# Verification receipt — September 14

Historical overnight receipt. Subsequent authorized primary-lab integration and
governance layout verification are owned by the
[follow-up receipt](../design-system-table-governance-followup-2026-09-14/README.md).
The source-frozen claims below apply to the original overnight pass only.

## Source and execution boundary

Primary: branch `design-system-v1`, HEAD `289b2af86e8245ced89d9058a09182799c65f825`
plus inherited dirty work. This task did not change its watched source, tests,
fixtures or configuration. Public source remained 2,437 files with digest
`ef4794d91f10cd4b804475c2c0ef078d2be0bd192a6537af925729143abc80a5`.
[Starting manifest](primary-source-start.json).

Isolated execution copy: `/private/tmp/register-design-overnight-JEwxJR/repo`.
Local shared-object clone plus actual working files and cloned existing
dependencies; private environment files excluded. No new checkpoint, commit,
push, install or production migration. The temporary clone intentionally lacks
some excluded non-application files; broad git status there is not this task's diff.

Final isolated public digest:
`81701faf2d23ba1e2d8710d35d1b306db96f64856fa0a64eaba5aaf861dfa4c5`
([manifest](isolated-source-final.json), 2,438 files). Exactly three changed paths:
the two column owners and the new browser spec in [the patch](isolated-layout.patch).
No chart, governance, auction, production, shared-default, hook or fixture changes.

Node 24.19.0 was used via the bundled runtime; shell Node 20 cannot import the
existing TypeScript source guard. Existing runtime pnpm is 11.19.0 versus declared
11.5.2; no package-manager/dependency update was made. All commands below ran
in the isolated copy unless stated otherwise, with:

```sh
export PATH=/Users/lill-kire/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH
export pnpm_config_verify_deps_before_run=false
export DESIGN_SYSTEM_PORT=3059
```

## Browser proof

| Run                        | Exact arguments to `pnpm design-system:review`                                                                                                                                                                                         | Outcome                                                                                                                                                                                                    |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Baseline                   | `table-family-lab-regressions.spec.ts holdings-family-lab-regressions.spec.ts discover-family-lab-regressions.spec.ts earn-family-lab-regressions.spec.ts defi-family-lab-regressions.spec.ts owned-positions-lab-regressions.spec.ts` | 53 passed, no skipped/flaky; [receipt](evidence/baseline/results.json).                                                                                                                                    |
| Additional inventory + RED | `overnight-lab-regressions.spec.ts discover-cards-lab-regressions.spec.ts`                                                                                                                                                             | 16 passed (8 Discover, 8 governance), 4 failed: 2 genuine Earn text collisions; 2 Owned test-literal mistakes, not product RED. [Receipt](evidence/inspection/results.json).                               |
| Corrected Owned RED        | `overnight-lab-regressions.spec.ts --grep 'Owned amount'`                                                                                                                                                                              | 2 failed as intended: existing literal `$12,345,678.90` rendered on two lines instead of one. No app fix had been applied. [Receipt](evidence/owned-red/results.json).                                     |
| Focused GREEN              | Exact command below                                                                                                                                                                                                                    | 4 passed after the two local layout changes; [receipt and before/after images](evidence/fixes-green/results.json).                                                                                         |
| Final affected suite       | `overnight-lab-regressions.spec.ts earn-family-lab-regressions.spec.ts earn-recovery-lab-regressions.spec.ts owned-positions-lab-regressions.spec.ts`                                                                                  | 42 passed, no skipped/flaky; [final receipt](evidence/final/results.json). Includes original full scenarios, container boundaries, loading recovery, sorting, disclosure/focus and zero transaction sends. |

Focused GREEN command, without Markdown table escaping:

```sh
pnpm design-system:review overnight-lab-regressions.spec.ts --grep 'Earn identity|Owned amount'
```

Owned's first incorrect assertion used `$123,456,678.90`; source and screenshot
inspection corrected it to the existing `$12,345,678.90` before the genuine RED.
No fixture value was changed to make a test pass. Earn's RED identifies the actual
text/run overlap, which the prior cell-overflow assertions missed.

Evidence receipts retain all test results and attachment hashes, with selected
PNG bodies externalized. They are summaries of original reports, not complete
raw Playwright archives; raw-report SHA-256 is recorded. Unretained captures are
not claimed as independently visually reviewed. Baseline 27, initial inventory
14, Owned RED 2, focused GREEN 4 and final 8 retained captures. Final 320px fix
captures are byte-identical to the focused GREEN; final dark desktop Earn/Owned
captures are byte-identical to their baseline, supporting unchanged desktop layout.

## Other fresh checks

- `pnpm exec vitest run src/views/internal/design-system/tests/earn-family.test.tsx src/views/internal/design-system/tests/owned-positions.test.tsx`: 29/29 passed.
- `pnpm typecheck`: application and E2E TypeScript passed.
- `pnpm exec oxlint src/views/internal/design-system/table-family/earn-columns.tsx src/views/internal/design-system/table-family/owned-columns.tsx e2e/design-system/overnight-lab-regressions.spec.ts`: passed.
- Scoped Prettier write/check and patch whitespace checks; no formatting of unrelated source.
- `node docs/plans/design-system-overnight-2026-09-14/check-package.mjs`: 48 local links and 55 retained image hashes/lengths checked, no errors. `node scripts/llm-workflow/wiki-lint.mjs`: 20 pages green. All 88 recorded governance boxes were checked against their host/viewport, with none outside.
- Primary `git apply --check docs/plans/design-system-overnight-2026-09-14/isolated-layout.patch`: passed without applying it.
- Source comparison with the Node24 runtime above: `node docs/plans/design-system-overnight-2026-09-14/verify-source.mjs compare /Users/lill-kire/Code/register docs/plans/design-system-overnight-2026-09-14/primary-source-start.json`: unchanged. Isolated comparison reports exactly the three intentional paths.
- `scope.mjs --base 289b2af86e8245ced89d9058a09182799c65f825 --dry-run --json`: inspected accumulated-scope signals, not a full gate. The project V1 bounded-lab cadence applies to this exact two-owner presentation patch.

Warnings: existing ambiguous Tailwind duration utilities; unit imports emit
wallet-library initialization/deprecation and failed remote-config fallback logs.
No new warning was treated as a financial/data fix. Native browser runs used
approved execution outside the filesystem sandbox, with existing offline mocks.

No real wallet, production end-to-end transaction, physical-device, screen-reader,
cross-browser, new translation or full repository/CI gate was exercised. Governance
capture tests are an inventory, not lifecycle/permission correctness tests.
The owned preview listener on 3059 closed after verification; user/Claude preview
ports were not stopped or restarted. The temporary copy is retained for inspection,
but all required patch/evidence files are in this package.
