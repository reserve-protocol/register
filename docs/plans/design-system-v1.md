# Design system v1

## Goal

Create and introduce a cohesive visual system for Register that raises the
product quality bar, keeps complex product compositions flexible, and separates
design authority, reusable implementation, verification, and production
adoption.

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

### Anti-cascade rule

Unreviewed lab work and unattended proposals cannot become authority for other
speculative work. A downstream candidate may consume only a current baseline,
an explicitly retained product/domain behavior, or clearly labeled evidence.
New evidence may inform a proposal; it cannot promote itself or its siblings.

## Current state

- The contained `/internal/design-system` lab routes Foundations, Components,
  Screens, Studies, and Project Status. The typed catalogs keep design
  authority, rendered output, implementation, review readiness, verification,
  and adoption separate.
- Reviewed foundation and component baselines are recorded in the typed
  registries and accepted-decision ledger. Canonical implementations remain
  opt-in and production migration is separate.
- Global and Product navigation are separate accepted, unadopted baselines.
- Current Review contains the provisional composition-first transaction system.
  Its four transaction-family anchors, focused Vote Lock / Unlock candidate,
  and installed-Zapper calibration remain under human visual refinement. No
  transaction candidate is adopted or promoted.
- The complete transaction inventory and correctness boundaries live in
  [the transaction-system audit](transaction-system-audit.md). The repeated
  review failures and context gaps are documented in
  [the feedback postmortem](transaction-review-feedback-postmortem.md).

## Active frontier

### Human review: transaction-family compositions

The active review target is derived from
`src/views/internal/design-system/current-review.ts` and the
`transaction-action` catalog entry. Continue only through explicit human visual
feedback. Preserve current product mechanics and the installed package
boundary; do not infer production adoption, a universal transaction controller,
or sibling-flow redesign from the lab.

The next meaningful work after review is whichever bounded component,
composition, or product adoption the human explicitly selects. The catalog is
a capability map, not an obligation to rush through every unresolved item.

### Provisional transaction composition contract

The current Zapper and Vote Lock candidates consume one provisional geometry
recipe at
`src/components/design-system-v1/transaction-task-geometry.ts`. It standardizes
relationships that already have sufficient evidence without creating a
universal transaction controller or universal header:

```text
Substantial task surface: 432px
└─ structural shell edge: 8px
   ├─ compact task header: 8px internal → 16px total axis
   ├─ amount objects: 16px internal; pair owns the 4px seam
   ├─ submitted-content boundary: 0px intrinsic spacing
   ├─ facts region: parent owns boundaries; rows own 16px inset
   └─ action footer: no duplicate top inset
```

Composition ownership follows these rules:

- Padding belongs to the visible region whose inside edge it describes.
- Gap belongs to the parent that owns a relationship between sibling content.
- A divider belongs to the semantic boundary owner and contributes no spacing;
  adjacent regions own their inset.
- A child does not add outer margin to repair its relationship with an unknown
  neighbor. The composition parent owns that relationship.
- Stable controls remain mounted or reserve their geometry across loading and
  execution unless the meaning of that region genuinely changes.
- Current-baseline components retain their defaults. A more specific named
  recipe may own materially different composition geometry without silently
  changing the generic component.

Shared invariants, supported lifecycle variants, and flow-owned content remain
separate:

| Layer             | Examples                                                                                         | Owner                                                           |
| ----------------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| Shared invariant  | task width, shell/header axes, amount anatomy, asset identity, boundary and action relationships | provisional transaction recipe plus current-baseline components |
| Supported variant | immediate result, delayed initiation, opaque wait, staged execution, recovery                    | transaction-family composition under human review               |
| Flow-owned        | exact copy, approvals, acknowledgement, exchange rate, package behavior, result source           | current product source and owning feature                       |

The lab now exposes four direct Zapper / Vote Lock comparisons—editable,
submitted, immediate result, and delayed initiation—at the same review width.
They are comparison fixtures, not a new shared controller or authority source.
The paired pass confirmed interaction locking after submission, removed an
orphan empty-section margin, and aligned genuinely immediate outcomes on the
same finalized-value language. It also keeps the delayed-initiation semantic
gap visible: Unlock can share outcome geometry without claiming that its
pending RSR has already been received. Exact delayed-outcome copy remains
flow-owned and requires human review under `TX-P05`. Human review considers the
cross-flow alignment sufficiently solid to proceed to a separate Delegation
audit, while both compositions and their exploratory treatments remain open to
further visual feedback and are not promoted or adopted.

