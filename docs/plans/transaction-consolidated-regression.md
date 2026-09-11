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

| Surface                                                                     | Retain at this checkpoint                                                                                                                    | What the checkpoint does not approve                                                                                                   |
| --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Zapper, Vote Lock/Unlock/Delegate, Stake/Unstake/Delegate                   | Current task, action/progress, recovery and outcome compositions; recorded local refinements and existing accepted component owners          | Package internals, production host/transaction changes, universal workflow/controller or automatic promotion of local treatments       |
| Automated Mint/Redeem                                                       | Shared operation-aware entry/workspace tree, left high-level stages, right optional order evidence, recovery and outcomes                    | New execution, cancellation, result-source or cross-session recovery policy; general-purpose order rows                                |
| Manual Mint/Redeem                                                          | Expanded 29-state lifecycle, three-section Mint and direct Redeem, required/held comparison, simulated permissions and conservative outcomes | Approval defaults/concurrency/USDT policy, actual receipt-derived amounts, a shared soft-blue Button variant or universal asset ledger |
| Governance/staking entry cards and other contextual launchers               | Keep as context for opening/dismissing the lab task                                                                                          | Final page-card design; visual approval of the launcher does not follow from task verification                                         |
| Standalone asset-selector pressure specimen                                 | Static, unreviewed reference; its search and confirmation are not wired                                                                      | A complete, accepted selector interaction; working selection inside Zapper is a separate use                                           |
| Portfolio/staking balances, cooldown, claimable, cancel and withdrawal rows | Existing production feature coverage and immediate transaction handoff requirements                                                          | Finished row/table design; review later in the real Portfolio/page context with the general row/table system                           |

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

## Retained transaction composition guidance

