# Responsive Overview page title

Status: done for this lab slice; coordinator handoff complete. Fixed point `49f9f22ae94d579b4c530de845e8637d299a9c7d`;
inherited dirty documentation is preserved. Medium radius, bounded V1 iteration:
one shared opt-in with one lab consumer; no shared default/token change or
production adoption, so focused checks replace unrelated integration suites.

## Contract

The user chose a light page-identity title at 24px/30px below `sm` (640px),
32px/38px from 640px. Add `v1TypographyVariants.responsivePageTitle`; keep
`v1Typography.pageTitle` unchanged. Mobile tracking follows the existing 24px
section role; desktop retains -0.01em. Consume only in the Overview replay's
title import/class. No financial row, hover, data, axes, footer, or copy changes.
No 28px role, app-wide audit, migration, dependency changes, or user-preview use.

## Acceptance evidence

- Existing typography default-role assertion plus focused opt-in assertion.
- Mounted Overview at 320/390/640/1400 in light/dark: computed size/line height,
  weight/tracking, normal and long wrapping title, containment and settled plot.
- Existing source chart behavior regressions; affected unit/type/lint checks.
- Source-guarded screenshots after SVG draw/resize settlement; inspect each.
- Read-only Dark/Light pair after implementation; one reconciliation owned by
  this implementation task. Reviewers may not edit files; unavailable review
  remains pending. Coordinator checks returned artifacts before completion.

No new interaction is introduced, so no analytics event is needed. The user
settled the title design; no alternative design exploration is required.
Engineer review of the new shared opt-in remains deferred to V1 handoff.

## Results

September 14: default-role assertion preserved; the new variant unit was RED
(`undefined`), and the mounted 320px title was RED (32px instead of 24px).
Final focused units: **45/45**, browser: **5/5**, app/e2e types and scoped lint
green. The final browser report has no failures, skips or retries; all five
`current-source` attachments have digest
`e13ac0ecacbbc7554c51f7d4dd07a9ed2e7a28135f504c8f148524d9444dca8c`.
See [the report](browser-report.json) and [source/image hashes](SHA256SUMS).

The browser cases cover mounted 24px/30px at 320/390 and 32px/38px at
640/1400, weight 300, normal mobile/-0.32px desktop computed tracking, both
themes, and normal/long title. The long string is a **test-only DOM substitution**,
not product copy or a new title API. Title and chart containment pass; long
titles grow naturally without changing plot width/height, SVG paths or ticks.
Existing source-frame, axis-context and header-inspection checks pass unchanged.

All 16 normal/long viewport screenshots in `screenshots/` were visually
inspected: clear title/financial hierarchy, natural wrapping, no title clipping
or overlap and fully drawn plots. The lab navigation's existing 320px crowding
is outside the changed Overview surface. These are local lab evidence, not
production readiness or human acceptance of the broader chart design.

Capture readiness waits for SVG width and curve extent after resize and for
every draw clip to cover its area path. An initial extra guard incorrectly
looked for stroke curves in fill-only layers; exact DOM inspection identified
the error, and area-path coverage fixed it. No chart animation behavior changed.
An earlier tracking assertion expected `0px`; Chromium serializes normal
tracking as `normal`, now asserted explicitly.

Dark/Risk and Light/Intent returned no scoped blockers. Light inspected all
16 images; Dark checked default compatibility, sole-consumer scope and the
installed Recharts structure, then rechecked the corrected fill-area guard.
Neither independently reran tests or supplied human design acceptance.
The coordinator independently inspected the scoped diff and representative
final captures, reran the typography tests (2/2), wiki lint (20 pages) and diff
check, and completed this slice's handoff. Broader chart acceptance remains separate.

## Replay

Use the existing installed runtime on `PATH`; no dependency reconciliation is
needed. `pnpm` remains the package manager, but this run invoked installed
binaries directly. Start an isolated server on an unused port (3036 was used):

```sh
VITE_E2E=true VITE_WALLETCONNECT_ID=test-project VITE_STAGING_API='' VITE_USE_STAGING='' VITE_MAINNET_URL='' VITE_INFURA='' VITE_ALCHEMY='' VITE_ANKR='' node_modules/.bin/vite --host 127.0.0.1 --port 3036 --strictPort
```

The exact final browser command (5/5, 21.8s) was:

```sh
DESIGN_SYSTEM_BASE_URL=http://127.0.0.1:3036 CURRENT_REBALANCE_CAPTURE_DIR=docs/plans/design-system-responsive-page-title/screenshots PLAYWRIGHT_JSON_OUTPUT_NAME=docs/plans/design-system-responsive-page-title/browser-report.json node_modules/.bin/playwright test --config=playwright.design-system.config.ts --project=design-system-review e2e/design-system/chart-review-lab-regressions.spec.ts --grep 'responsive Overview page title|source frames|source chart review preserves|source inspection changes' --reporter=list,json
```

Other fresh commands:

```sh
node_modules/.bin/vitest run src/components/design-system-v1/tests/typography.test.ts src/components/design-system-v1/tests/source-hygiene.test.ts src/views/internal/design-system/tests/typography-review.test.tsx src/views/internal/design-system/tests/component-catalog.test.ts src/views/internal/design-system/tests/chart-fixtures.test.ts
node_modules/.bin/tsc --noEmit && node_modules/.bin/tsc -p e2e/tsconfig.json --noEmit
node_modules/.bin/oxlint src/components/design-system-v1/typography.ts src/components/design-system-v1/tests/typography.test.ts src/views/internal/design-system/charts/source-overview.tsx src/views/internal/design-system/foundation-catalog.ts src/views/internal/design-system/typography-study.tsx e2e/design-system/chart-review-lab-regressions.spec.ts
node scripts/llm-workflow/scope.mjs --base 49f9f22ae94d579b4c530de845e8637d299a9c7d --dry-run
node scripts/llm-workflow/wiki-lint.mjs
git diff --check
```

The scope dry-run sees inherited documentation too; its broad app-suite mapping
is superseded here by the explicit bounded V1 cadence. No full-app suite or
global gate is claimed. Non-failing existing warnings: React test-utils `act`
deprecation, Vite ambiguous duration utilities, Playwright color-environment
warning and Sentry telemetry notice. `oxfmt` was unavailable; installed Prettier
formatted only the added test ranges. Initial server listen required sandbox
approval. The owned 3036 server was stopped; user previews were not used.

No dependency install/relink, commit/push, production migration or hover-worktree
access. Prior workflow-only receipts/verifier remain historical and untouched.
**Engineer review required before adoption** for the new shared opt-in; arbitrary
names/locales and production consumer suitability are not certified here.
