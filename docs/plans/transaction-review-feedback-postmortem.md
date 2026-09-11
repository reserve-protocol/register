# Transaction review feedback postmortem

**Status:** diagnostic report; not design-system authority

**Scope:** direct human corrections from the first action-to-outcome truth-spectrum board through the latest transaction quote-detail and asset-selector passes. Earlier unrelated component and navigation reviews are outside this report.

**Authority remains:** `docs/plans/design-system-v1.md` and `docs/wiki/domains/design-system.md`. This report explains why the transaction review repeatedly failed to consume that authority correctly and where the authority itself is still incomplete.

## Executive conclusion

The transaction work failed in four materially different ways, and treating all
of them as “the design system was not defined enough” would be inaccurate.

1. **Existing rules were violated.** Most repeated spacing, divider, inset,
   alignment, typography-role, surface, and component-owner problems already
   had an answer. They should have been caught before human review.
2. **Product evidence was not consulted or preserved.** Buy/Sell, close,
   quote-search behavior, real flow boundaries, and transaction language cannot
   be inferred from tokens. They required direct inspection of current product
   sources and the strongest predecessor work.
3. **Some composition rules were genuinely weak or missing.** The system had
   foundations and components but lacked a sufficiently consumable transaction
   composition contract for dense task shells, paired amounts, task headers,
   asynchronous geometry stability, and selector rows.
4. **Some choices remain legitimate design judgment.** A system can constrain
   chevron size, spacing, contrast, and interaction state without deciding that
   every chevron must have a circle or that every outcome must use one exact
   arrangement.

The spacing/divider concern is the clearest failure. The accepted foundation
already says:

- one owner controls each visible gap;
- a divider belongs to one boundary and supplies no spacing itself;
- adjacent regions use matching semantic insets unless an intentional
  hierarchy difference is under review;
- a bordered region leading to an action owns its symmetric inset, while the
  attached footer adds no second top gap.

The repeated defects therefore were not caused by missing spacing tokens. They
were caused by composing margins, parent gaps, and child padding without first
assigning one owner to each relationship, then reviewing screenshots without a
geometry-owner audit. That is an implementation and review-process failure.

## Classification rubric

| Code  | Class                          | Can the design system answer it? | Expected handling                                                                                 |
| ----- | ------------------------------ | -------------------------------- | ------------------------------------------------------------------------------------------------- |
| **E** | Existing-rule violation        | Yes                              | Correct before human review; add enforcement where recurrence proves prose is insufficient.       |
| **M** | Missing or unclear system rule | Partly                           | Gather repeated evidence, then clarify a recipe or role without over-generalizing.                |
| **P** | Product-evidence dependency    | No, not alone                    | Inspect current implementation, behavior tests, requirements, and strongest predecessor evidence. |
| **J** | Legitimate design judgment     | Not completely                   | Present a small number of system-compliant options for human judgment.                            |
| **R** | Review/process failure         | Not a visual token issue         | Improve evidence routing, state coverage, geometry audit, or visual QA.                           |

Multiple codes mean the visible problem had more than one cause.

Across the 41 correction clusters below, the tags overlap: 25 involved a
review/process failure, 18 involved a violation of an already accepted rule, 15
exposed a missing or insufficiently consumable rule, 15 depended on product
evidence, and 8 contained a legitimate visual judgment. This means the largest
opportunity is not inventing more design tokens. It is consuming existing
authority correctly and reviewing the rendered composition at the right level.

## Detailed correction ledger

### Review framing and evidence use

| ID  | Human correction                                                                                                                                 | Class         | Assessment                                                                                                                                                |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Isolated lifecycle specimens could not be judged without the transaction context around them.                                                    | **M + R**     | Foundations cannot prove composition quality in isolation. The review contract should have required compact realistic flow slices from the start.         |
| 2   | Static summary rows around the specimens still did not show input, output, hierarchy, actions, progress, recovery, and outcome working together. | **M + R**     | The second presentation was technically richer but still used the wrong review unit. A complete bounded composition, not an anatomy sheet, was required.  |
| 3   | Individually valid components still produced generic or administrative-looking transaction UI.                                                   | **M + J + R** | Canonical components are necessary but not sufficient. The missing test was composition-level hierarchy, financial focus, density, and product character. |
| 4   | The new flows drifted from how the actual current product flows are structured.                                                                  | **P + R**     | The audit was treated as a substitute for the render trees. Direct product inspection should have preceded synthesis.                                     |
| 5   | Strong earlier Zapper work was initially characterized as behavior evidence rather than discoverable visual-composition evidence.                | **P + R**     | The evidence router was incomplete. Strong predecessors must be compared explicitly without becoming authority.                                           |
| 6   | Repeated requests to “find more mistakes” still uncovered obvious defects.                                                                       | **R**         | Self-review was too local and edit-oriented. It did not re-run a whole-board visual critique after each material composition pass.                        |