Moved from the default V1 plan on 2026-09-09 so unrelated component work does
not load transaction history. This section retains existing scoped contracts
and unresolved pressure, not new acceptance. “Review” below means an explicitly
resumed transaction review; no further transaction pass is scheduled. The
[checkpoint disposition](#checkpoint-disposition) owns the stop/resume boundary.
Canonical components and later [accepted decisions](../wiki/decisions.md) take
precedence over a provisional or older description here.

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
| Action and progress   | A real Button for a required click; stable action placement; when another click will be required later, the action slot persists as loading status retaining the initiated action's hierarchy while processing                                             | Progress may replace inactive action chrome when remaining steps continue automatically; approval disclosure, ordered rows, retry scope, and step count follow actual execution; the current stepper anatomy remains exploratory |
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
primary loading action preserves the slot because another click will still be
required. After approval, the same action slot advances to `Step 2 of 2`, while
the stepper distinguishes a ready user action from an actively processing
transaction. When allowance is
already sufficient, the ordinary Vote-lock action remains a single action with
no artificial step count. The lock-delay acknowledgement remains beside an
action that still requires it, with a 16px control-to-action relationship, and
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
| Provisional transaction recipe  | 432px substantial-task default, 8px shell edge, compact 16px total header axis, 1px amount-pair seam, submitted-content boundary, parent-owned sibling gaps, semantic-boundary divider ownership, stable action placement, no child outer-margin repairs, attached-region frame/substrate geometry, progress-replaces-inactive-action behavior, and a shared no-shrink outcome minimum | Directly consumable only inside the active transaction-family review. This is relationship geometry, not a universal shell, header, controller, outcome, or workflow component. |
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
| `TX-P14` | A conditional approval followed by the intended transaction is genuinely multi-step, but always rendering the full future sequence adds avoidable height and overstates ordinary approval complexity | Vote Lock and Stake keep the pre-action stepper hidden and add compact `Step 1 of 2` metadata to the approval CTA. The lower process region appears only after approval starts and remains through the intended transaction. Because approval completion still requires another user click, the 44px action slot persists during approval as primary `Approval in progress…` loading status, then advances to the primary `Step 2 of 2` action; the stepper separately distinguishes Processing from actionable / Ready. Flows with sufficient allowance retain an ordinary unnumbered action                                                                                                                                                                                                                                               | Judge whether the now-repeated compact cue is sufficient before initiation and whether repeating the position in the revealed CTA and stepper is useful; do not transfer it to instant Zapper or automated mint without their own direct mechanics                        |
| `TX-P15` | The accepted substantial transaction surface is 432px, while the Zapper route-comparison trial pressures both task width and expanded-state density                                                  | The Zapper review locally tests the same 448px outer width as Vote Lock, keeps the canonical 8px shell edge, and currently renders three compact 44px fully rounded route choices as a vertical stack. This does not change package internals, the production 420px host, or the shared substantial-task default                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Human review decides whether route comparison justifies the wider Zapper family, whether the compact vertical list is the right choice anatomy, or whether 432px can be restored after further density work                                                               |
| `TX-P16` | Attachment outcomes place a primary follow-up action beneath a primary Done action and use the same blue intensity for atmosphere and actions, making the optional continuation easy to miss         | Zapper attachment states locally test a theme-aware Organic Brand `deep` tone: it resolves to the standard outcome surface and field intensity in light mode, while dark mode uses the deeper surface and calmer field intensity. Their no-shrink minimum belongs to the combined outcome-plus-attachment frame, allowing the main result card to use its natural height; standalone outcomes keep the minimum on the result surface itself. The composition omits redundant Done because the persistent close action already dismisses the modal; Schedule/Subscribe remains the one primary follow-up action, and the explorer action fills the outcome footer. Standalone outcomes retain the default surface and primary Done. The `brand-surface-deep` token and `deep` tone remain exploratory and must not be consumed elsewhere yet | Compare Updates and Intro call in light/dark themes; keep this attachment-only, generalize the theme-aware tone with more evidence, or remove it before any production adoption                                                                                           |
| `TX-P17` | Disabled mode tabs preserve geometry after submission but falsely remain controls, overemphasize unavailable alternatives, and do not connect the selected operation to the eventual outcome status  | Zapper, Vote Lock, and Stake/Unstake locally replace the segmented control with a 32px neutral committed-mode capsule once the operation cannot change. It retains the exact selected operation label plus a 16px primary-asset logo. The logo rotates once every 12 seconds only while work is active and remains static for ready-action, partial-failure, and reduced-motion states. Action and stepper regions continue to own phase and sequence. Zapper removes inoperable settings/refresh actions from the same submitted header. The header slot becomes the existing Completed, Unlocking, or Unstaking status at outcome                                                                                                                                                                                                         | Review the editable-to-committed-to-outcome transition across all three families, including directional asset identity and delayed initiation. Third-family evidence permits a promotion decision but does not make one automatically                                     |
| `TX-P18` | Longer transaction-supporting copy can hide the phrase that changes the user's interpretation or next action when every word has the same supporting weight                                          | Selected lab messages may emphasize at most one inline **decision anchor** per message block. Eligible anchors identify a binding limit, recovery timing or next action, automatic safety outcome, applicability qualifier, or concrete reason an alternate path helps. The anchor uses semantic `strong` with the accepted 500 weight and neutral foreground while surrounding copy remains supporting 300; primary blue stays reserved for links/actions and feedback color stays with the owning title or surface. Explanatory causes, marketing filler, and meaning already carried by the title or CTA remain unaccented. Exact product copy is unchanged                                                                                                                                                                              | Review the selected advisory, refund, eligibility, and attachment examples in both themes. Keep this transaction-local, revise the eligibility logic, or promote only after broader prose evidence; do not introduce a global typography/component default from this pass |
| `TX-P19` | One fixed shared outcome minimum cannot guarantee no shrink when preceding task height varies by flow and by conditional approval progress                                                           | Stake and Unstake keep the shared result anatomy but use local minimum floors derived from their tallest immediate predecessor: Stake preserves the approval-stepper height while Unstake preserves its one-transaction task height. Removed task content becomes flexible space inside the brand region rather than bottom whitespace. The shared 26rem baseline and other outcome families remain unchanged                                                                                                                                                                                                                                                                                                                                                                                                                               | Review both transitions and decide whether no-shrink should become a measured host responsibility, remain flow-owned floors, or gain a narrow recipe input; do not raise the shared fixed minimum from this example                                                       |
| `TX-P20` | The reviewed 24px Lifecycle Status geometry looks undersized when placed directly beside the canonical 28px micro action in dense automated-mint order metadata                                      | The lab globally trials one 28px intrinsic Lifecycle Status default rather than adding a local size variant. Indicator pills use 10px leading and 12px trailing inset; text-only pills use 12px on both sides; the 12px label, role semantics, tones, indicators, and motion contract remain unchanged. Automated-mint View order returns to the existing 28px micro secondary Button so the motivating adjacency can be judged directly                                                                                                                                                                                                                                                                                                                                                                                                    | Review state-sheet roles plus transaction orders, progress, requirements, and rich records in light, dark, and constrained widths. Accept the new shared geometry or revert globally; do not keep a special automated-mint status size                                    |

| `TX-P21` | Outlined white secondary actions feel heavy on Manual's recessed asset ledger, while individual approvals need more visibility than quiet actions | Manual alone tests soft-blue Approve actions with primary-token fill/text and no outline, retaining the canonical 28px micro geometry, focus, and press behavior. Revoke uses neutral quiet; Approve All remains primary and Approved stays success. This is a local trial, not a shared Button variant or navigation-selection change | Before promotion, review light/dark interaction states and define the action role independently of selected-state styling. If accepted as a system variant, audit earlier Zapper, Vote Lock, Stake, Automated, and Manual lab actions for intentional adoption; do not mass-replace secondary buttons or assume every past choice still fits. Record retained and changed uses. |

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
  loading status retaining its initiated action tone; ordered progress replaces inactive action chrome only
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
