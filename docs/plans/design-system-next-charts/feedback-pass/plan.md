# Chart feedback pass — 2026-09-15

## Goal

Turn the user's first review reactions into a coherent chart-family candidate:
balanced insets, closer axis labels, clear Portfolio inspection, and precise
latest-point markers. Delegated implementation is authorized. Visual acceptance
and production adoption remain separate.

## Current state

Implementation and independent reviews are reconciled in the
[closeout](README.md). Human visual review remains required; this contract does
not imply acceptance or production adoption.

Fixed point: `49f9f22ae94d579b4c530de845e8637d299a9c7d`, with the inspected,
inherited dirty checkout as implementation input. Do not restore files to HEAD.
The preceding [completion receipt](../completion/README.md) is pre-feedback
evidence, not verification of this pass. User preview stays on port 3005.

This contract supersedes the prior revision's bottom-Portfolio-controls choice
and fixed axis-gutter geometry. Other retained chart decisions still apply.
Profile: high, bounded design-system iteration; cross-renderer presentation
requires independent review, not unrelated production migration tests.

## Desired experience

At rest, a reader sees an intentionally spaced metric or Portfolio total,
readable axes close to the plot, and a small mark centered on the latest plotted
point. On Portfolio inspection, a vertical guide locates the selected date;
the total and adjacent category key describe that same sample. Pointer exit
restores the resting state without financial reinterpretation or header jumps.
On phones, controls remain usable and charts do not capture ordinary scrolling.

Keep existing successful typography, source-shaped Overview/Home charts,
mobile Overview's hidden axes, square surfaces and compact inline readouts.
Rejected alternative: one mandatory footer structure for every chart. Portfolio
has a legitimate need to place its key immediately below the plot.

## Feedback and intended changes

1. **Yield insets:** move the existing export control to the header's top-right.
   Reconcile the complete top/bottom visible inset, plot-to-footer gap and
   control hit area. Do not merely move the button or shrink canonical targets.
   Review canvas and chart composition must each own distinct spacing, not
   duplicate padding. Preserve all download behavior and existing wording.
2. **Portfolio controls/key:** ranges at top-right on desktop; below the readout
   and above the plot when narrow. Keep the category breakdown directly below
   the plot, without an intervening control row, divider or repeated Total.
   Preserve existing range options/availability and horizontal access on phone.
3. **Y-axis proximity:** inspect Yield, Portfolio and Overview line/candle
   renderers. Size label space from rendered/formatted labels where practical,
   with a small consistent plot-to-label gap. No large generic safety gutter.
   Geometry must remain stable during inspection; test range changes as well.
   Preserve financial formatting, tick meaning, domains and mobile-axis policy.
4. **Portfolio readout rhythm:** retain label-to-total relationship and responsive
   total size; give the date modest additional breathing room using an existing
   spacing step. Do not add large fixed numeric slots or a taller hero wrapper.
5. **Portfolio composition inspection:** add one subtle selected-timestamp
   vertical guide and one top marker. A thin total contour follows the stack's
   top edge using the supplied total, not a new calculation. No outlines/dots
   on every category, no new floating tooltip. Header/key/marker must agree.
6. **Latest-point markers:** trial across Overview line, Home line, the actual
   90×40 Discover sparkline, all four Yield metrics and Portfolio total/contour.
   Exclude candles and decorative category boundaries. Fill matches the line
   exactly at its endpoint, including gradient strokes; the thin surrounding
   ring matches the immediate host background. Use an understated static mark
   (starting radius 3px, ring 2px; sparkline radius 2px, ring 1.5px). No animation,
   glow or pulse. Center on the actual final data coordinate, never shift the dot
   away from the line to avoid clipping. Reserve real drawing clearance instead.
   Suppress the resting endpoint marker while inspecting another point; restore
   it on exit. For non-inspectable Home/Discover it stays visible. These indicate
   latest plotted values, not guaranteed live/current prices.

## Non-goals

- No changes to data sources, RPC/SDK/subgraph code, historical reconciliation,
  financial calculations, precision, domains, sampling, range semantics or CSV.
- No palette redesign, copy edits, title-role changes, tooltip redesign or
  candle touch/keyboard repair in this packet. The known candle interaction
  limit was subsequently resolved by the separately authorized September 15
  G7 repair.
- No shared defaults, global tokens, production adoption or new dependencies.
  Necessary renderer presentation seams must be opt-in with default parity tests
  and a specific engineer handoff note; no product caller opts in.
- No Toast/Progress integration, Slider work, commits, pushes or preview restarts.
- Lab inspection has no new product analytics event; production analytics and
  existing download handlers are unchanged.

## Slices

- **A — Yield/Portfolio:** all six applicable feedback items within
  `src/views/internal/design-system/charts/next-families/`; blocked by: none.
  Own the four `chart-next-families*` / `chart-yield-price-pilot*` browser specs
  and new local geometry tests. Do not edit fixtures, `fixture-data.ts`,
  `metric-formatters.ts`, `portfolio-formatters.ts` or `range-control.tsx`.
  Receipt: `feedback-pass/next-families.md`.