### Product structure, language, and information hierarchy

| ID  | Human correction                                                                                                                                               | Class         | Assessment                                                                                                                                                                                                                         |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 7   | Zapper lost its close control and Buy/Sell tabs.                                                                                                               | **P + R**     | This was unsupported invention during synthesis. The current flow and predecessor both made the controls discoverable.                                                                                                             |
| 8   | The established quote-finding animation/state disappeared and was not directly inspectable in the lab.                                                         | **P + R**     | A materially important product state was omitted from the review coverage. The design system cannot invent or remove this behavior.                                                                                                |
| 9   | “Signing creates an order” and “Sign order” were not clearly grounded in the real product step.                                                                | **P**         | Signature, submission, order creation, fill, and completion are product/lifecycle truths. Copy must follow the actual transition rather than explain an audit concept.                                                             |
| 10  | “Final after order fill” was invented and “Estimated output” was the truthful pre-completion label.                                                            | **P + M**     | The exact label is product truth; the cross-flow rule is that estimated, filled, confirmed, and final values must not be conflated.                                                                                                |
| 11  | Similar input/output concepts used unnecessarily different labels across flows.                                                                                | **P + M**     | Shared semantic jobs should share vocabulary; differences require a real difference in meaning or lifecycle truth.                                                                                                                 |
| 12  | Unstake repeated cooldown information three times.                                                                                                             | **E + P**     | Concise hierarchy and non-duplicative supporting copy were already expected. Product evidence determines where cooldown truth belongs.                                                                                             |
| 13  | “Unstake 250 stRSR” was an inappropriate modal title.                                                                                                          | **P + M**     | The amount already had a financial owner in the body. A task title should name the job unless including a value materially disambiguates it.                                                                                       |
| 14  | “Rate-derived · a separate withdrawal is required” was confusing; the primary action needed to communicate starting cooldown.                                  | **P + J**     | The design system can require action-truth and concise support, but current protocol behavior determines the exact message.                                                                                                        |
| 15  | Unstake, Unlock voting power, and Select an input asset used large titles or subtitles below the close row that added bulk without helping the decision.       | **M + J**     | Repetition shows a useful rule: routine task states use a concise same-row title and close action; extended explanatory copy is reserved for intro, outcome, recovery, or decision-critical context.                               |
| 16  | Long explanatory sentences were placed inside field-label positions.                                                                                           | **E + M**     | A label names the control; supporting or consequence copy belongs to a separate supporting/message role. This should be an explicit field-content boundary.                                                                        |
| 17  | Automated-mint future steps lacked enough containment to read as a coherent staged relationship, and the “Review” step name did not clearly describe the task. | **P + J + M** | Foundations constrained surface and spacing but did not determine the exact staged composition; product mechanics must determine the step name. Repeated use may justify a staged-plan recipe, not a universal progress component. |
| 18  | Generic outcome layouts placed an icon beside a large block of text and looked poor across multiple families.                                                  | **M + J**     | Premature reuse created similarity without evidence. Consequential outcomes should lead with result identity/value; side-icon templates should not be the default for multi-line result blocks.                                    |

### Geometry, spacing, dividers, and responsive behavior

