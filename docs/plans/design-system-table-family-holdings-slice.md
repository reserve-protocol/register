# Table family: Exposure / Collateral candidate

Prepared 2026-09-09 from direct source inspection. This is the next bounded
review slice, not acceptance or production adoption. The position/withdrawal
[checkpoint contract](design-system-table-family-first-slice.md) remains separate;
its 16px desktop header spacing is still provisional.

## Goal

Extend the shared cell review with allocation, underlying/wrapped identity and
metadata, then validate those cells in the actual Holdings job. Retain the
Exposure/Collateral distinction and useful mobile hierarchy without copying
legacy type, spacing or control inconsistencies.

## Active implementation contract

Fixed point: `adef9ee76`, on the inspected in-progress `design-system-v1` tree.
One bounded lab composition stage; no shared-default or production changes.
Use existing DataTable sorting, canonical identity/metric/help/action owners and
the local table-family vocabulary. Reject a new universal table API or a second
hand-built sorting controller. Preserve source copy; lab controls describe fixture
conditions and do not mutate product state. Internal previews need no product
analytics events.

Journeys: compare underlying assets by Weight or Price Change; switch to the
held tokens and inspect bridge details; expand a long basket and narrow the
container without losing the chosen sort. Recovery: independent performance
loading resolves without replacing identity/allocation; unavailable is not zero.
Empty fixtures do not invent product error copy.

Hierarchy: identity and allocation first; period-qualified performance and market
cap support comparison. Row owns 24px outside inset, 12px desktop / 24px narrow
vertical inset; identity owns its mark gap; facts own 4px label/value gap. Narrow
records pair the name with allocation, then group compact logo/ticker metadata
with Price Change and Market Cap. Below 512px available width, metadata spans
its own line above the two financial facts.
Start the four-column threshold at 768px available width and pressure-test both
sides before retaining it. The existing Portfolio threshold stays unchanged.

Proof: direct source interactions before composing; mounted tab/sort/expansion,
zero/unavailable and bridge-trigger tests; light/dark 320/375/768/1400px browser
checks and a constrained column. Grade source fidelity, hierarchy, continuity,
canonical reuse and simplicity. Long names / independent loading are visible
pressure cases, not held-out evidence. Bridge modal is retained production
reference, not redesigned or approved by this table review.

## Direct source map

All paths below were read by the implementation owner, not inferred from the
outside research report. Paths are relative to
`src/views/index-dtf/overview/components/basket-overview/`.

| Owner | Behavior that must survive |
| --- | --- |
| `index.tsx`, `basket-table-header.tsx` | Exposure/Collateral tabs; default Weight descending; Weight and Price Change sorting; sort and expansion reset on tab switch. Sort full rows before limiting. Desktop ordinary view is unlimited; mobile caps at ten. The separate progressive desktop shelf is an optional composition, not a required table control. |
| `exposure-rows.ts`, `exposure-table-rows.tsx`, `mobile-exposure-rows.tsx` | Native crypto aggregation, multiple-source count, NASDAQ/NYSE groups flattened into per-stock rows, exchange-formatted symbols. Exposure records are informational, not token-explorer links. |
| `collateral-table-rows.tsx`, `mobile-collateral-rows.tsx` | Actual held token identity, explorer destination, bridge-details trigger where eligible. Weight, time-range Price Change and wrapper Market Cap. |
| `performance-cell.tsx` | Fractional changes formatted as percentages; loading, zero, positive, negative, unavailable, and newly-added explanatory help for the selected period. No invented performance provenance. |
| `market-cap-cell.tsx`, `exposure-rows.ts` | Underlying company/native-asset market cap in Exposure; held-token market cap in Collateral. Do not merge these into one data source merely because the cells look alike. |
| `bridge-label.tsx`, `bridge-info-dialog.tsx` | Compact Bridged trigger opens reference/held-asset details and risks. Missing bridge metadata and wrappedVersion suppress the trigger. Native reference, chain, provider, address/copy, explorer, docs and risks are distinct information/actions. The modal itself is not automatically approved by table review. |
| `use-basket-overview-data.ts`, skeleton components | Independent basket/performance loading, rounded-zero-weight filtering, settled empty versus unavailable data, real data fallback paths. See limitations below before rendering a candidate. |

