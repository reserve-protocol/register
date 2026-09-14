# Current rebalance table — lab candidate

## Contract and decision

Fixed point: `289b2af86e8245ced89d9058a09182799c65f825`. Medium, isolated lab composition. Existing dirty workspace and audit material are inputs, not this slice's changes. No commit or production adoption.

The user selected a current-rebalances table above the static historical table. A row represents a rebalance, not one auction round. Opening it leads toward the retained production detail flow, not the experimental inline workspace. Keep the workspace at its existing anchor; add a table anchor and make it the Current Review destination.

## Near-term and deferred scope

September 14 disposition: finish the table review without making the redesigned
auction flow a prerequisite. This section owns the split; linked workspace and
history briefs retain their scoped implementation and evidence. It records the
user's selected direction. The user approved the current table work for now on
September 14; [scoped acceptance](../wiki/decisions.md#2026-09-14--current-table-work-approved-for-now)
does not approve production migration or the deferred workspace.

| Surface | Disposition | Boundary |
| --- | --- | --- |
| Current-rebalance table and separate historical table | Approved lab baseline for now; near-term migration target | Current rows navigate only. History is a self-contained, static summary with independent proposer links. |
| Existing production auction detail/flow | Retain for the initial table migration | Preserve familiar actions, inputs and transaction behavior. The real list-to-existing-flow adapter is not implemented by the lab. |
| Redesigned current-rebalance workspace | Unfinished, deferred candidate | Keep `#auctions-browse-review`, its source, local simulations and audit evidence. It is not the initial current-row destination or a dependency of table migration. |

### What the lab proves and does not prove

`#auctions-current-table-review` remains available as the accepted table lab. Its
deeper page shows selected fixture context beside dated, named, read-only
production audit captures. These are references, not the retained interactive
flow, selected-row live data, or proof of mobile production-detail parity.
The All matrix is a set of labeled review examples, not a real current queue.

No production adapter, SDK/RPC source, financial calculation, transaction,
persistence or shared default has been migrated. Retaining the old flow does
not certify it as safe or resolve the
[production audit findings](design-system-current-rebalance-flow-audit/report.md).
The [workspace's adoption gates](design-system-current-rebalance-workspace.md#unresolved-decisions)
remain open: live/indexing truth and duplicate sends, both launch paths,
receipt failures, permissions/network/version coverage, target units and
persistence, cap policy and filler navigation. Its simulated protections are
not production fixes.

### Remaining work before setting the table review aside

The authorized mobile/constrained cleanup gives historical identity/provenance
the full width below 512px and removes the current-table 4px bottom strip.
The [combined cleanup receipt](design-system-current-rebalance-table-evidence/mobile-cleanup/README.md)
records that pass; its compact current-row composition is superseded below.

The latest [status/arrow follow-up](design-system-current-rebalance-table-evidence/status-arrow/README.md)
orders compact content as identity, auction context, status, then rebalance
expiry. At container widths 352px and above, the arrow centres against the
status pill. Below 352px it stays beside auction context, leaving full width
for status and help. Expiry retains the approved localized label left and
counter right. Desktop cutovers remain 1024/896px; historical composition,
shared defaults, state meanings and financial semantics are unchanged.

The [bounded final independent review](design-system-auctions-tables-closeout-review/report.md)
is complete. Its F1–F5 follow-up was authorized, including desktop “Rebalance expires in”;
the [reconciliation receipt](design-system-current-rebalance-table-evidence/closeout/README.md)
owns implementation verification and deferred findings. Human visual disposition
remains separate. No new broad workspace or transaction audit is implied.

The workspace needs explicit authorization to resume. Its weight setup/editor,
launch/wait/recovery states, live chart/bids, liquidity/cap presentation and
outcomes remain provisional to the extent named in its brief; retained user
refinements are not blanket approval of the whole flow.

Before either table is adopted, the engineer-owned integration must verify
authoritative current/live membership, access and timing semantics, version-
appropriate destinations and Back/deep-link continuity, and the historical
metric sources, signs, precision and unknown values. A list-only migration can
proceed independently of the redesign, but cannot bypass these checks or
silently waive known production hazards. Routing/container implementation and
which existing-flow defects must be resolved for release remain engineering
decisions, not conclusions drawn from screenshots.

The original scope disposition was worktree-only documentation and lab metadata. It was not a
commit, reproducible checkpoint snapshot, production readiness declaration, or
authorization to start the remaining steps; mobile cleanup was authorized separately.

Scope-only verification: catalog/UI units 38/38, app/E2E typecheck, scoped
lint/format, link/anchor checks, wiki lint and whitespace checks pass. The updated
catalog description was inspected in the mounted preview. No auction behavior
or geometry changed, so earlier browser receipts retain their original bounds;
they are not a fresh combined visual pass or completion of mobile cleanup.

## Usage and affordances

- A launcher finds a ready rebalance, its round, and expiry, then opens Details. No execution occurs in the list.
- A non-launcher distinguishes ready auction configuration from their own launch restriction; a live auction instead exposes its end time and bids. Opening Details remains possible in either case.
- Missing auction data never means ready or finished. Price failure does not erase a confirmed ongoing auction. Loading and empty lists do not manufacture records.
- Browser Back restores the list, scenario and viewer, with focus returned to the matching Details link. Proposer links remain independent. Narrow layouts retain state and timing without horizontal scrolling.

The lab exposes scenario, viewer, network and data controls. They change fixtures only. Detail is explicitly a read-only audited production capture, not mounted transaction components. It demonstrates the navigation boundary, not full production parity or interaction coverage. Captures are dated evidence, not current state data.

### All-state review follow-up

The default All view renders 18 separate one-row tables: eight lifecycle
scenarios plus viewer/network and missing-data variants. Each table has its
existing scenario label immediately above it, outside the product surface.
History appears once below the set. Individual scenarios,
empty/loading list previews and their controls remain selectable. Global viewer
and data controls are hidden in All because each example owns its fixed inputs.
This is a review matrix, not a claim that 18 proposals coexist. Private preview
IDs keep Details, Back and responsive proposer focus on the exact example without
changing snapshot proposal IDs or explorer destinations.

Every product row still starts with its rebalance title and proposal provenance;
the restored labels belong to the enclosing lab example, not the identity cell.
Individual previews, including the two-record example, retain one table.

This remains a low-profile isolated presentation follow-up. Current verification
and earlier matrix evidence are recorded in the [receipt](design-system-current-rebalance-table-evidence/README.md).
No transaction, production, shared-default or history-layout changes.

## Ownership, transfer, constraints

The approved navigation/status refinement uses a neutral outlined 32px circular
arrow link with a 44px hit region, retaining Details as its accessible name and
the native destination.
Browse status is a single pill except where launch restrictions or missing/indexing
data require explanation. Bid counts stay visible alongside auction timing.
Start/Manage, wallet/network prompts and the redundant finished sentence remain in
the selected detail context. No state, eligibility rule or transaction behavior
is changed; the table no longer repeats those action prompts.

Ongoing retains the accepted active indicator; processing keeps the spinner.
The user approved Only launcher can start and Anyone can start for ready pills.
These reflect the access phase, not wallet connectivity or network. Launcher-only
ready rows use the existing HelpTooltip beside the pill: “The auction launcher is
the account authorized to start auctions during the restricted period.” It opens
on tap or keyboard focus, retains focus across table projections, and isolates
help-content clicks from row navigation. The permission countdown stays with
auction timing; no extra explanatory text row is added for ready states.
Restricted weight setup retains Only launcher can start as one supporting line;
the full source restriction moves into its helper and remains in selected detail.
Whole-cell vertical centering and data/indexing explanations are unchanged.
Labels and help reuse es/ko/zh translations. No launch gate or underlying
lifecycle value changed.

`auctions-current-table/` owns this presentation and local projection. History and `auctions-current/` retain their existing defaults. No SDK, RPC, financial calculations, transactions, production routes, analytics events or global component defaults change. Reuse DataTable, Link, LifecycleStatusPill, provenance, semantic card surfaces and the responsive table recipe. Transfer only state visibility and stable navigation from transaction-flow work; do not import transaction steppers or action orchestration.

Retain evidenced copy. Optional Next step/Timing wording is awaiting specific approval; the user approved “Rebalance expires in” for desktop as well as compact rows on September 14. Otherwise retain Rebalance/Status/Auction/Details labels and source-owned state/permission wording. Fixtures remain illustrative. Multiple rows use the same DTF context; identities are snapshot-backed with local state overlays, not a production queue claim.

## Candidate and review

One candidate: separate current table and retained detail boundary. Rejected: inline launch, or routing the experimental workspace as if it were the retained production flow. User chose the ownership shape, so no competing implementation agents.

Rubric: (1) distinguish rebalance/round; (2) truthful live/action/unknown state; (3) actionable navigation and independent links; (4) readable full-width and phone geometry; (5) no execution or history redesign. Visible pressure case: confirmed live auction with unavailable prices viewed by a disconnected visitor. It remains Ongoing and inspectable, not Connect wallet or ready.

Final review topology: required project Dark/Light read-only pair, bounded to this slice and evidence; no writable agents. Root owns implementation, verification, reconciliation and documentation. Not an Arena or held-out evaluation.

## Acceptance and verification

Highest stable seam: mounted browser lab. First test must fail for missing table. Fresh checks cover default ready, live/no bids, repeat, restricted viewer, visitor/network, weights, unknown auction data, price error while live, multiple/empty/loading, desktop/phone and both themes, selection/back/focus and zero transaction sends. Typecheck and focused lint/format follow. Existing history/workspace route remains independently reachable.

Initial RED: the new browser test failed on the missing `current-rebalances-table` element. Initial GREEN: 11/11 browser tests, source frozen per test, all transaction logs empty. The first independent review found a misleading reference fallback: July/repeat/no-bids could show the generic August first-round/bids capture as if it were the selected detail. Fixed by keeping selected context separate from a Reference figure with its own identity, state and 2026-09-13 capture date; repeat uses the actual next-round capture. Dark recheck accepted this source correction. Light found no scoped composition blocker; final captures now include the section heading rather than clipping it beneath lab chrome.

The alternative workspace link moved into preview controls, not between current and historical product sections. Existing product wording is retained; the more specific optional copy questions remain unapproved. Reference is an existing lab label, and capture identity/date/state are evidence data. New explanatory reference copy is not silently adopted.

Final proof: [receipt](design-system-current-rebalance-table-evidence/README.md), browser 14/14, retained history/workspace/catalog units 44/44, app/E2E types and scoped style/docs checks green. Corrected desktop/phone references and the full current/history composition were inspected. All five rubric criteria are met for the lab slice; the visible live/price-error/visitor pressure case remains Ongoing and inspectable. No held-out or production-parity claim.

Status: human-review-required (lab implementation and independent review complete). Engineer review required before production migration for authoritative live-state membership, permission and version semantics, route continuity and known audited launch hazards. This candidate cannot clear those gates.
