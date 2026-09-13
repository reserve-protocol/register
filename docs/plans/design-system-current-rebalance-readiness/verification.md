# Verification, audit intake and closeout

## What is verified in this batch

Source inspection of the named owners and their catalog/decision boundaries;
existing focused tests; local documentation links and formatting; source-drift
checks. No newly composed view exists, so this is **not** rendered validation of
the future auction workspace. Existing screenshots and earlier suite results
remain historical evidence, not a fresh pass for this package.

Fresh September 13 check: **60/60 tests in 9 files**, one worker, Node 24.19.0,
pnpm 11.19.0 using the existing installation. No dependency change.

```sh
pnpm_config_verify_deps_before_run=false pnpm exec vitest run --maxWorkers=1 \
  src/components/design-system-v1/tests/candidate-behavior.test.tsx \
  src/components/design-system-v1/tests/typography.test.ts \
  src/components/design-system-v1/tests/source-hygiene.test.ts \
  src/components/entity-identity/tests/entity-identity.test.tsx \
  src/components/entity-identity/tests/token-stack-trigger.test.tsx \
  src/views/internal/design-system/tests/transaction-metric-value.test.tsx \
  src/views/internal/design-system/auctions-browse/tests
```

Existing warnings: React test-utils act deprecation; the token-stack test imports
production logo dependencies that initialize wallet libraries, report deprecated
loadable/Lit development mode and fail a remote Reown configuration fetch before
falling back locally. Tests pass, but that suite is not hermetic offline proof or
evidence of wallet behavior. No real wallet action was invoked.

No browser suite, production suite, typecheck, full repository gate or CI was run
for this documentation-only batch. No preview process was started or stopped;
the user's 3005 tab/theme/state and Claude's server ownership were untouched.

## Existing proof and its limits

| Existing seam                                                                                                                                                                            | What is useful                                                                                                                          | What it does not prove                                                                                  |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| [Candidate behavior](../../../src/components/design-system-v1/tests/candidate-behavior.test.tsx)                                                                                         | Button/link semantics, copy, informational disclosure and field/feedback boundaries exercised by named cases                            | Mounted workspace hit areas, responsive layout, auction eligibility or recovery                         |
| [Typography](../../../src/components/design-system-v1/tests/typography.test.ts) and source-hygiene selection above                                                                       | Current role values and selected canonical-owner discipline                                                                             | Composed child/parent size equality or absence of CSS clipping                                          |
| [Identity tests](../../../src/components/entity-identity/tests/entity-identity.test.tsx) and [stack trigger](../../../src/components/entity-identity/tests/token-stack-trigger.test.tsx) | Opt-in name leading, trigger/ref/events, disabled/default preservation                                                                  | Complete operational asset inspection, long-name accessibility or touch layout                          |
| [Transaction metric tone](../../../src/views/internal/design-system/tests/transaction-metric-value.test.tsx)                                                                             | Neutral/realized/risk/superseded tone distinction                                                                                       | Correct financial source classification for auction values                                              |
| [History regression](../../../e2e/design-system/auctions-history-lab-regressions.spec.ts)                                                                                                | A reusable testing pattern for source guards, ordinary viewports, source-bound screenshots, real help targets and responsive boundaries | Future current workspace or complete flow; not rerun in this batch                                      |
| [Transaction action loading](../../../e2e/design-system/transaction-action-loading.spec.ts)                                                                                              | Stable busy-action emphasis in existing transaction families                                                                            | Auctions, 900px viewport composition quality or reduced-motion behavior; its captures use 1400px height |
| [Transaction accessibility](../../../e2e/design-system/transaction-accessibility.spec.ts)                                                                                                | Existing modal keyboard/return-focus and selected reduced-motion checks                                                                 | Same-page workspace focus order, persistent editors, keyboard bid selection or every new animation      |
| Claude's production audit and existing production auction tests                                                                                                                          | Source truth and exercised action sequences, once inspected and reconciled                                                              | Automatic acceptance of a new UI or proof of numerically correct transaction arguments                  |

## Required future acceptance matrix

Bind each group below to actual Claude coverage IDs before implementing fixtures.
These are proof requirements, not claims that every proposed state exists today.

