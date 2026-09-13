# Proposal-like auction records

Rejected historical trial: human review identified fragmented grouping and
mixed-size inline label/value pairs. The recorded checks asserted the wrong
typography and are not conformance evidence. See the
[state-led revision](../../design-system-auctions-composition-refinement.md#state-led-list-revision--september-12)
for the replacement candidate. Captures and hashes below describe only this old snapshot.

Candidate contract: [local follow-up](../../design-system-auctions-composition-refinement.md#proposal-like-record-trial--september-12).
Review route: `/internal/design-system/components/table#auctions-browse-review`.
This supersedes the previous icon-led geometry as a review candidate, not as
accepted design authority. Shared Metric and Governance remain unchanged.

The generated `record.json` binds the final source digest, test results and
28 hashed ordinary-viewport composition captures. It excludes private environment
fingerprints. Source guards cover the 22 regression cases; two existing rich-record
smoke cases run on the same candidate without individual guards. Images show
restricted/repeated, launcher, blocked, ongoing, permissionless, history-only and
long-unavailable states at 390/1400px in light/dark. Assertions additionally cross
320px and both sides of the former 512px container boundary.

The new primary-timing unit failed before implementation because the state group
did not exist; the obsolete icon count also failed (two instead of zero). After
implementation, each phase selects its expected source label/value and all other
facts remain in the supporting region. The first type pass caught an unsupported
styling prop on LifecycleStatusPill; visibility now belongs to the local loading
wrapper, leaving the shared component unchanged. Earlier test results are not
presented as final-source evidence.

Reproduction uses the existing offline boundary fixtures, one browser worker and
an owned Vite preview on 3047 with a separate cache. Node 24.19.0 and installed
pnpm 11.19.0; dependency bootstrap disabled, no install. The preview uses
`VITE_E2E=true`, `VITE_WALLETCONNECT_ID=test-project` and empty staging/RPC provider
environment overrides from `playwright.design-system.config.ts`.

```sh
DESIGN_SYSTEM_BASE_URL=http://127.0.0.1:3047 pnpm exec playwright test --config=playwright.design-system.config.ts --project=design-system-review --project=design-system-desktop --project=design-system-mobile auctions-browse-lab-regressions.spec.ts auctions-composition-lab-regressions.spec.ts auctions-launcher-lab-regressions.spec.ts auctions-repeat-lab-regressions.spec.ts auctions-record-links-lab-regressions.spec.ts table-row-links-lab-regressions.spec.ts lab.spec.ts --grep 'auction|table row links|source-grounded rich record' --max-failures=1
pnpm exec vitest run src/views/internal/design-system/auctions-browse/tests src/views/internal/design-system/tests/component-catalog.test.ts --maxWorkers=1
pnpm typecheck
```

No production adapter, transaction, new user action, source copy, shared default,
dependency, commit or push. Low-profile Intent/correctness/product self-review;
human visual acceptance and production engineering review remain separate.

Final results: 24/24 browser cases, 52/52 focused units, app/E2E typecheck and
scoped lint/format pass. Captures 01, 08, 17, 18, 21 and 26 were visually inspected.
Manifest source and image hashes were rechecked; wiki-lint and relative links
are green. The test-owned 3047 preview is stopped; the user's 3005 preview was
not restarted or navigated. No full repository/CI claim.
