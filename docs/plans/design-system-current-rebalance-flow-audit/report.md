# Current rebalance / auction operating flow — functionality and state audit

Report-only audit of the production rebalance list and rebalance detail
(`src/views/index-dtf/auctions/**`) to prepare the full-width current-rebalance
workspace. Companion files: [coverage-matrix.md](coverage-matrix.md) (stable IDs
for every function, state and transition), [scenarios.md](scenarios.md)
(journeys and the minimum review set), [evidence/index.md](evidence/index.md)
(commands, runtime, mocks, captures, limitations). No application code, test,
snapshot or configuration was modified; nothing was committed.

- **Baseline.** Primary checkout `/Users/lill-kire/Code/register`, HEAD
  `404bcbc414cf54eed988a9e6c95b74fa0c6e7251` on `design-system-v1`. The working
  tree carries uncommitted lab/doc work (Auctions browse, owned positions,
  lab spec edits) that does not touch the audited production sources; the
  81-file fingerprint of `src/views/index-dtf/auctions/**` was identical at the
  start and the end of the audit (`evidence/index.md` § Source fingerprint).
  A sibling untracked folder, `docs/plans/design-system-current-rebalance-readiness/`,
  appeared during the audit; it is not part of this package and was not read.
- **Evidence classes.** RX rendered and exercised · RO rendered only · SI
  source-inspected only · UN unresolved. Keys such as
  `launch-lifecycle → lag.buttonStates` point at
  `evidence/<area>/observations.json`. Synthetic overlays are labelled as such.
- **Prior research.** The 2026-09-11 rich-record package
  (`register-claude-table-review-2026-09-11/…/design-system-rich-record-research/`)
  was reused as discovery evidence; its browse/detail layout advice is
  superseded by the full-width direction and is not repeated here.

## 1. Readiness conclusion

The workspace can be composed faithfully from what is now documented, with
three caveats that are engineering or product decisions rather than gaps in
evidence:

1. **"Is an auction live?" has one fragile source.** Production derives it from
   the per-rebalance subgraph auctions query, never from RPC. After a confirmed
   launch the UI waits 10 s, refetches once, and re-arms the launch button at
   15 s regardless of the answer; an errored query is swallowed as "no auction".
   Both were exercised (`launch-lifecycle → lag.*`, `monitoring-data →
   auctionsQueryFailure`). The workspace needs an explicit "waiting for the
   auction to be indexed / auction state unknown" state and, ideally, an RPC
   confirmation of the open auction.
2. **Loading and unavailable data are rendered as confident zeros.** Progress
   "0%", next target "0%", "$0", the "Remove Tokens" round title before metrics
   exist, "Rebalance Finished" with 0% accuracy when API metrics are missing,
   and a silently Ondo-capped auction size. Each is a rendered state
   (`monitoring-data → pricesPending`, `launch-lifecycle → expiry.after`,
   `monitoring-data → ondoCap.*`). The workspace must distinguish pending,
   unavailable and zero, and must show launch inputs that change the calldata.
3. **Two write paths, two standards.** The launcher path gates on wallet and
   network, guards prices and handles rejection; the community path is a bare
   button that stays on "Launching..." when clicked without a wallet or when
   the wallet rejects (`roles-phases → disconnected.permissionless.afterClick`,
   `nonLauncher.rejected`). On-chain reverts leave both paths stuck
   (`launch-lifecycle → revert`). The workspace should use one transaction
   state machine for both.

Everything else a launcher or visitor can do today is inventoried with
prerequisites, states, outcomes and recovery in the matrix, and each reachable
action was either exercised offline or is marked SI/UN with the reason.

## 2. What was verified

| Check | Result |
| --- | --- |
| Repository auction specs (6 files, smoke + full + mobile) on the auditor's preview | 16 / 16 passed (`evidence/tracked-report.json`) |
| Audit harness (5 specs, 32 cases) | 32 / 32 passed, 0 flaky, 118 s (`evidence/harness-report.json`) |
| Transactions leaving the mock wallet | only the intercepted `openAuction` / `openAuctionUnrestricted` sends recorded in `txLog`; no signature, approval or broadcast |

