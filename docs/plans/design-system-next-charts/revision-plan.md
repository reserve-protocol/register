# Chart review revision plan — September 15

The initial revision is retained as predecessor context. The authorized
[feedback pass](feedback-pass/plan.md) now owns follow-up implementation,
including the revised Portfolio control placement and axis/marker geometry.

## Goal

Make the Yield historical metrics and Portfolio history candidates coherent
members of the Overview/Home chart family, without incidental host designs or
financial/interaction changes hidden inside visual cleanup. Include the requested
Overview inline separator refinement. The user approved the overnight scope and
subsequently authorized Priority execution on the following morning. The current
next-family candidate needs visual revision despite its passing functional
checks. Human acceptance and production adoption remain separate.

The overnight scope below is now authorized for bounded lab implementation.
The user's additional Portfolio direction is recorded here before dispatch:
the total is the dominant page-level readout; its descriptor is subordinate.

## Current state and evidence

The observations below describe the rejected starting state. The current
implementation and verification are owned by the [completion package](completion/README.md).

- `metric-line-chart.tsx`: uses panelTitle for the metric name, sectionTitle for
  its value and auxiliary for a unit that disappears in favor of an inspection
  date. Legal token imports did not establish correct roles or hierarchy.
- Both new plot owners reserve a 64px Y axis plus a 20px right margin; headers
  and controls separately use 24px insets. Tick anchoring creates uneven visible
  edges. The correction concerns label geometry, not data-domain manipulation.
- `review.tsx` includes a decorative/product-like Historical metrics header and
  beige shells. These confuse the chart-only review boundary. Production Yield
  does have that icon and shell, but that is not authority to include them here.
- Production `src/views/portfolio-page/components/portfolio-chart.tsx` has
  top-right range controls, a current-value headline and separate period change
  figures, total area at rest, composition on hover/click, and dated category
  values plus total in a tooltip. The selected-date tooltip total is not
  inherently a duplicate of the current headline.
- The lab changes this to persistent composition and a permanent three-column
  breakdown. Its header and bottom Total both read the same selected point;
  that duplicate adds no information. Five entries leave an unbalanced grid.
- Lab categories map sequentially to chart-1…chart-5. These variables are
  explicitly deferred generic categorical colors in the design reference, not
  accepted Portfolio assignments. Production associates Index DTFs with blue,
  Yield with teal, Staked RSR with coral, Vote-locked with gold and RSR with
  primary blue. Lab Index is coral, Staked is dark teal and RSR orange. Lab also
  reverses the production bottom-to-top stack order. Neither is a neutral token
  substitution.
- Existing captured/simulated data, unsupported touch inspection, and engineering
  boundaries remain as recorded in [integration.md](integration.md). Functional
  evidence is retained; it is not evidence of visual acceptance.

## User/caller usage and review boundary

1. At rest, the reviewer can identify a metric, read its value and unit, see the
   plot, and locate range controls without decoding a new card or page design.
2. During inspection, the exact point's value and date are clear while identity
   and units remain available. Exit restores the resting readout without large
   reserved blanks or duplicated totals. Current versus selected-date values
   must never be silently conflated.
3. At 320px or with long labels/large values, labels remain legible and inside
   their intended inset. Legend items stay associated with their amounts; range
   choices remain accessible without shrinking text or clipping.

In scope: chart readouts, plots, axes, controls, inspection and category key.
Out of scope: product page headings, card shells, beige substrates, rounded
frames, hero gradients and universal host spacing. Lab explanations, fixture
limitations and source notes live outside the candidate, in plain lab chrome.
A neutral review canvas may provide spacing, explicitly not host design policy.

## Recommended presentation contract

### Metric readouts

- Use ordinary metric label/value roles, not heading roles chosen for size.
  First candidate: supporting 14px metric descriptor and body 16px financial
  value, with primary foreground and tabular numerals; judge against Overview's
  existing 16px financial row. This is a proposal, not a new accepted type scale.
- Standardize descriptors: Price, APY, Supply, RSR staked. Keep hyUSD identity
  explicit in chart context/readout; never hide it solely in a lab note. Price
  remains USD per hyUSD; Supply remains hyUSD units; staking remains USD value,
  not a token quantity. Do not imply all upward movements are investment gains.
