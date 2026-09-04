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
  Its four transaction-family anchors, focused Vote Lock / Unlock / Delegate
  candidate, installed-Zapper calibration, and production-backed automated
  issuance lifecycle remain under human visual refinement. Automated issuance
  now exposes its production-backed advanced-feature introduction and
  disconnected versus incompatible smart-account gates before configuration,
  followed by quote
  searching/cancellation/failure, both funding branches, per-order execution
  and scoped recovery, a separate collateral-ready boundary, final mint
  signing, and completion evidence. Mint and Redeem now consume one local
  composition tree: the production-backed Input → Collateral → terminal-output
  relationship remains in the left task column, while operation policy changes
  assets, order direction, actions, stage count, and outcome facts. Mint retains
  its separate final action; Redeem authorizes its final transaction before its
  collateral-sale orders fill. The right column owns only per-order evidence,
  and the generic transaction stepper remains reserved for flows whose steps are
  not already represented by substantial content. The cross-family mobile pass
  keeps compact tasks complete at 320px, wraps rather than truncates high-level
  stage meaning, and centers Automated issuance in a 640px-max single column
  until its existing `lg` equal-column layout begins. Its order evidence stays
  opt-in on narrow screens.
  No transaction candidate is adopted or promoted.
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
   ├─ amount objects: 16px internal; pair owns the 1px seam
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

#### Fresh-flow transfer contract

A fresh transaction-family task starts from direct product evidence, not from
the most visually complete lab specimen. Before composing UI, establish:

- the asset or position being changed and the authoritative amount source;
- whether the work is one transaction, approval plus one transaction, multiple
  independent transactions, an opaque order, or transparent staged execution;
- when the intended result becomes final, which exact record can be opened,
  and whether another action is required later;
- which failures preserve prior progress, what can be retried, and which input
  must remain editable;
- the current host/surface boundary and exact product copy. Copy is never
  inferred from a sibling flow.

The transaction composition and its presentation host are separate owners. A
flow may begin inline or on a page and continue in a dialog or drawer without
forking the structured task content or its state. The host owns overlay,
positioning, focus management, and dismissal; the composition owns its header,
amount relationship, facts, actions, progress, and outcome. The Stake/Unstake
lab mounts the complete lifecycle in a dialog for review, but its inner task
must remain usable as the same structured card in an inline host. This does not
require every production flow to begin in a modal or make dialog primitives
part of the reusable content.

Then assemble only the relationships whose jobs match:

| Region / relationship | Transfer by default                                                                                                                                                                                                                                        | Conditional or flow-owned boundary                                                                                                                                                                                               |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Task shell and header | 432px substantial-task role, 8px shell edge, 16px compact transaction axis                                                                                                                                                                                 | A 448px surface and the committed-mode capsule remain explicit flow-local pressure; ordinary dialogs retain `DialogHeader` and its 24px axis                                                                                     |
| Amount relationship   | `TransactionAmountObject` / `TransactionAmountPair`, restrained 8px regions, 16px internal inset, and 1px pair seam; editable two-way pairs use `TransactionAmountDirectionControl`, while committed one-way relationships use `TransactionAmountRelation` | Asset selector, balance action, precision, quote terminology, and whether direction remains editable follow the actual flow                                                                                                      |
| Facts and boundaries  | Parent-owned sibling gaps; divider owned by the semantic boundary and contributing no spacing                                                                                                                                                              | Show only facts needed to understand or verify this operation; route, rate, fees, delay, and acknowledgements remain product-owned                                                                                               |
| Action and progress   | A real Button for a required click; stable action placement; when another click will be required later, the action slot persists as subdued loading status while the current transaction processes                                                         | Progress may replace inactive action chrome when remaining steps continue automatically; approval disclosure, ordered rows, retry scope, and step count follow actual execution; the current stepper anatomy remains exploratory |
| Outcome               | Shared no-shrink minimum and distinct immediate-result, delayed-initiation, order-settlement, partial-success, and recovery truth                                                                                                                          | Amount/result source, record identity, later action, organic surface, wallet action, and attachments remain flow-owned or explicitly exploratory                                                                                 |

Do not transfer Zapper route-choice UI, Vote Lock's two-role Delegation anatomy, 448px flow
widths, attachment tone, prose emphasis, committed-mode motion, or stepper
presentation merely because they appear in the review. The Stake-family proof
consumes only matching relationships; only repeated matching evidence may
promote an exploratory treatment.