| ID  | Human correction                                                                                                                   | Class         | Assessment                                                                                                                                                                                                                                 |
| --- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 19  | Dense transaction tasks repeatedly inherited ordinary 24px Dialog inset.                                                           | **E + M + R** | The 8px focused-tool shell mode already existed, but its transaction applicability was not routed clearly enough. This should have been caught before rendering.                                                                           |
| 20  | Selector horizontal inset did not visually match its vertical inset.                                                               | **E**         | Symmetric atomic-control geometry was already an accepted rule.                                                                                                                                                                            |
| 21  | Unstake facts, dividers, and the action used incoherent insets and spacing.                                                        | **E + R**     | The parent, children, and footer all contributed pieces of one visible relationship. One explicit region owner would have prevented it.                                                                                                    |
| 22  | Spacing above and below dividers repeatedly failed to match.                                                                       | **E + R**     | This directly violated the divider rule. The audit should compare both sides of every divider, not only token values in isolation.                                                                                                         |
| 23  | A large white gap lacked the boundary divider that its composition required.                                                       | **J + R**     | The system does not require a divider in every gap, but once two attached regions need a visible boundary, the boundary must be deliberately owned and inspected.                                                                          |
| 24  | The facts-to-button gap did not match the divider-to-facts gap.                                                                    | **E + R**     | The accepted compact-task relationships are both 16px. The mismatch was mechanically catchable.                                                                                                                                            |
| 25  | The element containing a divider had a top margin.                                                                                 | **E**         | A divider must not create or own whitespace. The adjacent region owns the inset.                                                                                                                                                           |
| 26  | The details trigger owned a divider that semantically belonged to the output boundary, so it remained visible during quote search. | **E + M**     | Boundary ownership was assigned to the convenient component rather than the relationship. The rule existed; the transition exposed why semantic ownership matters.                                                                         |
| 27  | One Zapper state overflowed its modal, clipped content, and placed the action outside the shell.                                   | **E + R**     | This is a basic responsive/containment failure. A real rendered surface check at the supported width should always catch it.                                                                                                               |
| 28  | The input/output direction control was partially covered by the quote-search output.                                               | **E + R**     | Stacking and overlap belong to basic visual QA. Neither a new component nor a new token was needed.                                                                                                                                        |
| 29  | Automated-mint step numbers were not centered against their corresponding rows.                                                    | **E + R**     | This was an alignment implementation bug visible in the default state.                                                                                                                                                                     |
| 30  | The unstake title was not aligned with the modal header action.                                                                    | **E + R**     | The accepted header owner already establishes the title/action row.                                                                                                                                                                        |
| 31  | Review-to-quote-search caused the whole Zapper UI to jump as controls disappeared or changed height.                               | **P + M + R** | Current product evidence established the important transition. The reusable rule is geometry stability: keep persistent controls mounted and disabled, skeletonize uncertain details, and transform only the region whose meaning changes. |
| 32  | Repeated local spacing fixes failed because margins, stack gaps, and child padding were mixed.                                     | **E + R**     | This is the central postmortem finding. The failure was ownership, not an inadequate spacing scale.                                                                                                                                        |

### Asset selection and identity

| ID  | Human correction                                                                                                                                      | Class         | Assessment                                                                                                                                                                                                                                     |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 33  | The Max action and input-token selector were visibly broken or poorly composed.                                                                       | **E + R**     | Existing Button, identity, and focused-tool geometry should have constrained these controls. Their rendered states were not reviewed carefully enough.                                                                                         |
| 34  | Input and output token labels used different sizes; one token mark was circular and the other square; chain identity was missing.                     | **E + P**     | Paired financial roles require equivalent visual treatment. Product evidence determines the assets/chains; accepted identity owners determine marks and type roles.                                                                            |
| 35  | A 24px logo was paired with a 14px token name solely because the logo was 24px, producing text that looked too small.                                 | **M + R**     | Logo size does not select typography. Identity density and semantic role do. This boundary was implicit and is now made explicit.                                                                                                              |
| 36  | The selector chevron looked unresolved without a neutral or outlined container.                                                                       | **J**         | The system constrains icon size, target, inset, and states but does not prove that every selector needs a framed chevron. This remains contextual judgment unless repeated evidence converges.                                                 |
| 37  | Asset rows mixed awkward primary/supporting sizes, excessive line separation, misplaced selected checks, blank trailing slots, and misaligned insets. | **E + M + R** | Typography, row spacing, and selected-surface roles already existed. The missing explicit selector-row contract allowed a checkmark convention and text stack to be invented. The corrected candidate now defines the needed boundary.         |
| 38  | A question-mark icon before “Fees included” looked like a help-tooltip trigger even though it exposed no help.                                        | **E + R**     | The existing HelpTooltip owner gives that symbol an interaction meaning. The quote-details row already has a chevron disclosure signal, so the decorative question mark created a false affordance and should have been removed before review. |
| 39  | The Zapper output USD row omitted the signed delta between input and estimated output that the current product shows.                                 | **P + R**     | The amount and estimate were present, but the economically meaningful comparison was lost during reconstruction. Direct product inspection should have caught and preserved this existing quote relationship before review.                    |
| 40  | The quote-search example described an animated output transformation but showed only a reconstructed still treatment.                                 | **P + R**     | Motion is part of the current product evidence for this unusually long opaque operation. The review needed to route the real animated artwork rather than approximate only its surrounding copy and timer.                                     |
| 41  | The predecessor's 2px input/output seam felt too tight, so the provisional shared amount-pair candidate moved to 4px.                                 | **J**         | Both values follow the spacing scale and preserve the same relationship. Current product evidence establishes 2px, but the preferred visual separation is a legitimate human-review choice rather than a mechanically provable rule violation. |

