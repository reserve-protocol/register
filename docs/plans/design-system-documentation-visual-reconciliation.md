# Design-system documentation visual reconciliation

> **Human-review remediation supersedes readiness claims — 2026-09-18.** The
> first visual review found systemic component-depth, surface-context,
> navigation-host, and transaction-framing defects. The active repair contract
> is [design-system-documentation-human-review-remediation.md](design-system-documentation-human-review-remediation.md).
> This document remains the implementation receipt for the preceding pass; its
> “ready for human visual review” statement must not be read as visual
> acceptance.

Planned 2026-09-17. This contract supersedes the presentation clauses in
`design-system-documentation-experience.md` that require a right-rail table of
contents, lightweight teaser specimens, or Transactions as a Workbench-first
destination. It does not change design authority, accepted component meaning,
production adoption, product mechanics, shared defaults, or tokens.

## Goal

Make the standalone design-system documentation a trustworthy, scroll-first
reference in which the system itself is always the primary content. One
persistent left navigation reflects the exact visible section; accepted
components expose their meaningful defaults, variants, sizes, and states in a
structured form; complex families use one consistent lab-control grammar while
retaining their real conceptual differences; and every specimen is shown in a
deliberate width, surface, padding, and alignment context.

## Current state

- The verified complex-family fidelity pass is uncommitted on top of checkpoint
  `8812f4969`; its repairs and evidence must be preserved.
- The shell renders top-level navigation, a separate active-destination subtree,
  page-local navigation, and a right-side table of contents. These owners do not
  form one visible hierarchy.
- Component overview rows place identity/status in a narrow left column and
  force accepted results into one generic three-column preview grid. Several
  entries omit their default or meaningful axes and still require detail-page
  round trips for ordinary comprehension.
- `DocumentationSpecimenCanvas` records host labels but does not own an explicit
  size mode, host surface, contained padding, alignment, or stable-state height.
- Transaction documentation exposes fixture taxonomy and engineering audit
  actions in primary controls, uses unstable state geometry, and presents
  Transactions as Workbench-first rather than as a paused Pattern.
- Fluid tables/workspaces sometimes inherit fixed reference widths; governance
  current/history records are presented side by side; charts correctly require
  family-specific sizing rather than blanket stretching.

## Non-goals

- Do not change accepted design meaning, catalog authority, adoption status,
  product behavior, financial data/math, transaction mechanics, source copy,
  tokens, or shared component defaults.
- Do not invent product-like compositions to demonstrate a single component or
  foundation property.
- Do not make every specimen fill the viewport after removing the right rail.
- Do not force Charts, Tables, Navigation, and Transactions into one identical
  information model.
- Do not resolve the Global Navigation portal-containment question, inherited
  transaction naming questions, or other owner-level design decisions silently.
- Do not stop, restart, or reconfigure the user's preview on port 3055. Do not
  commit, push, stash, reset, or discard unrelated work.

## Superseding experience contract

### One navigation owner

- One persistent, independently scrollable left sidebar contains the complete
  Start, Foundations, Components, Patterns, Workbench, and Internal Records
  hierarchy.
- High-level categories remain expanded. Typography, indentation, weight, and
  spacing communicate hierarchy; no divider creates a second navigation.
- The exact visible child is active, its ancestors remain visibly active, and
  the active link is kept in view without fighting deliberate sidebar browsing.
- Clicks intentionally push a deep link and scroll to its section. Scrolling
  replaces the hash. Back/Forward and direct loads restore the named section.
- The right-side table of contents and duplicate inline category navigation are
  removed. Mobile uses the same hierarchy in one drawer.
- Transactions appears beneath Patterns with a visible Paused activity label.
  Workbench remains the location for exhaustive fixture/audit tooling.

### Page width and reading measure

- Removing the right rail returns breathing room; it is not permission to
  stretch content to the browser edge.
- The documentation body uses a centered, capped content width. Explanatory
  prose uses a narrower readable measure. Lab canvases may fill the capped body.