- Keep units/identity visible during inspection. Date gets its own supporting
  role, not the unit's slot. Permit natural wrapping, preserve line rhythm, use
  no oversized fixed-width number or date reservations.
- Keep current precision and calculations unless a separate presentation-only
  precision proposal is explicitly reviewed. Axis labels must remain distinct.

### Typography audit — 12px use

Every 12px use in next-families was inventoried against `v1TypographyUsage`.
Auxiliary is reserved for space-constrained chart labels or truly auxiliary
metadata, not all text that happens to appear near a chart. Current corrections:

- Metric units/explanations and the selected-point date in
  `metric-line-chart.tsx`: use supporting 14px/20px, not auxiliary 12px. These
  explain the main value and are not spatially constrained axis annotations.
  Inline units sharing a financial-value row follow that row's size/line height.
- Portfolio header date in `portfolio-history.tsx`: supporting 14px/20px for
  the same reason; it distinguishes the inspected historical total from current.
- Portfolio category names and amounts in `portfolio-legend.tsx`: use a matched
  14px/20px compact label/value pair, differentiated through weight/foreground,
  not 12px to make five categories fit. Ordinary Yield financial readouts remain
  body 16px; Portfolio's primary total follows the page-level emphasis below.
  If the key cannot fit, change its layout instead of reducing its type.
- X/Y tick labels in both plots: 12px remains an intentional candidate for the
  genuinely constrained axis role. Validate legibility, contrast and edge fit
  against the existing family; this is not permission to shrink controls or
  readouts, nor to hide required axes on these chart families.
- Disabled-range/CSV explanations: supporting 14px rather than 12px; required
  explanations must be readable. Lab-only limitations belong outside the
  candidate where appropriate, without losing association with the control.
- Lab scope/simulation/provenance paragraphs in `review.tsx`: supporting 14px
  for readable explanatory copy, especially simulated-data warnings. Only a
  separately isolated, secondary capture timestamp could justify auxiliary;
  do not style the whole paragraph at 12px because it includes a timestamp.

Add an explicit role inventory to the pilot receipt: each retained 12px use
names its purpose and rendered evidence. Check both default and hover states,
both themes and mobile; do not run a blanket 12→14 replacement across other
charts or change typography tokens/shared defaults.

### Geometry and axes

- One owner defines the candidate's content axis. Plot bounds, tick-label bounds
  and control bounds are separate measured relationships, not nested guesses.
- Fit the right-side axis to actual formatted labels and their breathing room;
  avoid a fixed oversized blank strip. Align visible outer labels/controls to a
  deliberate right edge without shrinking the data domain or changing samples.
- First/last X labels must stay within the intended inset. Use endpoint anchoring
  only where those ticks are at the plot boundaries; preserve accurate position
  for interior ticks. Prefer fewer intermediate ticks on narrow widths to clipping,
  rotating labels, or increasing plot padding indiscriminately.
- Pressure-test dates and units before proposing a reusable chart-family rule.
  Do not refactor existing Overview/Home renderers just to share an abstraction.

### Portfolio history

- The user identifies this as a large opening page composition, not a peer of
  the small Yield metric panels. Make the total the dominant page-level readout
  and the descriptor subordinate; do not enlarge the descriptor to compete with
  a DTF identity title, or copy Yield's 16px total onto Portfolio. Propose a
  responsive scale from existing foundation values, with honest value semantics
  rather than choosing a heading recipe solely for its size. Exact scale and
  weight remain candidate decisions, not a global typography contract. Test
  realistic large totals and inspection changes without oversized reservations.
- Move timespan controls below the plot, matching Overview and Yield. Top-right
  has source precedent, but no identified Portfolio-specific job requires it.
  Keep the full set of available periods, their meanings and reset behavior.
- Keep a single primary total in the candidate readout, explicitly identifying
  current/resting versus inspected historical value. Remove the bottom Total
  and divider only when the selected-date total is visibly available above.
  Do not remove a dated total from a retained-tooltip variant whose header
  remains current: those two values can legitimately differ.
- Replace the wide balance-table grid with a compact category key: small markers,
  names and associated amounts together, consistent order, no stretched
  name/value gaps, no separate summary row. Prefer wrapping whole items; use a
  compact vertical key on phones rather than an uneven forced three-column grid.
- Proposed resting key identifies series; during inspection it includes category
  amounts alongside the same selected-date total. Render and judge both states
  before choosing whether amounts should also remain visible at rest.
