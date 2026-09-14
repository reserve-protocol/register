# Auctions tables — closing review (current + historical), 2026-09-14

Bounded, read-only review of `#auctions-current-table-review` on the working tree
(HEAD `289b2af86`, dirty tree, source digest `ef4794d9…` unchanged from start to
end of the pass — see [coverage.md](coverage.md)). Scope: visual, usability and
presentation-truth problems in the current-rebalance table, the historical table
and the navigation boundary they share. Not a redesign, not a token audit, not a
transaction-safety audit. Evidence lives in [evidence/](evidence/).

## Verdict

The two tables are in good shape. Every one of the 18 current examples and all
eight history states fit 288–1400px containers without overflow, wrapping or
target collisions in both themes; state distinctions (ongoing / ready + who may
launch / weights prerequisite / launching / loading / unavailable / completed)
read correctly; unknown never looks like zero; a live auction with failed prices
stays Ongoing; navigation, Back, focus return, independent proposer links and
keyboard order all behave. The existing focused specs pass (36/36 against an
isolated preview of this exact source).

Four things are demonstrably wrong and worth fixing before the lab is set aside.
Two of them (F1, F2) should block closing; they are small and local. Nothing
else is a blocker.

**Close the lab review after F1 and F2 are corrected (F3/F4 recommended in the
same pass).** No unresolved blocker remains beyond those.

## Findings (demonstrated)

### F1 — Completed detail: the Reference caption names a rebalance the capture does not show
- **Severity:** Important · **blocks closing** (presentation truth of the reference boundary).
- **Where:** current table → “Target reached · window open” (`?current=complete`, or `all-complete`) → Details. Both themes, 1400 and 390.
- **Evidence:** [f1-complete-detail-reference-caption-vs-capture-1400.png](evidence/f1-complete-detail-reference-caption-vs-capture-1400.png), [f1-complete-detail-reference-dark-390.png](evidence/f1-complete-detail-reference-dark-390.png).
- **Repro:** open the Completed row’s Details; read the Reference caption (“August 2026 Rebalance · Completed”), then the captured page header inside the image (“Rebalance - June 2026”).
- **Problem:** the figure identity is derived from the scenario, not from the capture that is actually mounted, so the completed reference is labelled with the wrong rebalance. A reviewer taking the caption at face value would believe the August capture exists. The same code path labels every non-hybrid scenario “August 2026 Rebalance”, which happens to be right for the ready/live/repeat captures but is not tied to them.
- **Fix (minimal):** give each imported capture its own identity/state caption (a per-capture map) instead of deriving the caption from `row.scenario`; for the completed case the caption should say what the capture shows (June 2026, Completed), or swap in an August completed capture if one exists in the audit evidence.
- **Source:** `src/views/internal/design-system/auctions-current-table/detail.tsx:9-14` (captures), `:38-47` (caption derivation).

### F2 — Historical metric help does not stay open on the first touch tap
- **Severity:** Important · **blocks closing** (touch helper behaviour on the migration-target table).
- **Where:** historical table, any state, 320 and 390, light (dark not separately tested). Touch emulation with and without `isMobile`.
- **Evidence:** [f2-history-help-touch-first-tap-4ms.png](evidence/f2-history-help-touch-first-tap-4ms.png) (open), [f2-history-help-touch-first-tap-1500ms.png](evidence/f2-history-help-touch-first-tap-1500ms.png) (already closed), [f2-history-help-touch-second-tap-1500ms.png](evidence/f2-history-help-touch-second-tap-1500ms.png) (second tap holds), [f2-current-help-touch-first-tap-1500ms.png](evidence/f2-current-help-touch-first-tap-1500ms.png) (the current table’s help holds from the first tap).
- **Repro:** on a touch viewport tap the ⓘ beside “Rebalance accuracy” or “NAV Change”. Sampled every ~45ms: tooltip present at 4ms, gone by 77ms and for the rest of 1.5s. Second tap: present for the whole window. Third tap: flashes again. Reproduced at 320 (touch only), 390 (touch only) and 390 (touch + mobile emulation).
- **Problem:** the first tap reads as dead; a user has to tap twice and then gets an inconsistent toggle. The current table’s launcher help does not have this problem because it wraps the shared `HelpTooltip` in local capture handlers that suppress Radix’s pointer/click auto-close; the history label uses the bare shared component. The existing touch spec passes because its assertion polls fast enough to catch the ~70ms window and the following taps alternate the way the spec expects; it is not evidence that the first tap holds.
- **Fix (minimal):** reuse the same capture-handler wrapper (`preserveHelpToggle` + `stopPropagation`) around the history metric help. Lifting that behaviour into the shared `HelpTooltip` would be a design-system change (shared defaults stay as they are) — flag for the owner rather than doing it in the lab.
- **Source:** `src/views/internal/design-system/auctions-browse/history-metric-label.tsx:24-35` vs `src/views/internal/design-system/auctions-current-table/cells.tsx:101-129`.