- Individual specimens declare one width mode:
  - `intrinsic`: natural-size controls, menus, modals, and bounded cards;
  - `fluid`: tables, navigation structures, and similar surfaces fill the
    available padded canvas, retaining a meaningful minimum and narrow scroller;
  - `full-canvas`: large workspaces occupy the complete specimen region;
  - `host-constrained`: a genuine production host width is part of the result.

### Canvas and host context

- Every specimen declares its host surface: neutral, secondary/beige page, or a
  named real host context. Only semantic tokens are used.
- `contained` is the default: visible token-based padding on every side and an
  aligned specimen. Intrinsic modal-like specimens center horizontally and
  vertically; short/narrow viewports top-align and scroll so content is reachable.
- `full-canvas` is an explicit exception for genuine workspaces. Fluid content
  fills the padded lab column, not the browser viewport.
- Stateful families declare stable breakpoint-specific canvas geometry; unusual
  tall states scroll internally rather than moving the navigation controls.
- Documentation controls, host labels, and provenance remain outside the
  specimen boundary. Primary pages do not expose engineering prose as chrome.

### Result-first component reference

- Component identity, one-line job, truthful status, and any necessary scope
  boundary sit above the result rather than consuming a narrow side column.
- Every accepted component exposes the meaningful axes required for ordinary
  comprehension. The default is always present and explicitly named.
- Family-appropriate matrices replace arbitrary specimen placement. A matrix is
  not mandatory when anatomy, sequence, or composition is the honest structure.
- Overview depth is sufficient for ordinary design questions. Detail pages are
  for exhaustive state matrices, APIs, edge guidance, implementation, evidence,
  and history.
- Exploring, Not started, Not planned, and Superseded entries use compact truthful
  treatments rather than full-height empty specimen slots.
- Status chrome must not resemble a system Button. Uniform Code/Production facts
  are stated once or shown only where they materially differ.

### Shared lab-control grammar

- Shared dimensions use human labels such as Example, Width, Operation, Phase,
  and State. Internal fixture taxonomy is not exposed as user-facing navigation.
- A few peer choices use tabs/segmented controls; larger sets use Select. Ordered
  flows may use adjacent Previous/Next controls, but direct navigation remains.
- Deep linking is automatic. Link, State URL, and Audit all states are removed
  from primary control bars; exhaustive fixture indexes move to progressive
  engineering detail when retained.
- Control chrome is visually and semantically distinct from documented system
  output. Charts, Tables, Navigation, and Transactions share the grammar without
  sharing axes that do not belong to them.

## Coverage matrix

| Area                  | Primary result required                            | Structure / axes                                                               | Width and host                                    | Detail-only material                          |
| --------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------- | --------------------------------------------- |
| Foundations           | Actual roles, values, rules, and primary specimens | Continuous sections; human usage language                                      | Capped document; foundation-specific result width | provenance, engineering, comparisons, history |
| Actions               | Button, Icon Button, Action Group accepted systems | variant × size plus important states; Default named                            | contained neutral canvas                          | exhaustive interaction/state sheets           |
| Fields                | Real accepted inputs and selectors                 | density/size × state where meaningful                                          | fluid within contained neutral canvas             | APIs, rare validation permutations            |
| Selection             | Accepted selection controls                        | selected/unselected/unavailable and family variants                            | contained neutral canvas                          | exhaustive interactive fixtures               |
| Navigation components | Real items and important states                    | family/anatomy/state, not teaser screenshots                                   | fluid or real host-constrained canvas             | fixture matrices, provider/product detail     |
| Overlays              | Complete bounded anatomy                           | default plus meaningful state; actions/close included                          | intrinsic and centered with safe overflow         | exhaustive content and focus fixtures         |
| Feedback              | Actual intent/state family                         | intent × state where meaningful                                                | contained neutral canvas                          | rare transitions/history                      |
| Data display          | Accepted content and anatomy                       | family-specific labeled result                                                 | intrinsic or fluid by owner                       | exhaustive records and engineering detail     |
| Disclosure            | Closed/open or relevant state pair                 | state/anatomy                                                                  | contained neutral canvas                          | exhaustive nested-content cases               |
| Charts                | Source-faithful chart result                       | family/variant and real supported ranges                                       | natural capture or genuine live host width        | source pressure, chart engineering            |
| Tables                | Accepted tables and records                        | family/state/viewport as real axes                                             | fluid by default inside capped document           | all-scenario audit matrices                   |
| Navigation patterns   | Global/Product systems before host body            | family/state/identity/width where meaningful                                   | fluid or real host; neutralized product body      | product fixtures and engineering questions    |
| Transactions          | Current state dominates; family remains paused     | family as document sections; Operation/Phase/State; adjacent sequence controls | beige contained modals; full-canvas workspaces    | all-fixture index and internal taxonomy       |
| Governance records    | Current then historical records                    | two full-width vertical sections                                               | fluid                                             | exhaustive fixture audit                      |

