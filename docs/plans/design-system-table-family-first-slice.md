# Table family: first composition slice

Prepared 2026-09-09. **Active lab candidate, not an accepted table contract or a
production migration.** Read the [active plan](design-system-v1.md) for authority
and the [lab area guide](../../src/views/internal/design-system/CLAUDE.md) before
implementation. This brief applies the existing
[composition transfer process](../../templates/design/flow-composition-transfer.md);
it does not add a new workflow.

## Fixed point and scope

The [2026-09-11 independent-review reconciliation](design-system-table-family-reconciliation.md)
adds adoption requirements for numeric sort keys, missing values, preview limits,
keyboard access and the viewed-account withdrawal boundary. Production's
page-level loading gate is not covered by these section-level skeletons.
Near-zero sign/precision and non-RSR withdrawal fixtures remain open coverage.
The [Portfolio coverage review](design-system-portfolio-coverage-review.md)
maps the intentionally excluded sections, including current stakes/vote-locks,
and their remaining source/fixture work. The subsequent
[owned-position candidate](design-system-owned-positions-slice.md) adds current
stakes and vote-locks separately; the first slice itself is unchanged. Neither
candidate claims full Portfolio coverage.

### Whole-row navigation treatment

User-directed lab refinement (2026-09-11): when the identity and the row open
the same destination, keep title/supporting text neutral on hover. The row's
surface supplies pointer feedback; the native link and visible keyboard focus
remain. This applies to Index/Yield positions and Discover, and to hover-only
title accents in the rich governance/rebalance examples. Rebalance's explicit
selected state remains distinct. Separate destinations/actions—collateral
explorer links, bridge details, withdrawal sources, basket previews and section
navigation—retain their own affordances. This is not a blanket removal of link
styling, a shared Link default change, or production adoption.

The [source-bound check](design-system-table-family-evidence/row-links-2026-09-11/record.json)
retains seven passing browser cases: four all-family hover/focus cases across
390/1400px light/dark and three basket-trigger interaction rechecks. Twenty
selected images retain the affected hover/focus states. The pre-change desktop
case reproduced the three identity underlines and both rich-record title-color
changes; governance now uses surface hover instead of its former title-only cue.
Focused Portfolio/Discover/Holdings unit tests pass 22/22. This is scoped
self-reviewed styling evidence, not acceptance of the broader rich-record design.

### Hardening and expansion checkpoint

Goal: finish the bounded position/withdrawal hardening, retain current evidence,
then prepare the Exposure/Collateral review from directly inspected product
sources and rendered states. The 16px desktop-header spacing remains a trial.
This checkpoint addresses limit-before-sort, breakpoint focus transfer, narrow
sorting by hidden metrics, and stale review/evidence descriptions. No production
migration, transaction change, dense-table variant or universal row API.

Slices: (1) sort all eligible records before limiting; test loading and narrow
sort meaning, keyboard breakpoint continuity, refresh current guidance and
source-bound evidence; (2) directly inspect Exposure/Collateral code, fixtures,
states and interactions, then record the next slice's requirements and remaining
evidence needs before composing additional lab cells. Existing research is a
discovery map, not the implementation specification.

Acceptance evidence: mounted sorting/expansion/defaults tests; owned browser
light/dark phone/desktop and container-boundary runs with focus, menu and row
order assertions; retained screenshots and public-source digest. The table
instance continues to own sorting. Production's old slice-before-sort behavior
is documented as a separate adoption change, not silently edited.

### Constrained sorting follow-up

Base: adef9ee76, retaining the inspected in-progress lab changes. Replace
constrained column labels with one Sort by menu for positions; remove the lone
withdrawal header without adding new withdrawal sorting. Desktop headers and
TanStack sorting ownership remain unchanged. An optional DataTable toolbar slot
lets the lab access that same table instance without a second sorting state or
changing existing callers. No production migration, financial logic, analytics
event or expansion-order change. Verify field/direction selection, keyboard
return focus, sorting persistence across widths, hidden constrained headers,
desktop defaults, phone menu containment and light/dark rendered records.