Transaction amount input/output regions now own restrained 8px geometry across
editable, read-only, submitted, and replacement states. A loading or animation
layer that replaces an output preserves that same boundary. This applies to the shared
transaction amount family only; ordinary Fields such as Delegation addresses
retain their accepted full-radius control geometry, while the asset selector
and status pills inside an amount region retain their own component-owned
radii. Empty editable amounts keep a `0` primary-value placeholder and a visible
zero-valued dependent estimate such as `$0.00`; flow formatting owns that value
rather than a generic component fallback.

The lab now exposes four direct Zapper / Vote Lock comparisons—editable,
submitted, immediate result, and delayed initiation. They are comparison
fixtures, not a new shared controller or authority source. Vote Lock is
currently testing a wider flow-owned surface under `TX-P09`; the Zapper review
now tests the same 448px width under `TX-P15` while pressure-testing compact
route comparison and supporting detail. Neither experiment revises the shared
432px transaction width.
The paired pass confirmed interaction locking after submission, removed an
orphan empty-section margin, and aligned genuinely immediate outcomes on the
same finalized-value language. It also keeps the delayed-initiation semantic
gap visible: Unlock can share outcome geometry without claiming that its
pending RSR has already been received. Exact delayed-outcome copy remains
flow-owned and requires human review under `TX-P05`. The subsequent direct-source
Delegation audit now keeps Delegate in the existing third-tab context, reuses
the compact task shell and canonical Field anatomy, and exposes normal-only,
normal-then-fast, completion, and partial-success recovery without treating
address editing as amount conversion. The Delegate information architecture
and all exploratory treatments remain open to human review and are not promoted
or adopted.

