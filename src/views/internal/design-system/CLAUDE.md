# Design-system lab

Read for lab composition, audit, or migration preparation; ordinary product work
uses its own area guide. Start with the [V1 plan](../../../../docs/plans/design-system-v1.md),
then the target's `getComponentContextRoute` in `component-catalog.ts`. Follow
its scoped authority, implementation, and evidence links. A rendered specimen,
reviewable state, or passing test is not design acceptance or production adoption.

## Apply and review

1. **Source fidelity:** inventory the real surface's states, actions, information,
   data and accessibility before composing. An audit report is a discovery map,
   not a substitute for inspecting the source and rendered examples yourself.
   Preserve production behavior not covered by a reviewed replacement.
2. **Geometry ownership:** name the owner of each inset, section gap, row rhythm,
   seam and flexible space. Measure the complete visible relationship, including
   nested padding; do not add a second owner or equalize unrelated numbers.
   Decide whether the host or composition bounds its width; judge the resulting
   reading/action distance on desktop as well as overflow on phone.
3. **Component roles:** use the canonical API, supported variant and typography
   role. Check purpose as well as imports. Color/focus ownership is
   `src/components/design-system-v1/semantic-roles.ts`; type ownership is its
   sibling `typography.ts`. Layout relationships remain in `v1-layout-recipes.ts`.
   Inline label/value pairs share a text size and line height; use weight/color
   for hierarchy. Stacked pairs may differ. Compact inline precedents already
   exist in Governance evidence and transaction details at 14px/20px on both sides.
4. **State continuity:** compare empty, configured, open, waiting, recovery and
   outcome where applicable. Check placeholders, focus, wrapping, disabled versus
   processing controls and retained context; no unintended layout jumps.
5. **Rendered review:** inspect light/dark, desktop/phone and the affected breakpoint
   at ordinary viewport height. Check alignment, hierarchy, density, seams and
   whitespace—not just bounding boxes. Use actual scrolling and keyboard actions.
6. **Predecessor comparison:** identify important strengths of the closest reviewed
   composition. Mark each preserved, improved or intentionally removed with a reason.
7. **Whole-composition critique:** judge hierarchy, clarity and visual quality as
   a complete task, not merely a set of legal classes. Resolve obvious mistakes
   before asking for human feedback; uncertainty is not automatic acceptance.

Keep acceptance scope, unresolved choices and implementation evidence separate.
Update the existing owner and links; do not create a global rule from one
composition. State which routes/states were actually inspected. Static tests
and full-content screenshots cannot prove ordinary viewport behavior.

Choose precedent by its job, not its nearest file. The catalog's rounded,
padded specimen frames are lab chrome, not product composition grammar.
For contained forms, [the field-group study](contained-form-row-review.tsx)
illustrates the [accepted repeated preset-or-custom pattern](../../../../docs/wiki/decisions.md#2026-08-19--repeated-preset-or-custom-form-composition-accepted),
including 24px inset/group rhythm. Its old provisional badge is stale. Reuse
the accepted relationships within their scope, not as a universal form template;
current component/type owners supersede incidental example code.

## Verification boundary

Follow the [coverage map](../../../../e2e/TEST_MAP.md).
`pnpm design-system:review` owns an isolated server on 3022 (override with
`DESIGN_SYSTEM_PORT`), captures 375/1400 light/dark and runs focused viewport
regressions. Do not stop the user's 3005 preview. Do not edit watched source
while capturing. Source drift, missing attachments and missing baselines fail.

`design-system:verify` additionally runs the existing full-content pixel sheets;
their recorded platform must match. `design-system:capture` is an explicit
snapshot writer, never routine verification. Inspect every intended difference.
CI runs behavior and viewport captures, not macOS pixel comparisons on Linux.

Canonical source-hygiene tests enforce semantic colors and reviewed type recipes
in named component owners. Their explicit exceptions preserve existing scrims,
local/platform variables and measured geometry. They do not approve new tokens,
scan legacy product styling, or replace visual judgment. See the test's scope
before widening it. No production or SDK migration is implied by lab readiness.

## Family-specific guidance

Before changing a family's composition, audit, state projection or migration
preparation, read its matching guide. Shared lab-host changes load each affected
family's guide; these routes do not authorize work on deferred specimens.

- [Charts](guidance/charts.md): `charts/`, source-renderer replay and chart review.
- [Current/history auction tables](guidance/auction-tables.md):
  `auctions-current-table/`, `auctions-browse/`, detail references and retained
  browse records. Current/history and earlier exploration stay distinct.
- [Deferred auction workspace](guidance/auction-workspace.md):
  `auctions-current/`, weights, live bids and simulated launch/outcomes.
  Read only for explicitly authorized work on that deferred workspace.
- [Table and governance records](guidance/table-records.md): `table-family/`,
  Earn/owned positions and `governance-proposal-*` compositions.

For content-row/card hover changes in any family, read the
[accepted opt-in treatment](../../../../docs/plans/design-system-content-hover-trial.md).
Target catalog routes and family briefs still supply contracts not repeated here.

## Current review boundary

Read `current-review.ts` for the selected review surface and the
[V1 plan](../../../../docs/plans/design-system-v1.md#active-frontier) for acceptance
and deferred-work boundaries. Do not copy transient review state into this guide
or infer production adoption from an available specimen.