### Collapsed record hierarchy trial

User review rejected the mixed stacked Value, horizontal Balance and detached
availability footer. Below the existing desktop threshold, identity and
withdrawal availability/action now share a wrapping header group. A separate
financial group follows at 16px: labels above values, Balance at the left and
Value at the right. Additional position metrics use the same stacked-fact
treatment in the existing intermediate band. Financial pairs wrap when their
intrinsic widths cannot fit; typography does not shrink. A wrapped availability
region starts at the header's left edge rather than forming a detached footer.
Its height and keyboard focus remain stable; a longer state may legitimately
move to the next header line. No new breakpoint, public API or production change.

Divided collapsed records use 24px top/bottom padding, matching their horizontal
inset. Desktop table rows retain 16px vertical padding; internal record gaps stay
unchanged. Section navigation aligns with the title's first baseline and wraps
below the title/subtitle group when width is insufficient.

Review the actual constrained 576px composition as well as 320/375px phones,
both Index and Yield, long content, loading and withdrawal state transitions.
Containment checks alone did not catch the previous incoherent grouping; the
browser seam now also measures labels above values, facts below identity and
availability before financial facts. These checks supplement visual judgment.

### Header spacing trial

Desktop anchors omit the header-to-body divider. Header cells wrap their
content rather than retaining DataTable's minimum height; 16px below the labels
and 16px above desktop first-row content provide 32px of combined inset,
matching the combined padding between ordinary desktop rows.
Collapsed records instead use 24px top/bottom padding, matching horizontal inset;
stacked-record separators use the same 24px bottom offset. Constrained headers
are hidden; positions offer the Sort by menu instead. This is a local
lab trial, not a shared DataTable default change. Browser checks measure both
the missing border and content-sized header height across the projection bands.

### Combined Withdrawal column

User-authorized bounded lab follow-up: replace separate Progress and Action
columns with one right-aligned Withdrawal region, on desktop and stacked mobile.
Cooling down shows the ring and “Available in …”; eligibility exposes Withdraw
without a duplicate Ready pill; submission shows spinner/“Withdrawing…” and a
simulated receipt shows Withdrawn. Only the ready state contains a button.
Retain compact button sizing and content width at every width; the region keeps its
height through transitions; the desktop right edge is stable, while collapsed
headers allow content-driven wrapping. Keyboard activation transfers focus
to the persistent feedback region, whose updates are announced politely.
Eligibility and lifecycle remain separate fixture inputs. This is not a generic
Table API: keep separate status/actions when both carry independent information.
Wallet/network/prepared-call gates stay product-owned and must not be mistaken
for cooldown readiness during adoption. No live transaction changes or analytics
are introduced. Mounted state transitions and light/dark phone/desktop browser
checks, including keyboard focus, are the acceptance seam; visual review remains
separate.

### 32px identity spacing trial

User-authorized medium shared-geometry trial, fixed point `adef9ee76` on the
inspected in-progress tree. EntityIdentity uses 12px between a direct 32px
ChainBadgedLogo mark and its copy; smaller and unclassified custom marks retain
8px. The logo exposes its size as a DOM attribute; the identity owns the gap,
without React child inspection or per-table overrides. The 32px table loading
placeholder mirrors the 12px gap. No badge, typography,
vertical text spacing, logo-stack, transaction mechanics or legacy wrapper changes.
Acceptance: browser measurements for single/two-line and compact identities,
both themes and phone/desktop table containment. New geometry is a visual trial,
not accepted migration policy; shared engineering review remains at closeout.

### Source actions and column rhythm follow-up

