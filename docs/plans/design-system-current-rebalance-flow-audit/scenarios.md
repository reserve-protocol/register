# Scenarios — reproducible journeys and the minimum review set

Every journey below runs offline against the repository's strict mocks with
the frozen clock, on the auditor's preview (see `evidence/index.md` for the
exact commands). "Expected" is the behaviour the current production code
produces (observed unless marked SI); "Workspace" says what the future
full-width current-rebalance workspace must show at that point. Journey IDs
map to matrix rows (`coverage-matrix.md`). Fixtures: cmc20 = bsc/cmc20
rebalance nonce 11 (24 h restricted window); lcap = base/lcap nonce 5
(zero-width window, curated hybrid). Times are relative to the snapshot window.

## S1 — Visitor before the first auction (restricted phase)

Roles: disconnected visitor; connected non-launcher. Spec:
`roles-phases.review.spec.ts` (disconnected.restricted, nonLauncher.*).

1. Open `/bsc/index-dtf/<cmc20>/auctions` frozen 60 s before `restrictedUntil`. Expected: one active row with "Permissionless in: 1m 0s" and "Expires in: 1d 0h 0m" (A-04); historical rows below.
2. Click the active row. Expected: detail with title link, countdown pill, execution progress, next target, total value traded $0, deviation, round card ("Precision Rebalancing" for this fixture), est. trade value, selling/buying stacks, disabled "Permissionless in: <countdown>" control, liquidity panel (F-02, D-01..D-03, I-01).
3. Advance the clock past `restrictedUntil` (connected non-launcher). Expected: control becomes "Start auction 1 (30 minutes)" enabled, without reload (F-03).
- Workspace must preserve: the phase and both deadlines, the round/estimate/assets facts, the reason the visitor cannot act yet, the liquidity evidence, and the transition into the permissionless phase without a reload.

## S2 — Launcher: prepare and launch the first auction

Roles: enrolled auction launcher on the DTF's chain. Spec:
`launch-lifecycle.review.spec.ts` (confirm.*), tracked `launch-write.spec.ts`.

1. Open the detail as a launcher in the restricted phase. Expected: "Start auction 1 (30 minutes)" enabled once params resolve (E-01); on the wrong chain the source renders "Switch to BNB Smart Chain" but the mock-wallet run showed the launch button instead — unresolved (E-03); with a missing price: red reason + disabled (E-04, tracked).
2. Click. Expected: wallet prompt; button "Launching..." (E-05); intercepted `openAuction(nonce 11, 18 tokens, weights, prices, limits)` (calldata fixture).
3. Receipt confirmed. Expected: toast "Auction launched successfully"; button still "Launching..."; after 10 s the auctions query refetches; when it returns the new auction the action card unmounts and "Auction 1 · Bidding is ongoing..." appears with the countdown pill and chart (E-06, H-01, H-02).
4. Indexer lag variant: if the query still returns nothing after 15 s the button re-arms as "Start auction 1" (E-07). Workspace must not allow this ambiguity: show "waiting for the auction to be indexed" and keep the control disabled until the on-chain state is known.
5. Rejection variant: toast "Transaction rejected or failed", control re-armed (E-08).
6. Revert variant: see `launch-lifecycle → revert` for the observed state (E-09).
- Workspace must preserve: wallet/network gating, the price guard, the pending/confirmed/failed states, and a single source of truth for "an auction is live".

## S3 — Auction underway, ending, and the next auction

Roles: any viewer; launcher for the follow-up launch. Spec:
`launch-lifecycle.review.spec.ts` (ending.*), `monitoring-data.review.spec.ts` (bids.*).

1. Open the detail with a live auction (subgraph auction ending in 100 s, two bids). Expected: "Auction 1", "Bidding is ongoing...", pill counting down in seconds, chart with two dots, "Total value traded" > $0, no launch control (H-02..H-04, D-04).
2. Click a bid dot. Expected: "Bid #1" panel with tx, bidder and token explorer links and USD values (H-04).
3. Advance the clock past `endTime`. Expected: within seconds the card unmounts and the action card returns with "Start auction 2 (30 minutes)"; round title/estimate recomputed (H-07). Auction ordinal (2) is not a promise of a total.
4. Launch again as the launcher (S2 steps). Expected: same lifecycle with N = 2.
- Workspace must preserve: live monitoring with a clear "ends in", bid inspection, automatic transition to "ready for the next auction", and the ordinal semantics.

## S4 — Hybrid DTF: weights before the first auction

Roles: enrolled launcher on Base (lcap). Spec: `hybrid-weights.review.spec.ts`.