The active transaction review stops at the immediate lifecycle handoff.
Unlock and unstake outcomes must still communicate the initiated delay,
pending amount, timing, later action, and where that action will live. The
persistent Portfolio/staking lists that manage cooldown, claimable, cancel, and
withdrawal states remain page-owned product evidence and are deliberately not
rendered as transaction specimens. Review those surfaces later in their real
page context alongside the row and table system.
Its outcome pressure test now preserves the production `Delegation updated`
truth while representing one or two successful delegate changes. Result facts
and explorer links stay associated per changed relationship, and the branded
result region leads with the delegated voting power. A one-call result uses the
established secondary explorer + primary Done footer; a two-call result keeps
both explorer records in the detail list and leaves Done as the sole footer
action. Approval transactions are intentionally omitted, and the existing
Fast-failed state continues to own partial-success recovery.
Delegate addresses now consume the accepted opt-in integrated Copyable Value
treatment rather than composing a separate ghost icon button. The shared owner
keeps a 14px shortened value and 14px copy/check icon inside one 20px action
with an 8px gap, copies the full value, and preserves success feedback without
moving the row. Its default emphasis remains primary; data-led outcome rows may
opt into a neutral rest tone with primary hover/focus feedback. The outcome
composition still owns its role grouping, responsive column spacing, and
explorer-link association. A one-role outcome uses one horizontal role/address
row, while two-role outcomes retain their richer two-line association.
The Delegate candidate now also distinguishes current self-delegation from an
editable form. Each compact read-only role pairs its title and explanation with
a right-aligned `Delegated to you` and shortened address stack. The summary is
bottom-anchored so spare minimum-height space remains above it and the locked-balance
fact stays visually associated with `Change delegates`. Editing reveals the
canonical address inputs beneath the same headings. This avoids treating the
already-applied assignment as a disabled field without promoting a shared
view/edit form pattern.
Delegation execution now also hosts the first process-stepper
experiment. Once the sequence begins, ordered truth appears beneath the stable
task section while the state action remains in its existing slot. The current
unboxed rows are content-driven to 40px through 8px vertical padding; 24px
indicators and one continuous connector share the indicator-center axis. This
is review evidence, not a promoted transaction or general-purpose stepper
contract. The current step keeps its leading connector anchor static; the
canonical trailing lifecycle pill owns processing motion and status color.
Each row keeps the meaningful action label primary and attaches its compact
sequence position as muted fraction metadata (`· 1/2`) rather than presenting a
detached `Tx.` label; assistive copy expands that fraction to “transaction 1 of
2.” Fractions use tabular numerals, while the leading nodes communicate only
lifecycle—check, solid current dot, hollow upcoming dot, or failure X—without
repeating the position. Current and failed surfaces transition over the accepted
180ms component-motion duration and respect reduced-motion preferences.
Vote Lock and Stake now pressure-test the same process region across a
conditional approval-to-action sequence without exposing the full stepper
before work begins. When approval is required, the existing action slot adds
compact `Step 1 of 2` position text; once approval begins, the lower process
region reveals Approval and the intended transaction as ordered steps while a
subdued loading action preserves the slot because another click will still be
required. After approval, the same action slot advances to `Step 2 of 2`, while
the stepper distinguishes a ready user action from an actively processing
transaction. When allowance is
already sufficient, the ordinary Vote-lock action remains a single action with
no artificial step count. The lock-delay acknowledgement remains beside an
action that still requires it, with an 8px control-to-action relationship, and
leaves the composition once submission begins because its decision job is
complete. This is review evidence under `TX-P14`, not a promoted approval or
stepper contract.
Submitted states now also pressure-test a committed-mode header treatment under
`TX-P17`. Once the operation can no longer be changed, the non-actionable tabs
leave the control tree and their selected label remains in a neutral 32px
capsule with the 16px logo of the asset being acted on. While work is active,
that logo rotates once every 12 seconds; ready-action and partial-failure states
keep it static instead of falsely implying background progress. Reduced-motion
also keeps it static. The asset follows transaction meaning: Zapper Buy/Sell
uses the DTF being traded, Vote-lock uses the asset being locked, and Unlock or
Delegate uses the locked voting asset. Detailed phase and sequence truth remain
in the action or stepper; the header capsule owns only operation identity.
The same slot then becomes the established Completed or Unlocking outcome
status. Inoperable Zapper settings and refresh controls also leave the submitted
header rather than persisting as disabled chrome.
Zapper review advisories now use existing Button states to reflect their actual
transaction consequence. Capacity and route-unavailable conditions disable the
primary action while leaving inputs editable; an executable but degraded
market-hours quote uses the secondary `Buy anyway` / `Sell anyway` action; the
material high-price-impact state retains its explicit acknowledgement gate.
This is flow-owned qualification logic, not a new warning Button tone.
The approved attached-region geometry gives execution/recovery states a
non-layout 2px card-color frame without changing generic Dialog. A local
card-colored content wrapper preserves the established 8px inset and all
existing content axes, while the action footer owns an opaque
`substrate-subtle` process panel plus its own 8px internal inset. The panel
therefore reaches the frame on the left, right, and bottom instead of inheriting
a white outer gutter. Stepper anatomy and exact content remain exploratory.

### Transaction hardening disposition

This pass hardens retrieval and ownership, not every visible treatment. A
worker may consume only the rows below at the stated maturity; repeated lab use
does not promote an exploratory row.

| Classification                  | Consumable now                                                                                                                                                                                                                                                                                                                                                                         | Boundary                                                                                                                                                                        |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Accepted current baseline       | Canonical Button, Action Group, Field, Segmented Control, Lifecycle Status, Link, Copyable Value, Inline Message, identity, semantic foundations including opaque `substrate-subtle`, and restrained 8px transaction amount-region geometry                                                                                                                                            | Consume the named owner without changing its defaults. Acceptance does not imply production adoption.                                                                           |
| Provisional transaction recipe  | 432px substantial-task default, 8px shell edge, compact 16px total header axis, 4px amount-pair seam, submitted-content boundary, parent-owned sibling gaps, semantic-boundary divider ownership, stable action placement, no child outer-margin repairs, attached-region frame/substrate geometry, progress-replaces-inactive-action behavior, and a shared no-shrink outcome minimum | Directly consumable only inside the active transaction-family review. This is relationship geometry, not a universal shell, header, controller, outcome, or workflow component. |
| Supported lifecycle distinction | Immediate result, delayed initiation, opaque wait/order settlement, transparent staged execution, partial completion, and recovery                                                                                                                                                                                                                                                     | Share lifecycle truth and vocabulary where meaning matches; do not infer shared layout, action count, result source, or orchestration.                                          |
| Flow-owned composition          | Vote Lock's 448px address-heavy width, Zapper's exploratory 448px route-comparison width, Delegate view/edit anatomy and minimum height, exact acknowledgement/fact placement, Zapper package controls, exact copy, and product-specific requirements                                                                                                                                  | Preserve locally unless another direct-source family establishes the same job and relationship.                                                                                 |
| Exploratory pressure            | Process-stepper anatomy, committed-mode header capsule, immediate-result organic surface and its deeper attachment-state tone, bare advisory dismiss action, and outcome follow-ups that mount with the outcome in one attached substrate below the result at every canvas width                                                                                                       | Keep visible for review but do not route as authority or transfer into Stake/Unstake by default. Use the pressure register and remaining evidence boundaries below.             |

