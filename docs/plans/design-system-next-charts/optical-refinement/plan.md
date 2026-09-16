# Chart text controls and final optical refinement

Status: approved-for-now as part of the frozen chart lab baseline. This plan
retains implementation and verification history; production adoption and
engineer review remain separate.

## Goal

Resolve the user's feedback through September 15, 14:39: compact text-only
control layout with generous actual interaction areas; a genuinely small CSV
utility; Portfolio controls visually anchored to the top-right; fitted gutters
based on displayed ticks; Overview performance weight matching its price.

This revised the existing chart stage rather than creating a new checkpoint.
Profile: high because text-only shared geometry required consumer checks and
independent Intent/Engineering Risk review. The September 16 decision supersedes
the former human-acceptance gate for this lab baseline only.

## Current state

Base `49f9f22ae94d579b4c530de845e8637d299a9c7d`; all inspected inherited dirty
work remains input. No restore/reset to HEAD. The previous worker
`/root/chart_optical_refinement` is stopped and has explicitly released the
source/browser slot. Its preliminary [46/46 report](evidence/browser-report.json)
is evidence of that intermediate candidate, not final acceptance.

Retain its right-aligned axes and 8px before the Portfolio amount. The user's
later visual review supersedes the provisional 4px amount-to-date gap with 8px.
Keep the latest date visible at rest without adding freshness wording. Portfolio
timestamp precision is an explicit `day`/`minute` caller choice: the current
weekly fixture declares UTC day precision, including its 23:59:59 geometry
sentinel, while future meaningful intraday callers can request UTC minute
precision. Yield uses the same family-local formatter at UTC minute precision.
Do not infer precision from cadence, range, or timestamp digits. Retain the
local genuine 320/390 mobile controls. Its oversized quiet CSV button and
candidate-value gutter fitting are superseded. The inherited E2E SVG getBBox
typing failure was repaired by B without weakening geometry assertions.
Final lint/hash/review closeout of that intermediate packet was not completed.

A/B have released their sources. Coordinator integrated B's Portfolio axis
patch before dispatching C; fresh app TypeScript passed after integration.
The later combined browser proof and review recorded below supersede this
historical in-progress handoff state.

The separately authorized [partial-history slice](partial-history/plan.md)
extended this stage before its final browser closeout. It corrected only
the Yield/Portfolio lab's selected-domain and coverage presentation; the earlier
optical candidate remains the visual baseline.

Human review then rejected the all-partial presentation and explicitly replaced
the later Price example with the Portfolio pre-holdings lifecycle. The corrected
slice is tracked in its [closeout](../partial-history/README.md): normal Yield
uses available plotted bounds, while the Portfolio lab fixture includes explicit
known-zero samples before its first positive holding. Unknown history is never
converted to zero, and the existing technical pressure fixture remains the
internal-gap example. The approved-for-now decision promotes only the frozen lab
presentation; no production authority was promoted.

The final lab-only plot-edge correction reduces the Yield/Price and Portfolio
left Recharts margin from 24px to 4px. The 24px right margin, measured Y gutter,
top/bottom margins, full-width focus wrapper, headers, footers, ranges, CSV,
axes, heights, touch/focus behavior and Portfolio known-zero onset remain
unchanged. Browser RED measured both focused curves 20px too far right; focused
GREEN passed 2/2 and the combined source-frozen replay passed 32/32 with no
unexpected, flaky or skipped cases. Production, Overview, shared defaults and
axis helpers are outside this correction.

The local Portfolio-key refinement uses a semantic definition list. Below its
existing 32rem container boundary, each category spans the 24px-inset content
width with a grouped dot/label term at left and a right-aligned, tabular,
non-wrapping amount; labels may wrap and rows keep their 12px gap. At 32rem and
above, entries remain intrinsic flex-wrap items with the existing 24px item and
8px term/value gaps. Category order, copy, colors, typography, selected state,
live output and every chart/control/data behavior remain unchanged.

## Experience and component direction

Text-only controls should occupy a compact visual/layout slot by default in
the proposed design. A composition may deliberately add toolbar height, but
transparent interaction padding must not silently become visible card inset.
Keep text sizes, semantic selection, labels, keyboard behavior and contained
control geometry unchanged. A large target need not imply a large hover pill.

