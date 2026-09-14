# Historical rebalance table review

September 14: the separate [current-rebalance table](design-system-current-rebalance-table.md#near-term-and-deferred-scope)
and this self-contained history table are the near-term migration target, now
visually approved for the current lab scope, not production adoption. Their retained composition
is `#auctions-current-table-review`. The unfinished redesigned workspace remains
deferred at `#auctions-browse-review`, where this history table is also retained.
History geometry and static row behavior are unchanged by this disposition.

The [independent closeout review](design-system-auctions-tables-closeout-review/report.md)
found that the earlier first-tap test could accept a tooltip flash. Its
[reconciliation](design-system-current-rebalance-table-evidence/closeout/README.md)
owns the local tap fix and sustained-open regression. Shared tooltip defaults,
metric meanings and production migration remain outside that change.

## Original scope and transfer

Authorized September 13: first compose historical rebalances as an ordinary,
full-container-width table. Current rebalances and their future working area
are intentionally omitted, not represented by an empty state or reserved pane.
This is an isolated, low-profile lab iteration, not a production or shared API
change. Existing unrelated work remains untouched. No Mixpanel event is needed
for specimen controls; production navigation and analytics stay unmodified.

The existing [browse transfer](design-system-auctions-browse-slice.md) owns source
evidence. CMC20 identity, timestamps, proposer and destination come from retained
snapshot fixtures; outcomes remain visibly declared illustrative overlays.
Production historical rows navigate to a rebalance and independently expose
proposer provenance. The user authorized replacing row navigation with a complete
table summary, retaining proposer links, all timestamp information and
signed impact meaning. Zero, unknown and pending are distinct. A missing metrics
response never establishes a lifecycle outcome. No live adapters or transactions.

## Composition contract

- Scan a newest-first history list and compare accuracy, NAV change, price impact and traded
  value. Preserve the count of auctions run as secondary context for traded value.
- Rebalance identity/provenance, Status, Rebalance accuracy, NAV Change, Total price impact,
  Traded: aligned columns in a shared DataTable. No new sorting contract.
- Constrained projection: identity/provenance followed by status below a 512px
  container; status sits alongside identity above that width. Paired outcomes and a
  traded/count region. Price impact carries its dollar magnitude as supporting
  text. Rows are static, without row hover/focus or a stretched link; the proposer
  retains independent navigation and visible keyboard focus.
- Reuse canonical lifecycle pills, Skeleton, Select, Switch, typography and
  semantic surface roles. Titles 16/500; numbers ordinary 16/300; supporting
  labels and provenance 14/300. Inline pairs remain equal-sized.
- The entire content block of each desktop cell stays vertically centered. A
  single-line number sitting below the primary line of a two-line pair is
  intentional; do not align primary baselines across cells. The first column
  takes remaining width while Status uses a pill-sized 112px column. Numeric
  column proportions and all existing content padding stay unchanged.
- Provenance wraps as a sentence in history only; compact dates omit the weekday,
  day/hour leading zeros and space before am/pm (for example `Jul 1, 5:48pm`).
  Earlier years remain visible; local timezone behavior and the exact machine
  timestamp are unchanged. “Proposed” and “by + address” stay explicit. The
  compact format is history-only, not a shared date default. Accuracy and NAV help reuse the source
  completed-view explanations. No historical price-impact explanation exists
  there beyond an availability notice, so no new financial copy is invented.
- The table owns a single 24px horizontal inset, 16px desktop row rhythm and
  24px constrained rows. Desktop headers have 24px top inset; the final row's
  16px padding plus 8px table footer matches the 24px horizontal axis. Mobile
  has no second wrapper inset. History and table header share the canonical card
  surface without gray row dividers; no host
  background preference or page width cap is established here.
- Pending metrics keep known identity/status usable. Whole-list loading hides
  navigation and identity while reserving the previous content geometry. Width
  changes preserve focus across responsive projections. Empty recovery remounts
  the table's focus owner. No pagination needed for three source records.

## Review boundary

The active current/history composition is `#auctions-current-table-review`;
`#auctions-browse-review` retains the deferred workspace above the same history.
The earlier record exploration remains at `#auctions-records-review`, not an
accepted prerequisite. Current-table changes, Governance, other table families,
shared defaults and production adoption are outside this history slice.

September 13 follow-up: card color and removal of gray dividers supersede the
initial recessed treatment. The subsequent user approval removes whole-row navigation.
The production completed view mostly repeats these outcomes; NAV change and the
dollar amount of price impact are the additional metrics. A self-contained history
table now includes both without requiring a detail page or inventing an
execution-detail disclosure. The new values are explicitly illustrative fixture
overlays, not calculations or live data. Missing NAV/dollar metrics remain unknown;
the existing known-zero fixture includes zero NAV change and dollar impact.

## Verification

September 14 mobile follow-up: the historical title and provenance now have the
full phone width instead of competing with Status. The default 320px title
regression failed before the change and passed afterward. Desktop columns,
whole-cell centering, loading geometry and all metric meanings are preserved.
The [combined mobile receipt](design-system-current-rebalance-table-evidence/mobile-cleanup/README.md)
owns the latest current/history checks; earlier receipts below remain historical.

The history-only rendered test failed before implementation. Visual inspection
then found that an absolutely positioned pseudo-element directly on `tr` created
an anonymous layout cell: the phone's visible cell was 179px inside a 358px table.
The new exact-width assertion failed before moving the seam inside a real cell,
matching the existing Holdings pattern. An overflow-only assertion had missed it.

Focused units, source-bound browser states and retained-record checks pass;
the [verification receipt](design-system-auctions-browse-evidence/history-table/README.md)
records commands, final captures and limits. Self-review covers intent,
correctness and product: current content is absent; only proposer links remain;
unknown metrics do not determine lifecycle; typography and responsive widths use
existing owners without changing defaults. Human visual acceptance remains required.