1. Open the lcap detail as a launcher. Expected: "Specify Exact Basket Weights / Manage Weights" instead of a launch control; overview "Weights saved: No" (G-02, G-03).
2. Click Manage Weights. Expected: editor with back, hero, "Replace Basket with CSV" + "CSV Template", 8 unit inputs, "Max Auction Size per Token" collapsible, "Save Weights 0/8 edited" enabled (G-04). Back discards (G-08).
3. Edit one unit, Save. Expected: return to the action card; "Weights saved: Yes ›" (reopens the editor with the edited value); "Start auction 1 (15 minutes)" enabled (G-07, G-09).
4. Launch. Expected: intercepted `openAuction(nonce 5, 8 tokens, 8 weights)` (G-09).
5. Reload. Expected: back to step 1 — saved weights are memory-only (G-07).
- Workspace must preserve: the prerequisite step and its gate, every editor control, the saved/unsaved indicator, and a decision on persistence.

## S5 — Community launch and its failure modes

Roles: disconnected visitor; connected non-launcher. Spec: `roles-phases.review.spec.ts` (disconnected.permissionless.*, nonLauncher.rejected), tracked `launch-write.spec.ts` (call fires).

1. Permissionless phase, disconnected. Expected: enabled "Start auction 1 (30 minutes)"; clicking it leaves "Launching..." with no prompt (F-05 defect).
2. Permissionless phase, connected, reject in the wallet. Expected: stuck "Launching..." (F-06 defect).
3. Zero-width window (lcap). Expected: "Community launch is not available for this rebalance" + help (F-01).
- Workspace must preserve: the community path with the same wallet/network gating and failure handling as the launcher path.

## S6 — Completion and expiry

Roles: any. Spec: `launch-lifecycle.review.spec.ts` (finished.*, expiry.*), `phone-keyboard.review.spec.ts` (completed.*), tracked flows (expired card).

1. Basket already matches the target (progression > 99.7 %) while the window is open. Expected: "Rebalance Finished" card with local fallback metrics (K-01, K-03) and "Available after rebalance completion" tooltips (K-04).
2. Window expires while the detail is open. Expected: within the next data refresh the view flips to the completed card — with fabricated zeros when the API has no metrics for the nonce ("Rebalance Finished", red incomplete bar, $0.00, 0 %); the same after reload (K-06, K-03).
3. Expired with API metrics below 99.7 %. Expected: completed card with the incomplete bar, accuracy 96.4 %, traded, impact, NAV change (K-02, K-05); list row says "Completed".
- Workspace must preserve: an explicit distinction between finished, expired-complete and expired-incomplete, driven by time as well as data.

## S7 — Data boundaries

Spec: `monitoring-data.review.spec.ts`.

1. Prices pending. Expected: "0.00%" progress/target, "Remove Tokens" title, "$0" estimate until prices arrive (M-01).
2. Auctions query error. Expected: no live-auction state, launch control exposed (M-06).
3. Liquidity payload with an errored leg, a >5 % leg, a closed Ondo market and a limited Ondo leg. Expected: badges, "High price impact" and "Ondo limits" alerts, retry/refresh POSTs (I-02..I-06).
4. Ondo cap. Expected: launch percent silently lowered; only visible with `?debug=true` (I-07, L-01).
5. Unknown proposal id. Expected: skeleton title with a default action card (B-04).
6. Unlisted DTF with a live auction. Expected: filler card "CowSwap Auction Filler running... · 0 orders submitted · Stop" + red banner; Back raises the confirm guard and, dismissed, stays on the detail; failing SDK reads are not surfaced (J-01..J-05).

## S8 — Phone and keyboard

Spec: `phone-keyboard.review.spec.ts`.

1. 390 and 320: list, restricted detail, live auction with chart (dark), completed card, weight editor. Expected fits recorded in `phone-keyboard → *.fit`.
2. Desktop keyboard trail through the detail with a live auction; inventory of reachable controls, clickable non-focusable divs and chart dots.

## Minimum scenario set to review the eventual lab composition

Render and walk these eight states in this order; each must be shown with real
(snapshot-derived) identities and explicitly illustrative numbers.

| # | State | Role | Source scenario |
| --- | --- | --- | --- |
| 1 | Restricted phase, before the first auction, launcher ready | launcher | S2.1 |
| 2 | Same state as a visitor (countdown to permissionless) | visitor | S1.2 |
| 3 | Hybrid prerequisite (weights not saved) and the editor | launcher | S4.1–S4.2 |
| 4 | Launch pending → confirmed → waiting for indexing | launcher | S2.2–S2.4 |
| 5 | Auction underway with bids, then ending | any | S3.1–S3.3 |
| 6 | Ready for auction N+1 after one auction ran | launcher | S3.3 |
| 7 | Liquidity/Ondo warnings and a price-unavailable guard | launcher | S7.3, S2.1 |
| 8 | Finished / expired-incomplete / expired-complete | any | S6 |

Plus the two responsive passes (390 dark with a live auction; 320 with the
completed card) and one keyboard pass through state 5.