## New cell/state coverage

Add to the consolidated gallery, then consume in Holdings anchors:

- Allocation percentage alongside identity; zero/tiny/large values without a
  gratuitous progress visualization.
- Plain underlying identity, exchange-qualified stock identity, grouped source
  count, and linked held-token identity with optional bridge metadata.
- Period-qualified performance with newly-added helper, separate performance
  loading, genuine zero and unavailable values.
- Same Market Cap visual vocabulary with explicit source meaning in fixtures:
  underlying and wrapper values must deliberately differ.

Reuse existing identity, metrics, performance, Link/InlineAction, Help, tabs,
menu and loading owners. Do not add a universal table API or dense typography.
Do not make informational Exposure rows clickable merely for consistency with
Portfolio rows. Inspect component contracts before implementation.

## Responsive direction to test

Use the product's identity/allocation-first narrow hierarchy as evidence, not a
pixel specification. Supporting facts should retain one consistent anatomy.
Use available container width, not viewport width, and determine the threshold
from the four-column composition. Do not inherit the seven-column Portfolio
1024px threshold blindly. Preserve desktop Weight/Price Change sort behavior;
the product currently has no visible mobile sort affordance, which is an
explicit candidate improvement if the Sort by treatment is adopted here.

## Evidence before implementation

The [existing direct observation](design-system-table-family-evidence/index.md)
already covers ordinary Exposure/Collateral switching and captures at
375/639/640/1400px in both themes. It does not prove sort, expansion, bridge
details, loading, empty states or the exchange/source-count branches.

Before composing the full next review, directly exercise desktop sorting and
tab-reset behavior, bridge open/close and keyboard return focus, and a fixture
with more than ten rendered rows. Capture both a crypto grouping and an exchange
stock; preserve source identities rather than using decorative mock data.
Retain the code/fixture/route/state links next to each new specimen.

The owner exercised the real overview composition using CMC20 and PHOTON replay
fixtures before implementation: desktop Weight/Price Change sorting, tab reset,
CMC20 mobile ten-row expansion preserving the leading records, and keyboard bridge
open/Escape close. Three checks passed; six screenshots and their public source
digest are retained in [the source record](design-system-table-family-evidence/holdings-source-2026-09-09/record.json).
The source dialog did **not** return focus to its trigger. The candidate owns its
return-focus behavior locally; production is unchanged. A missing NASDAQ logo is
explicitly fulfilled as 404; source captures contain logo fallbacks and are not
logo-quality evidence. The chart resolves its period asynchronously, so expansion
compares asset identities rather than treating a period-label change as reordering.

## Candidate implementation and data boundary

The new local `table-family/holdings-review.tsx` composes the existing DataTable,
cell-gallery framing, EntityIdentity, typography, numeric/performance, contextual
link/action, tabs, sort menu, help and loading owners. No new canonical Table API
or production defaults. The Portfolio anchors remain unchanged apart from local
sorting/focus helpers shared with this candidate.

`holdings-snapshot.json` is a reduced literal copy of `e2e/snapshots/bsc/{cmc20,photon}/`
exposure and chain-state fixtures: identities, weights, fractional changes, bridge
metadata and distinct held/underlying capitalization. The lab does not recalculate
baskets or represent these values as current prices. Performance is a fixed 7d
preview; production period integration remains with the chart/data owner.
Long names, a two-source count, new-asset help, zero and unavailable branches are
explicit synthetic conditions, not claims about those real assets. The source-count
sample exercises identity presentation, not the SDK's aggregation algorithm.

Mobile sorting is a deliberate local usability improvement over the source's
missing mobile affordance: it uses the same TanStack state and two sortable fields.
Ordinary desktop remains unlimited; narrow preview limits to ten **after sorting**.
Switching tabs or baskets resets sort/expansion; changing preview conditions does not.
The legacy bridge dialog is imported as a reference with explicit unreviewed status.
Its cross-feature import needs engineer review before any production adoption.

## Review reconciliation

