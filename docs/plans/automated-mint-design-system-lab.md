# Automated issuance design-system lab

## Goal

Audit the current Index DTF automated mint/redeem mechanics at fixed point
`c87d5ca113c9aea3daab7417af7699d6956a5101`, then make its core lifecycle
interactively reviewable in the Design System V1 lab without changing production
behavior, production UI, shared component defaults, or product copy.

## Current state

Paused at the [verified transaction checkpoint](transaction-consolidated-regression.md#checkpoint-disposition).
Retain the current human-directed flow design. Review notes below remain
resumption evidence, not a requirement for another broad review or permission
to migrate production. Contextual launchers and Portfolio rows are excluded.

- Historical starting point: the working tree was clean at the requested fixed point on branch
  `design-system-v1`.
- Production enters automated mint either through the issuance page's Auto panel
  or the lazy `/issuance/automated` route, then gates the flow on compliance,
  connection, route chain, and EIP-5792/Safe atomic batching support.
- Before amount configuration, production presents an advanced-feature
  introduction that recommends Swap, then a smart-account requirement when no
  wallet is connected or the connected wallet cannot atomically batch calls.
  The lab now renders those three entry states with the existing product copy
  and supported-wallet guidance while keeping all wallet effects simulated.
- `@reserve-protocol/async-zap-sdk@0.8.0` owns quoting, order submission,
  pre-signing, fill polling, retry, collateral readiness, and the final Folio
  call. Register owns presentation, input state, route reset, balance snapshots,
  and result reconciliation.
- Mint and Redeem now use one lab composition tree. The operation contract
  changes input/output assets, CoW order direction, stage count, action copy,
  terminal-action policy, and outcome facts; shared geometry and lifecycle
  regions are not duplicated.
- Redeem includes the production-supported held-collateral-only branch: zero
  DTF shares may still produce collateral-sale orders when eligible basket
  balances are selected, and zero-value order legs are omitted.
- CoW intents are submitted individually, but the wallet normally authorizes
  their required approvals and pre-sign calls together in one atomic batch.
  MetaMask may require sequential batches only when the combined call count
  exceeds its ten-call limit; the ordinary lab state must not imply one wallet
  signature per order.
- The starting staged specimen had four coarse states and omitted quote search,
  funding branches, directional order evidence, the explicit
  `collateral_ready` user-action boundary, and the SDK's retryable phases. The
  current lab replaces that specimen with the state map below.
- The accepted transaction system supplies canonical Button, Action Group,
  Inline Message, Lifecycle Status, identity, typography, semantic colors, and
  restrained 8px transaction amount regions. Automated order structure and progressive
  page-workspace layout remain flow-owned.
- At narrow widths the high-level task remains the default surface and orders
  stay behind the explicit disclosure. The one-column task is centered and
  capped at 640px until the existing `lg` equal-column workspace begins; phone
  supporting copy wraps instead of hiding stage meaning, and the order-detail
  heading stacks before dense rows.

## Non-goals

- No broad manual-issuance work or rethinking of the production automated-redeem mechanics.
- No production behavior, production UI, route, SDK, package, shared default, or
  global token change.
- No new universal transaction controller, stepper, order component, dialog
  interpretation, or speculative production adoption.
- No invented product copy, fabricated progress percentage, or claim that a
  quote/filled collateral order is the final mint result.
- No commit or push.

## Acceptance evidence

- Source-backed state/responsibility map covers entry and gates, configuration,
  quote lifecycle, funding branches, execution and wallet boundaries, per-order
  phases, recovery semantics, final mint, outcomes, responsive layout, and
  discrepancies.
- The lab can deterministically select initial configuration, quote searching,
  input-only ready, existing-collateral ready, active execution, recoverable
  partial failure, collateral-ready/final-mint-pending, and final success. It
  also exposes the production introduction, disconnected wallet requirement,
  and connected-but-incompatible wallet requirement before configuration.
- Mint and Redeem consume one shared composition tree and operation contract;
  operation-specific assets, order direction, actions, stage count, and outcome
  facts are data or narrow policy branches rather than duplicated layouts.
- Redeem accepts DTF shares, estimates quote-token output, preserves the
  existing-collateral conversion branch, presents collateral-to-USDC order
  direction, starts with `Prepare redeem`, completes without Mint's separate
  final-action boundary, and shows redeem transaction, CoW orders, and dust.
- Every swap row keeps quoted sell amount, estimated buy amount, direction,
  order lifecycle, and, once submitted, CoW identity associated at wide and
  constrained widths.
- A positive over-balance amount may reach quote discovery with its balance
  error preserved, while execution remains unavailable until funding is valid.
- Completed orders remain visible during failure, and recovery actions state the
  scope without implying that successful work repeats.
- Overall workflow progress is structurally separate from per-order status.
- Amount-dependent fixtures use bigint source values and display conversion only
  at the fixture presentation boundary.
- A classified reuse-gap register and engineer-review callouts are preserved in
  the narrowest existing durable owners.
- Focused tests, routed scoped checks, mounted-client review on this checkout,
  exact-state desktop/constrained screenshots, and light/dark checks for any new
  semantic color usage pass or are reported precisely.

## Test seams

- Focused Vitest rendering of the staged composition's public state selector and
  observable actions, labels, order associations, and responsive-safe structure.
- Existing transaction truth-spectrum tests for cross-composition contracts.
- `scope.mjs` routed checks for all touched files plus catalog/type checks.
- Mounted `/internal/design-system/components/transaction-action` review with a
  server started from this checkout on an unused port.

## Slices

- Slice: complete the production and SDK state/responsibility audit, reconcile
  guides and the old specimen, and define deterministic mint-only fixtures;
  blocked by: none.
- Slice: replace the provisional four-state staged specimen with the narrow
  configuration and expanded workspace lifecycle while retaining only supported
  reusable owners; blocked by: audit slice.
- Slice: add focused interaction/state tests and repair any regression at the
  rendered composition seam; blocked by: implementation slice.
- Slice: update the transaction audit, V1 plan/current review, coverage map, and
  progress evidence with the classified reuse-gap register and engineer-review
  boundary; blocked by: verified implementation.
- Slice: run routed closeout, independent Dark/Light review, mounted-client
  desktop/constrained and theme inspection, documentation housekeeping, and
  final reconciliation; blocked by: all prior slices.
- Slice: consolidate the accepted Mint candidate behind one operation-aware
  contract, then add the source-backed Redeem configuration, quote, execution,
  recovery, and outcome branches without duplicating the composition tree;
  blocked by: human review alignment pass.
- Slice: pressure-test both operations through ordinary input, existing
  collateral, recovery, completion, and operation switching, then update the
  audit and V1 frontier without promoting the lab to production authority;
  blocked by: redeem implementation slice.

## Unresolved decisions

- The SDK exposes fulfilled CoW executed amounts through `cowOrder`, but the
  production order row continues to display quote-leg amounts. Lab output will
  label quote values as estimates and keep receipt/order-exact claims out until
  engineer review confirms the intended result source.
- The SDK maps expired and cancelled CoW statuses to a retryable `failed` phase;
  the lab should preserve the underlying reason while using the canonical
  unsuccessful lifecycle role.
- Browser/session reconstruction after route leave is not supported by the
  current provider-local execution state; the lab must not imply cross-session
  resume.

These are bounded production constraints, not permission to redesign the
flow's mechanics. The current Register behavior and SDK contract remain the
baseline. Lab changes may improve hierarchy, component consistency, and
clearly misleading presentation, but must preserve the existing funding
policy, execution sequence, amount ownership, recovery limits, and result
sources unless a separate product or engineering decision explicitly changes
them.

## Experience decision

### User/caller usage

1. A user first sees that automated minting is advanced and can choose the
   recommended Swap path. Continuing exposes the existing smart-account gate;
   only a connected compatible wallet reaches USDC configuration and the real
   two downstream stages before execution.
2. A wallet with basket collateral enables the existing-balance option and sees
   the applied collateral tokens replace the single input-token identity beside
   the funding amount, while the right workspace stays focused on the smaller
   set of required CoW orders.
3. During execution, one order fills and another expires. The filled order and
   its identity remain visible; the failed order alone is recoverable. When all
   collateral is ready, the user must still explicitly mint before final success.

### Agent affordances

- Reviewers can select deterministic lifecycle states without triggering RPC,
  wallet, or CoW effects.
- The lab exposes the source role of amounts, current actionable boundary,
  preserved work, retry scope, and terminal evidence.
- Product use mode stays separate from design change mode: controls mutate only
  lab-local fixture state, and no shared or production owner is edited.

### Exploration admission

Use one candidate. The goal already fixes the consequential structure: narrow
configuration followed by a non-modal two-column page workspace. A dialog or
simple transaction-card candidate would violate the contract rather than offer
an honest alternative. The rejected alternative remains documented for review.

### Pre-registered rubric

- Mechanic truth: no state, amount, action, or completion label outruns the SDK
  and production evidence.
- Recovery truth: completed work remains visible and only retryable work appears
  actionable.
- Association: every order keeps direction, quoted sell/buy amounts, state, and
  identity together at every supported width.
- System fit: canonical owners keep their defaults and flow-specific structure
  remains local.
- Reviewability: the required states are directly selectable and visually stable
  with realistic data volume.

### Visible pressure case

A constrained-width existing-collateral recovery state must keep the applied
collateral-token stack in the funding amount, one fulfilled CoW order, and one
expired retryable order legible without detaching amounts or identities.

This case was present in the candidate-readable plan, so it is useful pressure
coverage but not held-out or independent evidence. A future candidate may only
claim a held-out result when the scenario remains in reviewer-only context until
after the candidate is complete.

### Strongest case against the plan

A large deterministic state matrix can become a second product implementation
and teach unsupported transitions. The mitigation is one typed fixture model,
no SDK orchestration in the lab, direct mapping to production/SDK states, and
tests that forbid broad state collapse or success-before-final-mint.

### Human gates

Human review may accept or revise the lab's hierarchy and composition without
reopening production mechanics. Production adoption of changed SDK
assumptions, result sources, Amount/bigint transaction math, cancellation
semantics, persistence, or shared defaults requires explicit product or
engineer review. Flow-owned specimens and presentation copy remain
provisional, but those gates do not block review of the lab-only composition.

## Corrective independent review

The first candidate passed its own focused suite but an independent mounted and
source review found gaps that the candidate-visible rubric did not exercise:

- arbitrary valid amounts had no bigint value, disabling the CTA and allowing
  later state presets to display one amount while calculating another;
- over-balance input was incorrectly blocked before quote discovery even though
  production preserves that preview path and blocks only execution;
- the lifecycle selector bypassed branch transitions, and recoverable failure
  forced existing collateral even for input-only funding;
- CoW order fixtures used 32-byte transaction hashes instead of 56-byte order
  UIDs;
- mixed funding presented the total as if all of it were USDC rather than a
  fiat total with separate USDC and existing-collateral sources;
- the terminal actions were incomplete, `View DTF` was inert, and outcome dust
  repeated the same fact twice.

The correction models lifecycle, funding mode, and input separately; routes
state-picker and in-flow transitions through one controlled boundary; parses
ordinary USDC decimals into bigint fixtures; uses domain-shaped CoW identities;
keeps terminal navigation singular; and keeps mixed funding semantically honest. The
regression suite now includes those pressure cases. Human visual review is
still required; these corrections do not promote the candidate or alter
production behavior.

### Why the first pass missed these failures

- The same task authored the specimen, chose its fixtures, wrote its tests, and
  declared its review result. The focused suite therefore proved the selected
  presets more thoroughly than it challenged the model behind them.
- The candidate-readable rubric and pressure case encouraged visible checklist
  coverage. They did not provide independent evidence, and the ordinary amount,
  state-transition, reset, over-balance preview, and identifier-shape cases
  stayed untested.
- Direct state-picker assignment made every screen individually renderable while
  bypassing the transition boundary used by the product-like controls. Visual
  state coverage consequently looked complete even though branch history was
  not preserved.
- Link presence and amount formatting were reviewed as presentation details.
  The checks did not assert that an enabled control navigated, that a CoW identity
  had UID shape, or that every displayed funding breakdown reconciled.
- Progress and audit documents recorded the task's own Dark/Light result before
  an independent reviewer challenged it, turning provisional self-report into a
  stronger-looking claim than the evidence supported.

### Fresh-task acceptance contract

Future state-rich lab work must keep candidate construction and acceptance
distinct. Before reporting review readiness, exercise one ordinary non-preset
value and every source-backed validation exception, preserve each independent
branch through recovery, reset terminal state, validate the domain shape and
destination of every enabled external action, and reconcile every displayed
subtotal with its labeled total. A candidate-visible scenario is useful
coverage, but only reviewer-hidden evidence can be called held out. Internal
Dark/Light review may report that it found no blocker; only human review can
accept the design direction.

### Workflow-change evaluation boundary

The observed pressure scenario is a state-rich lab whose candidate can read its
rubric and pressure case, owns editable input plus a lifecycle picker, and is
asked to certify itself. The expected behavior after the workflow changes is to
call that evidence visible coverage, keep input/mode/lifecycle independent, and
withhold acceptance until separate review exercises ordinary input, recovery,
reset, and enabled destinations. The counter-scenario is a static,
non-interactive specimen with no independent user dimensions or external
actions; it does not need the state-rich interaction matrix. A genuinely
reviewer-private rubric may still be called held out after it is applied by a
separate reviewer. Static checks validate the instruction text only; no
fresh-agent A/B harness was run, so behavioral confidence in the skill changes
remains unproven until the next fresh task exercises them.

## Human review alignment pass

The first composition overgeneralized the transaction-stepper precedent into a
global horizontal progress strip. Direct comparison with the production quote
summary showed that this weakened the automated-mint hierarchy: collateral
orders are evidence inside the acquisition stage, not an equal stage beside
Input and Mint.

The review candidate keeps the approved compact-to-wide transition and the
production-backed Input → collateral acquisition → Mint sequence without
adding a second lifecycle below the same content. Input remains fixed context;
the collateral section owns Step 1 state and action, while the output section
owns Step 2 state and action. The established amount, message, and Button
primitives remain unchanged. This changes the flow-owned composition, not the
production sequence or mechanics. High-level progress remains in the left
column, structurally separate from per-order status in the right column. The
left collateral stage owns the aggregate open-order expiry because it remains
visible when the order ledger is collapsed; the right header does not repeat
that countdown, and differing per-order expiries belong with their order rows.

The narrow configuration retains the production Mint/Redeem operation switch
as a compact contained control paired with an equally high secondary manual-
issuance route. The visual separation keeps manual issuance from reading as a
third peer mode while removing it from competition with the primary quote
action. Both operations lead into the same modeled lifecycle, while their assets,
order direction, stage count, actions, and outcome evidence remain explicit.
The active amount task has no redundant step numeral and uses the card surface;
its numbered future stages sit on the same recessed surface as the order
workspace, attached by the established 2px card frame.

The collateral workspace remains visible beside the task on desktop. At narrow
widths the high-level task and progress stay primary and the order ledger is opt-in via
`View orders`; individual orders are not squeezed into the default reading
path. Existing collateral shows its production-backed available/applied USD
value in the funding stage. When enabled, a canonical 24px token-logo stack
replaces the single USDC identity beside the total funding amount. The right
workspace omits duplicate wallet inventory and begins directly with
`Collateral swaps`, keeping that column exclusively about orders.

The expanded desktop workspace consumes the full content width of its beige lab
stage, uses the production-backed equal-width column split, and holds both
columns to one 736px review height, matching Manual's desktop review host.
Both use a 1200px maximum width; this is lab-host geometry, not a production
height requirement. Flexible space belongs after the Mint stage
instead of interrupting the collateral-to-Mint sequence, so each action remains
attached to the section it advances and unused height trails the complete
high-level journey. The right column keeps its header fixed and owns an
independently scrolling order ledger;
additional collateral orders must not increase the workspace height or make the
left task scroll. This follows production's equal-height column and internal
order-scroll behavior without transferring production's viewport-constrained
page shell into the lab.

The final state now uses the shared outcome hierarchy for status, received DTF
amount, supporting fiat value, transaction access, and next actions.
The footer owns the single final-transaction explorer link; no redundant
transaction-label/hash/copy row competes with the outcome details.
Completed CoW orders remain adjacent as flow-owned evidence because they are
material to reconciliation; approval transactions remain intentionally absent.
The outcome's brand region absorbs spare column height between status and
received amount; details remain content-sized. There is 24px between the fiat
row and the blue region's bottom edge. The footer pairs default-sized secondary
View transaction with primary View DTF at the 8px edge. Individual CoW order
links remain in the order ledger. A compact secondary New mint / New redeem
header action returns directly to empty configuration, preserving operation
and network while resetting completed funding choices and order inspection.
This is page navigation, not a promoted continuation CTA. Active collateral
and final-mint actions retain primary tone while loading, with busy/disabled
semantics; upcoming actions blocked by collateral stay neutral. Mint reuses
the Zapper bookmark beside its received DTF (simulated
feedback only); Redeem does not bookmark the DTF being redeemed. Funding,
unused amounts, swap impact, dust, and individual-order evidence remain intact.
Order-row styling and the embedded two-stage composition remain provisional and
require human visual review before migration.

The current hierarchy trial restores the production-backed boundaries between
funding, collateral acquisition, and Mint: a 2px `secondary` seam passes through
the center of a `secondary` ring with a card-colored arrow core. The adjacent
order workspace and its individual evidence rows use the existing
`recessedContent` surface role as one continuous field. These choices are local
to the automated-mint composition and do not change a shared component or
token.

Within this local hierarchy, the current stage's label and main amount/count
use primary blue; completed content stays normal foreground, and upcoming
labels are muted without fading financial values. `aria-current="step"`
tracks the same region. An editable over-balance input takes attention back
to funding; otherwise attention follows collateral work and then final Mint.
A small green check beside normal-foreground “Orders filled” confirms actual
fixture completion, not merely submission. No-swaps paths do not claim filled
orders, and transaction failure does not fall through to an “Orders filled”
sublabel. Arrows remain structural and section surfaces stay unchanged. These
are lab-local presentation choices, not new transaction or shared-default rules.

The collateral stage also retains the production risk summary. Before fills it
shows estimated swap impact beside maximum slippage; after every collateral
order fills it changes to quoted swap impact beside actual swap impact. The
two facts stack their labels above their values and align to opposite edges;
there is no vertical divider between them. The
explicit `swap` qualifier prevents these values from being read as the mint or
redeem conversion's impact. The lab values are
deterministic presentation fixtures, not new pricing logic or executed-amount
claims. Routine quoted and actual variance remains neutral even when displayed
with a minus sign. Once an actual is available, the quote becomes supporting
and struck through while the actual remains dominant. Escalation thresholds
remain flow-owned rather than being inferred from the sign or this fixture.

## Automated redeem extension

Redeem is an additive sibling of the reviewed Mint candidate, not a reversed
copy. Both operations share the entry gates, amount-region anatomy, compact to
two-column transition, equal-width workspace, order-row association, recovery
placement, and outcome hierarchy. The operation is an independent review
dimension and must survive state selection, recovery, and reset.

Production establishes the differences the lab must keep explicit: Redeem is
funded with DTF shares and receives the quote token; its CoW legs sell redeemed
collateral into that token; `useExistingBalances` may include held basket assets
and can make a zero-share conversion valid; `Prepare redeem` starts the batch;
and there is no later user-triggered Mint action after orders fill. The left
column therefore retains Input → collateral sale → expected output as one
shared structural sequence, while its action policy and stage metadata differ
from Mint. A collateral-only input explicitly says that basket assets are used
and no CMC20 will be redeemed rather than presenting the zero-share branch as an
empty or invalid amount. The outcome identifies the redeem transaction, received quote token,
redeemed shares, completed orders, and any leftover dust.

The strongest implementation risk is a nominally shared component with two
forked JSX trees hidden behind an operation conditional. Acceptance requires
one mounted task/workspace/outcome tree whose operation-specific differences
are expressed at the smallest truthful seams. The strongest product risk is
inventing a simpler lifecycle than the SDK supports; production behavior and
the installed SDK remain authoritative, and exact executed amount sourcing,
batch identity, and zero-share conversion remain engineer-review surfaces.