Two honest usages: a Portfolio control row whose text sits about 24px from the
top/right card edges; and a phone chart footer where scrollable period controls
sit beside or above a compact CSV utility. Hovering the utility must not reveal
the large gray capsule rejected by the user. Tapping above/below compact text
must still activate the intended control, with no neighboring target theft.

One candidate, not a competing architecture exercise. Before kernel edits the
control owner submits a concise proposed mechanism and API/consumer implications
for coordinator approval. Use the existing text-control owners where sound;
do not invent a new generic framework. Consider a bounded utility extension of
the existing text-action owner versus a narrowly named reusable text action;
keep ordinary Button/quiet and existing InlineAction defaults intact.

The compact text-only default is the requested design direction. Stage it as a
candidate/opt-in while validating hit geometry and consumers. Do not silently
roll a shared-default change into paused transaction compositions. Inventory
all V1 text-only consumers and identify which can safely inherit it; broader
migration or compensating sibling-layout changes require coordinator review.
Document any remaining promotion gate rather than hiding a permanent chart hack.

## Slices

### A — text-control kernel and chart composition; blocked by: proposal approval

Fresh Sol High implementation owner. Submit one bounded mechanism first, then
implement/test after coordinator approval. Own:

- V1 segmented-control.tsx and segmented-control-presentation.ts; do not alter
  contained-selection.ts or contained defaults.
- A narrowly scoped reusable text-action owner/variant; Button/IconButton and
  existing InlineAction behavior remain unchanged.
- Chart next-families/range-control.tsx presentation only (range selection/math
  unchanged), metric-export.tsx, metric-line-chart.tsx, review.tsx and Portfolio
  header/range-wrapper lines in portfolio-history.tsx only.
- Canonical segmented/button lab specimen needed to expose candidate states,
  relevant new colocated tests, and a new dedicated text-control browser spec.
- `controls.md` and `controls-evidence/` in this directory.

Separate compact visual height from actual interactive extent with a proven
scroll-safe mechanism. Do not assume an overflowing pseudo-element works:
current range controls use horizontal overflow and can clip vertical targets.
Test actual clicks/taps outside visible text, adjacent rows/actions, first/last
scroll items, focus rings, disabled states and non-overlap. Prefer existing
44px vertical comfort where safe; do not falsely claim every narrow label has
a 44px-wide target. Never create invisible overlap to meet a number.

CSV stays one FileDown InlineAction with the accessible name `Download CSV`,
foreground/14px compact utility hierarchy and no large filled/outlined hover
capsule. Below a 22rem chart container its visible label is `CSV`; at 22rem and
wider it remains `Download CSV`. Preserve file data, handler, disabled reasons,
20px visual height and expanded target. Re-evaluate footer flow at ordinary
two-column desktop and 320/390 widths; no oversized Button padding, forced
overflow or target overlap with the range track.

Portfolio tabs: approximately 24px visible top/right inset, not centered against
the tall readout and not 24px padding plus an unaccounted 44px box. Use the
component's deliberate optical/layout contract; do not stack unrelated offsets.
Preserve amount margins, type hierarchy and above-plot mobile range placement.
Rebalance Yield canvas padding after removing the old target-height compensation.

### B — actual-tick gutters and Overview typography; blocked by: none

Fresh Sol High implementation owner. Own:

- next-families/axis-geometry.ts and yield-price-plot.tsx plus their tests.
- Portfolio axis/plot lines in portfolio-history.tsx, but NOT the header. To
  avoid shared-file writes, submit the Portfolio-only patch to coordinator;
  A remains that file's sole writer until release.
- Overview chart-presentation.tsx, price-chart-body.tsx and candle body only
  where needed for axis measurement; no data/interaction changes.
- source-overview.tsx SourceReturn weight only; no footer/layout edits.
- Existing eight chart browser specs and axis/presentation tests. A uses a new
  dedicated spec, so these files have one owner.
- `axes.md`, `axes-evidence/`, and the pending Portfolio patch here.