| Group                          | Required proof                                                                                                                                                                                                                                          |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| V1 — preservation completeness | Every discovered function has a visible or reachable representation and exact disposition. No required function exists only in documentation or an inert preview control.                                                                               |
| V2 — viewer/access             | Disconnected, resolving, non-launcher and launcher cases as evidenced; wallet/chain changes update only relevant authority. No wallet connection or real transaction in the lab.                                                                        |
| V3 — preparation               | Normal and hybrid preparation where applicable; ordinary non-preset values, constraints and save/cancel/return semantics; invalid data cannot fabricate readiness.                                                                                      |
| V4 — launch and result         | Actual lab click drives wallet-required, submission, pending, confirmation and refresh handoff where evidenced. Duplicate activation blocked; receipt confirmation differs from auction/rebalance completion.                                           |
| V5 — recovery                  | Reject/fail/retry and partial data recovery retain the correct context; no rerunning confirmed steps or success without a confirmed source.                                                                                                             |
| V6 — monitoring and repeats    | No bids, multiple bids and a selected bid; chart keyboard/touch alternative; auction end → further work and expired/completed boundaries. Keep auction ordinal distinct from protocol round and progress.                                               |
| V7 — inspectability            | All assets and essential quantities, liquidity details/retries, relevant warnings, automation state, links and specialist entry points remain available. Nothing critical is hover-only.                                                                |
| V8 — responsive geometry       | Light/dark at ordinary 900px height; real desktop available width, a middle host width, 390px phone and 320px pressure. Actual-width boundary ±1px tests once a new breakpoint is justified. No duplicate task trees/timers, overflow or layered inset. |
| V9 — interaction continuity    | Open/close, resize, theme/state changes, failure and current→history transfer preserve draft/operation identity and focus according to the audited contract. Two-record fixture proves per-record isolation.                                            |
| V10 — safety and evidence      | Assert no wallet writes from lab controls; source-guard capture snapshots; label synthetic data, classify copy authority, preserve history regressions and record skipped branches.                                                                     |

Use the [existing source guard](../../../e2e/design-system/review-source.ts) and
fixture infrastructure rather than another test framework. Every important
behavior needs a sequence assertion, not just a selector that instantly paints
its terminal state. Wait for observable state, not arbitrary delays.

Keep one browser worker and one owned preview per scheduled run. Coordinate
with Claude before starting any browser tests. Never use or stop 3005 for an
owned-server run. No continuously running verification or overnight polling is
needed for this batch.

## Intake procedure when Claude returns

1. Check the audited commit/source fingerprints and resolve differences against
   the working tree. Read the evidence and representative harness; a summary's
   confidence level is not proof.
2. Map every audit ID to DS01–DS21 and its presentation disposition in the
   transfer brief. Add capabilities only for genuinely new jobs found by audit.
3. Reconcile contradictions once: preserve source behavior, explicitly propose a
   correction, or mark engineer/product resolution required. Do not copy a bug
   as a requirement or invent its fix through prettier wording.
4. Freeze a minimal scenario set, separate real snapshots from synthetic overlays,
   choose the representative/pressure pair and finalize geometry ownership.
5. Compose locally, verify V1–V10 at their applicable seams, and return one
   complete candidate for human review. No automatic production migration.

## Review and traceability

Intent self-review: the requested parallel work is system readiness, not another
production audit, new mock controller or visual composition. Those boundaries
are preserved. Correctness/product self-review sought counterexamples to easy
reuse: Metric's child font, identity subtitle truncation, independent disclosure
limits, real wallet wrappers, Discover's specialized strip and the auction
chart's internal clock/curve. Each has a specific limitation in the reuse map.

The strongest unresolved uncertainty is complete production coverage; this batch
does not claim to resolve it. Claude's audit is required before the full transfer
preflight passes. No independent reviewer or human visual approval is claimed.

`sources.sha256` fingerprints 48 relevant owner/evidence/test files for drift
checks. A hash is not a statement that every line was reviewed or every behavior
was exercised. Recheck from the repository root with:

```sh
shasum -a 256 -c docs/plans/design-system-current-rebalance-readiness/sources.sha256
```

Documentation verification passed the existing formatter, wiki-lint (20 pages),
all 46 relative links, Markdown table consistency and all 48 source fingerprints.
The readiness pointer updates the active plan without changing
Current Review or any catalog authority. Existing earlier audit/visual receipts
are retained because they document different snapshots, not superseded by this
source-readiness package.

No workflow changes were warranted: the reuse hazards are specific to this
composition and are recorded here rather than added as new general process.