One bounded independent Intent/Engineering review found no semantic or scope
blocker, but identified two keyboard-continuity gaps. Both were confirmed and
fixed locally: new-asset help now has a projection key without changing the shared
HelpTooltip API; bridge return retains a stable container and chooses its visible
sort control if the original row was removed by the narrow ten-row limit. The
late-row bridge case failed in the browser before this fix. Active links beyond
row ten instead retain an expanded list when resizing, so an in-use row is not
removed. Tests cover both behaviors and both themes.

No new workflow rules or enforcement layer: the findings belong in the local
implementation and regression checks. The screenshot review also caught needless
symbol truncation beside Bridged at 320px; supporting metadata now wraps within
the identity instead. The original Portfolio header-spacing trial stays unchanged.

## Non-goals and unresolved issues

- No production migration, SDK/amount-math change, charts, auction rich records,
  live wallet calls or bridge modal redesign in this slice.
- Current code uses `change ?? 0` for collateral mapping, truthiness for market
  cap display, and desktop empty arrays enter a skeleton branch while mobile
  empty arrays render no rows. These are source-level inconsistencies, not
  verified live defects. Document adapter requirements; don't silently change
  financial truth in a design pass or label a permanent skeleton as good UX.
- The two mobile skeleton variants have different supporting-column coverage;
  candidate skeleton geometry must match its own resolved layout.
- Any new empty-state wording needs explicit copy review; existing labels and
  help copy should be carried from source.
- Do not promote the optional progressive frosted shelf or legacy modal styling
  into system guidance through proximity.

## Completion boundary

Checkpoint 2026-09-09: implemented and reviewable, **not accepted or adopted**.
The initial [candidate record](design-system-table-family-evidence/holdings-candidate-2026-09-09/record.json)
retains 26 selected screenshots and all eight case receipts under one public source
digest; these captures precede the header-tab trial below. Six Holdings cases cover light/dark 320/375/1400, with 767/768 available-width
checks inside desktop cases; two existing Portfolio cases guard shared local focus
and sort behavior. The source record above remains the separate before-composition
observation, not a claim that production implements the candidate.

Fresh checks: mounted Holdings/Portfolio/catalog/DataTable 56/56; app and E2E
types; scoped oxlint and formatting; browser 8/8. All 27 literal fixture rows and
bridge metadata were independently compared to the replay source JSON. Inspected
ordinary desktop/mobile, stock/crypto, long-content and breakpoint captures;
logo fallbacks in mocked captures are not visual acceptance of the real assets.
The retained proof does not cover live RPC/price correctness, chart-period wiring,
physical touch devices, screen-reader sessions, the bridge modal's full behavior,
or production adoption. The skeletons demonstrate the candidate anatomy, not
exact future live-data row-height prediction.

Next human review: compare the individual cells, then CMC20/PHOTON Exposure and
Collateral, including constrained width and new-asset help. Keep the 768px threshold,
ordinary row rhythm and header-spacing trial provisional. **Engineer review required**
before reusing the cross-feature bridge reference or adopting the adapter/column
contract in production; current data fallback inconsistencies remain outside this
design-only change.

### Controls, metadata and loading refinement — 2026-09-10

The stacked Holdings row divider now starts at the 24px left content axis and
ends at the card's right edge, matching the existing Portfolio position and
withdrawal rows. Content retains 24px padding on both sides; the row owns that
padding independently of its divider. Desktop rows, header/section separators,
historical studies and lab administration tables are outside this change.
The [divider-edge check](design-system-table-family-evidence/row-divider-edges-2026-09-10/record.json)
passes all eight Holdings/Portfolio cases at 375/1400px in both themes, including
constrained rows. E2E types and scoped lint pass; the live 390px preview was
visually inspected. No padding or shared default changed.

The constrained-column review toggle now caps the Holdings preview at 390px
(previously 576px), using an iPhone-width target to inspect two-line names. Only the lab
host width changes; responsive row rules and the unconstrained table stay intact.
The live review client shows MACOM's exposure name wrapping onto two lines.
Earlier retained captures below preserve their original preview width.