Measure the longest actual displayed Y tick, not every formatted series value.
Supply 60K/40K/20K/0 and RSR $45K/$30K/$15K/$0 must not reserve room for decimals
they do not show. Keep right edges aligned and the good Price/APY clearance:
roughly 12–16px visible gap from endpoint ring/final candle glyph to the longest
label's nearest edge. Shorter right-aligned labels naturally sit farther away.
No formatter, tick-value/count/domain/source changes to make geometry pass.

Use a simple bounded measurement/update path, not private Recharts tick
generation. Account for fonts, width/range/data changes and Empty recovery;
do not measure/reflow on each hover or introduce resize loops/visible jitter.
Keep actual endpoints centered/unclipped and mobile Overview axes hidden.

Overview return percentage and (ytd) use the same weight as the price, retaining
green, arrow, separators and all supplied text/data. This tiny change is bundled,
not a third agent. Do not change Home/other performance surfaces or hover return
semantics. Fix the inherited SVG typing failure and update relevant exact tests.

### C — final user feedback: launch guide, Portfolio descriptor, tooltip alternative

Authorized September 15 after the audit discussion. One implementation owner,
Sol High, for these three small presentation changes; no three-way fan-out.
The existing A/B sources are frozen. Coordinator has integrated B's Portfolio
axis patch before releasing the Portfolio label to C. Reuse A's owner for this
follow-up; it already knows the composition. Root owns convergence and shared
docs while C implements. A/B browser verification is postponed until C freezes,
then run one combined candidate pass, preserving capacity for repair.

- Home launch guide: in the lab annotation presentation, the resting dashed
  line reaches the top of the circular launch badge rather than always reserving
  52px for an invisible label. When the label is actually visible (hover, focus,
  mobile default or clipped-badge fallback), leave deliberate label clearance.
  Derive this from the same visibility state as the label, not a second divergent
  guess. Keep legacy/default production presentation unchanged. No marker data,
  timestamp, badge appearance, card navigation or touch-scroll redesign.
- Portfolio descriptor: use existing body typography (16px/24px, light) for
  "Portfolio total", keeping muted color. Amount stays primary, date stays
  14px, existing 8px/4px readout spacing and 24px host inset stay. Yield labels
  remain 14px. No new type token, global variant or semantic heading change.
- Overview line tooltip: retain a selectable floating-tooltip alternative to
  header inspection, but render a V1 presentation. Preserve current value,
  timestamp, units/formatters and selection behavior. Reuse the existing
  tooltip-surface recipe and relevant typography/semantic roles, not the legacy
  20px radius. Optional source-renderer content seam must preserve omitted
  production defaults, existing YieldTooltip and candle behavior. Clearly name
  the lab alternative and mark it provisional; do not claim accepted design.

C owns Home performance-chart.tsx/launch-marker presentation and dedicated
tests, Portfolio descriptor only, Overview price-chart-body.tsx optional tooltip
content seam, lab source-overview.tsx/review.tsx, a new local line-tooltip and
tests, and a NEW final-feedback browser spec. No A/B existing test rewrites
until coordinated. Return final-feedback.md with preserved defaults, RED/GREEN,
exact source files, checks, remaining browser proof and explicit source release.
If C cannot finish, preserve its work and reassign serially; do not spawn a
competing owner. No independent-review claim for implementer self-checks.

Acceptance: line meets badge at rest and clears visible label in desktop
hover/focus and phone default; label transition has no detached unexplained
gap. Portfolio computed descriptor is16px, date/Yield descriptors remain14px,
no header/tab overlap at320/390/desktop. Tooltip shows actual selected sample,
legible light/dark surface, small/simple layout, no edge clipping, and switching
back restores the header-inspection behavior. Empty/inactive payload renders
nothing. User acceptance remains separate from verification.

### D — honest history boundaries; blocked by: A/B/C source release

Use the [bounded slice contract](partial-history/plan.md). Normal Yield and the
Portfolio specimen use available real-point bounds. Portfolio's simulated fixture
may display exact zero only for its explicit known pre-holdings samples, with the
path held on the baseline until the first positive sample. All uses actual fixture
bounds. This slice also owns Portfolio's weekly-capture 24H disablement and
focused range/path proof. It does not synthesize missing production history or add
another internal-gap system beside the existing technical fixture.

### Coordinator — convergence; blocked by: A/B/C/D

