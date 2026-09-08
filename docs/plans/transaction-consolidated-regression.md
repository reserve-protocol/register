# Transaction consolidated regression

## Task contract

Fixed point: `2e64876fb7ea28084ac8bee2b39cab9fd028f2d3` plus the inspected
uncommitted transaction-lab work. This medium, lab-only pass validates the
current Zapper, Vote Lock, Stake, Automated issuance and Manual issuance
compositions together before pausing transaction design work.

Preserve reviewed designs and product mechanics. Fix reproducible presentation
or interaction regressions, not unresolved product/security decisions. Entry
cards, the standalone selector specimen, persistent Portfolio rows and tables,
production migration, shared-default promotion, commits and pushes are excluded.

## Acceptance evidence

- Existing transaction component/unit coverage and affected shared primitives.
- Mounted family state coverage plus non-preset journeys, scoped recovery,
  gated versus busy actions, terminal reset and truthful outcome evidence.
- Desktop, narrow and intermediate geometry, light/dark presentation, keyboard
  access, reduced motion and long translated copy; inspect representative
  screenshots rather than equating containment checks with visual approval.
- App/E2E types, scoped lint, catalog compilation and documentation health.
- One independent combined intent/risk review; coordinator verifies findings.

Existing browser tests are the stable verification seam. Add targeted coverage
only for a concrete gap or regression. Use the running preview on port 3005;
do not stop the user's server. Browser simulations cannot prove native wallet,
mobile keyboard, RPC/receipt or production-host behavior.

## Review organization

One coordinator owns edits and browser runs. One read-only reviewer examines
coverage and recent transaction changes independently while verification runs;
no shared writes or simultaneous browser suites. Its report is evidence to
reconcile, not approval of designs. An unavailable reviewer leaves review pending.

## Results

### Corrections and review disposition

1. **Confirmed keyboard defect, fixed:** Shift+Tab from the initially focused
   Vote Lock/Stake dialog shell escaped to the underlying lab context. The
   contained-modal wrapper now sends initial Tab/Shift+Tab to its first/last
   control and prevents escape when it has no focusable controls. Browser RED
   reproduced the defect; desktop and mobile checks pass after the fix,
   including Escape, opener focus restoration and Enter to reopen.
2. **Stale browser assertion, corrected:** a narrow-width check still expected
   the removed duplicate expiry text in the orders header. It now checks header
   containment and exactly one countdown in the composition; the earlier check
   still verifies that countdown's position and width in the collateral step.
   No countdown or layout was restored merely to satisfy a test.
3. **Unit harness failure, isolated:** the initial focused run passed all 243
   assertions but produced 19 unhandled errors from TokenLogo image requests
   completing after jsdom teardown. The composition-wide test now uses the
   same deterministic image boundary as the existing staged test. It does not
   mock transaction state or controls. The fresh focused run is 243/243 with
   no unhandled errors. Browser evidence remains responsible for real layout.

One independent combined Intent/Engineering Risk review found no additional
blocking transaction regression. Its unit-error finding was resolved, its
reduced-motion coverage caveat was retained, and its bounded re-review of the
keyboard fix and test isolation passed. No production transaction mechanics,
approval policy, SDK code, or shared component defaults changed.

### Verification

- `pnpm exec vitest run src/views/internal/design-system/tests src/components/design-system-v1/tests`:
  21 files, 243 tests passed, no unhandled errors on the final run.
- Consolidated desktop Chromium: final rerun **37/37 passed**, including the
  added accessibility checks (initial run 34/35; the sole failure was the stale
  expiry assertion above).
- Targeted mobile Chromium (`lab.spec.ts` transaction families plus
  `transaction-accessibility.spec.ts`): 9/9 passed. The desktop suite also
  exercises narrow/intermediate widths, short viewports and translated Manual
  readiness copy in es/ko/zh; this is not full localization certification.
- `pnpm typecheck`, scoped `oxlint`, `pnpm exec lingui compile`, and
  `git diff --check`: passed. Wiki lint: 20 pages green.
- The earlier scope-mapped run also passed 1,142 full-unit tests and 72 E2E
  helper tests. Its generic smoke command could not bind protected port 3005;
  it is **not** claimed green. The existing preview was kept running and the
  scoped mounted suites used it directly. Per the project checkpoint cadence,
  this lab-only pass does not claim a production/full-gate release.
- Final scope inventory: correctness/product lenses, no emitted red flags.

Logs use `/tmp/transaction-consolidated-final-{browser,unit,types,lint}.log`;
mobile evidence uses `/tmp/transaction-consolidated-mobile.log`. Browser
artifacts are in `/tmp/transaction-consolidated-final-results` and
`/tmp/transaction-consolidated-mobile-results`. These are local evidence, not
permanent release artifacts. The earlier RED/fix logs are
`/tmp/transaction-accessibility-red.log` and `/tmp/transaction-regression-fixes.log`.