## What was already defined and should have been caught

These failures do **not** justify adding more variants or exceptions:

- spacing values and semantic relationship sizes;
- one owner per visible gap;
- divider ownership and zero intrinsic spacing;
- symmetric padding for atomic row/control shapes;
- accepted Dialog/Drawer header alignment;
- semantic surfaces rather than ad hoc colors;
- default versus compact typography roles;
- canonical entity and chain-badge owners;
- canonical buttons instead of locally styled pseudo-buttons;
- responsive containment, no clipping, and no action escaping its shell;
- light/dark role equivalence;
- preserving accessible control state while visually indicating selection.

The correction is stronger consumption and audit discipline, not more prose for
every instance.

## What should be specified more clearly

The repeated feedback does justify a small set of clearer, consumable contracts.
They should begin as documented composition recipes and regression tests, not
automatically as new React components.

### 1. Compact transaction task geometry

The existing spacing decision should be represented as one named geometry map:

```text
Task surface
└─ 8px structural shell edge
   ├─ dense input/output region: owns its 16px internal inset
   ├─ semantic boundary divider: owns 0px spacing
   ├─ facts region: owns 16px boundary inset and 8px fact-row gap
   └─ primary action relationship: owned once at 16px; no child top margin
```

Every visible gap must identify one owner. A review should fail if the same gap
is assembled from parent `gap`, child margin, and footer padding.

### 2. Transaction amount pair

Define the repeated input/output composition without creating a universal
transaction flow:

- input and output labels use the same role unless their meanings differ;
- equivalent asset identity uses equivalent mark shape, size tier, and chain
  context;
- interactive input and estimated/read-only output remain visually paired;
- the direction control has a stable layer and alignment slot;
- balance, Max, fiat value, and estimate occupy named supporting roles;
- estimated, filled, confirmed, and final labels reflect lifecycle truth.

### 3. Asset-selection row

The candidate now has enough evidence for a precise provisional contract:

- popup outer inset: 8px;
- rich-row inset: symmetric 12px;
- row rhythm: 4px between row shapes;
- default identity: 16px/24px primary over 14px/20px support;
- compact transaction-selector identity: 14px/16px primary and support when
  both are forced single-line metadata, without a separate vertical margin;
- trailing balance is a direct aligned column and includes its asset symbol;
- single selection uses selected surface plus semantics, not a checkmark column
  that reserves blank space on every unselected row;
- checkboxes/checkmarks remain appropriate when multi-selection itself is the
  row's explicit job.

### 4. Routine task header and copy density

Clarify that routine input/review states use one concise title on the same row
as the close action. Supporting copy appears only when it changes the decision,
explains a consequence, or communicates recovery. Intro and outcome states may
carry more explanatory hierarchy. Field labels name fields; they do not carry
paragraphs of consequence copy.

### 5. Asynchronous geometry stability

When a state transition preserves the same task:

- persistent controls remain mounted;
- temporarily unavailable controls disable in place;
- uncertain values use dimensionally stable skeletons;
- only the region whose meaning genuinely changes transforms;
- semantic boundary owners determine which dividers remain visible.

This is broader than Zapper, but it should not dictate the animation or progress
detail of every transaction family.

### 6. Consequential outcome composition

Do not define one universal outcome component yet. Do define constraints:

- lead with the consequential result, value, or changed position;
- keep transaction/order identity and remaining work available;
- do not use a decorative side icon as the default anchor for a large block of
  result prose;
- preserve family-specific evidence and action needs;
- extract shared layout only after independent outcomes converge.

## What should remain product- or context-owned

The following cannot be solved safely by adding design-system rules:

- whether a flow has Buy/Sell, settings, refresh, or close controls;
- whether signing creates an order, submits a transaction, or authorizes a later
  action;
- exact cooldown, fill, claim, refund, retry, and cancellation semantics;
- exact Zapper quote-search animation and package behavior;
- which information is available from receipts, RPC, orders, or local state;
- whether an exact composition needs a divider when spacing or surface contrast
  may already establish the boundary;