### F3 — On touch, dismissing the launcher help by tapping the card navigates to Details
- **Severity:** Medium · should fix, not a blocker on its own (recoverable with Back).
- **Where:** current table, any launcher-restricted row (`?current=ready&viewer=member` etc.), 390×844 touch + mobile emulation, light.
- **Evidence:** [f3-phone-help-open-390.png](evidence/f3-phone-help-open-390.png) → [f3-phone-after-tapping-card-to-dismiss-390.png](evidence/f3-phone-after-tapping-card-to-dismiss-390.png).
- **Repro:** tap ⓘ (tooltip opens, no navigation); tap the “Rebalance expires in” line to dismiss it. The tooltip closes and the row navigates to the retained detail. Tapping the page background below the card closes the tooltip without navigating.
- **Problem:** on a phone the card fills the width, so “tap somewhere neutral to dismiss” lands on the row, which is a whole-row link. The natural dismiss gesture becomes an unintended navigation.
- **Fix (minimal, local to `auctions-current-table/`):** while a help tooltip is open, let the first outside tap only dismiss — e.g. the launcher help’s `onOpenChange` records “closed by outside pointer” on the table root and the row click guard in `table.tsx:45-54` skips that click. No shared default changes.

### F4 — Unknown auction round renders a bare “—” line in compact rows and in the detail context
- **Severity:** Minor · recommended.
- **Where:** compact projection (container < 1024px) of “Auction query failed” and “Target reached · window open”; the retained-detail context block at all widths. Both themes.
- **Evidence:** [f4-compact-auction-query-failed-390.png](evidence/f4-compact-auction-query-failed-390.png), [f4-compact-completed-390.png](evidence/f4-compact-completed-390.png), [f4-detail-auction-query-failed-390.png](evidence/f4-detail-auction-query-failed-390.png), and the dash beside the Completed status in the F1 desktop capture.
- **Problem:** on desktop the dash sits under the “Auction” header, so it reads as “no auction”. Compact rows have no header, so the dash is an unlabelled glyph between the provenance line and the status pill; in the detail block it floats to the right of the status with nothing to attach to. Unknown must not look like a rendering glitch.
- **Fix (minimal):** when `round === null`, omit the round block in the compact cell and the detail block (the status pill + explanation already carries the meaning), keeping the dash only under the desktop “Auction” header.
- **Source:** `src/views/internal/design-system/auctions-current-table/cells.tsx:133-135`, `table.tsx:74-76`, `detail.tsx:67-70`.

### F5 — Desktop “Expires in” header sits beside “Ends in”; only the compact label says whose expiry it is
- **Severity:** Minor · copy/product decision (agents may not change copy).
- **Where:** desktop projection, live rows (`Auction live · bids/no bids`), both themes.
- **Evidence:** [f5-desktop-live-two-countdowns-1400.png](evidence/f5-desktop-live-two-countdowns-1400.png).
- **Problem:** a live row shows “Auction 1 · Ends in 10m 0s · Bids · 2” and, one column to the right, “Expires in 23h 59m”. Two countdowns, and the header does not say the second one is the rebalance window. The compact projection already uses the approved “Rebalance expires in”, so the two projections name the same value differently.
- **Suggestion:** carry the scope into the desktop header (“Rebalance expires in”, or a scoped short form) — needs copy approval; the existing “Expires in” is retained lab copy.
- **Source:** `src/views/internal/design-system/auctions-current-table/table.tsx:126-136`.

## Refinements (subjective, optional)