Medium, fixed point `adef9ee76`, on the inspected in-progress tree. Source
navigation becomes an opt-in neutral contextual Link/InlineAction with a
directional cue; existing shared defaults and destinations stay unchanged.
Withdraw uses compact 32px height at every width, matching the logo's horizontal
centerline in collapsed rows. The user explicitly chose this bounded table-action
exception to the ordinary mobile default-size guidance; it is not a new Button default.
Independent desktop columns get at least 24px separation, with matching header
axes and 24px outside insets. Natural table sizing keeps content pressure visible.
Related tables share spacing and compatible column structures, not forced empty
tracks: Positions ends in Value while Withdrawals has a trailing Withdrawal region.
Exact page-wide financial axes remain a page-composition decision, not a new
universal grid contract. No dense variant or production migration is included.
Prove defaults and opt-ins with mounted tests, and source/action type, responsive
heights, gaps, wrapping and processing continuity in light/dark browser checks.
Internal fixture interactions do not require product analytics. Visual acceptance
and shared opt-in engineering adoption remain separate review boundaries.

The source/gutter follow-up passed 36 focused mounted tests and eight
source-bound browser cases. Subsequent user review rejected the local button
minimum widths: table actions must wrap their actual label/icon with canonical
Button padding. The later mobile sizing review uses compact height throughout;
width may change when content changes, while the right edge stays aligned.
Column allocation—not stretching the button—owns any space for the action.
The regression compares actual and intrinsic width for the available button;
the combined region then preserves height/alignment when replaced by feedback.
Existing 24px minimum Value–Withdrawal separation, 16px desktop vertical padding and
24px outside insets remain.
Those earlier follow-ups used bounded verification; the current hardening
checkpoint separately records the final full-repository gate.

### Active implementation contract

2026-09-09: authorized as one bounded, medium lab slice. The user can compare
ordinary positions, then see a pending withdrawal become ready, enter a
non-executing processing preview, and inspect a simulated withdrawn state.
The lab controls own fixture selection; they have no wallet authority. Product
navigation remains separate from withdrawal actions.

Use the existing DataTable for sorting and row rendering, canonical identity,
metric, performance and action owners for cells, and a local responsive
projection. Reject a new universal Table/Row API: these two records do not prove
its requirements. Reject a gallery-only deliverable: it cannot prove scanning,
wrapping or nested action isolation. No production adoption or shared-default
change is included.

Acceptance: focused mounted tests for zero/unavailable values, full-list sorting
before the five-row preview limit, append-only expansion, navigation and action isolation; source-backed production
captures; light/dark desktop and narrow lab captures including constrained
containers, keyboard operation and loading. Grade source fidelity, single-owner
geometry, readable hierarchy, state continuity and component reuse. Long names
and large amounts are visible pressure cases, not an independent held-out test.
Final row hierarchy and mobile treatment remain human-review-required.

The primary checkout is `design-system-v1`, based on
`adef9ee76ffe2a579f6811cae2f5cf152cd0cf99`, with the foundation consolidation
changes still present. The production row sources below are unchanged from that
checkpoint; reusable V1 owners must be read from the current working tree.
The independent consolidation comparison is a separate workstream.

Prepare one consolidated family review, starting with two anchors:

1. An ordinary Portfolio DTF position: identity, token balance, USD value and
   supporting financial columns.
2. A Portfolio pending withdrawal, including its ready-to-withdraw counterpart:
   identity, balance/value, deadline or readiness, and action.

Show their reusable cells together and then in realistic row compositions. A
cell gallery alone cannot prove scanning, wrapping, action ownership or loading
continuity. Conversely, separate page replicas would hide accidental variation
between cells. The first slice needs both views, not every production page.

Holdings and Earn supply contrasting evidence, not additional migrations.
Exclude Auctions, Governance, editable baskets, selector drawers, every other
Portfolio section, legacy table retirement and a universal Table/Row API.
Do not reopen transaction design or change financial calculations, wallet reads,
chain switching, contract calls, shared defaults or production copy.

## Direct evidence and how to use the research

- [Portfolio position source](../../src/views/portfolio-page/components/dtf-positions.tsx)
  already shares its column definitions between Index and Yield positions.
  Do not assume every Portfolio table is an independent copy to consolidate.
- [Withdrawal source](../../src/views/portfolio-page/components/pending-withdrawals.tsx)
  combines two domain branches, not one generic withdrawal transaction.
