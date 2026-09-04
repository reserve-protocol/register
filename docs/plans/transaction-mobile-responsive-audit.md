# Transaction mobile responsiveness audit

## Goal

Verify and repair the constrained-width behavior of the current transaction
composition candidates: Instant Zapper, Vote Lock / Unlock / Delegate,
Stake / Unstake / Delegate, and Automated Mint / Redeem. Preserve each flow's
existing lifecycle and product ownership while making the lab reviewable at
phone widths.

## Current state

The desktop compositions have received detailed human review, while their
mobile behavior has not had one complete cross-family pass. The accepted
direction already distinguishes compact task dialogs from Automated Mint's
progressive two-column workspace: at narrow widths the high-level task remains
primary and the order ledger becomes opt-in.

The mounted audit now covers every selectable state at 320px and 390px, plus
representative light/dark states and the 639px, 767px, 1023px, and 1024px
breakpoint bands. Below 360px, transaction amount and asset typography take one
bounded scale step so values remain complete; Vote Lock and Stake keep their
compact three-mode header with reduced item inset. Automated issuance wraps
high-level state copy on phones, stacks the order-detail heading below `sm`,
and centers a 640px-max single task column until the existing `lg` two-column
workspace begins. Orders remain opt-in on narrow screens.

## Non-goals

- Do not audit or change manual mint/redeem in this stage.
- Do not migrate production consumers or change package-owned Zapper behavior.
- Do not alter transaction mechanics, quote math, thresholds, or SDK contracts.
- Do not invent narrow-screen product behavior when an issue requires a human
  information-priority decision; record it with a recommendation instead.
- Do not change shared component defaults to repair a local composition.

## Acceptance evidence

- Each included family is inspected at phone and narrow-tablet widths in its
  ordinary state plus at least one high-content edge, recovery, or outcome
  state.
- No included composition causes document-level horizontal overflow, clips a
  primary action, strands an enabled control, or renders unreadable overlapping
  content at the audited widths.
- Automated Mint / Redeem keeps the high-level task as the default narrow path
  and exposes orders through its existing opt-in control.
- Obvious local defects are repaired and covered at the highest stable public
  seam; product choices without an obvious answer are reported separately with
  a recommendation.
- Focused tests, routed checks, mounted-browser light/dark inspection, and the
  final workflow gate are green or any limitation is named precisely.

## Test seams

- The transaction-family composition test IDs and public state selectors in
  the lab.
- Focused Vitest coverage in `transaction-truth-spectrum.test.tsx` and
  `transaction-composition-staged.test.tsx`.
- Mounted browser measurements for document and composition overflow, control
  reachability, wrapping, and representative screenshots at every crossed
  breakpoint band.

## Slices

- Slice: inventory responsive ownership and establish repeatable measurements
  for every included family; blocked by: none.
- Slice: repair obvious compact-task defects in Zapper, Vote Lock, and Stake;
  blocked by: responsive inventory.
- Slice: repair obvious Automated Mint / Redeem collapse, overflow, and order
  disclosure defects; blocked by: responsive inventory.
- Slice: verify light/dark and lifecycle pressure states, document unresolved
  human decisions, and complete workflow closeout; blocked by: repair slices.

## Unresolved decisions

- The global Reserve AI launcher can overlap bottom transaction actions at
  320px. This is a pre-existing application-shell issue already tracked in the
  project backlog, not something each transaction composition should offset.
- The 320px three-mode headers now fit without changing their accepted anatomy.
  Moving Close onto a separate row would add height and remains unnecessary
  unless human review rejects the intentionally dense fallback.
