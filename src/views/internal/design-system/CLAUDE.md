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

## Current review boundary

The user approved the current table presentations for now on September 14;
the [scoped decision](../../../../docs/wiki/decisions.md#2026-09-14--current-table-work-approved-for-now)
does not approve production adapters, universal Table/Row APIs, chart design or
the deferred auction workspace. Older family receipts retain engineering gates.
Current Review now points to `components/chart#chart-first-review`.
`charts/` starts from the actual Overview and Home renderers and a 90×40 Discover
sparkline. See the [source-reset contract](../../../../docs/plans/design-system-charts-source-reset.md).
Source fidelity preserves chart strengths and mechanics, not legacy framing.
Overview uses a square flat surface, 24px header/footer inset and canonical
page-title/body roles. Home keeps the accepted square outer shell, 8px shell
inset/media corners, 24px content axis, 16px logo-to-name and 8px name-to-market
gaps with no hidden title-height reservation. Identity uses ChainBadgedLogo.
These host roles never become universal chart-owned padding.
Overview's optional `onInspect` updates the lab header from existing selected-event
payloads; no production caller adopts it. A local Jotai Provider isolates replay
mode. Existing-tooltip mode omits the callback. Footer labels are explicitly
frozen, not fake-wired range/type controls. PHOTON headline and history captures
are dated independently; do not reconcile them or derive a new return.
The older generic renderer lives in collapsed technical pressure tests; passing
those does not certify Overview's production edge states or reduced motion.
Do not append live data, normalize returns, resample history or change production
chart types/defaults. Chart design and the optional readout seam remain unadopted.
The replay owns pointer-exit/blur restoration and suppresses touch compatibility
mouse/focus events; touch does not lock native page scrolling. Its first-tap proof
checks the selected timestamp as well as value after a hold and mode round trip.

## Retained table and auction references

The retained navigation-only current table is at
`#auctions-current-table-review`; `auctions-current-table/` owns its local state
projection and safe detail boundary. The [scope split](../../../../docs/plans/design-system-current-rebalance-table.md#near-term-and-deferred-scope)
selects current/history tables as the near-term migration target. Mobile cleanup
and the independent final review are complete; the [closeout reconciliation](../../../../docs/plans/design-system-current-rebalance-table-evidence/closeout/README.md)
owns F1–F5 verification and deferred findings. Its presentation is approved for now; production adoption remains separate. Initial migration retains the existing
production detail/flow; the deeper lab page contains dated read-only references,
not that working integration. Keep missing auctions distinct from ready,
and confirmed live auctions distinct from viewer/price prerequisites.
The default All preview shows 18 independently keyed scenario/permission/data
examples in separate one-row tables, each with its scenario label above the table
as lab chrome, never inside the identity cells. History appears once below the set;
individual previews (including the two-record example) keep their single table.
Individual previews remain selectable; row preview IDs
must never replace proposal identities or proposer destinations. Keep Details,
Back and responsive proposer focus attached to the exact example.
Table rows navigate through 32px secondary circular arrow links inside 44px hit
regions, retaining the
Details accessible name; no transaction controls execute here. Browse status
uses a single pill by default. Ready pills read Only launcher can start / Anyone
can start, independently of wallet connection/network. Launcher-only ready rows
reuse HelpTooltip beside the pill, with tap/keyboard access and a preview-keyed
focus owner. Help content must not bubble clicks into row navigation.
The local trigger capture handlers suppress Radix's pointer/click auto-close so
HelpTooltip's explicit tap toggle persists; do not remove without a real-touch
regression check. Shared HelpTooltip defaults remain outside this local fix.
History metric help uses the same local capture recipe. Tests must prove sustained
presence after the first tap, not accept a transient tooltip flash. A neutral
touch on the current card dismisses its open launcher help without navigating;
the next card tap and explicit arrow/proposer links remain intentional navigation.
Weight-setup restrictions use Only launcher can start on one supporting line,
with the exact source restriction in launcher help; selected detail retains the
full instruction. Keep the ordinary whole-cell vertical centering. Data/indexing
explanations remain visible beneath their pills; bid counts belong
with auction timing. Action prompts remain
in the selected detail context, not duplicated beneath a browse status. The
deeper page separates selected context from explicitly dated/named production
Reference captures. Those captures are not selected-row data or interactive parity.
Its browser seam is `current-rebalance-table-lab-regressions.spec.ts`; current
table breakpoint is 1024px and history remains 896px. Compact rows read auction
context, status, then rebalance expiry. At container widths of 352px and above,
the arrow centres against the status pill, not its supporting instruction. Below
352px it sits beside the auction context so status and helpers keep the full width.
Keep one compact arrow mounted across this change. Current rows have no extra
unknown-round block in compact/detail layouts; the desktop Auction column keeps
its dash. Without a round, the compact arrow pairs with the status pill at every
width. Reference captions belong to their imported captures, not selected-row
identity; the completed reference is June while the selected fixture is August.
Current rows have no extra
table bottom padding outside the hover surface. Rebalance expiry keeps its label
left and remaining time right; keep its scope explicit. Align the compact arrow's
visible circle with that right edge, not the invisible 44px touch-area boundary.
No shared defaults change.
Desktop also uses the approved, localized Rebalance expires in heading, distinct
from the live auction's Ends in timer.

The unfinished, deferred Auctions workspace remains with history at
`#auctions-browse-review`; do not resume it without explicit user direction or
make it a prerequisite/initial destination for table migration.
`auctions-current/` owns the private simulation,
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
replaces that working body. Known preparation scenarios add the round purpose;
unknown metrics never infer a round type. These are lab overlays, not live classification.
The description sits 8px below the title row. Status and event time sit beside it
on desktop and follow the title/description on narrow widths. The permission clock
says Anyone can launch in, with whole minutes until the final minute; readiness
and viewer permissions remain distinct. Execution target has canonical help for
estimated total progress, not additional progress or a guaranteed result.
The prelaunch hybrid Basket owns weight editing before and after saving; the
operation retains a disabled Start action associated with the visible prerequisite.
Its summary keeps Estimated trade value and Execution target above Duration,
using static dashes until target weights are confirmed, with one associated
explanation. The row order stays fixed after confirmation; missing prices still
prevent estimates and launch. Unconfirmed weights are not a loading state.
Required setup uses a compact full basket stack; saved setup exposes the actual
saved units and their illustrative allocations in a borderless table, not the
unsaved draft. At 320px the identity column must keep uDOGE on one line. Editor
rows retain the familiar Current units and New units labels while distinguishing
illustrative current holdings from the starting rebalance target and editable
target. Current amounts are per DTF token, not proposal values;
starting-target references stay visible after editing. Confirm target weights is
a first-auction preparation step, and unchanged defaults can be confirmed. Save
prepares the target locally; it does not submit a transaction or change holdings.
Saved-target copy warns about reload loss. Rows align identity/current units, bounded input and allocation; override Field's
vertical spacing locally when using a grid, and preserve the full 44px input hit.
Max Auction Size per Token uses the canonical secondary button with a pencil and
disclosure cue, plus the production USD/default explanation. Its fields still
expand in place; opening or closing them never saves or submits the draft.
The live chart and Bids headings align. Plot, timestamps, caption and note share
the plan's content edges; verify the outer relationship, not just plot-to-time. Its
schematic Now marker uses the pausable, default-running preview clock and hides
when auction state is unknown; this is not a live-price feed or pill animation.
Live bid summaries show both exchanged amounts; selection highlights the owner
and labels the corresponding schematic marker. The old live subtitle appears
only with the empty bid count; proposed new status/empty-state copy is not approved.
Wide preparation pairs Selling/Buying, with the compact asset disclosure anchored
to its plan rather than the operation's height; one vertical rule separates
plan and operation without another surface. Narrow order is plan/action/inspection.
Selling/Buying use the full allocated plan width, without a second text-width cap.
Removal gives its longer Buying list more room. Live uses a 2:1 split with an
18rem minimum bid rail; preparation retains 3:2. Ticker lists wrap naturally.
Cumulative results follow it, never mixed with the next auction target. Above a
1024px container they use stacked facts, with execution shown as a percentage only;
the recap heading uses the muted 14px label role, subordinate to Auction N.
narrow inline facts remain 14px on both sides. Before the first auction, compact
context retains completed count and deviation. Outcomes separate execution from
financial facts, retaining all seven metrics and matched 14px supporting pairs.
The cap explanation belongs beside the affected launch terms; high impact stays
above the plan. Existing transaction-step copy precedes the disabled launch action.
General provenance/expiry stays in the header, including still-open deadlines after
the target is reached. Expiry's remaining time uses the foreground 14px label role;
its label and proposal metadata stay muted, with matching inline text sizes. Assets
and liquidity expands across the working width: estimates, not executed history.
Selling/Buying inspection tables have no header or body-row dividers. Override
TableHeader's descendant border locally; a border-free TableRow alone loses to it.
Use TokenLogo's size prop; its inline dimensions override utility sizing. On narrow
rows, stack failed-status recovery controls so they cannot squeeze away identity.
Bid details expand directly beneath their canonical disclosure trigger. Long asset
inspection has a bottom collapse control with focus return. Invalid weight fields
have associated lab messages without clearing other inputs. Completed auction
count and terminal recovery messages each have one owner. The history handoff is
only in collapsed Lab simulation controls outside the product card, not an outcome action. It keeps focus
on History and leaves a current empty state. The visual-review regression
suite pins these behaviors; no shared defaults or chart redesign are implied.

The retained history projection is independent:
`auctions-browse/history-*` composes a full-container-width DataTable, with a
constrained projection below 896px. Below a 512px container, identity/provenance
take the full width and status follows; above it, status sits alongside that group.
Titles are 16px/500, numbers 16px/300,
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

Compact Earn identities must fit beside the rate using their actual text bounds;
cell overflow alone misses a supporting-label collision. Bound and wrap the local
identity, not canonical EntityIdentity defaults. Owned Balance/Value wrap as whole
facts when long amounts need their own row; never split, shorten or reformat the
number to fit a fixed two-column cell. Governs/APY retain their paired row.

Compact Index Earn rate help is an icon-only canonical InlineAction beside the
plain period label, with the 44px tap region outside its 20px layout. Keep
the numeric/APR line control-free and right aligned; loading reserves the label
icon footprint. The same existing FAQ, focus key and accessible name remain.
Desktop IconButton and shared action defaults are unchanged; see the
[rate-help receipt](../../../../docs/plans/design-system-table-governance-followup-2026-09-14/earn-rate-help/README.md).

Governance records own an inline-size container: below 28rem of content width,
the unchanged Fast/Contested qualifier precedes a full-width title, decision
evidence follows status, and standard quorum/vote facts use labels above values.
Whole facts wrap only when they cannot fit beside each other, without a stranded
divider. The local Constrained proposal column switch caps only this list at
390px, retaining every example. Row wrappers retain the card surface. Eligible
content rows/cards opt into the accepted opaque
[content-hover treatment](../../../../docs/plans/design-system-content-hover-trial.md):
proposal, Earn, current/earlier rebalance records, Discover, Portfolio positions
and neutral catalog content links. Whole-row action ownership determines
eligibility, not a shared table default. Static/withdrawal/loading rows and
individual controls keep their own behavior. Discover's decorative strip and
fade masks follow the hovered card; loading masks remain unchanged. The solid
warm light / subtly lighter dark role is separate from selection, generic control
hover and structural substrate roles. Production adoption remains engineer-gated.
Wider records retain
inline title/qualifier and complete evidence groups. The lab review aside uses
content height. Governance's 13 frozen examples now use one leading pill,
unboxed foreground voting/challenge deadlines and a quieter Passed outcome.
Waiting period plus Execution available in is distinct from supplied Ready to
execute; timer zero never derives eligibility. Active strips describe lifecycle
timing, not vote support; closed rows omit them. The canonical help trigger is
independent of the stretched native overview link. A first outside touch dismisses
help without navigation; a subsequent touch retains normal link behavior.
Local Default/Loading/Empty previews do not query or simulate production recovery.
Shared timeline defaults, optimistic evidence and reference destinations remain
unchanged. Real proposal identity, live deadlines, permissions, data recovery and
Show all need engineer-owned integration; see the
[presentation closeout](../../../../docs/plans/design-system-governance-presentation-closeout.md).
