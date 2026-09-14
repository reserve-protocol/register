# Design system v1

## Goal

Create and introduce a cohesive visual system for Register that raises the
product quality bar, keeps complex product compositions flexible, and separates
design authority, reusable implementation, verification, and production
adoption.

The system should give developers and designers strong, attractive first-pass
defaults without prescribing every page or suppressing task-specific judgment.
Established component contracts stay consistent; justified changes belong in
their owning component or a supported variant, not hidden consumer overrides.
Evaluate simplicity and future feature quality alongside migration reliability.

## Non-goals

- Do not turn the transaction family into one universal flow controller or
  force distinct product mechanics into identical screens.
- Do not promote unfinished lab compositions, local exceptions, or unattended
  proposals into current-baseline authority.
- Do not migrate production consumers, change product copy, or resolve
  engineer-owned transaction correctness as part of lab hardening.
- Do not freeze foundation values that still require realistic screen evidence;
  record pressure from compositions and resolve it at the owning level.

## Read this plan for

- the current operating model and source precedence;
- current project state and active frontier;
- unresolved risks and active synchronization;
- the bounded evidence/audit paths needed for current work.

Do not use this file as a component or foundation encyclopedia. Start at the
[design-system router](../wiki/domains/design-system.md) for task-specific
sources. The former chronological plan is preserved as
[historical evidence](design-system-v1-history.md) and is not active guidance.

## Source and authority precedence

Use the smallest relevant sources in this order:

1. Repository safety and engineering rules in `CLAUDE.md`. Explicit Register
   overrides in `docs/wiki/project.md` win over conflicting reusable Skill
   defaults; they never weaken non-negotiable safety rules.
2. Accepted design meaning and rationale in `docs/wiki/decisions.md`.
3. Typed foundation/component authority and maturity in
   `src/views/internal/design-system/foundation-catalog.ts` and
   `component-catalog*.ts`, plus the canonical implementation named by the
   relevant entry.
4. Current synthesized detail reached through
   `docs/wiki/domains/design-system.md`. Its on-demand reference may explain a
   rule but does not override a newer accepted decision or typed owner.
5. `src/views/internal/design-system/current-review.ts` for the one active
   human-review boundary. Review output is provisional until accepted.
6. This plan for current project direction, active frontier, risks, and pending
   synchronization.
7. Evidence and historical sources, interpreted by their declared role. Lab
   appearance, strong precedent, current product behavior, and legacy coverage
   do not become canonical authority by being visible or frequently used.

When two current-looking sources disagree, preserve the higher-precedence
accepted meaning and current implementation. If that would require choosing a
new design meaning, stop and record the ambiguity for human review.

### Authority vocabulary

- `current-baseline`: human-reviewed contract that new work inherits today;
  revisable only through evidence and an owner-level decision.
- `canonical-candidate`: reusable V1 implementation exists; this alone does not
  confer design authority or production adoption.
- `reusable-recipe`: the named treatment is consumable without promoting a
  larger component contract.
- `exploratory` / `specimen`: review evidence, not current authority.
- `adoptionStatus: none`: no production consumer is migrated, even when the lab
  renders an accepted reusable candidate.

## Current operating model

The [lab area guide](../../src/views/internal/design-system/CLAUDE.md) owns the
seven-pass composition review and executable verification route. Read it before
changing a lab surface; it does not replace target-specific accepted decisions.

1. Route from the target catalog entry to only its named foundations,
   implementation, accepted decisions, and relevant evidence.
2. Reuse existing audits and product evidence before gathering the same
   requirements again.
3. Synthesize the strongest complete candidate from current baselines,
   consumable implementations/recipes, and correctly classified product or
   visual evidence.
4. Preserve product jobs, mechanics, content constraints, and successful
   composition. Consolidate accidental legacy variation instead of mirroring
   it.
5. Resolve a visually meaningful prerequisite before its parent. Consume an
   existing owner directly; do not reconstruct an accepted treatment locally.
6. Self-review foundation conformance and whole-composition quality before
   placing a nearly complete candidate in Current Review.
7. Classify feedback as local, component, composition/pattern, foundation, or
   reusable heuristic and update the smallest justified owner.
8. Keep rendered output, reusable implementation, human acceptance,
   verification, and production adoption independent and truthfully labeled.