Exercised end to end (RX): launcher launch → wallet pending → confirmed → toast
→ refresh with the new auction; indexer-lag re-arm and a second send;
rejection; revert; auction ending while open → "Start auction 2"; rebalance
expiry while open; in-session completion; hybrid Manage Weights entry → editor
→ discard → edit → save → launch with saved weights → reload loss; restricted →
permissionless crossing while mounted; disconnected and rejected community
launches; zero-width window; live auction with bids and bid inspection;
liquidity panel with error/high-impact/Ondo legs, refresh and retry; Ondo cap;
auctions-query failure; prices pending; debug mode; unknown proposal route;
phone fits at 390 and 320; keyboard trails.

Rendered only or source-only: legacy v2 UI, v4 detail (mainnet/open), the
cowbot stopped/start and order-submitted states (the running state and the
navigation guard were observed offline), the "Switch network" button (see § 5),
mid-session wallet connect/disconnect, out-of-bounds and unexpected-error
banners, liquidity API failure, the badge click-to-retry action.

## 3. Important findings

Each finding names the matrix row, the evidence class and its disposition.
"Defect" means a production behaviour the workspace must not reproduce; it is
reported, not fixed.

### F-01 Launch confirmation relies on fixed timers and an unguarded re-arm — E-06/E-07 · RX · defect
After the receipt, "Launching..." holds for 15 s and the auctions query is
refetched once at 10 s. With the subgraph still empty the button returns to
"Start auction 1 (30 minutes)" enabled; a second click sent a second
`openAuction` to the mock wallet (`lag.txLog`: two sends, selector `0x3c46570f`).
The on-chain contract would reject the second call, but the UI invites it.
Workspace: an explicit indexing-wait state; a chain-side check before
re-enabling; a single "auction live" source.

### F-02 Community launch has no wallet gate and no failure handling — F-04/F-05/F-06/N-05 · RX · defect
Disconnected visitors see an enabled "Start auction 1 (30 minutes)" in the
permissionless phase. Clicking it leaves "Launching..." indefinitely, with no
toast and no connect prompt (`disconnected.permissionless.afterClick`,
22 s). A connected non-launcher who rejects the signature is left in the same
state (`nonLauncher.rejected`, 23 s). Cause: the component never reads
`useWriteContract().isError` and is not wrapped in `TransactionButtonContainer`
(`community-launch-auctions-button.tsx:90-109, 142-177`).

### F-03 Reverted launches leave the launcher stuck — E-09 · RX · defect
With a reverted receipt (`harness.tx.revert()` plus an `eth_call` replay
answering `Folio__AuctionCannotBeOpened`), the launch button stayed
"Launching..." through 30 s with no toast (`launch-lifecycle → revert`, five
receipt polls). Only `useWriteContract` errors are handled
(`launch-auctions-button.tsx:115-120`); the receipt outcome is never checked.

### F-04 Pending data renders as zeros and a wrong round title — M-01/C-01/C-02/D-01/D-02 · RX · defect
With the price feed held: execution "0%", next target "0%", "Est. trade value
$0", "Total value traded $0", and the action card titled **"Remove Tokens"**
(`metrics.round ?? 0` maps to the EJECT title) beside a disabled community
button with no reason (`monitoring-data → pricesPending`,
`prices-pending-1400.png`). Once prices arrive: "Precision Rebalancing",
$626,416.81, 100% target. Zero and unknown are indistinguishable everywhere in
this card; the deviation cell alone uses a skeleton (and hides a genuine 0,
`rebalance-overview.tsx:108-112`).

### F-05 "Rebalance Finished" with fabricated zeros — K-03/K-06 · RX · defect
When API metrics are unavailable (the shared mock, and any nonce the API does
not know) the completed card falls back to local metrics and renders
"Rebalance Finished", a fully red incomplete bar, "$0.00", "0%", "0%", "0%"
and a title dated from the *current* clock ("Rebalance - August 2026")
(`launch-lifecycle → expiry.after`, `finished.withoutApiMetrics`,
`expired-while-open-1400.png`). The code comment says impact "will show as Not
available"; the UI shows 0%. The same card appeared when the rebalance expired
while the tab was open. Contrast: with API metrics the card is coherent
(`phone-keyboard → completed-390.png`: 96.4 %, $84,210, −1.51 %).