The reusable geometry source contains only relationships currently consumed by
the review compositions. Unused speculative fact-list and fact-row entries were
removed rather than retained as implied future contracts. The approved
hardening adds the opaque `substrate-subtle` semantic token and accepts Inline
Message's compact summary presentation. Generic Dialog defaults, production
transaction behavior, and product copy remain unchanged.

### Transaction composition pressure register

Record only deliberate pressure against a current baseline or strong retained
precedent. Ordinary conformance and straightforward implementation bugs do not
belong here. A row remains provisional until human review resolves it; it cannot
authorize another candidate through the anti-cascade rule.

| ID       | Pressure against existing owner/evidence                                                                                                                                                             | Current treatment                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Revisit / disposition trigger                                                                                                                                                                                                                                             |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `TX-P01` | Ordinary `DialogHeader` produces a 24px axis; dense Zapper/Vote Lock tasks need 16px                                                                                                                 | Explicit compact transaction-header geometry is composition-owned; generic `DialogHeader` remains unchanged. The direct-source Stake/Unstake proof now supplies a third family using the same compact axis without inheriting dialog-host ownership                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Human review decides whether the three-family evidence is stable enough for a narrow recipe owner; do not promote a universal transaction header from repetition alone                                                                                                    |
| `TX-P02` | Installed/earlier Zapper evidence used a 2px amount seam; later human review found both 4px and no seam visually wrong                                                                               | `TransactionAmountPair` owns one provisional 1px relationship across current candidates; the Stake/Unstake proof preserves that seam without a flow-local override                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Keep or revise the shared recipe from direct review evidence rather than restoring predecessor geometry by default                                                                                                                                                        |
| `TX-P03` | Accepted Button sizes include padded actions; dense balance rows need a text-only Max action that does not change row height                                                                         | `InlineAction` is a narrow provisional action role, not a new accepted Button tone or size                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Validate across Zapper, Vote Lock, and another real compact row before catalog promotion                                                                                                                                                                                  |
| `TX-P05` | Immediate outcomes can say assets were received; Unlock completion only begins a delay                                                                                                               | Preserve the shared stable outcome frame while delayed initiation uses pending amount, countdown timing, return location, and later-action truth without immediate-result organic motion. Direct-source Unstake now corroborates the same semantic distinction while keeping its own amount, reward-stop, and later-withdrawal facts                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Exact product copy remains product-owned; human review decides whether the corroborated information relationship is ready for a narrow delayed-initiation recipe                                                                                                          |
| `TX-P06` | The production Index issuance host is 420px while the accepted substantial modal role is 432px                                                                                                       | The retained 420px inline host is a different product boundary, not a modal override. Ordinary lab task geometry remains 432px; explicit 448px Vote Lock and Zapper experiments are separately tracked pressure rather than host precedent                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Revisit only during explicit production adoption; do not resize the host from lab work                                                                                                                                                                                    |
| `TX-P08` | Canonical `Field` applies one 8px relationship between all children; concise Delegation labels and their always-visible explanations looked disconnected at that distance                            | Delegate groups each label and description at 4px while retaining 8px from that group to the input; the focused-tool 8px control / 24px text axes otherwise follow the accepted foundation                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Reassess with another required field description before changing `Field`; keep local, add a supported field-heading anatomy, or return to the canonical 8px rhythm                                                                                                        |
| `TX-P09` | The accepted substantial transaction surface is 432px, but full 42-character delegation addresses overflow the ordinary 16px editable input                                                          | `AddressTextInput` keeps canonical field geometry while using a shared 14px mono address treatment in Vote Lock and Stake delegation. Vote Lock retains its separately reviewed flow-owned 448px surface; generic Dialog defaults stay at 432px                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Revisit the shared address treatment only if another correct-address task needs different readability or containment; do not generalize it to ordinary text inputs                                                                                                        |
| `TX-P10` | Two independent sequential Delegation transactions need visible current/upcoming/completed truth after execution starts, but a persistent pre-action stepper adds height and ceremony                | Delegate locally reveals compact ordered progress only after submission. Progress replaces inactive action chrome when no click is possible; a real Button returns for an actionable next transaction or scoped recovery. Leading nodes own lifecycle only, while labels retain muted fractional position metadata                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Pressure-test the semantic disclosure model in automated mint/deploy without transferring this row anatomy by default; keep local, revise the recipe, or promote only after another genuinely multi-transaction flow confirms the same structure                          |
| `TX-P12` | Delegation needs the current locked balance for context, but both the original leading fact row and the compact-header treatment made the task hierarchy feel structurally awkward                   | Delegate locally tests the familiar split fact-row anatomy after the address fields and before the action: lock/label on the left, rounded `12.8M RSR` on the right, with the exact fixture value (`12,843,771.62 RSR`) available to assistive technology and native hover. The field stack owns one 16px sibling gap; the row adds no divider, border, or independent outer spacing                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Judge whether this placement clarifies the form-to-action relationship without overloading the task; keep it flow-local until the information architecture is accepted                                                                                                    |
| `TX-P13` | Content-height dialogs make Delegate’s normal-only one-field state contract sharply below its two-field sibling, weakening continuity inside the same task mode                                      | Delegate task states locally reserve a 24rem minimum surface height. The single-field body fills the available region and bottom-aligns its field section, so the variable space remains between the compact header and the form instead of becoming field padding or changing the action inset                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Judge the single/two-field transition and smaller-screen containment; keep this task-local until another variable-length focused form establishes the same need                                                                                                           |
| `TX-P14` | A conditional approval followed by the intended transaction is genuinely multi-step, but always rendering the full future sequence adds avoidable height and overstates ordinary approval complexity | Vote Lock and Stake keep the pre-action stepper hidden and add compact `Step 1 of 2` metadata to the approval CTA. The lower process region appears only after approval starts and remains through the intended transaction. Because approval completion still requires another user click, the 44px action slot persists during approval as subdued `Approval in progress…` status, then advances to the primary `Step 2 of 2` action; the stepper separately distinguishes Processing from actionable / Ready. Flows with sufficient allowance retain an ordinary unnumbered action                                                                                                                                                                                                                                                       | Judge whether the now-repeated compact cue is sufficient before initiation and whether repeating the position in the revealed CTA and stepper is useful; do not transfer it to instant Zapper or automated mint without their own direct mechanics                        |
| `TX-P15` | The accepted substantial transaction surface is 432px, while the Zapper route-comparison trial pressures both task width and expanded-state density                                                  | The Zapper review locally tests the same 448px outer width as Vote Lock, keeps the canonical 8px shell edge, and currently renders three compact 44px fully rounded route choices as a vertical stack. This does not change package internals, the production 420px host, or the shared substantial-task default                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Human review decides whether route comparison justifies the wider Zapper family, whether the compact vertical list is the right choice anatomy, or whether 432px can be restored after further density work                                                               |
| `TX-P16` | Attachment outcomes place a primary follow-up action beneath a primary Done action and use the same blue intensity for atmosphere and actions, making the optional continuation easy to miss         | Zapper attachment states locally test a theme-aware Organic Brand `deep` tone: it resolves to the standard outcome surface and field intensity in light mode, while dark mode uses the deeper surface and calmer field intensity. Their no-shrink minimum belongs to the combined outcome-plus-attachment frame, allowing the main result card to use its natural height; standalone outcomes keep the minimum on the result surface itself. The composition omits redundant Done because the persistent close action already dismisses the modal; Schedule/Subscribe remains the one primary follow-up action, and the explorer action fills the outcome footer. Standalone outcomes retain the default surface and primary Done. The `brand-surface-deep` token and `deep` tone remain exploratory and must not be consumed elsewhere yet | Compare Updates and Intro call in light/dark themes; keep this attachment-only, generalize the theme-aware tone with more evidence, or remove it before any production adoption                                                                                           |
| `TX-P17` | Disabled mode tabs preserve geometry after submission but falsely remain controls, overemphasize unavailable alternatives, and do not connect the selected operation to the eventual outcome status  | Zapper, Vote Lock, and Stake/Unstake locally replace the segmented control with a 32px neutral committed-mode capsule once the operation cannot change. It retains the exact selected operation label plus a 16px primary-asset logo. The logo rotates once every 12 seconds only while work is active and remains static for ready-action, partial-failure, and reduced-motion states. Action and stepper regions continue to own phase and sequence. Zapper removes inoperable settings/refresh actions from the same submitted header. The header slot becomes the existing Completed, Unlocking, or Unstaking status at outcome                                                                                                                                                                                                         | Review the editable-to-committed-to-outcome transition across all three families, including directional asset identity and delayed initiation. Third-family evidence permits a promotion decision but does not make one automatically                                     |
| `TX-P18` | Longer transaction-supporting copy can hide the phrase that changes the user's interpretation or next action when every word has the same supporting weight                                          | Selected lab messages may emphasize at most one inline **decision anchor** per message block. Eligible anchors identify a binding limit, recovery timing or next action, automatic safety outcome, applicability qualifier, or concrete reason an alternate path helps. The anchor uses semantic `strong` with the accepted 500 weight and neutral foreground while surrounding copy remains supporting 300; primary blue stays reserved for links/actions and feedback color stays with the owning title or surface. Explanatory causes, marketing filler, and meaning already carried by the title or CTA remain unaccented. Exact product copy is unchanged                                                                                                                                                                              | Review the selected advisory, refund, eligibility, and attachment examples in both themes. Keep this transaction-local, revise the eligibility logic, or promote only after broader prose evidence; do not introduce a global typography/component default from this pass |
| `TX-P19` | One fixed shared outcome minimum cannot guarantee no shrink when preceding task height varies by flow and by conditional approval progress                                                           | Stake and Unstake keep the shared result anatomy but use local minimum floors derived from their tallest immediate predecessor: Stake preserves the approval-stepper height while Unstake preserves its one-transaction task height. Removed task content becomes flexible space inside the brand region rather than bottom whitespace. The shared 26rem baseline and other outcome families remain unchanged                                                                                                                                                                                                                                                                                                                                                                                                                               | Review both transitions and decide whether no-shrink should become a measured host responsibility, remain flow-owned floors, or gain a narrow recipe input; do not raise the shared fixed minimum from this example                                                       |
| `TX-P20` | The reviewed 24px Lifecycle Status geometry looks undersized when placed directly beside the canonical 28px micro action in dense automated-mint order metadata                                      | The lab globally trials one 28px intrinsic Lifecycle Status default rather than adding a local size variant. Indicator pills use 10px leading and 12px trailing inset; text-only pills use 12px on both sides; the 12px label, role semantics, tones, indicators, and motion contract remain unchanged. Automated-mint View order returns to the existing 28px micro secondary Button so the motivating adjacency can be judged directly                                                                                                                                                                                                                                                                                                                                                                                                    | Review state-sheet roles plus transaction orders, progress, requirements, and rich records in light, dark, and constrained widths. Accept the new shared geometry or revert globally; do not keep a special automated-mint status size                                    |

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