9. Verify at the owning seam and with the bounded/checkpoint/integration cadence
   explicitly overridden for this project in `docs/wiki/project.md`.
10. Treat every enabled lab control as behavior: it must work over a
    representative domain, be explicitly unavailable with a reason, or be
    labeled specimen-only. State-rich transaction labs pressure-test an
    ordinary non-preset amount, branch preservation into recovery, terminal
    reset, and external-identity shape before review.
11. Keep candidate evidence out of accepted domain truth until human review.
    Internal Dark/Light review may report “no blocker identified,” but is not a
    substitute for human acceptance and must not be recorded as one.

For an existing product-flow composition, the operating model consumes the
[flow composition transfer brief](../../templates/design/flow-composition-transfer.md)
before visual implementation. The brief makes state transfer, information
priority, exact component use, geometry ownership, transition continuity, and
transaction truth inspectable before a candidate is repeated across many
fixtures. It is a preparation contract, not new design authority.

### Anti-cascade rule

Unreviewed lab work and unattended proposals cannot become authority for other
speculative work. A downstream candidate may consume only a current baseline,
an explicitly retained product/domain behavior, or clearly labeled evidence.
New evidence may inform a proposal; it cannot promote itself or its siblings.

### Design-system scope and sensitive behavior

The primary deliverable is the design system: reusable visual elements,
necessary variants, typography, layout, controls, accessibility and presentation
states. Reading product/data code establishes the requirements those elements
must preserve; it is not authorization to repair or redesign that machinery.

Preserve existing value definitions, periods, units, source selection, SDK/RPC/
subgraph contracts, freshness rules, live-point reconciliation, permissions and
transaction behavior. A chart audit reporting different percentages or stale-
looking history raises a question, not an instruction to standardize calculations,
replace a source, invent a freshness threshold, or change interpolation. First
establish whether the compared values have the same intended meaning and inputs.
Unresolved semantics must not become silent assumptions in a reusable component.
The lab may demonstrate explicitly supplied/simulated states without claiming
the product can yet derive them. Useful technical findings stay separate from
the visual build; non-trivial sensitive changes require a separately authorized
scope and engineering decision, not a later-review promise after implementation.

Record sensitive findings and any authorized sensitive changes in the deferred
engineering-review register below, with linked detail where needed. The handoff
must name the affected owners, existing behavior, exact proposed versus actual
change (including "no implementation"), evidence/source snapshot, unknowns,
possible user impact, and required engineering verification. Distinguish an audit
claim from a reproduced defect and from an accepted change. Lab annotations or
chat history alone are not the handoff. No chart preparation or overnight
implementation is authorized merely by this scope clarification.

## Current state

- The contained `/internal/design-system` lab routes Foundations, Components,
  Screens, Studies, and Project Status. The typed catalogs keep design
  authority, rendered output, implementation, review readiness, verification,
  and adoption separate.
- Reviewed foundation and component baselines are recorded in the typed
  registries and accepted-decision ledger. Canonical implementations remain
  opt-in and production migration is separate.
