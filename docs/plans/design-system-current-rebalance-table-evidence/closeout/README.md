# Auction table closeout reconciliation — September 14

Status: F1–F5 fixed and verified; independent review reconciled. No remaining scoped implementation blocker. This is not production adoption or final human visual acceptance.

## Scope and fixed point

The user authorized F1–F5 from the [independent review](../../design-system-auctions-tables-closeout-review/report.md), including the exact desktop wording “Rebalance expires in”. Fixed point is `289b2af86` plus the reviewed dirty-source digest `ef4794d9…`. Existing dirty work is retained. No checkpoint, commit, installation or production migration.

Low-profile, contained lab presentation/interaction fixes. The accumulated scope tool reports a medium size signal from thousands of inherited files/evidence; this follow-up changes three application owners, not shared defaults or a product contract. Correctness/product self-review applies. No new analytics event: these remain internal, non-executing review controls.

## Finding disposition

| Finding | Authorized treatment | Preserved boundary |
| --- | --- | --- |
| F1 reference identity | Capture-owned image/identity/state metadata; completed reference names the June capture | Selected August fixture remains August; no record identity changes |
| F2 historical help | Local pointer/click capture handlers preserve the canonical tooltip's explicit tap toggle | Shared HelpTooltip unchanged; first and third open must persist for 1.5 seconds |
| F3 accidental navigation | A neutral touch on the same card that dismisses launcher help does not also navigate | Next deliberate card tap, arrow, proposer link, keyboard and normal mouse navigation remain available |
| F4 unexplained dash | Omit null-round context in compact rows and detail; keep the desktop dash under Auction | Unknown remains unknown; no round inference, status or membership change |
| F5 expiry wording | Reuse approved localized “Rebalance expires in” in the desktop header | Same remaining-time value and auction “Ends in” meaning |

R1/R2/R4 are deferred optional composition polish, not blockers. R5/R6 belong to shared status/focus owners and are not changed locally. R3/Q4 financial sign/dollar semantics remain engineering questions; Q1 current membership after completion, Q2 timing priorities and Q5 full localization/date patterns remain migration obligations. Q3 is resolved by the user's F5 approval. The original review remains immutable historical evidence, not a report of the corrected source.

## Reproduction

The first five focused tests failed as expected: June/August caption mismatch, unscoped expiry header, card dismissal navigating, and both historical metric helpers failing the sustained-open observation. [Receipt](red/results.json).

The initial null-round absence assertion ran before the detail mounted and could falsely pass. It now waits for the visible detail; the follow-up [RED receipt](round-red/results.json) confirms the existing unwanted round block. This harness correction is not a product fix.

The tooltip assertion samples every animation frame for the 1.5-second reproduction window after first observing an open tooltip. It cannot pass by catching only the original brief flash.

## Verification

Commands use the existing Node 24 runtime, `pnpm_config_verify_deps_before_run=false`, isolated `DESIGN_SYSTEM_PORT=3047`, and temporary capture directories. The sandbox initially denied listening on 3047; approved local execution ran the offline suite. No dependency installation or lockfile edit. The user's 3005 listener was not stopped or restarted.

