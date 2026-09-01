# Vote Lock transaction-system V1

## Goal

Bring the existing Vote Lock, Unlock, and explicit Delegation product flows
into the Transaction System lab as one coherent, review-ready V1 candidate
that preserves current mechanics, content, and state relationships while using
the accepted design system. Keep production UI and business logic unchanged.

## Current state

- The real product uses one three-mode Vote Lock drawer with quote-backed Lock
  and Unlock amount pairs plus Delegation.
- Lock may require an ERC-20 approval before the vote-lock deposit; it
  self-delegates when needed and acknowledges the configured unlock delay.
- Unlock redeems vote-lock shares, stops rewards when the delay begins, and
  creates a later withdrawal that is surfaced and claimed from Portfolio.
- The Transaction System lab now renders one focused Vote Lock / Unlock /
  Delegate candidate with deterministic amount, approval, wallet,
  confirmation, immediate-result, delayed-initiation, address-editing,
  sequential-call, partial-success, and delegation completion states. It
  preserves the later Portfolio withdrawal boundary without rendering its
  persistent management rows as part of the transaction flow.
- Vote Lock and the installed-Zapper study now share a provisional substantial
  task geometry and four direct comparison slices without promoting a universal
  transaction controller, header, outcome, or production migration.
- Human review considers the cross-flow alignment solid enough to continue,
  while visual details in both flows remain explicitly open to refinement.
- The shared transaction recipe now owns the opaque attached-region substrate,
  frame/depth geometry, progress-replaces-inactive-action behavior, and
  no-shrink outcome minimum. Vote Lock still owns its 448px address-heavy width,
  Delegate form anatomy, and the current process-stepper presentation locally.
- Delegation has now been audited directly. It is the existing third tab in the
  same shell, is also reachable as governance remediation, and updates an
  existing position rather than converting an amount.
- Normal delegation is required and fast delegation is optional for optimistic
  governance. When both change, the current product sends two independent
  transactions sequentially; the first can succeed before the second fails.
- The lab now distinguishes an already-self-delegated default from editing.
  Each compact role pairs its title and explanation on the left with a stronger
  `Delegated to you` and shortened address stack on the right. Spare task height stays above
  this bottom-anchored summary so the locked-balance fact remains associated
  with `Change delegates`. Editing reveals canonical address inputs beneath the
  same headings without promoting this exploratory summary into a shared form
  pattern.
- The current product owns exact labels, explanatory content, validation,
  loading labels, and the `Delegation updated` toast. It does not preserve a
  durable partial-success record or consequential in-context result.

## Non-goals

- Do not migrate or edit production Vote Lock, Portfolio, Zapper, SDK, on-chain
  math, calldata, analytics, or business behavior.
- Do not establish a universal transaction controller or promote an
  exploratory composition to accepted design authority.
- Do not invent new product copy. The lab may standardize Delegation visually
  and make evidenced lifecycle truth inspectable, but larger changes to its
  product mechanics remain separate decisions.
- Do not create a new lab section or unrelated study.

## Acceptance evidence

- Direct-source trace covers the Vote Lock drawer, lock/unlock quotes and submit
  actions, governance entry context, and Portfolio pending-withdrawal action.
- The Transaction System detail page renders one coherent Vote Lock / Unlock /
  Delegate candidate with realistic lock review, approval, confirmation,
  success, unlock review, delayed initiation, delegation execution,
  partial-success, and completion states. Persistent cooldown, claimable, and
  withdrawn management rows are deferred to contextual Portfolio/table review.
- The candidate preserves underlying↔share amounts, exchange rate, balances,
  configured delay, reward-stop consequence, approval sequencing, transaction
  identity, and later Portfolio withdrawal.
- The same task shell renders Delegate as the real third mode without forcing
  amount-pair anatomy onto address editing. It preserves normal/fast delegate
  distinction, current locked context, validation, one-transaction and
  two-transaction execution, and the possibility of partial success.
- The candidate uses the canonical Dialog, Button, Segmented Control, amount,
  status, message, identity, and semantic layout recipes without changing
  shared defaults or tokens.
- Focused transaction-system tests, scoped type/lint checks, browser inspection
  at desktop and phone widths, wiki lint, and `git diff --check` are fresh and
  green after the final edit.

## Test seams

- `src/views/internal/design-system/tests/transaction-truth-spectrum.test.tsx`
  is the highest stable behavior seam for deterministic lab state controls and
  rendered product relationships.
- The routed design-system browser page is the visual seam for default, delayed,
  completion, and responsive modal states.

## Slices

- Completed slice: reconstructed the direct-source flow model and explanatory
  content placement.
- Completed slice: replaced the isolated Vote Unlock pressure specimen with a
  coherent Vote Lock / Unlock Transaction System composition and focused tests.
- Completed slice: aligned Current Review, typed catalog evidence, and
  supporting coverage without promoting authority.
- Completed checkpoint: synchronized the reviewed Zapper / Vote Lock alignment,
  verification, and documentation before the separate Delegation audit.