### F-06 The Ondo cap silently changes the launch size — I-07/E-12/L-01 · RX · defect + decision
With one Ondo leg over its session cap, the launch percent was driven to 2 %
and the estimated trade value fell from $626,416.81 to $72,419.16 with no
visible explanation in the ordinary view (`ondoCap.plain`). The only place
the percent is shown is the debug panel (`?debug=true` or `localhost`), which
also shows "Above Ondo single-trade limit" (`ondoCap.debug`). Product must
decide what a launcher sees and controls (percent, volatility) and the
workspace must surface any automatic change to the calldata.

### F-07 Debug mode is a user-reachable behaviour switch — L-01/L-06/K-07 · RX · engineering
`?debug=true` on any URL enables the slider (changes `openAuction` weights),
the volatility toggle, hides the completed card and disables the small-auction
100 % override. On an expired rebalance in debug mode the community button is
still enabled "Start auction 1" beside an "Ended" pill
(`monitoring-data → debugExpired`). Diagnostics and behaviour switches need to
be separated before the workspace inherits them.

### F-08 Auction-state failures are silent — M-06/H-01 · RX · defect
A GraphQL error on the per-rebalance auctions query is caught and treated as
"no auctions": no banner, no toast, launch control exposed
(`auctionsQueryFailure`). Combined with F-01 this means the UI can offer a
launch while an auction is running. The metrics and history queries fail into
permanent skeletons (prior evidence, A-07/M-07).

### F-09 Weight editor and completed card overflow on phones — P-05/P-06 · RX · defect
At 390 px the Manage Weights editor spans −103…493 px: the back control sits
off-screen and the table is clipped on both sides
(`phone-keyboard → editor.390.fit`, `editor-390-top.png`). At 320 px the
completed card (`min-w-[350px]`) spans −15…335 px (`completed.320.fit`). The
restricted detail, the live-auction detail with chart, and the list fit at
390 and 320 at this snapshot; the earlier 480 px overflow reported for the
live detail was not reproduced here (`detail.390.live.fit`: column 364 px, no
overflowing elements).

### F-10 Hybrid weights are session state — G-07 · RX · decision
Saved weights and edited units live in Jotai atoms only. After a reload the
launcher is back at "Specify Exact Basket Weights" with "Weights saved: No"
(`hybrid-weights → launcher.afterReload`). Nothing warns before leaving.
Product/engineering must decide whether saved weights persist (local storage,
URL, or backend) and how the workspace signals unsaved preparation.

### F-11 Keyboard and pointer reach — A-05/B-01/D-03/H-04/I-03/P-02 · RX · defect
List rows are `div role="button"` without `tabindex` (prior evidence); the
back control is an anchor wrapping a button (two tab stops,
`keyboard.backLink`); Selling/Buying lists open only on hover; chart bid dots
are non-focusable SVG (`keyboard.inventory`); the liquidity badge's retry
action lives inside a hover tooltip and the badges are not focusable
(`liquidity.retryControl`, `liquidity.tabTrail`; the badge tooltip reads
"Zapper error · Zapper timeout" and the retry is the badge's own `onClick`,
`liquidity-badge.tsx:44,74`, on a non-focusable element). The Help controls,
launch, title, refresh and editor inputs are reachable.

### F-12 Copy and provenance details — A-06/A-08/K-05/M-10 · SI + RO · defect (copy)
"Completed" is unconditional for every historical row; both provenance links
target the proposer's explorer page (the date link does not go to the proposal
or the execution transaction); a missing token metadata case is rendered as
"Price unavailable"; bid USD values in the chart panel are `toFixed(2)`
without thousands separators while the overview uses locale formatting
(`bids.selected`).

### F-13 Facts the detail loads but never shows — B-05 · SI · decision
Rebalance nonce, `priceControl`, limits, `bidsEnabled`, `startedAt`, the
starting transaction, and the auction's on-chain price range are available and
undisplayed. The auction ordinal ("Auction 1", "Start auction 2"), the number
of auctions run, the protocol round (EJECT / PROGRESS / FINAL) and the
progress percentage are four different things; the workspace should label them
distinctly and never present the ordinal as "of N".

