# Vote Lock transaction-system V1

## Goal

Bring the existing Vote Lock and Unlock product flows into the Transaction
System lab as one coherent, review-ready V1 candidate that preserves current
mechanics, content, and state relationships while using the accepted design
system. Keep production UI and business logic unchanged.

## Current state

- The real product uses one three-mode Vote Lock drawer with quote-backed Lock
  and Unlock amount pairs plus Delegation.
- Lock may require an ERC-20 approval before the vote-lock deposit; it
  self-delegates when needed and acknowledges the configured unlock delay.
- Unlock redeems vote-lock shares, stops rewards when the delay begins, and
  creates a later withdrawal that is surfaced and claimed from Portfolio.
- The Transaction System lab now renders one focused Vote Lock / Unlock
  candidate with deterministic amount, approval, wallet, confirmation,
  immediate-result, delayed-initiation, cooldown, claimable, and withdrawn
  states. It preserves the later Portfolio withdrawal boundary.
- Vote Lock and the installed-Zapper study now share a provisional substantial
  task geometry and four direct comparison slices without promoting a universal
  transaction controller, header, outcome, or production migration.
- Human review considers the cross-flow alignment solid enough to continue,
  while visual details in both flows remain explicitly open to refinement.
- Delegation remains an unchanged sibling outside this candidate. Its automatic
  self-delegation relationship and separate explicit delegation action require
  direct-source audit before any lab composition is proposed.

## Non-goals

- Do not migrate or edit production Vote Lock, Portfolio, Zapper, SDK, on-chain
  math, calldata, analytics, or business behavior.
- Do not establish a universal transaction controller or promote an
  exploratory composition to accepted design authority.
- Do not redesign Delegation or invent new product copy.
- Do not create a new lab section or unrelated study.

## Acceptance evidence

- Direct-source trace covers the Vote Lock drawer, lock/unlock quotes and submit
  actions, governance entry context, and Portfolio pending-withdrawal action.
- The Transaction System detail page renders one coherent Vote Lock / Unlock
  candidate with realistic lock review, approval, confirmation, success,
  unlock review, confirmation, cooldown, claimable, and withdrawn states.
- The candidate preserves underlying↔share amounts, exchange rate, balances,
  configured delay, reward-stop consequence, approval sequencing, transaction
  identity, and later Portfolio withdrawal.
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
- Current checkpoint: synchronize the reviewed alignment, verification, and
  documentation before the separate Delegation audit.

## Unresolved decisions

- Human review will continue refining visual detail and concise explanatory
  content in both Zapper and Vote Lock. Direct evidence still does not justify
  a new mandatory introductory step: Lock already has governance entry context
  plus a required delay acknowledgement, and Unlock needs its
  delayed-withdrawal consequence adjacent to the amount and final durable state.
- A reusable cross-product delayed-outcome attachment is still provisional; the
  Vote Lock candidate should consume the existing lab-only pattern rather than
  promote a new component contract.
- Delegation must be audited from its current product implementation before
  deciding which task geometry, lifecycle, partial-success, and outcome
  relationships it can share with Vote Lock or Zapper.

## Plan self-review

Every acceptance criterion maps to a slice and named evidence. The strongest
case against the plan is that moving Vote Lock from a large Drawer to a regular
Dialog could erase useful explanation or imply production adoption. The plan
contains that risk by preserving all evidenced jobs in one lab-only composition,
keeping the delay consequence adjacent to the relevant action, and retaining
authority and adoption labels as exploratory / none.