- Completed slice: added the direct-source Delegation audit and a lab-only
  third-tab composition with deterministic ready, one-call, sequential
  execution, completion, eligibility, and partial-success/recovery states.
- Completed slice: expanded the Delegation outcome into one-change and
  two-change fixtures. Each changed delegate remains a result fact and owns its
  corresponding explorer link; approval transactions stay outside the outcome,
  while the existing Fast-failed state remains the partial-success recovery.
- Current review: judge whether Delegate belongs coherently in the current
  three-mode task shell and whether its address-editing, sequential-call, and
  partial-success states feel like the same transaction family without being
  flattened into Lock / Unlock amount anatomy.
- Completed slice: reconciled the approved transaction hardening disposition.
  Active progress now replaces non-actionable Button chrome; delayed initiation
  keeps the shared stable outcome frame without immediate-result organic motion;
  and attached process/advisory regions consume the opaque subtle substrate.

## Delegation direct-source audit

### Preserve

- Delegate remains the third mode in the current Vote Lock shell and can be
  opened directly from governance when voting power is not delegated.
- Normal and fast governance keep separate delegate addresses. Normal is
  required; fast is only shown for optimistic governance and remains optional.
- Existing delegate values initialize from live vote-lock state. A missing
  normal delegate falls back to the connected wallet; touched values survive
  refresh synchronization while the drawer is open.
- Explicit delegation requires an existing vote-locked balance. First-lock
  self-delegation remains SDK-owned and does not become a separate user step;
  an existing third-party delegate is not silently replaced.
- Each changed delegate produces its own SDK-prepared contract call and receipt.
  If both change, normal runs before fast.

### Standardize visually

- Reuse the compact transaction header, substantial task width, shell edge,
  canonical Segmented Control, Field/TextInput, Button, typography, semantic
  status, and parent-owned facts/action geometry already exercised by Vote Lock
  and Zapper.
- Replace the legacy nested rounded panel and local input styling in the lab
  specimen with the accepted open task structure and canonical fields.
- Keep the action in the stable footer and keep address controls mounted but
  disabled during execution so the task does not jump between steps.

### Consolidate

- Share shell geometry, direct-wallet loading language, stable action placement,
  success presentation, and contextual recovery principles with the other
  transaction compositions.
- Do not consolidate Delegation into the amount-pair recipe: it edits governance
  relationships, not financial input/output.

### Deliberately improve in the lab

- Do not present already-applied self-delegation as a disabled form. Show the
  current role assignments first, then progressively disclose editing without
  replacing the surrounding task composition.
- Make the two-call sequence legible when both delegates change.
- Preserve the successful normal update if the fast update fails, and scope the
  retry to the remaining fast update rather than presenting the pair as atomic.
- Keep the completed result in context instead of relying only on a toast.
- Preserve one overall `Delegation updated` outcome while showing only the
  delegate relationships that actually changed and making the delegated voting
  power the branded result value. A one-call outcome keeps the established
  secondary explorer action in the footer and pairs its role with the copyable
  address on one horizontal row. A two-call outcome keeps each neutral-resting
  address, explorer action, and assigned amount grouped under its role while
  reserving primary blue for interaction and the final Done action.
  When both calls succeed, keep both transaction links in the same fact list as
  their Voting and Challenge relationships rather than crowding the footer or
  inventing one combined transaction identity.

### Do not touch yet

- Production state orchestration, SDK calls, transaction receipt handling,
  refresh behavior, proposal eligibility, analytics, and error copy.
- Whether Delegate remains the best long-term information architecture. The
  first review deliberately tests it in the current third-tab context.
- Promotion of a universal transaction form, transaction header, or multi-call
  controller based on these examples alone.

## Unresolved decisions

- The central hardening disposition is owned by
  `docs/plans/design-system-v1.md`. This flow consumes its accepted
  attached-region, progress/action, outcome-minimum, and compact-message
  relationships without independently promoting the compact header, 448px
  width, process-stepper anatomy, or bare dismiss treatment.
- Human review will continue refining visual detail and concise explanatory
  content in both Zapper and Vote Lock. Direct evidence still does not justify
  a new mandatory introductory step: Lock already has governance entry context
  plus a required delay acknowledgement, and Unlock needs its
  delayed-withdrawal consequence adjacent to the amount and final durable state.
- A reusable cross-product delayed-outcome attachment is still provisional; the
  Vote Lock candidate should consume the existing lab-only pattern rather than
  promote a new component contract.
- Human review must decide whether Delegate belongs comfortably in the shared
  shell once its distinct address-editing anatomy and two-call lifecycle are
  visible. The audit supports shared geometry and lifecycle language, not a
  universal flow controller.

## Plan self-review

Every acceptance criterion maps to a slice and named evidence. The strongest
case against the plan is that moving Vote Lock from a large Drawer to a regular
Dialog could erase useful explanation or imply production adoption. The plan
contains that risk by preserving all evidenced jobs in one lab-only composition,
keeping the delay consequence adjacent to the relevant action, and retaining
authority and adoption labels as exploratory / none.