Every implementation slice must expand this family matrix into an inspected
item inventory for its consumers so a local screenshot fix cannot close the
slice while the same defect remains elsewhere.

## Acceptance evidence

- One left navigation shows the complete hierarchy, has no right TOC or duplicate
  page-category navigation, tracks exact visible sections, keeps the active item
  visible, and restores direct/back/forward anchors at 1400, 1024, 390, and 320.
- The content column remains centered and capped after TOC removal; prose and
  intrinsic specimens do not stretch merely because space is available.
- Every accepted ordinary component presents its real default and meaningful
  variants/sizes/states in a labeled structure; no component family retains the
  narrow-left teaser template.
- Every specimen consumer has an inspected sizing mode, host surface, padding,
  alignment, and overflow disposition. Contained examples have visible breathing
  room; explicit full-canvas workspaces do not receive artificial padding.
- Transaction modal-like states center within stable beige contained canvases;
  neutral launch controls replace fabricated Stake/Vote-lock cards; Manual and
  large Automated workspaces use the full canvas; sequence controls stay adjacent
  and stationary; primary labels are human-readable.
- Auctions, Portfolio positions/withdrawals, and other fluid table surfaces use
  their full lab width. Governance current/history sections stack vertically.
- Chart sizing remains source/host faithful and is not blanket-stretched.
- Canonical examples contain only approved owners. Unknown authority produces an
  honest compact treatment or human gate, never invented UI.
- Final visual inspection covers ordinary viewport-height screenshots and real
  scrolling/interactions—not only full-page captures—in light/dark at every
  crossed breakpoint. Focus, keyboard, overflow, direct anchors, and no-results
  behavior are checked.

## Test seams

- Navigation projection and section-observer unit tests for hierarchy, active
  ancestry, click-versus-scroll history, namespaced identity, and anchor restore.
- Shell/browser tests for sidebar visibility, independent scrolling, active-link
  containment, mobile drawer hierarchy, and absence of the right TOC.
- Canvas behavior tests for sizing mode, host surface, contained/full-canvas
  semantics, alignment, stable height, and control-slot vocabulary.
- Component overview tests derived from the component inventory, including
  Default Button/Icon Button sizes and truthful compact non-accepted entries.
- Transaction behavior tests for human dimensions, neutral entry actions, stable
  geometry, adjacent sequence navigation, retained direct selection, and existing
  amount/reset fidelity.
- Existing focused Chart, Table, Navigation, standalone/provider-isolation, and
  deep-link suites remain regression owners.
- Rendered evidence at 1400/1024/390/320 in both themes, including ordinary
  viewport crops and at least one pressure state per changed family.

## Slices

- **Slice 1 — Contract, inventory, and unified shell navigation.** Supersede old
  presentation clauses; flatten the visible sidebar into one expanded hierarchy;
  remove right/inline duplication; retain exact scroll/hash semantics; establish
  the capped page-width contract.
- **Slice 2 — Shared canvas and lab-control grammar.** Add explicit sizing,
  surface, padding, alignment, and stable-height ownership; migrate control labels
  and progressive deep-link/audit behavior without changing owner mechanics.
- **Slice 3 — Component reference depth.** Replace the side-label teaser template
  and generic specimen grid with family-specific structured summaries for every
  accepted ordinary component; compact truthful unresolved entries.