- [Portfolio response types](../../src/views/portfolio-page/types.ts) and
  [atoms](../../src/views/portfolio-page/atoms.ts) own the data relationships;
  the [page](../../src/views/portfolio-page/index.tsx) owns wallet, error,
  loading and empty-portfolio gates.
- [Holdings source](../../src/views/index-dtf/overview/components/basket-overview/index.tsx),
  its [mobile layout](../../src/views/index-dtf/overview/components/basket-overview/mobile-row-layout.tsx),
  [Exposure rows](../../src/views/index-dtf/overview/components/basket-overview/mobile-exposure-rows.tsx)
  and [Collateral rows](../../src/views/index-dtf/overview/components/basket-overview/mobile-collateral-rows.tsx)
  are the leading product precedent for stacked mobile records.
- [Existing dense-row specimen](../../src/views/internal/design-system/information-row-state-sheet.tsx)
  demonstrates identity/value alignment, but remains provisional. Its horizontal
  overflow treatment is not the answer to every narrow-width case.
- [Fresh Holdings evidence](design-system-table-family-evidence/index.md) records
  source-backed rendering and tab interaction at 375, 639, 640 and 1400px, in
  both themes. It is predecessor evidence, not V1 design acceptance.

Claude's broader map remains in the isolated `register-research-adef9ee76`
worktree: `docs/plans/design-system-table-family-research.md`, its inventory and
evidence directory. Use it to find additional source surfaces, not as a visual
specification. Its section 8 lists unverified behavior. In particular, fixture
NaN/crash observations are not proof of live production defects; the erroneous
light Portfolio performance capture must not become a baseline. This brief's
core scope and source links do not depend on that external worktree remaining.

## Production transfer

| Job/state           | Current behavior to preserve                                                                                                                                                           | First-slice treatment / proof                                                                                                                                                      |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ordinary position   | Name, chain identity, 7D performance, unrealized P/L, average cost, market cap, balance and USD value. Initial Value descending; six numeric columns have sort controls.               | Standardize identity/type/alignment. Preserve fields and sort meaning. Test zero, unavailable and large values separately.                                                         |
| Narrow position     | Production keeps Name, Balance and Value; hides the four other metrics and the symbol below `sm`.                                                                                      | Compare a clearer projection of these retained fields. Do not silently remove any additional information, or require every table to use stacked records.                           |
| Position navigation | Row click opens the appropriate Index/Yield product route in a new tab.                                                                                                                | Preserve destination and tab behavior. Keyboard reachability needs an explicit implementation test; current pointer behavior alone does not prove it.                              |
| Short/long list     | Production `useExpandable` takes five records before DataTable sorting; empty sections unmount. | The authorized lab correction sorts the complete list before its five-row limit; Show all appends the remainder. Production adoption must explicitly reconcile this difference. |
| Index eligibility   | The Index position atom excludes non-positive/invalid token amounts before expansion; Yield uses its own response list.                                                                | Preserve this fixture boundary. A genuine zero remains visible in the cell gallery and in financial metrics, not as a fabricated zero-balance Index holding.                       |
| Withdrawal pending  | Token, source, balance, USD value, a countdown/progress ring, and disabled Withdraw. Source hides below `sm`; other columns remain.                                                    | Stack necessary facts when they cannot fit; do not hide progress or action just to make the row narrower.                                                                          |
| Withdrawal ready    | Deadline elapsed changes progress to Ready and permits the action, subject to the existing transaction preparation path.                                                               | Ready means actionable, not withdrawn or transaction success. Include pending and ready side by side.                                                                              |
| Withdrawal action   | stRSR uses `withdraw(account, endId)`; vote-lock resolves its manager and uses `claimLock(lockId)`. Connection, chain and prepared-call conditions remain product-owned.               | Keep branches identifiable. Lab action can demonstrate local states, but must be explicitly non-executing. No generic transaction handler or mock success presented as live proof. |
| Submission/result   | Existing Withdraw action disables while pending and after receipt-backed success; successful label becomes Withdrawn. Source controls also have their own navigation/sidebar behavior. | Reserve action geometry and isolate nested actions. Reopen this source before wiring any action preview. Do not redesign the transaction modal.                                    |
| Page gates          | Wallet prompt, loading skeleton, retryable error and no-activity page are parent-owned; empty section is not an empty portfolio.                                                       | Preserve distinct cases in the transfer checklist. Full page redesign is outside this slice.                                                                                       |