### Approved transaction disposition

Human review resolves the former questions as follows:

- attached progress and advisory regions share only frame, opaque
  `substrate-subtle`, and depth geometry; their semantic/content owners remain
  separate;
- a sequence that will require another user click preserves its action slot as
  subdued loading status; ordered progress replaces inactive action chrome only
  when remaining steps continue automatically, while a real Button remains for
  an actionable current step or recovery;
- the no-shrink minimum is shared outcome-frame geometry, the organic brand
  surface belongs to immediate results, and delayed initiation uses the stable
  shell with explicit pending/countdown treatment;
- Inline Message's compact summary, including its opt-in contained leading
  icon, is accepted with a strict supporting-only tooltip boundary;
- Vote Lock's 448px width and the 20px bare advisory dismiss remain local until
  another direct-source composition supplies the same need.

Stake/Unstake may consume the resolved relationships only where its direct
product structure supplies the same job. It must not manufacture evidence for
the remaining local treatments or inherit the current stepper anatomy merely
because it is visible in this lab.

### 2026-09-02 upstream transaction evidence reconciliation

Task contract for this reconciliation:

- **In scope:** inspect the installed Zapper boundary after the `master` merge,
  add lab coverage for materially different current behavior, and keep exact
  current-product copy distinguishable from design proposals;