- **Slice 4 — Complex patterns and Transactions.** Move Transactions into the
  Patterns hierarchy with Paused status; correct modal/workspace hosts, entry
  controls, human labels, sequence geometry, fluid tables, governance stacking,
  Navigation hosts, and Chart sizing through the shared contracts.
- **Slice 5 — System-wide audit and convergence.** Inspect Foundations and every
  canvas/control consumer for the same principles, repair remaining systemic
  instances, run the affected verification matrix, complete independent Intent
  and Engineering Risk review, and reconcile durable documentation.

## Unresolved decisions

- Secondary/beige transaction page backgrounds are the current reversible
  documentation presentation. A later human decision may change the intended
  product host without altering component owners.
- Quiet Button resting affordance, Global Navigation portal containment, exact
  product-navigation divider ownership, inherited transaction naming, and any
  missing component authority remain owner-level questions. Documentation may
  expose or honestly defer them but cannot decide them silently.
- Hosted-preview access/indexing U11/U12 remains separate and blocks publication,
  not this local reconciliation.

## Strongest case against this plan

The pass could replace several inconsistent local presentations with one overly
generic documentation framework that hides real family differences. The plan
survives only if shared owners define layout and control grammar while every
family retains its own meaningful axes, accepted implementation, and host truth.
If a shared primitive accumulates family-name branches or requires invented
component behavior, return that behavior to the family and keep only the common
contract shared.

## Implementation receipt — 2026-09-17

Status: implementation-verified and ready for human visual review, not fully
accepted. The complete 1400/1024/390/320 light/dark interaction matrix remains
human-review evidence rather than a completed claim. This pass changes
documentation projection and documentation-only opt-in seams; it does not
accept new design authority, change production adoption, alter transaction
mechanics, or modify shared component defaults or tokens.

Implemented result:

- one persistent, independently scrolling left hierarchy replaces the right
  rail, duplicate inline family navigation, and separate mobile section picker;
  exact children and their ancestors track scroll position and remain visible;
- Components now presents labeled, family-appropriate results rather than
  narrow teaser rows, including the complete Button size matrix, the accepted
  Compact Icon Button role, meaningful states, real Tabs and Multi-select
  outcomes, a complete Dialog, and truthful compact unresolved entries;
- the shared specimen canvas owns explicit width, surface, padding, alignment,
  stable-height, and control-slot semantics;
- Charts retain source-faithful widths; Tables default to full documentation
  width; governance current/history stack vertically; Navigation uses neutral
  or secondary hosts without fabricated product bodies;
- Transactions lives under Patterns with a Paused label and five visible family
  children. Human Operation, Phase, State, and adjacent Previous/Next controls
  replace fixture taxonomy and primary audit links. Modal families use beige
  contained hosts, large Automated and Manual states use the full canvas, and
  neutral documentation launch buttons replace fabricated product cards;
- the duplicate Workbench transaction explorer is removed. Workbench retains
  review activity and links back to the Patterns result.
- responsive convergence keeps Color definitions readable at 1024, contains
  Table width controls in local phone scrollers, preserves the Overview chart's
  readable 824px source width, and keeps Stake/Vote-lock specimens reachable at
  390 and 320 without changing their product owners;
- raw transaction fixture identifiers are replaced by human-readable labels
  while the internal routing keys remain unchanged; the duplicate Foundations
  section strip is removed;
- Select and Metric now own their single documentation canvas instead of
  sitting inside a second framed result. Their canvas contract is explicit, and
  Select exposes its choice as Size rather than the generic Example label.
- modal transaction canvases retain visible phone padding while preserving
  reachability; Workbench navigation tracks every scrollable section; the
  Transaction result identifies itself as a paused Pattern; and Popover uses
  the accepted Multi-select Filter owner instead of invented inner anatomy.
- Forms now uses the same explicit specimen-canvas contract as every other
  Pattern, and the nested Transaction explorer no longer repeats the parent
  Pattern identity and status.
