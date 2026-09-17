# Design-system documentation share-readiness handoff

## Outcome and authority

- User-visible result and explicit approval: repair the low-risk, high-confidence
  documentation defects confirmed by the 2026-09-17 independent visual/UX audit.
- Approved human decisions: canonical documentation stays result-first and
  scroll-first; deeper records remain secondary; the existing authority system
  and production adoption boundaries remain unchanged.
- Coordinator interpretation: unreliable anchors, invisible sidebar position,
  and loops that do not reach complex-family documentation block sharing.
- Blocking choices: none for this presentation-only slice. Stop if a repair
  requires a global token, shared component default, or transaction mechanic.
- Non-goals: no production adoption, catalog/status promotion, foundation-token
  change, transaction-flow correction, or component redesign.

## Ownership and scoped identity

- Owned paths: documentation shell/navigation/presentation modules, standalone
  documentation detail routing, their focused tests, and this handoff/evidence.
- Excluded surfaces: production routes, shared component defaults, `src/app.css`,
  typed authority catalogs, Charts data/math, and Transaction mechanics.
- Starting ref: `02434707c`; the existing dirty documentation candidate is
  authorized input only inside the owned paths and existing evidence packages.
- Returned identity: final changed-path inventory plus affected-surface verifier
  evidence; no repository-wide manifest.
- Execution: shared checkout `/Users/lill-kire/Code/register`; workers receive
  disjoint write boundaries and do not create or stop preview servers.
- Preserve: the user's preview on port 3055 and all unrelated dirty work.

## Read and preserve

- Authority route: `CLAUDE.md`, `docs/plans/design-system-v1.md`,
  `docs/wiki/domains/design-system.md`, and
  `src/views/internal/design-system/CLAUDE.md`.
- Preserve the accepted results, exact component/product copy, provider-free
  standalone runtime, scroll-first overview, query-state URLs, and current
  Canonical/Workbench/Internal Records boundaries.

## Visual precedent

- Primary precedent: current Foundations overview navigation behavior and the
  Transaction Workbench's direct, stable state links.
- Why it applies: both expose real accepted/exploratory results without routing
  readers through review-board scaffolding.
- Preserve: neutral shell, one-word status, stable hashes, active section state,
  and compact documentation chrome.
- Do not copy: Workbench state controls into ordinary component rows or old
  process-heavy detail-page vocabulary.
- Open decisions: global dark link token, Quiet resting affordance,
  multi-select applied-state affordance, and Navigation portal containment.

## Acceptance and proof

- Highest seam: standalone documentation browser behavior, supported by focused
  Vitest coverage for section observation, navigation, presentation, and links.
- RED: reproduce each anchor/routing/accessibility defect with a focused test
  before implementation; browser evidence remains the oracle for late layout.
- Representative states: direct-loaded component and pattern hashes, long
  desktop sidebar, mobile section navigation, and complex-family links.
- Final affected-surface run: focused Vitest, TypeScript, mapped scope, and the
  standalone documentation Playwright journeys covering touched behavior.
- Durable evidence: this handoff plus the existing complete-pass evidence
  package and the final progress/log entry.

| Criterion                                                     | Test seam                                | Rendered state                             | Proof owner          |
| ------------------------------------------------------------- | ---------------------------------------- | ------------------------------------------ | -------------------- |
| Direct hashes remain stable through late layout               | section observer + shell browser journey | Components and Patterns deep links         | coordinator          |
| Active sidebar item remains visible and groups do not collide | navigation test + shell browser journey  | long desktop navigation                    | navigation worker    |
| Complex-family links reach Patterns or Workbench              | components/presentation tests            | Chart, Table, Navigation, Transaction rows | routing worker       |
| Mobile/search navigation exposes clear accessible states      | focused tests + shell browser journey    | 390/320 navigation and empty search        | accessibility worker |

## Design-system findings retained outside this slice

- Dark `--primary` as 12–14px link text measured 3.2:1 on the dark canvas.
  Decide a global dark link/text role separately; this slice must not change the
  foundation token.
- Quiet Button lacks a strong resting affordance when shown without context.
  Documentation may present context/states, but changing Button is a component
  decision.
- `GlobalNavigation` may need an opt-in portal container or inline-menu seam if
  documentation-only containment cannot hold its overflow menu.
- Multi-select filter applied and empty triggers are visually indistinguishable
  in the audited specimen; confirm the canonical component contract before any
  component change.
- A separate read-only complex-flow fidelity audit should inspect Transaction,
  Navigation, Table, and Chart specimens for spacing, state composition, and
  owner mismatches without changing product mechanics.

## Return

Workers return changed paths, RED/GREEN proof, focused verification, and any
scope pressure. The coordinator inspects every delta, runs the final affected
surface, reconciles documentation, and does not commit or push.

## Closeout — 2026-09-17

Implementation is verified and remains human-review-required. The final primary
navigation/current-page split was strengthened after browser evidence showed
that a deep Components branch could still hide Workbench, Internal Records, and
the theme control. Primary destinations and theme now remain fixed; only the
current page's section tree scrolls and follows the active item.

The [evidence receipt](design-system-documentation-share-readiness/evidence/README.md)
records the 35 focused units, Components 2/2, Patterns 1/1, shell 3/3,
TypeScript, 4,035-module build, final 1400/390/320 light/dark inspection, and
independent Intent/Risk pass. No authority, component contract, provider,
production route, adoption state, commit, or remote changed.