User-authorized local refinements, superseding the narrow control placement in
the earlier captures. Below 768px, use canonical default 44px/full-width tabs.
After phone-width review, tabs fill the space beside a canonical quiet 44px
icon-only sort button at every narrow width, with an 8px gap. The active field
stays in the accessible name and the menu marks both selected field and direction;
the direction is also reflected in the sort icon. This replaces the earlier
second-line text trigger. Desktop header tabs stay compact.
The toolbar has no extra bottom padding: the first row's existing 24px top
padding owns the full controls-to-content gap (previously 32px combined).
Empty fixtures retain the matching tab presentation without an unusable sort menu.

Below 512px, the name-to-metadata gap is now 8px, followed by 16px before the
financial facts. The 512–767px three-group detail layout keeps its 16px gap from
the name block. This groups phone identity content without changing wide rows.

Refinement proof: [seven browser cases and seven captures](design-system-table-family-evidence/holdings-inline-sort-2026-09-10/record.json)
pass in both themes, including 320/375px viewports, the 390px constrained preview,
breakpoint transitions and the selected sorting field. The new geometry check
failed on the preceding text trigger (63.625px instead of 44px) before implementation.
Both mounted table-family test files pass (18 tests), as do app/E2E type checks
and scoped lint. The refreshed live 3005 client was inspected with the sort menu
open, then left on PHOTON/long-content/constrained Exposure with the menu closed.
This changes only lab presentation, with no new analytics event or production adoption.

Holding metadata separates independent ticker and Bridged items with a muted,
decorative middle dot. Keep the dot with the following item when wrapping; do not
insert one into attached qualifiers such as `(2 sources)` or across stacked lines.
The shared local metadata renderer applies this to both row projections and the
cell gallery. Bridged keeps its neutral supporting text with a persistent subtle
underline, stronger hover/focus treatment and the existing keyboard interaction.
This is a scoped inline-metadata pattern, not a mandate to add separators to every
supporting-text composition in the app.

Collateral-name external arrows reserve their space, appearing on hover or
keyboard focus for wide rows with a fine/hover-capable pointer. Narrow rows and
touch pointers retain visible arrows. External announcements and destinations are
unchanged; the canonical Link's existing icon slot owns the visual substitution.

The local identity skeleton uses 16px/12px bars centered in the existing 24px/20px
line boxes: an 8px visible gap without increasing the 44px text stack. Holdings
and Portfolio consume this same local cell. Other loading primitives, table data,
production consumers and shared component defaults remain unchanged.

Prior proof (before the icon-only toolbar and tighter identity grouping):
[seven browser receipts and eleven captures](design-system-table-family-evidence/holdings-controls-metadata-2026-09-10/record.json)
cover light/dark phone, wide and constrained rows, both 511/512 and 767/768 bands,
long names, open sorting, bridge keyboard return, skeleton geometry, fine-pointer
hover/focus and emulated touch. The narrow tab-height check failed at 32px before
implementation and passes at 44px. Added explicit narrow-arrow checks after the
visual comparison; the final run passes 7/7. Holdings/Portfolio mounted tests pass
18/18, app/E2E types and scoped lint/formatting pass. The live 3005 review client
was also inspected with its existing PHOTON/long-content/constrained state intact.
Physical-device, screen-reader, live-data and mocked-logo limits still apply.
The scope dry-run's high/shared signals include preceding consolidation changes;
this pass stays low/domain-local under the bounded-lab cadence, not a claim that
the complete dirty-checkout integration gate passed.

### Narrow hierarchy trial — 2026-09-10

User-directed revision after long-name review: name and allocation lead the row;
allocation uses neutral 16px/500 type and retains a screen-reader Weight label
without a repeated visible label. Move the 20px mark, symbol and bridge/source
metadata below the name. At 512–767px available width these sit beside the two
financial facts; below 512px metadata owns a full-width line. The existing Symbol
label from the product appears only in the three-group layout. All wording comes
from the existing source; data, links, actions, shared defaults and desktop
geometry are unchanged.