See [expansion owner](../../src/views/portfolio-page/components/expand-toggle.tsx)
and [DataTable owner](../../src/components/ui/data-table.tsx). Loading, pagination,
selection and row navigation are separate capabilities, not required features
of every row. Do not adopt research-wide bans on combining loading with
pagination or on using different responsive strategies for different jobs.

## Information hierarchy and mobile direction

User direction on 2026-09-09: Exposure/Collateral is the most recently designed
mobile reference for cases where neither horizontal scrolling nor removing
non-required columns is appropriate. Treat that as a strong composition
precedent, not blanket acceptance of its legacy styling.

Retain its useful idea: **identity first, with clearly grouped labeled facts**.
The current collapsed trial places Balance and Value together below identity,
and availability alongside identity when space permits. Exposure's leading value
is weight; a wallet position's is value; a withdrawal must make availability obvious.
The meaning determines the hierarchy, not a universal column template.

- Desktop: consistent identity axis; equal-role numeric peers use matching type
  and right alignment. Do not give each legacy financial cell its own size.
- Narrow position: keep name, balance and USD value easy to distinguish. A
  wrapped name must not squeeze amounts into ambiguous or clipped fragments.
- Narrow withdrawal: keep identity, amount/value, pending/ready meaning and
  action available. Show source context where needed to distinguish otherwise
  identical records. Extra facts can occupy another line; do not copy Holdings'
  three-column metadata grid when the actual content cannot fit.
- Retain distinct interaction meaning: Exposure names are not the same as
  Collateral explorer links; Portfolio navigation is not a Withdraw action.
- Holdings currently changes representation at 640px. This is a test reference,
  not a universal breakpoint: test the proposed row at its actual available
  width, including within a constrained desktop region.

## Exact reuse and small open seams

| Relationship    | Existing owner / intended use                                                                                                                                                                                                  | Boundary                                                                                                                                                                                                                     |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Identity        | [EntityIdentity](../../src/components/entity-identity/entity-identity.tsx), default density; [ChainBadgedLogo](../../src/components/entity-identity/chain-badged-logo.tsx), `xl` for the 32px mark. | Reuse owner spacing and chain geometry. The explicit `wrapName` opt-in allows wrapping without changing defaults. |
| Financial peers | [MetricValue](../../src/components/metric/index.tsx), end aligned; retain its shared [typography](../../src/components/design-system-v1/typography.ts) `body` default of 16px/300.                                             | Ordinary numeric peers have equal weight. Identity names retain 16px/500. Do not invent separate Balance/Price typography. Labels and all column headings use 14px/300 supporting text.                                      |
| Performance     | [PerformanceValue](../../src/components/design-system-v1/performance-value.tsx), period label plus percentage-point display value; match numeric peer typography in the composition.                                           | Existing reusable implementation, not a new enum for all value states. Portfolio API fractions need the existing display conversion; never multiply twice. Do not apply performance color semantics to all financial values. |
| Readiness       | Existing [LifecycleStatus](../../src/components/lifecycle-status/index.tsx) meaning where appropriate; withdrawal countdown/ring remains domain composition.                                                                   | Do not select success just to get green for Ready. Its actionable role has a different visual treatment; inspect plain readiness versus that role in the anchor before promoting a row recipe.                               |
| Loading         | [Skeleton](../../src/components/design-system-v1/loading.tsx).                                                                                                                                                                 | Skeleton owns material/motion; row owns geometry and parent owns loading truth. No new shimmer or truthy-zero loading rule.                                                                                                  |
| Action          | Existing V1 Button sizes/states, with a local non-executing preview handler.                                                                                                                                                   | Distinguish a navigable record from a record containing a transaction action; preserve disabled/pending meaning and test nested activation.                                                                                  |
| Table mechanics | Existing DataTable / underlying Table and supported column/row seams.                                                                                                                                                          | Start with composition-level reuse. Any missing opt-in should be justified by the anchors before expanding the shared API; never change legacy defaults implicitly.                                                          |

