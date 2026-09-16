# Auction table and retained browse guidance

Read for current/history auction tables, detail references or retained browse records. Read the [common lab guide](../CLAUDE.md) first.
Code paths in prose are relative to the lab directory unless fully qualified.
These are scoped preservation requirements, not new design authority.

## Current table

The retained navigation-only current table is at
`#auctions-current-table-review`; `auctions-current-table/` owns its local state
projection and safe detail boundary. The [scope split](../../../../../docs/plans/design-system-current-rebalance-table.md#near-term-and-deferred-scope)
selects current/history tables as the near-term migration target. Mobile cleanup
and the independent final review are complete; the [closeout reconciliation](../../../../../docs/plans/design-system-current-rebalance-table-evidence/closeout/README.md)
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

## Historical table

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
The [history brief](../../../../../docs/plans/design-system-auctions-history-slice.md)
owns the historical row boundary. The earlier record exploration remains separately
accessible at `#auctions-records-review`; its rules below are retained context,
not a prerequisite or accepted design for the current workspace.

## Earlier browse exploration

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
[transfer brief](../../../../../docs/plans/design-system-auctions-browse-slice.md).