- **Out of scope:** changing production Zapper behavior, restyling package
  internals, replacing accepted lab proposals, or treating the current release
  as permanent product authority;
- **Success:** current defaults, supported alternatives, recovery behavior, and
  proposals remain separately inspectable without a newer default erasing a
  still-valid state;
- **Validation:** focused transaction tests, catalog/type checks, and inspection
  of the actual mounted review surface.

The branch now includes current `master` and
`@reserve-protocol/react-zapper@2.10.5`. This updates product evidence without
changing the authority of the reviewed V1 work: generic upstream workflow and
design guidance remains subordinate to the project overrides, this plan, and
accepted V1 owners for this scope.

The current Zapper boundary differs from the earlier audit in five consequential
ways:

- Register keeps one mounted package element across wallet connection state so
  connection changes do not reset in-flight work;
- inline mode hides optional Buy/Sell tabs by default and uses the amount-pair
  direction control, while the lab's visible tabs remain an explicit design
  comparison rather than a current-product parity claim;
- all usable providers appear in the Details route list, the best route is
  selected automatically, and a user-selected route remains sticky until it is
  unavailable;
- background refresh preserves the current quote and action, while an exhausted
  quote round remains in sourcing/retry with editable input and disabled submit
  instead of becoming the lab's explicit availability-failure message;