- the internal documentation remains English-only. Its 169 introduced messages
  are intentionally untranslated in the existing Spanish, Korean, and Chinese
  public-UI catalogs; no locale or language selector was added.

Fresh proof after the final source edits:

- focused documentation units: 101/101 across Components, navigation,
  accessibility, canvas, Charts, Tables, Navigation patterns, Transactions,
  presentation, Workbench, provider isolation, and compatibility routing;
- integrated shell browser journeys: 26/26 at desktop and mobile widths;
- standalone provider/asset boundary: 16 unaffected journeys plus the corrected
  2/2 asset-boundary rerun, with no product provider or wallet startup;
- Components and Patterns browser journeys: 16 passed across desktop/mobile,
  with two intentional capture-only skips;
- focused real-browser Navigation and Table fidelity checks pass; the final
  transaction browser assertion was reconciled from the retired internal flow
  navigation and Select operation control to the shared sequence/segmented
  controls, while its behavior remains covered by the focused unit suite and
  rendered inspection;
- application and E2E TypeScript pass; the standalone production build passes
  with 4,034 modules; ordinary viewport inspection covered Components,
  Navigation, Tables, Zapper, Automated, Stake, and Manual at 1400 and 390.
- the final inherited-tree gate passed 1,506/1,507 tests. Its only failure is
  the unchanged native filesystem-watcher test, which emitted `watcher-error`
  in this environment on three consecutive attempts; no review-source or
  watcher implementation changed in this pass.
- the overnight component, responsive-reference, and transaction packets pass
  71/71 combined focused units. The final Select/Metric slice was proven RED by
  three framing/label failures, then GREEN at 23/23; its isolated real-browser
  check passed 1/1 and refreshed desktop-light and phone-dark evidence for both
  components;
- the pre-final-audit broad run passes lint and both application/E2E
  TypeScript projects. It passes 1,514/1,515 tests; the sole failure is again
  the unchanged native filesystem-watcher test reporting `watcher-error`, so it
  was not retried without a materially different approach.
- the final audit reconciliation was proven RED across six assertions and now
  passes 59/59 focused units, scoped formatting/lint, application/E2E
  TypeScript, locale extraction, and diff checks. The repaired 320/390
  transaction containment journey passes 1/1 in an isolated browser run.
- the overnight follow-up was proven RED for the final legacy Forms canvas and
  duplicated Transaction identity, then passes 22/22 focused units. Locale
  extraction and compilation pass; independent base-to-worktree reconciliation
  confirms all 169 internal-documentation messages remain intentionally empty
  in each non-English catalog.

The isolated verification preview used ports 3063/3064 only. The user preview
on port 3055 was never stopped, restarted, or reconfigured. Hosted-preview
access/indexing U11/U12 and the previously recorded owner-level questions remain
separate decisions.

Final review disposition:

- Intent Important, confirmed/fixed: removed documentation-owned elevation from
  the Product Navigation rail because divider/separation ownership remains a
  human-gated component question.
- Intent Important, confirmed/deferred to human review: the complete four-width,
  both-theme visual and interaction matrix was not gathered; the receipt now
  states the narrower evidence boundary explicitly.
- Engineering Risk Minor, confirmed/deferred: newly reconciled browser coverage
  retains some English accessible-name selectors. This affects test
  maintainability under localization, not runtime behavior, and belongs in a
  later test-hygiene pass with stable test IDs.
- Overnight read-only audit Important, confirmed/fixed: phone modal padding,
  Workbench section tracking, stale Workbench-first Transaction labeling, and
  invented Popover anatomy. The related stale Pattern search copy and Select
  accessible label were also corrected. Constrained Global Navigation's
  state-dependent height remains an explicit human/owner-level refinement.
- Overnight final read-only audit Important/Minor, confirmed/fixed: Forms no
  longer recreates legacy canvas chrome and Transactions no longer repeats its
  parent identity/status. Constrained Global Navigation's state-dependent
  height remains deferred because selecting one stable height changes the
  visual balance and should be judged in the morning review.

The affected Intent-axis rerun passes for handoff to human visual review.