- **R1 — Tablet band mismatch.** Viewports ≈944–1071px (containers 896–1023) show the history table in desktop columns while the current table is still a stacked card; at 1024 the stacked card has ~600px of empty space between the status pill and the arrow. At 768 both are compact and the history 2×2 fact grid spreads its pairs ~500px apart. Evidence: [r1-current-compact-at-1024-viewport.png](evidence/r1-current-compact-at-1024-viewport.png), [r1-history-columns-at-1024-viewport.png](evidence/r1-history-columns-at-1024-viewport.png), [r1-current-compact-at-768-viewport.png](evidence/r1-current-compact-at-768-viewport.png), [r1-history-compact-at-768-viewport.png](evidence/r1-history-compact-at-768-viewport.png). Options: align the current cutover with history’s 896, or add an intermediate two-column compact arrangement (a composition decision for the owner; the existing responsive table recipe does not define a middle projection — design-system dependency).
- **R2 — Reference figure presentation.** The captured production page is placed full-bleed and borderless directly under the caption, including the production nav (logo, Connect); in dark theme it is a bright light-mode block; on phones the live/repeat captures are 1400px desktop shots scaled to 358×230px and unreadable. Evidence: [r2-detail-reference-ready-1400.png](evidence/r2-detail-reference-ready-1400.png), [r2-detail-reference-live-dark-390.png](evidence/r2-detail-reference-live-dark-390.png). The caption is explicit, so this is not a truth defect; a framed/inset figure and a caption line naming the captured viewport/theme would make the boundary visible at a glance. Dark/phone captures do not exist in the audit evidence — lab limitation, not a lab defect.
- **R3 — Price impact sign vs dollar figure.** History shows a signed, coloured percentage (“−1.51%” red, “+0.12%” green — the sign is inverted from the raw cost by `priceImpactDisplay`) over an unsigned, muted dollar magnitude (“$1,272”, “$14”). A reader cannot tell from the presentation whether “$14” under “+0.12%” was gained or paid. The production completed view pairs them inline in the same tone (“-1.51% ($1,271.57)”, visible in the F1 capture). Evidence: [r3-history-desktop-light-1400.png](evidence/r3-history-desktop-light-1400.png), [r3-history-desktop-dark-1400.png](evidence/r3-history-desktop-dark-1400.png). Suggest one convention for both values once engineering confirms the metric meaning (see Q4); the muted supporting line itself is fine.
- **R4 — Desktop arrow inset.** On desktop the visible 32px circle ends 30px from the card edge (x 1314–1346 of a card ending at 1376) while the left content inset is 24px; the compact layout was corrected to 24px. A 6px optical asymmetry. Evidence: [r4-desktop-ready-restricted-row-1400.png](evidence/r4-desktop-ready-restricted-row-1400.png). Same `-mr-1.5` treatment as compact, or accept.
- **R5 — “Unavailable” wears the waiting icon.** Data-failure rows (“Auction query failed”, “Token metadata missing”, “Metrics unavailable”) use the `waiting` pill role, i.e. the same neutral clock as “Loading”; only the word differs. Distinguishable, but a failure state carrying a clock hints that waiting will resolve it. `LifecycleStatusRole` has no unknown/unavailable role — design-system dependency; note for the pill owner rather than a lab change.
- **R6 — Double focus indicator on links.** Proposer links show the semantic ring plus the browser’s default outline (`outline: auto 1px`) when focused via keyboard; the arrow and help buttons show the ring only. Cosmetic; belongs to the shared focus role, not this lab. Evidence: [cov-desktop-hover-focus-1400.png](evidence/cov-desktop-hover-focus-1400.png).

Observed and accepted as-is: whole-cell vertical centering (single-line numbers sit below the primary line of two-line pairs, per the history brief); no row dividers on phone history (record boundaries rest on 48px whitespace and the 16px/500 titles — legible); the faint `bg-muted/50` row hover (visible, retained feedback).

## Unresolved product-meaning questions (not defects)

- **Q1** — “Target reached · window open” shows **Completed** together with **Expires in 1d 1h**. Truthful for an open window, but a completed row with a live expiry countdown in a *current* list reads as contradictory. Whether such rebalances belong in “current”, and whether “Completed” or production’s “Rebalance Finished” is the right word while the window is open, is a live-membership/product decision for the engineer-owned integration.
- **Q2** — For connected non-launchers and visitors during the restricted period the auction line replaces “Duration 30 minutes” with “Anyone can launch in 1h 0m”; the duration is then only in the detail. Intentional trade, but confirm the list does not need both.
- **Q3** — Desktop header wording for the rebalance expiry (F5) needs a copy owner.
- **Q4** — Price-impact sign convention (positive cost shown as “−x%”) and whether the dollar figure is a cost magnitude; confirm before any adoption (R3).
- **Q5** — es/ko/zh: only the approved labels are translated. “Proposed … by”, “Auction 1”, “Duration”, “Ends in”, “Bids”, the status words (Ongoing, Launching…, Loading, Unavailable, Completed, Expired) and all history labels stay English, and the compact date renders as “ago 3, 8:50pm” / “8월 3, 8:50오후”. Lab fixture scope, not a lab defect — but the migration must own these strings and the date pattern. Evidence: [cov-locales-es-ko-zh-320.png](evidence/cov-locales-es-ko-zh-320.png).

## Known migration boundaries (unchanged by this review)

- No production list→detail adapter exists; the deeper page is selected fixture context plus dated, read-only production captures (2026-09-13). It proves the navigation boundary and nothing about the retained flow’s behaviour, live data or mobile parity.
- The default All view is a labelled review matrix of 18 one-row tables, not a queue.
- Live membership, access/timing semantics, version-appropriate destinations, Back/deep-link continuity, and the historical metric sources/signs/precision remain engineer-owned checks; the production audit findings remain open. Visual approval here certifies none of that.
- Historical values are illustrative overlays on CMC20 snapshot identities.

## Answer

Yes — close the table lab review once F1 (reference caption) and F2 (history help
first tap) are fixed; F3 and F4 are cheap and worth taking in the same pass. No
other unresolved blocker was found. Production migration gates above are separate
and untouched.