- Focused RED: `pnpm design-system:review auctions-closeout-lab-regressions.spec.ts auctions-table-constrained-lab-regressions.spec.ts --grep 'completed reference.*light|expiry.*light|touch.*light|historical metric help'`: 5 expected failures. The mounted-detail correction ran `auctions-closeout-lab-regressions.spec.ts --grep 'completed reference.*light'`: 1 expected failure.
- Focused GREEN: same two specs with `--grep 'completed reference|expiry is|touch dismissal|historical metric help'`: [8/8](green/results.json). Visual inspection then corrected an 8px status/arrow mismatch after removing the null-round block; the all-state geometry checks retain that invariant.
- Combined: `pnpm design-system:review auctions-closeout-lab-regressions.spec.ts auctions-table-constrained-lab-regressions.spec.ts current-rebalance-all-states-lab-regressions.spec.ts current-rebalance-launcher-help-lab-regressions.spec.ts current-rebalance-table-locales-lab-regressions.spec.ts current-rebalance-table-lab-regressions.spec.ts auctions-history-lab-regressions.spec.ts`: [48/48 passed](combined/results.json), no failures, skipped tests or flakes. Both themes; 18 examples through 288–1400px containers, history states, touch toggles, navigation, independent links, responsive focus and zero transaction sends.
- The initial open-help screenshot helper scrolled/moved the pointer and thereby dismissed the otherwise persistent tooltip. The final targeted run captures without either action and asserts it remains open after the screenshot. It also checks the desktop header in es/ko/zh. These are evidence/test changes, not additional application fixes. `pnpm design-system:review auctions-closeout-lab-regressions.spec.ts auctions-table-constrained-lab-regressions.spec.ts current-rebalance-table-locales-lab-regressions.spec.ts --grep 'completed reference|expiry is|touch dismissal|historical metric help|access labels fit'`: [17/17 passed](final/results.json), no failures, skips or flakes.
- `pnpm typecheck`: app and E2E TypeScript passed after final application edits. `pnpm exec vitest run src/views/internal/design-system/auctions-browse/tests/history.test.tsx src/views/internal/design-system/tests/component-catalog.test.ts src/views/internal/design-system/tests/catalog-ui.test.tsx`: 48/48 passed.
- Scoped `pnpm exec oxlint` and `pnpm exec prettier --check` passed for the three application owners plus touched browser specs/assertion helper. `pnpm exec tsc -p e2e/tsconfig.json --noEmit` passed after the capture/locale-test correction. `git diff --check`, local-link checks and `node scripts/llm-workflow/wiki-lint.mjs` pass. Final accumulated `scope.mjs --base 289b2af86 --dry-run` reports correctness/product lenses and no red flags; bounded lab cadence applies, not the inherited whole-repository command union.

The [19 retained final captures](final/) cover corrected references, compact unknown/completed states, explicit expiry headings, post-dismissal navigation and open touch helpers. Inspected the corrected light 320px unknown row, dark 390px reference, light 1072/dark 1400px expiry, dark 320/390px open helpers and Spanish 1072px heading. The Spanish header wraps to three lines at the desktop cutover without overlap; no single-line-header claim or unapproved shorter translation. All 17 final source attachments match the final manifest. The combined run differs only by the later area-guide and screenshot/locale-test changes; application source is identical.

Existing warnings: ambiguous Tailwind duration utilities, React test-utils/Jotai deprecations and wallet-library remote-config fallback during unit imports. These were not treated as authorization for unrelated changes.

No physical-device, screen-reader, cross-browser, real wallet, production transaction, complete localization, full repository or CI verification is claimed. Passing lab checks do not establish live timing/permissions or financial correctness.

## Handoff boundary

Implementation owners: `src/views/internal/design-system/auctions-current-table/detail.tsx` (capture metadata and null-round context), `auctions-current-table/table.tsx` (touch guard, compact projection and expiry header), and `auctions-browse/history-metric-label.tsx` (local tooltip tap recipe). No other application implementation changed. The [final public manifest](source-final.json) records 2,439 files at digest `18eeef4d3e1f3724d88f0387f1ac8bc21a088f85b642ae5fd24d7abc741d4f98`.

Self-review: intent is limited to the five authorized findings; the selected-record identity, static history behavior, all numerical values, status/access derivation, translations and shared defaults are retained. Correctness/product checks explicitly challenge accidental navigation, disappearing help, unknown-versus-zero, alternate input methods and constrained layout. The final guide/test-capture changes do not change the three application owners verified by the combined run. No additional broad review is required for this low-profile reconciliation.

**Engineer review required before production adoption.** Current/history tables are the near-term migration target; the real adapter must retain the existing production auction detail/flow initially. The redesigned workspace remains unfinished and deferred. The lab's detail references are frozen images, not that integration.

No financial calculation, source, SDK/RPC/subgraph read, permission, wallet, transaction, persistence, shared default or production route was changed. Live membership/access/timing, version-correct destinations, Back/deep-link continuity, historical metric source/sign/precision/unknown values, localization and existing production audit hazards remain with the integration owner. See the [scope owner](../../design-system-current-rebalance-table.md#near-term-and-deferred-scope).