### Visual inspection and limits

Coordinator inspected representative Manual configuration/insufficiency,
Automated collateral authorization, Vote Lock and Stake approval processing,
Zapper quote-search layering, and Manual/Automated Mint/Redeem outcomes,
including light/dark and desktop/narrow samples. No new layout change was
warranted by those samples. Automated assertions cover more states than this
visual sample; they do not constitute human acceptance of every design.

The browser harness deliberately blocks remote image CDNs: quote-search
artwork availability is not proven by its screenshots. Its status pill,
direction-control layering and amount geometry are covered. The real native
mobile keyboard, wallet prompts, RPCs and executed receipt values are outside
this lab pass.

New reduced-motion assertions pass for the committed token logos and Zapper
outcome attachment. The existing shared Button spinner still animates under
reduced motion; this is a shared-component accessibility follow-up, not a
reason to change shared defaults inside this pass. The keyboard assertions
prove the named modal-boundary behavior, not a complete keyboard-only issuance
journey.

## Checkpoint disposition

Transaction design is paused after the consolidated pass. This is a stable
continuation point, not a request for another broad visual review. Preserve the
human-directed local refinements already present; an overall exploratory
catalog label is not permission to undo those decisions or return to legacy
layout. It also does not turn every visible surface into an accepted design.

| Surface | Retain at this checkpoint | What the checkpoint does not approve |
| --- | --- | --- |
| Zapper, Vote Lock/Unlock/Delegate, Stake/Unstake/Delegate | Current task, action/progress, recovery and outcome compositions; recorded local refinements and existing accepted component owners | Package internals, production host/transaction changes, universal workflow/controller or automatic promotion of local treatments |
| Automated Mint/Redeem | Shared operation-aware entry/workspace tree, left high-level stages, right optional order evidence, recovery and outcomes | New execution, cancellation, result-source or cross-session recovery policy; general-purpose order rows |
| Manual Mint/Redeem | Expanded 29-state lifecycle, three-section Mint and direct Redeem, required/held comparison, simulated permissions and conservative outcomes | Approval defaults/concurrency/USDT policy, actual receipt-derived amounts, a shared soft-blue Button variant or universal asset ledger |
| Governance/staking entry cards and other contextual launchers | Keep as context for opening/dismissing the lab task | Final page-card design; visual approval of the launcher does not follow from task verification |
| Standalone asset-selector pressure specimen | Static, unreviewed reference; its search and confirmation are not wired | A complete, accepted selector interaction; working selection inside Zapper is a separate use |
| Portfolio/staking balances, cooldown, claimable, cancel and withdrawal rows | Existing production feature coverage and immediate transaction handoff requirements | Finished row/table design; review later in the real Portfolio/page context with the general row/table system |

Accepted foundations and component contracts remain owned by the catalog,
canonical implementations and decision ledger. Flow-local directions remain
within their stated scope. Passing tests, a checkpoint commit, or stopping this
phase must never promote an unreviewed component or mark production adopted.

### Re-entry and migration

Resume only the next scope the human selects. A future migration must inventory
the then-current production states/actions/content and classify each as a
reviewed replacement, preserved behavior, or unresolved conflict. Lab omissions
do not authorize removing or simplifying production functionality. Preserve
the existing engineering/security behavior until its owners approve a change;
do not ask the designer to decide approval policy as part of visual work.

Keep the named engineering register in the active V1 plan. The shared Button
reduced-motion follow-up remains an accessibility task at its owning component,
not an implicit transaction redesign. No additional skill, generic abstraction
or new verification framework is justified by this closeout.

## Engineering boundaries

Approval concurrency/defaults, USDT reset behavior, exact executed amounts,
SDK/package cancellation/recovery, production integration and security decisions
remain with engineering. Unreviewed surrounding surfaces are not approved by
this regression pass. Review-status and migration-authority documentation have
now been reconciled to the disposition above.

The bounded regression and documentation closeout are complete. The user
authorized a checkpoint on 2026-09-08; no push or production migration is
authorized. This does not mark earlier human-review-required design stages as
accepted.

Closeout verification (2026-09-08): catalog/composition tests 75/75, app/E2E
typecheck, scoped lint, formatting, wiki lint and diff checks passed. The current
mounted preview exposes the corrected Manual coverage and unreviewed selector
notice without horizontal overflow in the coverage region. This documentation
pass adds no transaction layout or behavior change. Compiled Lingui JavaScript
catalogs are ignored generated output; tracked PO sources remain in the checkpoint.