- successful inline work opens a portalled package dialog with exact received
  output, used USD, transaction or order navigation, and eligible contact/call
  attachments.

These facts are requirements for later Zapper reconciliation, not permission to
copy package internals or silently undo reviewed proposals. In particular, the
lab's package-availability recovery specimen must not be cited as ordinary
no-route behavior, and its operation tabs must be evaluated as an intentional
departure. The upstream merge does not materially change Vote Lock,
Stake/Unstake, automated-mint orchestration, or the existing deferred
engineering-review boundaries.

Current `master` is versioned product evidence, not a destructive lab migration
instruction. Reconciliation is additive by default: introduce another state
when the current release supplies materially different behavior, and preserve a
semantically valid existing state even when it is not today's default. Replace
an existing state only when direct implementation evidence makes it impossible
or misleading, or when it is a true semantic duplicate. Lab controls and notes
must distinguish current product defaults, supported current alternatives,
recovery/edge cases, and design proposals; exact production copy and proposed
copy must not be silently merged.

The same preservation contract applies when this lab is eventually migrated
into product code. Lab coverage is deliberately incomplete: it reviews selected
component jobs and transaction states, not every screen or operational branch
in Register. Before migrating an area, inventory the visible production states,
actions, copy, relationships, and recovery paths from current source, then mark
each as a reviewed replacement, preserved behavior, or unresolved conflict.
Only the first category inherits a reviewed lab decision. The second keeps its
functionality and meaning while adopting compatible system foundations; the
third stops for an explicit decision. A missing lab specimen never authorizes
deletion, flattening, or an improvised simpler replacement. Post-migration proof
must reconcile against that production inventory as well as the lab contract.

### Deferred engineering-review register

Engineering review is deferred until the complete design-system project is
ready for its final handoff. It is not a stage-by-stage blocker during lab,
visual-composition, or documentation work. Every stage must still add a
specific row here when it changes a shared implementation contract, touches a
product correctness seam, or proposes production adoption. Record the owner
and reason now so project-closeout review does not depend on reconstructing the
history from the diff.