- First expose source behavior explicitly: total-area resting and inspected
  composition states. Do not promote today's permanent stack as the replacement
  interaction. Frozen lab states can demonstrate both until interaction scope is
  approved; no changes to production mouse/touch behavior or return derivation.
- Preserve production category identity and stack order as the starting reference.
  Propose a named categorical mapping separately, using existing approved tokens
  where suitable. Where no approved token fits a source hue, show that as a
  specific palette gap for approval; do not paste raw colors, reuse feedback
  success/danger semantics, or globally redefine chart-1…chart-5. Labels accompany
  color; evaluate adjacent fills in both themes and under color-vision pressure.

### Overview separator

- Add a muted dot between ticker and change when they share one desktop line,
  with equal gaps around both separators and arrow attached to percentage.
- No dangling dot when the change wraps. Preserve ticker visibility, compact
  header inspection, responsive title size and mobile axis policy. Do not invent
  hovered return values; existing headline return remains withheld on inspection.
- Apply only to the named lab Overview readout; do not sweep production or Home
  into a new layout merely because they contain the same values.

## Non-goals

No production migration, SDK/API/RPC work, source replacement, on-chain math,
historical valuation repair, live-point reconciliation, range redefinition,
resampling/interpolation change, derived returns, theme-wide palette change,
candle interaction repair, pie/factsheet expansion, or new universal chart API.
No checkpoint, commit or production adoption is authorized. Delegated owners
have disjoint source/test paths; the coordinator owns integration and this plan.

## Slices

1. Readout and geometry pilot: one captured Yield Price chart, neutral wrapper,
   metric roles, persistent units/date and deliberate axes/controls edges. Show
   desktop/mobile and inspection together. Implemented by the delegated owner;
   coordinator inspected source/main mount/mobile evidence and protected hashes.
   [Pilot receipt](price-pilot/README.md): browser20/20, fixtures7/7, types/lint.
   Human visual review remains required for acceptance; overnight approval now
   permits provisional reuse in the remaining Yield candidates.
   Follow-up approved: compact value · hyUSD, a plain review-only content
   background without added padding, capture/24H/1Y limitations outside the
   candidate, and four-decimal selected values (resting headline unchanged).
   Underlying samples, CSV precision, range filtering and sibling charts stay
   unchanged. Fresh follow-up evidence is owned by the same pilot receipt.
   Subsequent explicit correction: review surface owns 24px top/bottom padding;
   existing horizontal insets stay single-owned. No chart/control changes.
2. Portfolio composition pilot: source-state comparison, bottom periods, one
   appropriately labeled total, compact category key, explicit palette proposal.
   Authorized as a candidate; palette/interaction choices stay visible human
   decisions, not accepted authority from worker discretion.
3. Apply the reviewed Yield treatment to APY/Supply/Staked RSR; add the Overview
   separator and run the combined review. Authorized with predecessor comparison
   and visual correction before handing the result to the user.

Use a fresh bounded implementation owner after launch approval, with one owner
for the overlapping new-family files. Coordinator owns the design brief,
predecessor comparison, returned-code review and final integration. Do not
delegate vague instructions to "make it design-system compliant."

### Authorized chart completion scope and ownership

Status: authorized for Priority execution. [Execution receipt](completion/README.md) owns worker paths,
verification and returned results. Continue the existing active chart stage.

Prioritize a strong, coherent chart review over maximizing component count.
Approval authorizes lab candidates and verification, not
human visual acceptance, new shared defaults, production migration or financial
changes. Keep the current preview running; no commit/checkpoint is implied.

1. Chart owner: finish the remaining Yield metric candidates using the Price
   pilot's measured geometry and role decisions, preserving each metric's units,
   precision and source limitations. Bring Portfolio to a complete candidate
   using its distinct primary-total hierarchy and source-state comparison.
   Treat the latest pilot as a provisional working reference, not an accepted
   baseline merely because other candidates reuse it.