## Proposed geometry ownership

### Typography follow-up — 2026-09-09

The user authorized the lighter table hierarchy: ordinary financial values and
plain countdowns use 16px/300; names retain 16px/500; supporting text and column
headings use 14px/300 regardless of whether a heading sorts. Shared links,
buttons and status pills retain their component typography. This supersedes the
initial proposal to emphasize every numeric peer at 500. The older holdings
specimen already uses the lighter MetricValue default.

A 14px dense-table treatment is deferred by user direction until realistic
constraints demonstrate a need; do not prepare it proactively or apply it
automatically at a narrow viewport. No shared typography
default, production table, financial precision or transaction behavior changes.

### Shared chain-badge trial — 2026-09-09

Bounded medium slice at base `adef9ee76`: the user authorized changing the
canonical ChainBadgedLogo and all four size variants, not a Portfolio override.
Keep badge dimensions and mark layout box unchanged. Identity spacing now follows
the separate 32px/12px trial above; smaller marks retain 8px. The
user's border follow-up specifies a 2px surface-colored border for xl and 1.5px
for sm/md/lg. Offset the outer badge by the border width below and the border
width plus 1px right: nominal colored interior is 1px rightward and flush below.
Headless Chromium quantizes the fractional border to 1px even with Retina
emulation, leaving 0.5px extra overhang. Live Chrome was measured at the exact
intended 1.5px/2px borders and offsets; do not equate emulation with native pixels.
Do not change legacy logo wrappers, stacked logos, text roles or production
adoption. Verify the four sizes at the component seam and actual light/dark
single/two-line rows plus compact identity. Review shared impact independently;
the visual trial still needs the user's judgment.

These are first-render starting choices from
[layout recipes](../../src/components/ui/v1-layout-recipes.ts), not new accepted
table tokens. Inspect the whole rows before repeating them across fixtures.

| Relationship                                 | Single owner and proposed measurement                                                                               | Check                                                                                                         |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Section boundary to row contents             | Row/cell track supplies a total 24px horizontal axis; do not also pad the parent by 24px.                           | Header and identity/value endpoints align at the same final axis.                                             |
| Row top/bottom                               | Row track supplies 16px desktop, 24px collapsed; child identity/value blocks add no outer vertical padding.                            | Compare logo and text bounds, not just declared padding.                                                      |
| Withdrawal section bottom                   | Desktop section adds 8px after its 16px row/footer inset, giving 24px to the card edge. Mobile and clickable Position rows are unchanged. | Check the last content block or expansion button against the actual section edge. |
| Mark to identity text                        | EntityIdentity trial: 12px for direct 32px ChainBadgedLogo marks; 8px for smaller/custom marks.                     | No second gap added outside the owner; loading placeholders match the applicable gap.                         |
| Collapsed identity/header to financial facts | Parent supplies 16px; each fact has 4px between label and value, with 24px horizontal/12px wrapped pair separation. | Facts remain consistently stacked; wrapping never changes one fact into a stretched label/value row.          |
| Desktop row separation                       | First candidate uses divider-free ordinary rows. | Repeated records must still be scannable; avoid card outlines around every cell. |
| Stacked record separation                    | Trial a neutral 1px divider, inset to the text axis and extending to the right region edge, following Holdings.     | Divider adds no extra spacing. Beige remains the major-section reveal, not a default line between every fact. |
| Surplus space/overflow                       | Region owns any scroll boundary; rows remain natural height.                                                        | Do not stretch individual rows to fill a lab box, nest padded scroll cutoffs, or clip focus rings.            |

## Value truth and continuity