### Transaction composition pressure register

Record only deliberate pressure against a current baseline or strong retained
precedent. Ordinary conformance and straightforward implementation bugs do not
belong here. A row remains provisional until human review resolves it; it cannot
authorize another candidate through the anti-cascade rule.

| ID       | Pressure against existing owner/evidence                                                                                                               | Current treatment                                                                                                                                                                     | Revisit / disposition trigger                                                                                                                         |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `TX-P01` | Ordinary `DialogHeader` produces a 24px axis; dense Zapper/Vote Lock tasks need 16px                                                                   | Explicit compact transaction-header geometry is composition-owned; generic `DialogHeader` remains unchanged                                                                           | Reassess after Stake/Unstake; promote only if a stable third-family contract emerges                                                                  |
| `TX-P02` | Installed/earlier Zapper evidence used a 2px amount seam; human review preferred 4px                                                                   | `TransactionAmountPair` owns one provisional 4px relationship across current candidates                                                                                               | Reassess with Stake/Unstake and constrained states; keep, revise the recipe, or restore predecessor geometry                                          |
| `TX-P03` | Accepted Button sizes include padded actions; dense balance rows need a text-only Max action that does not change row height                           | `InlineAction` is a narrow provisional action role, not a new accepted Button tone or size                                                                                            | Validate across Zapper, Vote Lock, and another real compact row before catalog promotion                                                              |
| `TX-P04` | Ordinary dialogs use a neutral card surface; Zapper and immediate Vote Lock outcomes use an organic brand result region                                | Outcome treatment remains exploratory visual-composition evidence                                                                                                                     | Compare immediate, delayed, and staged outcomes before accepting, revising, or keeping it flow-local                                                  |
| `TX-P05` | Immediate outcomes can say assets were received; Unlock completion only begins a delay                                                                 | Preserve the shared outcome family while designing a truthful delayed-initiation variant with pending amount, timing, return location, and later action                               | Human review decides the visual treatment and exact product copy; do not reuse immediate-result semantics                                             |
| `TX-P06` | The production Index issuance host is 420px while the accepted substantial modal role is 432px                                                         | Lab task dialogs use 432px; the retained 420px inline host is a different product boundary, not a modal override                                                                      | Revisit only during explicit production adoption; do not resize the host from lab work                                                                |
| `TX-P07` | Ordinary dialogs are content-height driven, but a transaction outcome contracting below its immediately preceding task creates a disruptive transition | Vote Lock outcome currently reserves a 26rem minimum and lets the branded result region grow between its status header and finalized value; facts and footer retain intrinsic density | Compare Zapper and Stake/Unstake transitions; promote a stable outcome-frame relationship only if it generalizes, otherwise keep it composition-local |

For future designer feedback, first identify the relevant foundation/component
baseline and classify the change as conforming reuse, implementation misuse,
composition pressure, product mechanic, or possible local exception. Add or
update a pressure row only for the last three when the treatment departs from a
current owner. At resolution:

- update a foundation decision/catalog only when the foundation itself changes;
- update a component catalog and implementation when its reusable contract
  expands;
- update this named recipe when the relationship is transaction-family-wide;
- keep a documented local treatment when evidence does not generalize;
- or revert to the existing owner when the experiment does not justify drift.

Remove resolved rows from the active register after their durable disposition
is recorded in the accepted decision/log or owning product source. This keeps
the register an active reconciliation tool rather than another history file.

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

- **Transaction composition hardening:** make the shared Zapper/Vote Lock
  geometry, ownership, lifecycle-variant boundary, and deviation handling
  directly consumable; reconcile only already-determined invariants; blocked by:
  none.
- **Stake/Unstake proof run:** use the hardened contract with direct current-flow
  evidence to test fresh-worker reusability; blocked by: transaction composition
  hardening and explicit human selection.
- **Manual/automated mint expansion:** consume the proven family while retaining
  staged and workspace-specific mechanics; blocked by: the proof run and
  explicit human selection.

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
- [Transaction review feedback postmortem](transaction-review-feedback-postmortem.md)
- [Chronological project log](../wiki/log.md)
- [Stage ledger](../wiki/progress.md)

These sources preserve evidence. They are not a reason to load the complete
project chronology for an ordinary component task.