| Review surface                                                                                                                          | Why engineering review is required at project closeout                                                                                                    | Current boundary                                                                                     |
| --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Semantic `substrate-subtle` token and its CSS/Tailwind/semantic-role wiring                                                             | Adds an opaque shared surface role whose exact light/dark values and naming affect future consumers                                                       | Accepted for the V1 lab; no production migration                                                     |
| Exploratory `brand-surface-deep` token and Organic Brand `deep` tone                                                                    | Adds a shared theme alias and opt-in presentation whose extra depth currently applies only in dark mode and only attachment outcomes need it              | Lab pressure only; do not consume or migrate until human disposition                                 |
| Shared Link directional-icon spacing and Lifecycle Status intrinsic sizing defaults                                                     | Changes reusable component defaults outside a single transaction composition                                                                              | Verified in the lab; production adoption remains separate                                            |
| Copyable Value integrated action and Inline Message compact-summary/contained-icon contracts                                            | Adds reusable interaction/presentation variants, including copy feedback, tooltip eligibility, and an opt-in balanced icon treatment                      | Accepted V1 component contracts; production adoption remains separate                                |
| Restrained 8px transaction amount-region geometry, opt-in supporting-row reservation, and provisional transaction relationship geometry | Defines reusable input/output/replacement boundaries, stable responsive content height, and cross-flow spacing/divider ownership                          | Consumable only in the active transaction review; not a universal Dialog or workflow contract        |
| Stake delegation split versus the production `stakeAndDelegate` shortcut                                                                | Adopting the lab's distinct Delegate mode could remove or alter an existing combined contract call and changes the product interaction model              | Lab-only information architecture proposal; retain the live shortcut until explicit migration review |
| Transaction result, RPC, package callback, order/queue identity, approval, and partial-success seams                                    | Visual fixtures cannot prove the live source of truth or execution/recovery correctness                                                                   | Keep exact behavior product-owned; reconcile against direct implementation before adoption           |
| Automated issuance batch count, cancellation, executed amounts, recovery, and dormant outcome route                                     | The SDK owns call splitting and execution while the current UI reconciles quote, order, receipt, and balance sources without a persisted operation record | Lab may model named states only; source priority and reconstruction require product/SDK review       |
| Manual issuance address normalization, parallel/USDT approvals, zero-minimum Redeem leg, and result source                              | These boundaries can change balance validity, permission ordering, slippage protection, and the facts a consequential outcome may claim                   | Preserve production behavior in the lab; resolve before any production migration                     |
| Any production migration of the current transaction candidates                                                                          | Adoption may change real flow behavior, shared defaults, analytics, accessibility, and integration boundaries                                             | Requires separate explicit migration scope after human design review is complete                     |

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

- **Transaction composition hardening:** the shared Zapper/Vote Lock geometry,
  ownership, lifecycle-variant boundary, fresh-flow inputs, and transfer limits
  are directly consumable without promoting a universal shell. Remaining
  visual treatments stay explicitly flow-local or exploratory.
- **Stake/Unstake/Delegate proof run:** the review-ready lab proof uses current
  sources—the legacy page-entry → confirmation-modal flow and the newer Earn
  drawer plus the existing one-role delegate transaction. It mounts the
  complete lifecycle in a lab dialog while keeping its structured task content
  host-independent. Conditional Stake approval remains inside Stake, while
  changing the active voting delegate becomes a distinct third mode with one
  address and one transaction. One-transaction Unstake → 14-day delay → later
  withdrawal truth is preserved; persistent cooldown/withdrawal lists remain
  excluded. Production's combined `stakeAndDelegate` shortcut remains an
  explicit migration decision and must not be removed merely because the lab
  separates the tasks. Engineer review is required before that behavior is
  adopted. The proof corroborates several relationships while leaving its
  flow-specific outcome floors and any broader promotion to human review.
- **Manual/automated issuance expansion:** consume the proven family while
  retaining staged and workspace-specific mechanics. Automated Mint/Redeem
  starts with a narrow configuration task, then becomes a full-page two-column
  workspace rather than
  a Dialog composition. It must disclose its intrinsic multi-step nature before
  execution through its operation-specific stages; keep every collateral order's sell
  amount, buy amount, and lifecycle inspectable, including branches where
  existing wallet collateral changes the work required. On narrow screens the
  high-level stages lead and the order ledger is explicitly revealed on demand.
  Reuse accepted components, semantics, lifecycle language, and
  relationship geometry where their jobs match, but do not force this
  high-capital professional workflow into the simple Zapper/Vote Lock shell.
  The proof run must classify every mismatch as existing reuse, a supported
  variant need, flow-owned composition, exploratory pressure, or a product /
  engineer-review question; one example does not promote a new shared owner. It
  is now implemented as a lab-only shared composition and remains subject to
  human visual review plus the named engineer-review boundaries.

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
- [Transaction review feedback postmortem](transaction-review-feedback-postmortem.md)
- [Chronological project log](../wiki/log.md)
- [Stage ledger](../wiki/progress.md)

These sources preserve evidence. They are not a reason to load the complete
project chronology for an ordinary component task.