Keep independent dimensions independent: availability (loading, present,
unavailable), unit (token amount, USD, percent), and domain lifecycle. Estimate
or confirmed provenance is only shown where a real source supplies it. Zero is
a present value, not unavailable; a ready withdrawal is not a confirmed result.
Do not introduce a broad public value-state API before the examples need one.

The present app has differing fallback paths. Record suspicious missing-price
zeros, invalid values and loading predicates for the owning engineering work;
do not silently repair API semantics in a design-system pass. Fixtures may
demonstrate honest unavailable display without claiming production already
provides that distinction. On-chain amount calculations stay Amount/bigint;
existing API display formatting does not authorize new Number-based money math.

Test transitions: loading to data, pending to ready, action to processing, list
expansion, sort changes and responsive reflow. Preserve row identity, units,
labels and action alignment. Only actual content changes should cause movement;
states should not invent unexplained blank rows or lose the action's context.

## Candidate implementation and review boundary

The [Table detail](../../src/views/internal/design-system/components-pages.tsx)
now places the [shared cells and two anchors](../../src/views/internal/design-system/table-family/review.tsx)
before the retained rich-record study. The overview keeps its earlier compact
information-row specimen; Current Review points only to this bounded candidate.
Index and Yield use distinct fixture lists and destinations. Loading, long
content, absent sections, constrained width, elapsed deadlines and simulated
receipts are explicit lab controls, not new production workflow.

The review frame separates cell specimens into individual square tiles with
equal-height, vertically centered example areas. These frames are lab-only,
not a required height or container for product cells. Position type uses tabs;
preview state uses Select; width/deadline conditions use Switch; receipt
simulation remains an action. Position type and preview condition are independent,
so loading or long content does not silently switch Yield back to Index.

The projection is based on **available container width**: below 640px it keeps
the essential position facts plus the active sort metric if otherwise hidden;
640–1023px restores all four supporting
metrics; at 1024px all columns fit the table track. Positions use one Sort by
menu below 1024px and clickable column headings above it, with one sorting state.
The menu preserves all six sortable fields and offers ascending/descending order.
Sorting remains usable during loading, with the selected metric's skeleton
visible and the resulting order applied when data returns. Active sort, identity,
source and withdrawal focus transfer between projections; focus outside the table
or explicitly blurred does not get pulled back. The toolbar and post-sort row
limit are opt-ins on DataTable; default callers still render the full row model.
Withdrawals retain the combined lifecycle/action region at every width. The source's day/hour/
minute countdown formatter is reused, including a near-deadline example.

Review judgment is still required for:

1. Desktop row density and the shared identity/numeric emphasis.
2. Stacked mobile hierarchy and the inset separator treatment; the 320px long
   financial pair is allowed to wrap into separate lines instead of clipping.
3. Whether the combined Withdrawal region makes readiness clear without a second status pill.

No table contract is accepted by this implementation. Shared `wrapName` and
`ariaLabel` additions are opt-in and keep existing defaults; their adoption
review is recorded in the [engineering register](design-system-v1.md#deferred-engineering-review-register).
Production adapters must still reconcile missing-price data, performance
fractions, wallet/chain gates, manager resolution and receipt truth. Both
withdrawal branches are represented in the lab; only the stRSR branch is mounted
in this slice's fresh production observation. The vote-lock source/sidebar was
inspected in code, not claimed as executed production proof.

The [current checkpoint](design-system-table-family-evidence/checkpoint.md) retains
the hardened candidate without accepting the header-spacing trial.
The [evidence index](design-system-table-family-evidence/index.md) distinguishes
predecessor observations, candidate verification and remaining limits. Passing
tests are not visual acceptance. Unreviewed product behavior must survive later
migration even when absent from these two anchors.

The [Exposure / Collateral candidate](design-system-table-family-holdings-slice.md)
is implemented and locally refined, with its own scoped interaction evidence.
The next bounded expansion is [Discover browsing cells](design-system-table-family-discover-slice.md).
Neither the older rich-record study nor production adoption is approved by this
checkpoint.