Both compositions reuse local name, mark and metadata renderers, preserving native
versus held-token meaning and bridge eligibility. The original 16px name-to-details
gap is superseded below 512px by the refinement above; retain the 24px outer inset
and existing narrow row divider. This is local
composition work, not a new EntityIdentity variant or a universal table breakpoint.
Earlier captures below precede this narrow-layout revision.

Fresh proof: [six browser receipts and ten selected captures](design-system-table-family-evidence/holdings-narrow-hierarchy-2026-09-10/record.json)
cover light/dark 320/375/1400, 511/512 and 767/768 container transitions, long names
including MACOM, independent loading and existing keyboard continuity. The narrow
allocation-weight assertion failed at 300 before implementation and passes at 500.
Holdings mounted tests pass 5/5; app/E2E types, scoped lint and formatting pass.
Inspected constrained MACOM, dark phone, loading and unchanged desktop captures.
This remains a trial; mocked-logo, live-data, physical-device and screen-reader
limitations above still apply.

### Desktop row-spacing trial — 2026-09-09

User-directed local trial: desktop Exposure/Collateral cells use 12px top/bottom
padding, producing 24px between ordinary two-line identity blocks. Keep the 24px
horizontal outside inset, existing typography, no desktop row dividers, and the
narrow layout's 24px padding and dividers. Portfolio and shared defaults stay
unchanged. Header-tab captures below predate this tighter row spacing.

The proposed continuous-table versus separated-record treatments remain a future
comparison for Discover/Earn, not new component variants or accepted rules. Their
choice should describe visual grouping, independently of whole-row navigation;
clickable Portfolio rows inside a shared panel are an existing counterexample to
a clickable/non-clickable split. Dense typography remains deferred.

Verified with [six browser cases and selected captures](design-system-table-family-evidence/holdings-row-spacing-2026-09-09/record.json):
light/dark 320/375/1400, including available-width transitions and existing state
checks. Rendered padding assertions confirm 12px desktop and 24px narrow; ordinary,
long-content and narrow captures were inspected. Scoped lint and E2E types pass.
This is a spacing trial, not acceptance; mocked-logo and live-data limitations persist.

### Header-tab trial — 2026-09-09

User-directed refinement: retain Exposure/Collateral tabs in the first header
cell at wide widths, centered with the other header labels. Use canonical compact
tabs (32px track, 14px/500 labels), without a separate Holdings title band. Narrow
layouts place the same control above the records and Sort by control. Keep the
existing 24px outside inset and provisional 16px header bottom inset; no shared
table or tab defaults change.

The two responsive projections have unique trigger IDs, one visible tab strip,
and a named controlled panel. Keyboard focus survives tab-driven sort/expansion
reset and crossing the 768px boundary. Empty fixtures retain the tabs. These are
local composition responsibilities, not a new table API or system-wide acceptance.

Fresh proof: [six browser receipts and ten captures](design-system-table-family-evidence/holdings-header-tabs-2026-09-09/record.json)
cover light/dark 320/375/1400 plus 767/768 container transitions. The wide header
placement assertion failed before implementation and passes now; measured tabs are
32px with 14px/500 labels and centered within 1px of the Weight control. Holdings
and Portfolio mounted tests pass 18/18; app/E2E types and scoped lint pass. Inspected
wide and narrow captures in both themes; keyboard-focused captures deliberately
include a focus ring. Mocked logo fallbacks are not logo-quality evidence. Previous
live-data, physical-device and screen-reader limitations remain unchanged.

The implemented Exposure/Collateral candidate remains available alongside the
Portfolio anchors. The next independent expansion is
[Discover browsing cells](design-system-table-family-discover-slice.md); it does
not promote Holdings trials to accepted defaults. Direct inspection precedes
new visual implementation; research alone is not sufficient evidence.

The Discover closeout reran the latest corrections against the expanded lab:
[15 passing predecessor cases](design-system-table-family-evidence/discover-predecessor-check-2026-09-10/record.json)
cover both themes at 320/375/1400 for Holdings/Portfolio, plus the existing
touch-pointer and Retina-badge checks. The 24px controls-to-content gap and
left-inset/right-flush gray dividers remain checked. This is regression
hardening, not additional human acceptance of the visual trials.
