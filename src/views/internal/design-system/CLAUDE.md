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

The Auctions review pairs the local current workspace with history at
`#auctions-browse-review`. `auctions-current/` owns the private simulation,
snapshot identities, 832px workspace breakpoint and single mounted task tree.
Never connect its fixture actions to real wallets or reuse its illustrative
arithmetic as transaction math. The receipt/indexing wait cannot re-arm launch.
Traded value is cumulative across rounds; the current round's bid presence is
not the total. Missing data and missing exact weights never establish an estimate.
Form validation uses React Hook Form/Zod; drafts and limits are memory-only.
The 44px editor input hit area is opt-in, measured on the real input rather than
inferred from the surrounding field. Lab scene query changes use a reset guard;
this is not production router blocking. See the
[workspace contract](../../../../docs/plans/design-system-current-rebalance-workspace.md)
for explicit copy, version, data and transaction adoption gates.

One Auction N heading owns preparation assets, terms and action; live monitoring
replaces that working body. Cumulative results follow it, never mixed with the next
auction target. General provenance/expiry lives in the header disclosure. Assets
and liquidity expands across the working width: estimates, not executed history.
Use TokenLogo's size prop; its inline dimensions override utility sizing. On narrow
rows, stack failed-status recovery controls so they cannot squeeze away identity.
Completed auction count and terminal recovery messages each have one owner.

The retained history projection is independent:
`auctions-browse/history-*` composes a full-container-width DataTable, with a
constrained projection below 896px. Titles are 16px/500, numbers 16px/300,
stacked labels and provenance 14px/300; inline peers remain equal-sized.
Keep each desktop cell's whole content block vertically centered; the primary
lines of single- and two-line cells are intentionally not baseline-aligned.
History lets identity absorb remaining width, bounds Status to 112px, and wraps
provenance as a sentence. Its opt-in compact date omits weekday and leading zeros,
retaining time, non-current year, timezone behavior and exact machine timestamp.
Other record dates retain their default formatter. Accuracy/NAV
help uses the canonical tooltip and the existing completed-view explanations.
The working area sits above it, not in a reserved detail pane. Unknown metrics
never establish Completed or Expired.
History uses the canonical card surface without gray row dividers. Its rows are
static: only proposer provenance is linked. NAV change and the muted dollar
impact complete the summary without a detail-page destination. Where a
different specimen deliberately uses dividers, keep them inside cells: a
pseudo-element directly on `tr` creates an anonymous table cell in Chromium.
The [history brief](../../../../docs/plans/design-system-auctions-history-slice.md)
owns the historical row boundary. The earlier record exploration remains separately
accessible at `#auctions-records-review`; its rules below are retained context,
not a prerequisite or accepted design for the current workspace.

Auction browse records live in `auctions-browse/`. Their copied identity/date/window
fields are checked against CMC20 snapshots; displayed outcomes and auction activity
are explicitly illustrative. Keep metric availability separate from the frozen
auction phase and simulated connected-launcher wallet. Ready state is objective;
the separate access line changes with the simulated wallet, not readiness or the
countdowns. Price-unavailable preflight suppresses ready-to-start only when no
auction is ongoing; it does not label the rebalance failed. Live readiness and
permissions still need engineer-owned adapters.
The Auctions run control counts ended auctions before the current/next one;
0/1/2 are example choices, not a protocol limit. Never infer completion or a
known final total from that count. Keep this input through phase/state changes.
The 640px browse trial pairs title/status in a wrapping header. The round number
sits outside the pill with access or its ending timer; remaining deadlines/counts
are grouped below. Historical results replace operational context. Inline pairs
use matching 14px/20px with 300/500 weights, following Governance evidence rather
than overriding Metric defaults. The rejected mixed-size trial is not precedent.
Loading retains the last nonempty content state's geometry, including warnings.
Preserve production `formatDate` information, independent proposer
links and native record destinations. This review does not implement selection,
detail/actions, live adapters or production metrics recovery; see the
[transfer brief](../../../../docs/plans/design-system-auctions-browse-slice.md).

Owned Portfolio positions live in `table-family/owned-*`, separately from Earn
opportunities and pending withdrawals. Keep balance/value central, every governed
asset independently linked, and staking Modify navigation distinct from the
vote-lock's non-executing context dialog. Appreciating balances carry underlying
units and exchange rate; ordinary API share balances do not inherit those units.
The owned Governs cell keeps `+N` inline with the last visible DTF and opens the
full linked list in a popover; it does not expand the row. Hover is optional;
click/tap and keyboard open a persistent panel. Responsive projection changes
close it and return keyboard focus to the visible matching trigger.
The local table must constrain its actual nested table, not only DataTable's
scroll wrapper. Empty recovery remounts the focus owner. See the
[owned-position contract](../../../../docs/plans/design-system-owned-positions-slice.md).
