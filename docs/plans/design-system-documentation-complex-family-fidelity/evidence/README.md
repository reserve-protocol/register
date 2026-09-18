# Complex-family fidelity evidence

> **Historical receipt.** The subsequent
> [visual reconciliation](../../design-system-documentation-visual-reconciliation.md#implementation-receipt--2026-09-17)
> supersedes this receipt's owner-sized Table default, right-rail assumptions,
> Workbench-first Transaction location, and retained-render naming. The repairs
> and evidence below remain valid historical input where they do not conflict
> with that later contract.

## Result

The standalone documentation now presents the existing Charts, Tables,
Navigation, and paused Transaction owners without the objective fidelity
defects recorded by the 2026-09-17 audit. The work is implementation-verified
and remains human-review-required: it repairs documentation projection and
Workbench explorer behavior, but does not accept a new design, adopt anything
in production, or change component authority.

The recoverable starting point is local checkpoint `8812f4969`. No commit or
push was created after that checkpoint, and the user preview on port 3055 was
not stopped, restarted, or reconfigured.

## What changed

- **Navigation:** constrained Utilities remains visible; the Product rail
  hover/focus expansion overlays its reserved column; desktop and constrained
  DTF selection update identity and state together; constrained switchers use
  the retained Drawer, scroll all 15 rows, and dismiss with Escape; Global
  header actions are reachable through an explicit horizontal scroll host.
- **Tables:** every family has an explicit owner-sized Desktop projection;
  Current `All` retains all 18 scenario labels; loading and empty reuse the
  accepted owner treatments; standalone row actions no longer dead-loop; the
  duplicate Holdings family control is removed.
- **Charts:** the static Overview capture stays at its natural size inside a
  horizontal scroller. The false Narrow and Phone zoom controls are removed,
  and provenance identifies its painted footer controls as non-interactive.
- **Transactions:** all five families open and reset to their declared default;
  Automated and Manual ordinary amounts survive the appropriate state
  transitions; Automated operation, chain, collateral, swap, restart, and URL
  state follow the retained owner; the Manual owner note is omitted only inside
  Workbench documentation.

## Verification

The final affected-surface proof covers:

- seven focused unit files: **131/131 passed**;
- the new real-browser fidelity regression: **4/4 passed**;
- standalone entry/provider isolation: **9/9 passed**;
- integrated documentation shell on an isolated app server: **13/13 passed**;
- Components documentation: **5 passed, 1 intentional capture skip**;
- Patterns documentation: **3/3 passed**;
- application and E2E TypeScript, documentation production build, scoped
  formatting/lint, wiki lint, and whitespace checks.

Final commands and results:

| Surface                          | Command                                                                                                                         | Result                                                          |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Focused owners and documentation | `pnpm exec vitest run` with the four affected documentation suites plus the staged, atomic, and Manual transaction-owner suites | 7 files, 131/131                                                |
| Complex-family browser seam      | `playwright test e2e/design-system/complex-family-fidelity.spec.ts` against the isolated standalone entry                       | 4/4                                                             |
| Provider-free standalone entry   | `playwright test e2e/design-system/standalone-entry.spec.ts` with `standalone-desktop`                                          | 9/9; zero external/provider/WebSocket calls                     |
| Surrounding documentation        | Components and Patterns journeys against the standalone entry; shell journey against an isolated integrated app server          | Components 5 pass/1 intentional skip; Patterns 3/3; shell 13/13 |
| Types and build                  | `pnpm typecheck`; `pnpm design-system:docs:build`                                                                               | pass; 4,036 modules                                             |
| Closeout                         | scoped lint/format, `wiki-lint.mjs`, `git diff --check`; final broad gate plus native watcher rerun                             | pass; broad 1,498/1,499, sole sandbox watcher then 7/7 natively |

The browser regression asserts real geometry and interactions for constrained
Utilities, Product rail expansion, long switcher dismissal, table owner widths,
the natural-size Overview capture, transaction defaults and Reset, amount
persistence, and the BSC fixture. The 60 retained renders in
[`rendered/`](rendered/) cover ten representative states at 1400, 390, and 320
pixels in both light and dark themes:

- Navigation Utilities, Product expanded rail, and Product constrained
  switcher;
- Tables Desktop, All, loading, and empty;
- Chart Overview;
- Automated and Manual Workbench.

The coordinator inspected the rendered matrix. Historical Components and
Patterns evidence accidentally regenerated by mapped journeys was restored to
the exact checkpoint state instead of being presented as new evidence.

## Review reconciliation

- **Intent — confirmed/fixed:** Automated Redeem's `Initial configuration`
  shared Mint's state label and was mistakenly treated as the family default,
  which disabled Reset. Default detection now compares exact node identity. A
  RED regression proves Reset is enabled, returns to Mint, and clears the
  Automated URL state; the focused rerun passed 1/1.
- **Intent — pass after repair:** all requested host, fixture, and explorer
  defects are covered without widening authority or adoption.
- **Engineering Risk — confirmed/fixed:** constrained Product triggers were
  conditionally removed while their Drawer was open, so focus restoration did
  not have a stable live target. Both initiating triggers now remain mounted;
  RED unit coverage failed 2/2 before the repair, GREEN passed 14/14, and
  browser proof covers Escape and explicit close.
- **Engineering Risk — confirmed/fixed:** Reset availability originally
  considered only URL-selected node/view state. Automated and Manual local
  values now participate in default detection, and Manual Reset remounts its
  owner-local reducer. Unit proof covers dirty → enabled → reset → disabled;
  browser proof covers value-preserving round trips followed by reset.
- **Final independent re-review:** PASS for both repaired findings; no residual
  Critical, Important, or Minor finding in the scoped seams.
- **Verification repair:** keeping the constrained initiating trigger mounted
  truthfully increases its provider-safe mark count from 15 to 16. The stale
  standalone assertion was updated and the complete 9/9 isolation journey was
  rerun.

## Explicitly deferred

- Global Navigation More-menu portal containment remains an owner/component API
  question; this pass does not silently change the shared component.
- Automated Redeem naming, Manual outcome height, chart touch inspection, and
  dark-link token contrast remain owner or human decisions.
- Hosted-preview access and indexing remain the separate U11/U12 decision.

No token, shared default, product route, production mechanic, data source,
financial meaning, typed catalog authority, or adoption status changed.