2. Chart refinement owner, assigned at launch: the candle tooltip is a must-fix,
   retaining its small two-column OHLC layout and readable timestamp. Apply the
   accepted floating-surface recipes, 8px radius, compact spacing and typography
   through a lab-only presentation or explicit opt-in, preserving production
   defaults, full payload, timestamp meaning and interaction behavior. Do not
   enlarge or redesign it. The old dispatch remains unconfirmed; no result was
   found in the bounded September 15 task/worktree check. No replacement sidebar
   task is needed: this slice belongs to the chart workstream, with isolated
   lab-owned output. Any late old-task delta requires reconciliation, not an
   automatic merge. This does not claim the old task was cancelled.
   Include the agreed Overview separator. For the Home highlighted-card name,
   test a lighter supported title treatment at the existing 20px size without
   changing its layout or every panel-title default; do not substitute a
   supporting-copy role merely to obtain its weight. Any added title variant is
   an explicit opt-in candidate, not a new accepted global rule.
3. Coordinator:
   Compare actual rendered results with Overview/Home and the user feedback,
   repair visual defects, then verify the final combined surface. Integration,
   catalog/review wiring and shared documentation have one owner.
4. Independent [Claude packet](../design-system-small-components-overnight.md):
   strong opt-in lab drafts for Toast and Progress,
   grounded in their catalog entries and actual consumers. Slider starts with
   its three-consumer need assessment; build a draft only if that establishes a
   distinct reusable job. Do not invent upload flows, progress percentages,
   financial constraints, automatic notification lifetimes or transaction
   outcomes as if they were product facts. Proposed policies remain explicit.
   Retain installed behavior primitives; do not migrate consumers or alter
   shared defaults. Use an isolated worktree/preview and return a bounded patch,
   realistic states, verification evidence and remaining decisions. No edits to
   chart files, accepted foundations, current-review/catalog wiring or shared
   ledgers; provide integration notes for the coordinator instead.

No duplicate candle task, upstream package work, transaction restart, generic
stepper/asset-picker/amount-field redesign, deferred Combobox/Breadcrumb work or
speculative Drawer promotion. Pie/allocation is the next chart family, not a
prerequisite for repairing the current set; prepare a source-grounded brief only
if the primary chart work and final verification are complete. Factsheet stays
excluded pending confirmation of use.

Final verification and a repair pass take priority over optional breadth. Review
ordinary-sized desktop/constrained/mobile renders in both themes, resting and
inspected states, long values, exact axis bounds, keyboard behavior, touch-scroll
safety, range/CSV behavior, empty/reset states and header/footer spacing. Test
reports alone do not establish visual readiness. The morning handoff provides
direct links, changed/preserved boundaries, a short review order and only the
remaining genuine human choices. Sensitive unknowns stay in the engineering
handoff, not hidden in lab notes or silently implemented.

## Acceptance evidence and test seams

- Review scope is visually unmistakable: no icon/beige host surrounding studies;
  provenance/limitations remain plainly available outside chart examples.
- Labels, values, units and date retain correct roles in resting/inspection/empty
  states; no heading recipe used solely to enlarge ordinary financial values.
- Actual text bounds at both axis ends and right edge are checked at 320, 390,
  constrained desktop and wide desktop, in light/dark. Include long names,
  large/negative/zero values and narrowly separated price ticks as visible cases.
- Portfolio shows the correct selected timestamp and category sums, no redundant
  same-time total, and deliberate source category order. No clipping/truncation
  hides category identity. Legends do not rely on color alone.
- Range selection, exact pointer/keyboard readout, exit restoration, CSV contents,
  unsupported touch disclosure and Empty/Default remain covered. Separator tests
  cover same-line/wrapped/inspection states without new financial calculations.
- Inspect ordinary-height screenshots and live interactions beside Overview/Home;
  explicitly record hierarchy, density, axis edges and footer balance, not just
  overflow/test passes. Preserve each precedent strength or explain its removal.
- Scoped unit/browser/type/lint verification and docs housekeeping follow the
  bounded design-system cadence. User acceptance remains separate from checks.

## Unresolved decisions and strongest counterargument

The exact categorical palette is not accepted; current generic tokens have no
category rationale. The proposed persistent-header/inspection-key Portfolio
treatment must be reviewed against its source resting/hover behavior before
implementation is treated as a replacement. Whether resting amounts earn their
space is decided from that compact candidate, not assumed from the current grid.

Strongest case against simplification: removing the tooltip breakdown could lose
historical total/category meaning, and making typography uniform could erase
useful metric emphasis. Guard against this by comparing current and inspected
states explicitly, retaining all values, and reviewing one pilot before rollout.
The plan does not claim these proposed designs have already passed visual proof.