### F-14 The in-browser filler runs silently through failing reads — J-01..J-05 · RX · defect + engineering
For listed DTFs (every snapshot DTF) the card is hidden by design. With cmc20
made unlisted and an auction live, the card rendered "CowSwap Auction Filler
running... · 0 orders submitted · Stop" with the red "Do not close this tab"
banner from the first second through 30 s (`monitoring-data → cowbot.states`,
`cowbot-1000.png`), while the SDK's reads (`0xfc528482` on the folio,
`0x61281516` on `0x0D3B…1F40`) were rejected by the strict mock
(`cowbot.unmockedCalls`): failed polling never reaches the user. Clicking Back
raised the `window.confirm` guard ("Are you sure you want to leave? This may
cause the auction to fail and value to be lost."); dismissing it kept the URL
(`cowbot.backAttempt`). The workspace must keep the guard but implement it at
the router level and show polling failures.

## 4. Product and engineering decisions needed before composition

Product / design:
- Where the restricted-phase deadline lives when a visitor cannot act (today
  inside a disabled button) and whether launchers may also use the community
  path (N-06).
- Which launch inputs a launcher sees: percent, volatility, small-auction
  override, Ondo cap (F-06, L-02, O-04).
- Copy for finished / expired-complete / expired-incomplete and for the list's
  "Completed"; whether "Auction N" and "N auctions run" are shown together.
- Whether ordinary users get the bid history list (H-08) and a keyboard path
  for bid inspection and the Selling/Buying lists.
- Persistence of saved weights (F-10) and a leave-without-saving warning.

Engineering review:
- One transaction state machine for launcher and community launches with
  receipt-revert handling (F-02, F-03).
- A confirmed source for "auction live" plus an indexing-wait state (F-01,
  F-08); explicit unavailable states for metrics, history and liquidity.
- Separation of `?debug=true` diagnostics from behaviour changes (F-07).
- `openAuction` weight/price math remains the standing engineer-review item
  (the specs prove the call fires with the right nonce and token count, not the
  numbers).
- Router-level navigation blocking for the filler (J-04); phone layouts for the
  editor and the completed card (F-09).

## 5. Remaining uncertainties

- v4 (mainnet/open) and v2 legacy detail views were not rendered; the tuple
  encoder in the repository is v5-shaped (O-01..O-03).
- Cowbot stopped/start transitions, order toasts and the 'error' status were
  not observed; only the running state and the guard were (F-14).
- Wallet connect/disconnect while the detail is mounted was not exercised
  (N-03); the role atom is reactive by construction.
- Wrong network is unresolved. With the injected wallet configured for Base
  (8453) and the BSC DTF open, no `wallet_switchEthereumChain` request was
  recorded and the launcher saw an enabled "Start auction 1 (30 minutes)"
  instead of the "Switch to BNB Smart Chain" control the source provides
  (`roles-phases → launcher.wrongNetwork`; `transaction.tsx:61-79` compares
  `walletChainAtom`, set from `useAccount().chainId`). Either the mock wallet
  reports the DTF chain regardless of the fixture option or the app offers a
  launch on the wrong chain; confirm with a real wallet before composing the
  network state (E-03).
- Liquidity API failure (empty result, "Unknown liquidity") and the
  out-of-bounds / unexpected-error banners are source-inspected only (M-04,
  M-05, M-09).
- The trigger that flips an open detail to the completed card at expiry was
  observed within the two-minute advance but not isolated to a specific data
  refresh (K-06).

## 6. Recommended next steps

1. Codex: compose against the eight minimum states in `scenarios.md` using the
   matrix rows marked **preserve**; treat every **defect** row as a state to
   design correctly, not to copy.
2. Engineering: decide F-01/F-02/F-03 before any launch control is styled; the
   composition depends on the state machine's vocabulary.
3. Product: settle the decision list in § 4; the countdown/deadline placement
   and the launch-input visibility change the workspace's information
   architecture.
4. Add the smallest tests that would pin the defects once fixed: a reverted
   receipt path, a disconnected community click, a "pending" price state
   asserting no zero renders, and a completed card with no API metrics
   asserting no fabricated values.