- Global and Product navigation are separate accepted, unadopted baselines.
- Transaction design is paused at a verified, unadopted lab checkpoint. Retain
  the five families and their human-directed local refinements without
  accepting every visible specimen. The [checkpoint disposition](transaction-consolidated-regression.md#checkpoint-disposition)
  owns retained scope and exclusions; the [audit](transaction-system-audit.md)
  owns product evidence, and the [postmortem](transaction-review-feedback-postmortem.md)
  records prior review failures rather than current design authority.

## Active frontier

The [September 14 workflow-boundary checkpoint](design-system-workflow-boundary-checkpoint-2026-09-14.md)
preserves tables approved for now and charts still under review. Chart review is
temporarily paused for workflow discussion; the checkpoint does not authorize
workflow changes, a fresh implementation task or production adoption.

### Transaction checkpoint: paused, not a migration approval

The retained review target is derived from
`src/views/internal/design-system/current-review.ts` and the
`transaction-action` catalog entry. Continue only through explicit human visual
feedback when this work resumes. No further transaction design pass is scheduled
by this plan. The [checkpoint disposition](transaction-consolidated-regression.md#checkpoint-disposition)
separates retained flow designs, unreviewed surroundings, and engineering-owned
adoption work. Preserve current product mechanics and the installed package
boundary; do not infer production adoption, a universal transaction controller,
or sibling-flow redesign from the lab.

The next meaningful work is whichever bounded component,
composition, or product adoption the human explicitly selects. The catalog is
a capability map, not an obligation to rush through every unresolved item.

### Inventory reconciliation and outside audit

The bounded inventory reconciliation and independent Phase 1 audit are complete.
The [audit](design-system-outside-audit-phase-1.md) and its
[reconciliation](design-system-outside-audit-phase-1-reconciliation.md) remain
evidence, not design authority. The
[foundation consolidation plan](design-system-foundation-consolidation.md) has
been revised after its [independent review](design-system-foundation-consolidation-review.md);
implementation was authorized on 2026-09-09. Its bounded ownership, typography,
verification and documentation/catalog changes are implemented. All six initial
fresh-agent outputs are retained. The [independent comparison and reconciliation](design-system-consolidation-reconciliation.md)
found useful authority/API improvements but no better first-pass composition;
S4's positive reliability claim is not met. Small retrieval/precedent corrections
are applied without promoting the experimental specimens. The plan also prepares a
named, separately authorized integration rehearsal; it has not been implemented.
The current table work is [approved for now](../wiki/decisions.md#2026-09-14--current-table-work-approved-for-now).
This covers the bounded Portfolio/withdrawal, Holdings, Discover, Earn/DeFi/owned
position, governance record and current/history auction table presentations,
including the accepted content-hover treatment and recent governance refinements.
It does not accept a universal Table/Row API, every production state, chart design,
global pill geometry or production adoption. Earlier candidate/checkpoint receipts
remain historical evidence; this scoped human decision supersedes their pending
visual-review status, not their engineering gates.

The active work is the [source-faithful chart review](design-system-charts-source-reset.md):
actual Overview and Home renderers in named product contexts, a correctly sized
Discover sparkline and opt-in header inspection. The prior generic compositions
were rejected as product replacements; they remain collapsed technical fixtures. The
[reconciled audit brief](design-system-overnight-2026-09-14/charts.md) owns sequencing;
[source/financial questions](design-system-overnight-2026-09-14/chart-engineering.md)
remain separate. Overview gains a display-only optional `onInspect` callback;
existing production callers keep their tooltip. No data source, calculation,
freshness rule, sampling policy or chart-type default is changed. Candles, signed period bars and both
composition patterns are separate later work. Current Review points to
`/internal/design-system/components/chart#chart-first-review`.

Table evidence remains discoverable through the typed catalog and its family
briefs. The [production-adoption contracts](design-system-table-family-reconciliation.md#production-adoption-contracts)
and [Portfolio coverage exclusions](design-system-portfolio-coverage-review.md)
are still binding. [Governance presentation closeout](design-system-governance-presentation-closeout.md)
records the frozen-state presentation; it does not implement live eligibility.

The [current rebalance table](design-system-current-rebalance-table.md#near-term-and-deferred-scope)
and separate historical table are the approved-for-now near-term presentation.
Mobile cleanup and the [final independent review reconciliation](design-system-current-rebalance-table-evidence/closeout/README.md)
are complete. Navigation-only current records stay separate from static history.
The deeper lab page is a dated, named read-only production reference, not an
executable flow. Initial migration must retain the existing auction detail/flow,
with engineer-reviewed membership, access, timing and version-correct navigation.
Retention does not certify the old flow's safety or waive known audit findings.
The [current rebalance workspace](design-system-current-rebalance-workspace.md)
is unfinished and deferred at `#auctions-browse-review`, above the retained
[historical table](design-system-auctions-history-slice.md). One open surface
pairs auction-owned trade planning with transparent launch terms/action under one
heading. Full-width liquidity inspection follows; general references stay in the
header and cumulative results below the working section. Narrow widths retain
the same task tree. Lab-only scenarios cover roles, hybrid weights, receipt and
indexing waits, live bids, repeat rounds, unknown data, expiry and history handoff.
Keep that implementation and evidence for explicitly authorized future work;
it is not a prerequisite for the table migration or the initial row destination.
No real wallet, live adapter, production action or shared default is changed.
The [flow audit](design-system-current-rebalance-flow-audit/report.md) and
[readiness map](design-system-current-rebalance-readiness/README.md) remain source
evidence, with dispositions and verification at the workspace brief. New error
explanations are explicitly lab annotations pending product copy approval.
The [earlier record composition](design-system-auctions-composition-refinement.md)
remains separately inspectable at `#auctions-records-review`; it is historical
exploration, not an accepted layout or workspace dependency.
Breadcrumbs remain low-priority and conditional; their catalog entry records when a migration owner should
reconsider them without depending on the original designer personally.

Review readiness is not work scheduling or approval: `not-started` means no
review specimen is prepared, `deferred` means no review is scheduled, and
`blocked` requires a named dependency. `in-composition` output points to existing
rendered evidence without inventing a standalone specimen or promoting it.
Verification remains in scoped checkpoint reports and component evidence;
the progress dashboard does not infer a blanket verified gate. Accepted
baselines, implementation maturity, and production adoption remain separate.

### Transaction-only guidance

Load the [retained composition guidance](transaction-consolidated-regression.md#retained-transaction-composition-guidance)
only for transaction work. It owns the provisional geometry/transfer boundaries
and the [pressure register](transaction-consolidated-regression.md#transaction-composition-pressure-register);
accepted component meaning remains in the decision ledger. The
[dated upstream reconciliation](transaction-system-audit.md#14-versioned-upstream-transaction-reconciliation-2026-09-02)
is product evidence. None is required for ordinary component work or an instruction
to resume the paused transaction review.

### Deferred engineering-review register

Engineering review is deferred until the complete design-system project is
ready for its final handoff. It is not a stage-by-stage blocker during lab,
visual-composition, or documentation work. Every stage must still add a
specific row here when it changes a shared implementation contract, touches a
product correctness seam, or proposes production adoption. Record the owner
and reason now so project-closeout review does not depend on reconstructing the
history from the diff.

Deferral applies to review timing while safe presentation work continues; it
does not authorize introducing sensitive behavior changes before the separate
scope/decision required by the boundary above. Investigated concerns are not
changes made, and a handoff entry does not certify correctness.

| Review surface                                                                                                                          | Why engineering review is required at project closeout                                                                                                                                                                                                                                                                              | Current boundary                                                                                                                                                                                                                                                                                                                                          |
| --------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Governance record production adapter                                                                                                    | Governance owner must preserve individual proposal/governor identity, lifecycle/tally/deadline derivation, standard versus optimistic evidence and vote/queue/execute authority; loading/empty/expired/Show all and deadline crossings need real source coverage                                                                    | [Presentation closeout](design-system-governance-presentation-closeout.md): 13 frozen examples, explicit waiting versus ready, independent help, active-only timeline and local loading/empty. Overview reference links remain; no adapter, state derivation, shared timeline default or transaction change.                                              |
| Opt-in interactive content hover                                                                                                        | CSS/Tailwind/semantic role needs theme, contrast, focus/selection and real consumer-scope review before production use                                                                                                                                                                                                              | [Accepted lab rollout](design-system-content-hover-trial.md): solid pale ivory in light, subtle lightening in dark. Eligible content rows/cards opt in; static/loading/control states excluded. No production migration or shared-default change. Engineer review required for adoption.                                                                  |
| Same-view current rebalance lifecycle                                                                                                   | Auction live-state truth, indexer lag/double-send prevention, both launch paths, receipt reverts, permissions/network checks, weight units/persistence, cap policy and filler navigation need real integration evidence                                                                                                             | [Lab candidate](design-system-current-rebalance-workspace.md) only; local simulation and explicit unknown states, no SDK/wallet/RPC change. Engineer review required before adoption; v4/v2 and router-level blocking remain separate                                                                                                                     |
| Current/history table production adapter                                                                                                | Auctions integration owner must verify authoritative current/live membership, access/timing, version-correct destinations and Back/deep-link continuity; history needs source/sign/precision/unknown-value fidelity                                                                                                                 | [Near-term scope](design-system-current-rebalance-table.md#near-term-and-deferred-scope) only. Keep the existing detail/flow; dated lab references do not implement it or clear audited launch hazards. No production adoption.                                                                                                                           |
| Chart value-basis and freshness questions                                                                                               | Chart audit at checkpoint `289b2af86` reports different headline/series endpoints across Overview, Discover/Home and Factsheet (F-01/F-02/F-09), and stale-history/live-point behavior (F-03). Chart/data owners must establish intended periods, timestamps, units and SDK/source semantics before classifying or changing them    | [September 14 reconciliation](design-system-overnight-2026-09-14/chart-engineering.md) separates source-confirmed observations from historical/unverified claims; no calculation/source/freshness change. [Visual first slice](design-system-overnight-2026-09-14/charts.md) can use explicit supplied values/states without choosing a financial policy. |
| Overview header-readout/launch-annotation opt-ins and source-renderer reuse                                                             | `price-chart-body.tsx` accepts optional `onInspect`; `chart-inspection.ts` validates existing selected event payloads. The lab owns accessible readout, focus/touch/exit. Optional `launchMarkerVariant="annotation"` replaces the static pill with V1 text; launch dates/segmentation are unchanged. Production callers omit both. | **Engineer review required before adoption.** Verify modes/units, payload lifecycle, keyboard/touch/exit, header/series meaning, motion and source imports; check annotation translations and edge-of-domain placement. No query, SDK, return, sampling or chart-type default changes. [Bounded contract](design-system-charts-source-reset.md).          |
| Semantic `substrate-subtle` token and its CSS/Tailwind/semantic-role wiring                                                             | Adds an opaque shared surface role whose exact light/dark values and naming affect future consumers                                                                                                                                                                                                                                 | Accepted for the V1 lab; no production migration                                                                                                                                                                                                                                                                                                          |
| Exploratory `brand-surface-deep` token and Organic Brand `deep` tone                                                                    | Adds a shared theme alias and opt-in presentation whose extra depth currently applies only in dark mode and only attachment outcomes need it                                                                                                                                                                                        | Lab pressure only; do not consume or migrate until human disposition                                                                                                                                                                                                                                                                                      |
| Shared Link directional-icon spacing and Lifecycle Status intrinsic sizing defaults                                                     | Changes reusable component defaults outside a single transaction composition                                                                                                                                                                                                                                                        | Verified in the lab; production adoption remains separate                                                                                                                                                                                                                                                                                                 |
| Standalone Link hover feedback                                                                                                          | Adds the user-requested text underline on hover to the shared V1 standalone treatment; navigation and focus behavior stay unchanged                                                                                                                                                                                                 | Lab verified; engineer review before production adoption                                                                                                                                                                                                                                                                                                  |
| DataTable optional toolbar slot                                                                                                         | Exposes the existing TanStack table instance for caller-owned controls without a second sorting state                                                                                                                                                                                                                               | Used by constrained position sorting in the lab; existing callers/defaults unchanged; engineer review before adoption                                                                                                                                                                                                                                     |
| Link and InlineAction contextual treatment                                                                                              | Adds opt-in neutral body-type navigation/local-detail actions without changing defaults                                                                                                                                                                                                                                             | Table-family lab trial only; engineer review before production adoption                                                                                                                                                                                                                                                                                   |
| Copyable Value integrated action and Inline Message compact-summary/contained-icon contracts                                            | Adds reusable interaction/presentation variants, including copy feedback, tooltip eligibility, and an opt-in balanced icon treatment                                                                                                                                                                                                | Accepted V1 component contracts; production adoption remains separate                                                                                                                                                                                                                                                                                     |
| Restrained 8px transaction amount-region geometry, opt-in supporting-row reservation, and provisional transaction relationship geometry | Defines reusable input/output/replacement boundaries, stable responsive content height, and cross-flow spacing/divider ownership                                                                                                                                                                                                    | Consumable only in the active transaction review; not a universal Dialog or workflow contract                                                                                                                                                                                                                                                             |
| Stake delegation split versus the production `stakeAndDelegate` shortcut                                                                | Adopting the lab's distinct Delegate mode could remove or alter an existing combined contract call and changes the product interaction model                                                                                                                                                                                        | Lab-only information architecture proposal; retain the live shortcut until explicit migration review                                                                                                                                                                                                                                                      |
| Transaction result, RPC, package callback, order/queue identity, approval, and partial-success seams                                    | Visual fixtures cannot prove the live source of truth or execution/recovery correctness                                                                                                                                                                                                                                             | Keep exact behavior product-owned; reconcile against direct implementation before adoption                                                                                                                                                                                                                                                                |
| Automated issuance batch count, cancellation, executed amounts, recovery, and dormant outcome route                                     | The SDK owns call splitting and execution while the current UI reconciles quote, order, receipt, and balance sources without a persisted operation record                                                                                                                                                                           | Lab may model named states only; source priority and reconstruction require product/SDK review                                                                                                                                                                                                                                                            |
| Manual issuance address normalization, parallel/USDT approvals, zero-minimum Redeem leg, and result source                              | These boundaries can change balance validity, permission ordering, slippage protection, and the facts a consequential outcome may claim                                                                                                                                                                                             | Preserve production behavior in the lab; resolve before any production migration                                                                                                                                                                                                                                                                          |
| Any production migration of the current transaction candidates                                                                          | Adoption may change real flow behavior, shared defaults, analytics, accessibility, and integration boundaries                                                                                                                                                                                                                       | Requires separate explicit migration scope after human design review is complete                                                                                                                                                                                                                                                                          |
| Complete shared typography owner API                                                                                                    | Exposes all ten reviewed roles and usage guidance from typography.ts; four earlier keys stay compatible                                                                                                                                                                                                                             | Value-preserving lab consumption verified; engineer review before production adoption                                                                                                                                                                                                                                                                     |
| Compact item-title recipe and EntityIdentity nameLeading opt-in                                                                         | Adds a 16px/20px wrapping-title variant and preserves a 24px single-line floor; reviewed roles and shared defaults unchanged                                                                                                                                                                                                        | Bounded table presentations approved for now; engineer review of API and adoption scope before production use                                                                                                                                                                                                                                             |
| Consolidated semantic owner and Tailwind role aliases                                                                                   | Removes overlapping owner exports and names existing surface, feedback, disabled and neutral-status aliases; distinct focus contracts remain explicit                                                                                                                                                                               | Existing CSS values and component defaults preserved; engineer review before production adoption                                                                                                                                                                                                                                                          |
| EntityIdentity `wrapName`; DataTable `ariaLabel`, `renderToolbar` and `rowLimit` opt-ins                                                | Adds wrapping, accessible sort metadata, a same-instance toolbar and a post-sort preview limit for the position/withdrawal lab slice                                                                                                                                                                                                | Defaults and production callers unchanged; engineer review of shared APIs and real data/action adapters before adoption                                                                                                                                                                                                                                   |
| ChainBadgedLogo optical edge positioning                                                                                                | User-authorized shared candidate geometry change across all four sizes; verify separator/background relationship when adopting                                                                                                                                                                                                      | Visual trial in V1 consumers only; legacy production wrappers and stacked logos unchanged; engineer review before adoption                                                                                                                                                                                                                                |
| ChainBadgedLogo optional custom mark                                                                                                    | Accepts caller-sized artwork while retaining the existing badge owner; default TokenLogo path unchanged                                                                                                                                                                                                                             | Unadopted opt-in from the preceding DeFi trial; latest DeFi composition no longer consumes it; engineer review before production adoption                                                                                                                                                                                                                 |
| EntityIdentity 32px mark spacing                                                                                                        | User-authorized 12px gap trial keyed to direct ChainBadgedLogo size metadata; other marks keep 8px                                                                                                                                                                                                                                  | Shared candidate trial, not accepted migration policy; inspect consumers before adoption                                                                                                                                                                                                                                                                  |
| TokenStackTrigger opt-in                                                                                                                | Adds a named 44px logo-led trigger over existing Button and TokenLogoStack without altering their defaults                                                                                                                                                                                                                          | Discover trial; its local horizontal strip and production adoption remain separate review boundaries                                                                                                                                                                                                                                                      |
| DataTable alternative renderer and feature-chart animation opt-in                                                                       | Keeps one table state owner while rendering a caller-owned card list; lets the lab disable both chart layers for reduced motion without changing existing defaults                                                                                                                                                                  | Discover card lab only; engineer review before adoption, including list state, focus, and production page integration                                                                                                                                                                                                                                     |
| Portfolio viewed-account withdrawal ownership and table data adapters                                                                   | Independent review found enabled withdrawals while viewing another account; source combines the connected account with a viewed row's endId. Sorting/limiting, missing values and precision also differ between lab and product                                                                                                     | No production changes or transaction attempts; engineer review of account/row ownership and the [adoption contracts](design-system-table-family-reconciliation.md#production-adoption-contracts) before migration                                                                                                                                         |

Exploratory lab-only treatments do not need an engineering decision merely
because they exist. Add them to this register only if they are promoted into a
shared contract, affect live product truth, or enter a production-migration
proposal.

## Unresolved decisions

- Transaction presentation seams remain provisional. Exact result/RPC sources,
  automated reconciliation, queue identity, package callbacks, and the P0
  correctness findings in the transaction audit require engineer review at
  their owning product seams.
- Production adoption remains separate for all current V1 candidates. Shared
  defaults and token changes require their own explicit migration authority.
- Complex screens may still pressure-test foundation values. Revise the owning
  rule only with real evidence; do not accumulate local exceptions.
- The on-demand detailed design-system reference still mixes several domains
  and dated evidence. A later split by foundation or component family is
  deliberately deferred until this lighter routing layer is tested in real
  work.
- The component catalog does not model every product dependency. Add typed
  routes only when they materially reduce ambiguity; do not build a dependency
  platform.

## Pending synchronization

- Keep Current Review, typed catalog authority, accepted decisions, and the
  active plan aligned when human review changes an owner.
- Keep historical studies and evidence recoverable, but do not copy them back
  into active authority merely to summarize completed work.
- Revisit the larger foundation/catalog document split only after observing
  whether this router and typed-source pass materially improve fresh-worker
  performance.

## Verification cadence

- **Bounded review loop:** focused behavior/type/lint checks and affected live
  rendering only.
- **Design-system checkpoint:** reconcile the coherent batch, run affected
  unit/type/lint and design-system browser coverage, then update authority and
  the progress ledger once.
- **Repository integration:** full repository gate only for production
  adoption, shared/global defaults or tokens, releases/PRs, or another genuine
  cross-product boundary.

`skills/workflow.md` still owns general radius × size calibration. The cadence
above is Register's explicit design-system override; broad verification is not
required merely because a lab-only diff is large or long-running.

## Test seams

- Typed catalog tests prove authority, maturity, dependency, and evidence
  routing without treating rendered output as acceptance.
- Focused component and composition tests prove deliberate shared contracts and
  state preservation at their public rendered seam.
- Routed browser review proves geometry, continuity, responsive containment,
  and light/dark composition quality on the actual current mounted surface.
- Typecheck, scoped lint, wiki lint, and `git diff --check` protect integration
  and durable-context health without claiming production behavior.

## Slices

The [foundation consolidation plan](design-system-foundation-consolidation.md)
owns current implementation slices and dependencies. Transaction families stay
paused at their [checkpoint](transaction-consolidated-regression.md#checkpoint-disposition);
their earlier proof runs are completed evidence, not the upcoming work queue.

## Acceptance evidence

- A worker can begin at the design-system router, find a target catalog entry,
  resolve its typed foundation IDs, follow canonical implementation and accepted
  decision sources, and distinguish visual/product/legacy evidence roles.
- Current Review contains only the active human judgment boundary and never
  implies acceptance or production adoption.
- Focused catalog tests, typecheck, scoped lint, routed browser checks when UI
  changes, wiki lint, and `git diff --check` validate the affected seam.
- Broader production and release evidence is required only at the explicit
  integration boundary above.

## Load-on-demand evidence

- [Historical V1 plan and prior handoffs](design-system-v1-history.md)
- [Detailed design-system reference](../wiki/domains/design-system-reference.md)
- [Accepted decisions](../wiki/decisions.md)
- [Transaction-system audit](transaction-system-audit.md)
- [Manual issuance readiness](manual-mint-design-system-readiness.md)
- [Manual issuance lifecycle lab](manual-issuance-lifecycle-lab.md)
- [Transaction review feedback postmortem](transaction-review-feedback-postmortem.md)
- [Chronological project log](../wiki/log.md)
- [Stage ledger](../wiki/progress.md)

These sources preserve evidence. They are not a reason to load the complete
project chronology for an ordinary component task.