- whether a particular selector chevron is framed;
- exact outcome copy, next action, and data volume;
- exact flow sequencing and shell transitions.

These require direct product evidence and, where the behavior is consequential,
engineer review.

## Root causes

### 1. Canonical-first was applied at component level, not composition level

The work often asked whether a valid Button, Metric, Dialog, or identity owner
was present, but not whether the complete flow had a coherent focus, density,
axis, and information hierarchy. Valid parts were treated as proof of a valid
whole.

### 2. The audit became visible UI

Lifecycle concepts and audit explanations were converted into labels,
subtitles, status blocks, and generic outcomes. Requirements should constrain
the interface; they are not automatically interface copy.

### 3. Product-source inspection happened too late

The transaction audit correctly mapped families, but it could not preserve
render-tree relationships by itself. Close, Buy/Sell, quote search, automated
workspace transitions, and durable queue boundaries were lost or rearranged.

### 4. Geometry was edited locally without an owner model

Margin, padding, and stack gap were adjusted symptom by symptom. That produced
the recurring divider and footer failures. The correct unit of reasoning is the
relationship and its single owner.

### 5. Review coverage favored assertions over rendered edge states

Tests could confirm that a class, label, or control existed while missing
overflow, stacking, perceived spacing, weak hierarchy, or a selector-open
state. The failures were visible in ordinary screenshots and should have been
caught by visual QA.

### 6. Reuse was attempted before convergence

Generic outcome and status arrangements were synthesized before multiple flows
independently demonstrated stable anatomy. This created consistency at the
expense of truth and quality.

## Required review discipline going forward

The current procedure is owned by the [lab area guide](../../src/views/internal/design-system/CLAUDE.md).
The list below records the original postmortem recommendation, not a second
maintained workflow. Before asking for human design feedback it called for:

1. **Source-fidelity pass:** classify important relationships as preserve,
   visually standardize, consolidate, deliberately improve, or do not touch.
2. **Geometry-owner pass:** identify the owner of every shell inset, section
   gap, row gap, divider boundary, and action relationship.
3. **Component-role pass:** verify not just that a canonical component is used,
   but that the correct size, density, semantic role, and state are used.
4. **State-continuity pass:** compare default, selected/open, loading, pending,
   recovery, and outcome states for unexpected movement or information loss.
5. **Rendered visual pass:** inspect desktop and phone, light and dark, with
   selectors/details open and realistic long/edge content. Explicitly check
   overflow, stacking, clipping, axes, divider symmetry, and action placement.
6. **Predecessor comparison:** for every important successful quality in the
   strongest predecessor, mark preserved, improved, or intentionally removed
   with a reason.
7. **Whole-composition critique:** ask whether the result looks like the
   strongest product this system supports—not merely whether each local class
   is legal.

## Recommended intervention level

Do not redesign the entire foundation or add a large family of transaction
components. The smallest justified intervention is:

1. keep the existing spacing/divider rule but make the geometry-owner check an
   explicit review requirement;
2. retain the newly clarified provisional asset-row and EntityIdentity roles;
3. clarify compact task-shell, amount-pair, task-header, and async-stability
   recipes in the current authority owner;
4. add regression coverage at the composition seam, including selected/open and
   loading states;
5. require current-flow and predecessor evidence before structural synthesis;
6. leave exact flow behavior, exact copy, and unresolved visual choices product-
   or human-owned.

The important conclusion is not that every correction needs a new token or
component. It is that rule compliance must be audited at the level where the
relationship is visible, and product truth must be inspected at the source
rather than reconstructed from an audit summary.

## Evidence anchors

- `docs/plans/design-system-v1-history.md` — transaction review contracts,
  correction history, and provisional selector evidence preserved from the
  former active plan.
- `docs/wiki/domains/design-system-reference.md` — detailed identity, Drawer,
  selector, Zapper-evidence, and quote-search guidance reached through the
  current router.
- `docs/plans/transaction-system-audit.md` — transaction-family requirements,
  lifecycle distinctions, and product-source register.
- `src/views/internal/design-system/tests/transaction-truth-spectrum.test.tsx` —
  current composition regressions and prohibited-invention checks.
- `src/components/design-system-v1/transaction-asset-picker.tsx` and
  `src/components/entity-identity/entity-identity.tsx` — the corrected selector
  and identity seams that exposed the latest rule boundary.