Own plan, current-review/catalog/guidance, wiki/engineering handoff, cross-packet
integration and existing stale spacing assertions after A settles. Review A's
proposed mechanism before widening shared mutation. Apply B's Portfolio patch
after A releases; resolve once, never allow competing writers.

One final whole-candidate source-frozen browser pass, optical inspection of
rest AND hover/focus, and at most two independent reports: Intent and Engineering
Risk. Reserve an affected repair/recheck. Passing tests do not approve design.

## Non-goals

No SDK/RPC/subgraph, financial math/domain/sampling, fixtures, CSV contents,
live-price promises, candle interaction repairs,
Discover marker changes, palette, fonts/tokens, or production adoption. The
only additional Home change is C's opted-in launch-guide endpoint treatment.
No contained tab/control or ordinary Button default change. No new dependencies,
servers, credentials, checkpoints, commits/pushes, or Toast/Progress work.
Keep user preview 3005 untouched. Keep the accessible `Download CSV` name; the
explicitly authorized narrow visible label is `CSV`.
No new product analytics event for internal review controls.

## Acceptance evidence

- Compact text-only layout plus real expanded clicks/taps, not bounding boxes
  alone. No clipped target/focus, overlap or broken horizontal scrolling.
- Actual consumer inventory and default-preservation checks for contained
  controls/ordinary buttons; declared candidate versus promotion boundary.
- Full Portfolio top-right visual inset and left readout rhythm at desktop;
  narrow/phone controls remain deliberate and accessible.
- Full Yield canvases including hovered/focused/disabled CSV action at desktop,
  constrained and 320/390 widths, both themes. Small visual treatment, no pill.
- Price/APY/Supply/RSR/Portfolio/source axes: visible tick-driven gutter and
  preserved alignment, marker center, formatting, range behavior and stability.
- Yield/Price and Portfolio begin at 4px local left drawing clearance while the
  24px content/right axes, focus wrapper and total/composition bounds remain
  preserved.
- Portfolio key rows align terms and amounts across narrow containers without
  overflow under long-label/long-value pressure; desktop entries remain compact.
- Overview price/performance computed weights match; rest/inspection/reset,
  marker and separately captured return semantics unchanged.
- Local mobile controls and independent previous chart controls still work.
- Focused RED/GREEN, app/e2e typecheck, scoped style/diff/wiki checks, meaningful
  consumer/browser integration checks, protected input hashes, independent review.
  This shared-control step needs wider affected-consumer proof than a local
  spacing edit, but not unrelated financial production tests.

## Test seams

Existing real chart specs, dedicated text-control pressure spec and canonical
component behavior tests. Verify the user's actual two-column chart widths,
not only a full-width standalone chart. Use actual visible glyph geometry and
hit tests. All watched source/e2e writers freeze before browser evidence;
coordinate a single browser slot. Source edits invalidate affected captures.

## Delegation and effort

Two coverage packets, not competing candidates. Sol High for both: this is the
configuration with recent relevant source/real-browser evidence, although it
required coordinator corrections. The control packet has no earned authority
for an unattended global-default migration. Higher effort is allocated to
geometry, clipping, state and compatibility; a two-line font adjustment does
not merit its own task. No claim about cost, Fast mode or model equivalence.

Dispatched: `/root/chart_text_controls` (A, proposal before kernel edits) and
`/root/chart_actual_ticks` (B, bounded chart implementation), both attached
subagents in the shared checkout, not independent sidebar/worktree tasks.
`/root/chart_text_controls` now also owns C after explicit follow-up dispatch;
its A source is preserved. B remains frozen until the final browser slot.

One shared checkout with explicit disjoint files; Portfolio is patch-only for B.
No workers start stages or edit shared docs. If overlap appears, stop writes and
finish serially through the named owner. If a worker fails, reassign its bounded
packet; keep independence and final verification honest.

## Unresolved decisions

No shared-default promotion follows from the approved lab baseline. Any later
adoption still depends on consumer and hit-area proof. If preserving large usable targets requires more
reserved surrounding space, disclose that physical constraint; do not promise
zero-space interaction or silently shrink accessibility to satisfy the visual.

Strongest risk: replacing obvious padding with invisible clipped/overlapping
targets, or measuring labels through a self-triggering render loop. These are
the primary engineering-review questions. Engineer review before production
adoption remains required.