- **B — source line family:** Overview/Home/Discover marker and axis presentation;
  blocked by: none. Own `charts/source-overview.tsx`, `charts/source-small.tsx`,
  isolated lab helpers, `price-chart-body.tsx`, `candlestick-chart-body.tsx`,
  `performance-chart.tsx`, and focused tests for those seams. Lower renderer
  helpers `price-chart-defs.tsx` and `performance-chart-renderers.tsx` are also
  authorized for optional coordinate-space gradient inputs, preserving omitted
  defaults and existing stops/direction. Further helper edits require notifying
  coordinator first. Do not edit next-families.
  To keep existing bodies bounded, renderer-local `chart-presentation.tsx` in
  Overview and `performance-chart-presentation.tsx` in Home are authorized for
  geometry/SVG only; no shared application chart abstraction or data ownership.
  `price-chart-series.tsx` may suppress built-in active dots only for the marker
  opt-in, which then renders one coordinate-space marker at the inspected sample
  or latest resting sample. Preserve omitted behavior and both readout modes.
  Receipt: `feedback-pass/source-family.md`.
- **Coordinator — convergence:** owns this plan, catalog/current-review/context,
  shared docs, evidence index and whole-family verification; blocked by A/B for
  final source-frozen browser run. Reconcile, independently review and repair
  before handing the candidate back.

## Delegation contract

Two cold-context coverage workers in the same checkout, disjoint paths, one
coordinator. No separate servers, shared documentation edits, workflow-start,
commits or unannounced boundary expansion by workers. Source and unit checks may
run concurrently; browser capture waits until every watched source writer is
frozen. Workers report before browser runs; coordinator serializes the final
suite and archives reports before overwrite.

Dispatched task IDs: `/root/chart_feedback_next` (A) and
`/root/chart_feedback_source` (B), both in the shared Register checkout. They
return the slice receipts above; coordinator owns completion verification.

Use Sol/high for these bounded implementation packets, as previously authorized.
Recent comparable receipts are `completion/metrics-portfolio.md` and
`completion/refinements.md`: useful implementation evidence with a known missed
Recharts wrapper defect repaired after independent review. Authority therefore
stays presentation-only; actual mounted-axis/marker checks are mandatory.
Priority is the user's latest requested execution mode; no claim about task
cost or speed settings is made without tool evidence.

Dropout/overlap: stop conflicting writes and finish through one owner; do not
create competing implementations. Reserve coordinator verification, Dark/Light
review and one scoped repair pass before optional refinements.

## Test seams

- Existing real mounted lab browser specs, not mocked Recharts: desktop/phone,
  light/dark, standalone preview and integrated route.
- Actual SVG tick, path and marker coordinates; axes stay direct Recharts
  children. Endpoint radius plus ring must fit every clipping ancestor, including
  extrema, single-point/empty and tiny-cell pressure cases where supported.
- Hover/key selection, exit/reset, native phone scrolling, range access,
  empty/recovery and export behavior remain covered by existing seams.
- Focused tests prove optional source-renderer props leave default callers
  unchanged. App/e2e typecheck, scoped lint/format, diff check and wiki lint.
- Hash protected fixture/formatter/range/production financial owners before
  and after. Test additions may not weaken old semantic coverage to pass.

## Acceptance evidence

| Requirement                             | Evidence required                                                                                    |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Yield balanced insets, export placement | Visible top/bottom landmarks and default/empty captures at desktop, 390 and 320                      |
| Portfolio controls, readout and key     | Desktop and phone full composition captures; accessible range traversal                              |
| Axis proximity                          | Measured plot-edge to visible label edges with short/long labels; no clipping or inspection jitter   |
| Portfolio inspection                    | Real guide/dot timestamp coordinates and synchronized header/key in total/composition                |
| Endpoint markers                        | Rest/inspection/exit SVG checks; exact center, line-matching color and unclipped ring in both themes |
| Scope preserved                         | Protected-file fingerprints; default opt-in compatibility checks and inspected diff                  |

The coordinator inspects visual output, not just passing bounding-box tests.
Independent Dark/Light reviewers check intent and engineering scope once after
convergence; affected evidence reruns after repairs. Human review is still needed
for the final optical balance, contour and endpoint treatment.

## Unresolved decisions

No blocking user decision. Marker size, small spacing adjustments and exact
measurement technique are reversible candidate details, not universal design
rules. If fitting axes would require financial/domain changes, leave that case
unchanged and report the boundary rather than solving it through data changes.

Strongest risk: optimizing numeric padding while missing perceived whitespace,
or adding a correct-looking marker detached from the actual line. Acceptance
therefore requires both rendered coordinate proof and whole-composition critique.
