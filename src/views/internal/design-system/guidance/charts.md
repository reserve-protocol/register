# Chart lab guidance

Read for chart lab or source-replay changes. Read the [common lab guide](../CLAUDE.md) first.
Code paths in prose are relative to the lab directory unless fully qualified.
These are scoped preservation requirements, not new design authority.

`charts/` starts from the actual Overview and Home renderers and a 90×40 Discover
sparkline. See the [source-reset contract](../../../../../docs/plans/design-system-charts-source-reset.md).
Source fidelity preserves chart strengths and mechanics, not legacy framing.
Overview uses a square flat surface, 24px header/footer inset and canonical
responsive page-title variant/body role. The Overview name opts into
`v1TypographyVariants.responsivePageTitle`; the fixed page-title default remains
unchanged. Home keeps square outer and inner corners, a 4px shell
inset, 24px content axis, 16px logo-to-name and 8px name-to-market
gaps with no hidden title-height reservation. Identity uses ChainBadgedLogo.
The gradient begins inside the thin surround and the plot spans its width.
These host roles never become universal chart-owned padding. The earlier
full-card foundation study retains historical framing, not the current delta.
Overview's optional `onInspect` updates the lab header from existing selected-event
payloads; no production caller adopts it. A local Jotai Provider isolates replay
mode. The provisional floating-tooltip mode omits the callback and supplies local
V1 tooltip content; omitted renderer props keep the production tooltip default.
Footer labels are explicitly frozen, not fake-wired range/type controls. PHOTON
headline and history captures are dated independently; do not reconcile them or
derive a new return.
The older generic renderer lives in collapsed technical pressure tests; passing
those does not certify Overview's production edge states or reduced motion.
Do not append live data, normalize returns, resample history or change production
chart types/defaults. Chart design and the optional readout seam remain unadopted.
The replay owns pointer-exit/blur restoration and suppresses touch compatibility
mouse/focus events; touch does not lock native page scrolling. Its first-tap proof
checks the selected timestamp as well as value after a hold and mode round trip.
The ticker stays visible during inspection; the unrelated headline return is
withheld until exit/blur. The existing financial slot stays compact, without
fixed-width price/date fields or a newly derived historical return.

The [feedback pass](../../../../../docs/plans/design-system-next-charts/feedback-pass/plan.md)
owns the active follow-up to the [completion receipt](../../../../../docs/plans/design-system-next-charts/completion/README.md).
That receipt verifies the preceding Yield/Portfolio and small-refinement candidates. Home's name
opts into the 20px light panel-title variant, not a global weight change.
Candles pass a local V1 tooltip through optional `tooltipContent`; production
tooltip defaults are preserved. Keyboard inspection and retained touch selection
are green for the reviewed lab candle seam, including native page scrolling.
Yield metrics use ordinary 16px values and 14px descriptors/date support;
Portfolio's primary dated total has page-level emphasis without becoming an h1.
Neutral review backgrounds are not approved host-card APIs. Portfolio category
colors remain provisional; do not turn them into a global palette. Source data,
periods, CSV and financial formatters are protected through this visual pass.

The reviewed Yield surface owns 24px top and bottom insets. Its range row uses
24px visual text-only controls with expanded approximately 44px usable targets;
the pseudo-element hit area does not reserve 44px control layout height. A quiet
20px CSV utility sits in the footer, centered with the range row and retaining an
expanded target. Below a 22rem chart container its visible label shortens to
`CSV`; at 22rem and wider it shows `Download CSV`. The accessible name remains
`Download CSV` at every width. Portfolio ranges are top-right from a 640px container and sit
directly above the plot on narrower layouts; the category key follows below the
plot. Its muted 16px descriptor sits 8px above the total, while the 14px date sits
8px below it. The Portfolio fixture explicitly uses UTC day precision at rest
and during inspection; future meaningful intraday callers may opt into UTC
minute precision. Yield inspection uses the same family-local formatter at UTC
minute precision. Precision is caller-owned, never inferred from cadence,
range, or timestamp digits. Composition inspection uses one vertical guide and a thin
supplied-total contour. Yield and Portfolio next-family plots use a local 4px
left drawing clearance while retaining the 24px content axis and right chart
margin. This is not an Overview, shared-renderer or host-inset rule.
Below a 32rem Portfolio container, each semantic key row spans the 24px-inset
content width with its dot/label term on the left and a non-wrapping tabular
amount on the right; labels may wrap and rows retain a 12px gap. At 32rem and
above, the same entries keep their compact flex-wrap layout with a 24px item gap
and an 8px term-to-amount gap.
Line endpoints use static line-matched dots with host-matched rings, centered
on the real final coordinate with drawing clearance; inspection replaces the
resting mark. These mean latest plotted values, not verified live prices.
Source renderer props remain opt-in, with production defaults preserved and
engineer review required before adoption. Mouse exit resets the Overview
marker/header together; lifting a finger retains the selected sample.

Yield and Portfolio finite periods use explicit fixture as-of timestamps and UTC
calendar windows, with available real-point bounds so routine capture limits do
not resemble missing history. The simulated Portfolio fixture explicitly models
known zero before its first holdings: YTD, 1Y and All expose that state, while 7D
and 1M remain post-holdings. This is not generic missing-data treatment. Production
currently hides finite periods older than the first positive Portfolio point and
does not synthesize or prepend zeros; unknown history must never become zero. All
uses the actual fixture minimum and maximum. Do not add sentinels, interpolation,
backward carry or generic zero-fill; the technical pressure fixture separately
owns interrupted data. Yield 24H stays disabled for daily capture and Portfolio
24H stays disabled for weekly capture. A resting endpoint mark belongs to the
latest real point. No production adoption is implied.

Keep Recharts axes as direct chart children. Its child parser does not execute
a custom axis wrapper component: types can pass while the axis and timestamp
marker disappear. Verify actual rendered ticks and marker coordinates, not only
the selected data attributes or fixture output.
