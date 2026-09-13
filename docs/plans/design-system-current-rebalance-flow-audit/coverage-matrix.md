# Coverage matrix — current rebalance / auction operating flow

Snapshot `404bcbc414cf54eed988a9e6c95b74fa0c6e7251` (`design-system-v1`), primary
checkout with uncommitted lab/doc work that does not touch
`src/views/index-dtf/auctions/**` (fingerprint in `evidence/index.md`).
Line numbers refer to that tree. Every row names the role and prerequisites,
the owner, the behaviour observed or read, an evidence class and what the
full-width current-rebalance workspace must carry.

Evidence classes: **RX** rendered and exercised (offline mocks, a real
interaction or transition happened) · **RO** rendered only · **SI**
source-inspected only · **UN** unresolved. Keys such as `roles-phases →
nonLauncher.afterCrossing` point at `evidence/<area>/observations.json`;
`tracked:` points at the repository's own specs re-run here; `prior:` points at
the 2026-09-11 rich-record research package (superseded layout advice, still
valid production observations).

Dispositions: **preserve** the workspace must keep it · **defect** production
problem, do not reproduce · **decision** product/design owner · **engineering**
engineering review or adapter work · **out of scope** for the workspace.

## A. Entry: rebalance list

| ID | Function / state | Role, prerequisites | Owner | Current behaviour | Evidence | Workspace disposition |
| --- | --- | --- | --- | --- | --- | --- |
| A-01 | Route gate | any | `auctions/index.tsx:9-19` | `indexDTFVersionAtom === '2.0.0'` renders the legacy v2 UI instead; v4/v5 mount `dtf-auctions` | SI (no v2 DTF in the offline registry) | out of scope (legacy), but the gate must stay |
| A-02 | Active / historical bucketing | any | `rebalance-list/index.tsx:15-30` | `availableUntil > now` → active, else historical; evaluated when atoms change, not on a timer | RX tracked flows/auctions, multichain; `phone-keyboard → list.*` | preserve; the workspace's "current" rebalance is the active bucket (0, 1 or more) |
| A-03 | Multiple active rebalances | any | same | Each renders as a separate active row; nothing prevents two in-window rebalances (one live rebalance nonce on chain, but history rows are subgraph-driven) | SI (snapshots hold one in-window rebalance) | decision: which one the full-width workspace shows when >1 |
| A-04 | Active row content | any | `active-rebalance-item.tsx:15-65` | Icon, "Permissionless in: <d h m s>" (restricted phase only, hidden below `sm`), "Expires in:", proposal title (`line-clamp-2`), arrow, footer | RO tracked; prior captures | preserve facts; the split timing is decided by phase (N-01) |
| A-05 | Row activation | any | `:67-83`, `historical-rebalance-item.tsx:17-22` | `div role="button"` without `tabindex`, click → `navigate('rebalance/:proposalId')` | RX `phone-keyboard` (click), prior `lcap.idle.tabTrail` (not keyboard reachable) | defect (keyboard); preserve route-backed navigation |
| A-06 | Historical row | any | `historical-rebalance-item.tsx`, `metrics-row.tsx` | Unconditional "Completed"; accuracy, "N Auctions run / $X Traded", signed price impact (API cost-positive rendered as "−x%" red) | RX tracked; prior | preserve facts; "Completed" for expired-incomplete is a copy defect (K-05) |
| A-07 | Metrics unavailable | any | `metrics-row.tsx:20-21`, SDK read | API `[]`/error → skeleton forever, no state | RO prior harness run 1 | defect: needs an explicit unavailable state |
| A-08 | Provenance links | any | `rebalance-item-footer.tsx` | "Proposed: <date>" and "Proposed by: <ens/address>" both link to the **proposer address** explorer page (the date link does not go to the proposal or tx); proposer hidden below `sm`; `stopPropagation` keeps row navigation separate | SI + RO prior | defect (date links to the address); preserve two independent links |
| A-09 | Loading / empty | any | `index.tsx:32-46` | Two 208px skeletons with spinner counts; "No rebalances found" per section | RX tracked lifecycle (skeleton→list), prior empty | preserve |
| A-10 | Legacy trades entry | any | `index.tsx:48-61` | "View older auctions" → `./legacy` while `dtfTradesAtom` is undefined or non-empty | RO prior | preserve an entry point (secondary) |

## B. Detail: identity, provenance, timing

| ID | Function / state | Role, prerequisites | Owner | Current behaviour | Evidence | Disposition |
| --- | --- | --- | --- | --- | --- | --- |
| B-01 | Back | any | `rebalance-header.tsx:38-42` | `Link ../` wrapping a `Button` (anchor containing a button) | RX `phone-keyboard → keyboard.backLink` | preserve; fix nesting when recomposing |
| B-02 | Title → proposal | any | `:43-52` | Proposal title as underlined link to `governance/proposal/:id` in a new tab; skeleton while unmatched | RX `keyboard.titleLink` | preserve (provenance) |
| B-03 | Rebalance countdown pill | any | `:11-28`, `use-time-remaining.ts` | `availableUntil` countdown, d/h/m plus seconds under 1 h, "Ended" after; ticks every second | RX `launch-lifecycle → expiry.*` | preserve; decide whether "Ended" alone is enough (K-06) |
| B-04 | Unmatched proposal route | any | `atoms.ts:45-52`, header | `currentRebalanceAtom` undefined → title skeleton, no pill, "Remove Tokens" card with 0 %/0 %/$0, skeleton stacks and "Community launch is not available for this rebalance" (`undefined === undefined`) | RX `monitoring-data → unknownProposal` | defect: needs a not-found state |
| B-05 | Rebalance identity facts not shown | — | `atoms.ts` `Rebalance` type | nonce, priceControl, limits, `bidsEnabled`, `startedAt`, tx hash are loaded but never displayed | SI | decision: which identity facts the workspace exposes (nonce/round are distinct from auction ordinal) |
| B-06 | Restricted-phase deadline in the detail | non-launcher | `community-launch-auctions-button.tsx:122-140` | Only inside the disabled community button ("Permissionless in: 1h 2m") | RX `roles-phases → disconnected.restricted` | preserve the fact; place it outside a disabled control (decision) |

## C. Progress, deviation, traded value

| ID | Function / state | Role, prerequisites | Owner | Current behaviour | Evidence | Disposition |
| --- | --- | --- | --- | --- | --- | --- |
| C-01 | Execution progress % | any; needs prices + RPC + initial block reads | `rebalance-progress.tsx`, `rebalance-metrics-updater.tsx` | `relativeProgression` from `getOpenAuction`; shows "0.00%" while metrics are undefined | RX `monitoring-data → pricesPending/pricesResolved` | defect (0% while loading); preserve the metric |
| C-02 | Next auction target % | same | same | `relativeTarget × 100`; "0.00%" while loading; changes with rebalance percent (Ondo cap, dev slider) | RX same; `ondoCap.*` | preserve; explain that it depends on the launch percent |
| C-03 | Progress bar | same | `progress-bar.tsx` | Segmented bar: current (thick), expected (thin), dashed target marker, grey remainder | RO all detail captures | preserve semantics (current vs target) |
| C-04 | Total value traded | any | `rebalance-overview.tsx:82-100`, `use-total-value-traded.ts` | Sum of bids' sell amounts × current price; "$0" with no bids | RX `monitoring-data → bids.state.overview` | preserve; note it is price-at-view-time, not settlement value |
| C-05 | Current basket deviation | any | `rebalance-overview.tsx:101-113` | `100 − absoluteProgression` as "−x%"; skeleton until metrics; `trackingError` 0 also renders the skeleton (`{trackingError ? … : <Skeleton/>}`) | RX `pricesPending`, SI (zero case) | defect (0 renders as skeleton); preserve |

## D. Action card: round, estimate, assets

| ID | Function / state | Role, prerequisites | Owner | Current behaviour | Evidence | Disposition |
| --- | --- | --- | --- | --- | --- | --- |
| D-01 | Round title / description | any, no live auction | `rebalance-action.tsx:24-80` | EJECT "Remove Tokens" (+ "Remove X and Y from the basket"), PROGRESS "Progressing", FINAL "Precision Rebalancing"; `metrics.round ?? 0` → **"Remove Tokens" while metrics are loading** | RX `pricesPending` (title before metrics), tracked round 2 | defect (loading title); preserve protocol round separately from auction ordinal |
| D-02 | Est. trade value | same | `rebalance-action-overview.tsx:99-107` | `$auctionSize`; "$0" while loading | RX | defect (0 while loading); preserve |
| D-03 | Selling / Buying stacks | same | `:108-141` | Up to 7 stacked logos, HoverCard with full list (name, $symbol); skeleton while empty | RX `roles-phases → launcher.restricted.sellingHoverCard` | preserve; hover-only disclosure needs a keyboard path |
| D-04 | Card hidden during a live auction | any | `rebalance-action.tsx:126-129` | Whole action card unmounts while `activeAuctionAtom` is set | RX `launch-lifecycle → confirm.afterRefresh`, `ending.live` | preserve (no launch during a live auction) |
| D-05 | Launcher vs community branch | role | `:140-144` | `isAuctionLauncherAtom` (wallet ∈ `dtf.auctionLaunchers`, subgraph) chooses the button | RX `roles-phases` | preserve; permission resolution stays subgraph-driven (N-02) |

## E. Launcher launch (`openAuction`)

| ID | Function / state | Role, prerequisites | Owner | Current behaviour | Evidence | Disposition |
| --- | --- | --- | --- | --- | --- | --- |
| E-01 | Ready control | launcher, wallet on DTF chain, params resolved, prices usable, percent > 0, no live auction | `launch-auctions-button.tsx:89-94, 184-211` | "Start auction N (30 minutes)" with N = auctions.length + 1 and duration from `dtf.auctionLength` | RX tracked launch-write; `roles-phases → launcher.restricted` | preserve; N is an ordinal, never a total |
| E-02 | Wallet not connected | launcher-capable visitor | `TransactionButtonContainer` | Disconnected users are never launchers (role needs a wallet) → community branch instead | RX `roles-phases → disconnected.*` | preserve |
| E-03 | Wrong network | launcher on another chain | `transaction.tsx:61-79`, `AtomUpdater.tsx:36-68` | Source: "Switch to <chain>" replaces the launch button when `walletChainAtom` (from `useAccount().chainId`) differs. Observed with the mock wallet configured for Base: no switch request, launch button rendered for the BSC DTF | UN `roles-phases → launcher.wrongNetwork` | engineering: confirm with a real wallet; preserve the switch state |
| E-04 | Price guard | launcher | `:62-94, 172-183` | Missing/0 price → red "Price unavailable for X — cannot launch" note + disabled button; banner from the metrics updater | RX tracked launch-price-guard | preserve (must not be lost in recomposition) |
| E-05 | Submit → wallet pending | launcher | `:122-163, 187-199` | `isLaunching` + `isPending` → spinner "Launching..."; args from `getRebalanceOpenAuction` (math is engineer-review territory) | RX `launch-lifecycle → confirm.pendingWallet`, calldata fixture | preserve; engineering: calldata math |
| E-06 | Receipt confirmed | launcher | `:96-113` | toast "Auction launched successfully"; **10 s** later `refreshNonce++` refetches auctions; **15 s** later `isLaunching` clears regardless of data | RX `confirm.receipt`, `confirm.afterRefresh` | preserve the intent; engineering: replace fixed timers with a state-driven refresh |
| E-07 | Indexer lag after confirmation | launcher | same | With the subgraph still empty after 15 s the button re-arms as "Start auction N" and a second `openAuction` can be sent | RX `launch-lifecycle → lag.*` (synthetic second send) | defect: the workspace needs an explicit "waiting for indexer" state and a chain-side guard |
| E-08 | Wallet rejection | launcher | `:115-120` | `useWriteContract.isError` → toast "Transaction rejected or failed", `isLaunching` cleared | RX `launch-lifecycle → reject` | preserve |
| E-09 | On-chain revert | launcher | same | Only `useWriteContract` errors are handled; a reverted receipt is not watched | RX `launch-lifecycle → revert` (see report for the observed state) | defect / engineering |
| E-10 | Local build error | launcher | `:158-162` | try/catch → toast "Error opening auctions" | SI | preserve |
| E-11 | Analytics | launcher | — | No Mixpanel event on launch, reject or success; only page view tracking | SI (`useTrackIndexDTFPage('auctions')`) | engineering: instrument in adoption |
| E-12 | Percent and volatility inputs | launcher | `rebalance-debug.tsx`, `atoms.ts:48-51,78` | `rebalancePercentAtom` (default 98, Ondo-capped, small-auction 100%) and `priceVolatilityAtom` feed the calldata but are only visible/editable with `?debug=true` | RX `monitoring-data → ondoCap.*` | decision + engineering: which inputs a launcher may see or change in the workspace (L-01) |

## F. Community launch (`openAuctionUnrestricted`)

| ID | Function / state | Role, prerequisites | Owner | Current behaviour | Evidence | Disposition |
| --- | --- | --- | --- | --- | --- | --- |
| F-01 | Zero-width window | any non-launcher | `community-launch-auctions-button.tsx:51-52, 111-120` | "Community launch is not available for this rebalance" + help "Only the auction launcher can start auctions" | RX `roles-phases → disconnected.lcap.zeroWindow` | preserve |
| F-02 | Restricted phase | non-launcher | `:122-140` | Disabled button "Permissionless in: <countdown>" (own `parseDurationShort` format) | RX `disconnected.restricted`, `nonLauncher.beforeCrossing` | preserve the countdown; decide its placement (B-06) |
| F-03 | Crossing into permissionless while mounted | non-launcher | `:55-69` | 1 s interval flips to the enabled button without reload | RX `nonLauncher.afterCrossing` | preserve |
| F-04 | Enabled control | non-launcher, params resolved, percent > 0 | `:142-177` | "Start auction N (30 minutes)"; **not wrapped in `TransactionButtonContainer`** | RX `disconnected.permissionless.before` | preserve the action; see F-05 |
| F-05 | Click without a wallet | disconnected | `:90-109` | `writeContract` fails asynchronously; component never reads `isError` → "Launching..." spinner stays, no toast, no connect prompt | RX `disconnected.permissionless.afterClick` | defect: gate on connection like the launcher path |
| F-06 | Wallet rejection | connected non-launcher | same | Same unhandled `isError` → stuck "Launching..." | RX `nonLauncher.rejected` | defect |
| F-07 | Confirmed | connected non-launcher | `:71-88` | No toast; same 10 s / 15 s timers | RX tracked launch-write (call fires); timers SI | preserve intent; align with E-06/E-07 |
| F-08 | Price availability | non-launcher | — | No price guard on this path (call carries only the nonce); the red banner is launcher copy ("cannot launch auction") while the community button stays enabled | RO prior `cmc20.detail.priceGap`; SI | decision: whether community launch should be blocked or the banner reworded |

## G. Hybrid weight management

| ID | Function / state | Role, prerequisites | Owner | Current behaviour | Evidence | Disposition |
| --- | --- | --- | --- | --- | --- | --- |
| G-01 | Hybrid designation | — | `state/dtf/atoms.ts:228-242` | Curated address allowlist (LCAP, Venionaire, six test addresses); not derived from `weightControl` | SI | engineering: keep curated until an on-chain signal exists |
| G-02 | Entry card | launcher, hybrid, no auctions run, weights not saved | `rebalance-action.tsx:82-133` | "Specify Exact Basket Weights / Manage Weights" replaces the round card and launch button | RX `hybrid-weights → launcher.entry` | preserve as a prerequisite step |
| G-03 | Saved indicator | any, hybrid | `rebalance-overview.tsx:33-80` | "Weights saved: No ✗" until saved or an auction exists; launcher sees "Yes ›" to reopen while no auction ran | RX `launcher.afterSave`, `nonLauncher` | preserve; copy decision for non-launchers |
| G-04 | Editor | launcher | `manage-weights-view.tsx`, `-content.tsx`, `index-basket-setup` | Header with back, hero, CSV import, units table (token/current/input/allocation), max-auction-size editor (collapsible), "Save Weights N/M edited" | RX `launcher.editor` | preserve; keep all secondary controls reachable |
| G-05 | Fail-closed | launcher | `manage-weights-view.tsx:28-45, 152-164` | 0 supply or any tuple token missing from the subgraph map → `manage-weights-unavailable` | SI + unit-pinned (tracked `manage-weights/tests`) | preserve |
| G-06 | Validation | launcher | `index-basket-setup/atoms.ts:124-136` | units mode: valid when items exist and every token has a price > 0; allocation total not enforced in units mode | SI | engineering: confirm intended validation |
| G-07 | Save | launcher | `-content.tsx:94-182` | Builds `getStartRebalance` weights, stores `savedWeightsAtom`/`managedWeightUnitsAtom` **in memory only**, returns to the action card | RX `launcher.afterSave`, `launcher.afterReload` | preserve; decision/engineering: persistence across reload |
| G-08 | Back without saving | launcher | `manage-weights-header.tsx` | Returns; edits discarded | RX `launcher.backWithoutSave` | preserve |
| G-09 | Launch after save | launcher | `launch-auctions-button.tsx:57-60` | Saved weights replace `initialWeights` for the first auction only (`auctions.length === 0`) | RX `launcher.launchCalldata` | preserve; engineering: subsequent auctions use `originalRebalanceWeightsAtom` from the first auction block |
| G-10 | Debug logging | launcher | `-content.tsx:160-173` | `console.log` of weights on save | SI | defect (noise) |

## H. Live auction monitoring

| ID | Function / state | Role, prerequisites | Owner | Current behaviour | Evidence | Disposition |
| --- | --- | --- | --- | --- | --- | --- |
| H-01 | Active auction detection | any | `atoms.ts:107-127` | First subgraph auction with `endTime > now` (evaluated when auctions data changes) | RX `launch-lifecycle → confirm.afterRefresh`, `monitoring-data → bids.state` | preserve; source is the subgraph, not RPC (E-07) |
| H-02 | Auction card | any | `rebalance-auctions.tsx:149-176` | Spinner badge, "Auction N", "Bidding is ongoing...", countdown pill (primary tone), chart | RX | preserve |
| H-03 | Dutch-auction chart | any | `auction-bids-chart.tsx` | Synthetic exponential curve (not on-chain prices), past segment tinted, dashed "optimal" midpoint, bid dots on the curve; re-renders every second | RX `bids.*` | decision: chart shows a schematic price path, not real prices — the workspace must not imply otherwise |
| H-04 | Bid inspection | any | `:172-175, 274-426` | Click a dot → "Bid #n" panel with tx/bidder/token explorer links and USD values; dots are SVG without keyboard access | RX `bids.selected` | preserve information; keyboard path is a defect |
| H-05 | Submitting a bid | — | — | No bid action anywhere in the UI (viewing only) | SI (tracked guide: bid writes deferred) | out of scope: do not invent a bid control |
| H-06 | Polling while live | any | `use-rebalance-auctions.ts:89-96`, `use-rebalance-current-data.ts:95-103` | Auctions every 30 s while `availableUntil` ≥ now; RPC tuple every 10 s while an auction is ongoing (`getRebalance` reads went from 2 to 19 within 31 s of the auction going live) | RX `confirm.liveRefetch`, `ending.afterEnd.auctionQueries` | preserve cadence semantics |
| H-07 | Auction end while open | any | `:126-147` | 1 s monitor bumps `refreshNonce` after `endTime` → refetch → card unmounts, action card returns with "Start auction N+1" | RX `launch-lifecycle → ending.*` | preserve |
| H-08 | Bids list | any | `rebalance-bids-list.tsx` | Aggregated newest-first list with round labels — rendered **only inside the dev panel** | RX `monitoring-data → debugExpired.panelSections` | decision: expose the bid history to ordinary users? |

## I. Liquidity, price impact, Ondo

| ID | Function / state | Role, prerequisites | Owner | Current behaviour | Evidence | Disposition |
| --- | --- | --- | --- | --- | --- | --- |
| I-01 | Liquidity panel | any, metrics + prices + ETH price | `rebalance-liquidity-checker.tsx`, `use-rebalance-liquidity-check.ts` | POST `/rebalance/liquidity` for surplus/deficit legs scaled to the matched auction size; debounced 1 s; polls every 30 s while the window is open | RX `monitoring-data → liquidity.*` | preserve |
| I-02 | Per-token rows | any | `TokenRow` | Symbol, USD size, impact % coloured (≤0 green, ≤3 amber, else red), badge (high/medium/low/insufficient/error/unknown/failed) with tooltip | RX | preserve |
| I-03 | Retry / refresh | any | `:226-232`, hook `retryToken`, `liquidity-badge.tsx:44,74` | Header refresh (button) refetches all (POST count 2 → 3); per-leg retry is the badge's own click handler on a non-focusable element whose tooltip reads "Zapper error · <reason>" | RX refresh (`liquidity.requests`), SI retry (`liquidity.retryControl`, `liquidity.errorBadgeTooltip`) | preserve both; make retry a discoverable, focusable control |
| I-04 | High impact alert | any | `:240-262` | Any leg > 5% → destructive alert with symbols and "Estimated loss: ~$" | RX | preserve |
| I-05 | Ondo rows | any | `OndoBadge`, `ondoHasProblem` | Tradeable / Limited / Market closed pill with tooltip (session, next open, upcoming events) | RX | preserve |
| I-06 | Ondo alert | any | `:263-277` | "Ondo limits — outside trading hours or larger than the max single Ondo trade. Oversized legs fill as multiple sequential trades." | RX | preserve |
| I-07 | Ondo cap on the launch percent | launcher | `ondo-cap-updater.tsx`, `use-ondo-limit-status.ts` | Silently lowers `rebalancePercent` to the highest safe percent; only the dev slider shows it | RX `ondoCap.debug/plain` | defect (invisible consequential change) / decision |
| I-08 | Totals | any | `:280-296` | "Total trade value" and "Estimated total impact" with colour | RX | preserve |

## J. Automation (CowSwap filler)

| ID | Function / state | Role, prerequisites | Owner | Current behaviour | Evidence | Disposition |
| --- | --- | --- | --- | --- | --- | --- |
| J-01 | Eligibility | any | `rebalance/index.tsx:76-104`, `use-is-listed-dtf.ts`, `use-cowbot-query.ts:60-69` | Runs only when an auction is active, the DTF is **not** in the discover list (`/v1/discover/dtfs`), chain ∈ {1, 8453, 56}, and a public client exists; every snapshot DTF is listed, so the card never shows for them | RX `monitoring-data → cowbot.states` (unlisted overlay) | preserve rule; decision: how the workspace explains "external bot handles listed DTFs" |
| J-02 | Status card | any | `cowbot-card.tsx` | "CowSwap Auction Filler running... · 0 orders submitted · Stop" observed; starting…, stopped/Start not observed; hidden for external/error | RX running (`cowbot-1000.png`), SI others | preserve |
| J-03 | Warning banner | any | `cowbot-warning-banner.tsx` | "Do not close this tab while an auction is in progress" while active | RX | preserve |
| J-04 | Navigation guard | any | `cowbot-widget.tsx:58-109` | `beforeunload` prompt + monkey-patched `pushState`/`replaceState`/`popstate` with `window.confirm`; Back raised the confirm and, dismissed, kept the URL | RX `cowbot.dialog`, `cowbot.backAttempt` | engineering: replace with router blocking; workspace must keep the guard |
| J-05 | Failure visibility | any | `use-cowbot-query.ts:84-93, 127-133` | SDK reads rejected by the strict mock (`cowbot.unmockedCalls`) while the card stayed "running… 0 orders"; a query error would hide the card silently; only per-order errors toast | RX (running through failing reads), SI (error status) | defect: no visible failure state |
| J-06 | Toasts | any | `:108-115` | "CowBot submitted N new order(s)" | SI | preserve |

## K. Completion and expiry

| ID | Function / state | Role, prerequisites | Owner | Current behaviour | Evidence | Disposition |
| --- | --- | --- | --- | --- | --- | --- |
| K-01 | Completed predicate | any | `use-is-rebalance-completed.ts` | not dev mode ∧ no active auction ∧ (expired ∨ progression > 99.7 % ∨ (FINAL round ∧ auctionSize < 1)) | RX `launch-lifecycle → finished.*`, tracked expired card | preserve; decision on copy for each cause |
| K-02 | Completed card | any | `rebalance-completed.tsx` | Gradient header, back, "Rebalance - <Month YYYY>", progress bar (solid ≥ 99.7 %, else incomplete bar), value traded, price impact (+USD), accuracy (help), NAV change (help) | RX; prior captures | preserve |
| K-03 | Metrics source | any | `use-rebalance-completed-metrics.ts` | API metrics when available, else local fallback: auctionsRun 0, priceImpact **0 rendered as "0.00%"** (comment claims "Not available"), NAV 0 rendered "0.00%" | RX `finished.withoutApiMetrics` | defect: unavailable rendered as zero |
| K-04 | "Available after rebalance completion" | any, not yet expired | `:164-168, 214-218` | Tooltips on price impact and NAV change while `isCompleted` is false | RX `finished.tooltips` | preserve |
| K-05 | Expired but incomplete | any | list + card | List says "Completed"; card shows the incomplete bar with API accuracy | RO prior `lcap-detail-1400-completed`; RX `phone-keyboard → completed.*` | defect (list copy) / decision (card wording) |
| K-06 | Expiry while the view is open | any | `atoms.ts:111-119` (no ticker), `use-is-rebalance-completed.ts` | Observed: within the 2-minute advance the open detail flipped to the completed card with local fallback zeros ("Rebalance Finished", 0 %, $0.00); the flip is triggered by an upstream data refresh, not by a clock, so its timing is not guaranteed | RX `launch-lifecycle → expiry.before/after/afterReload` | defect (fabricated metrics) / engineering (time-driven transition) |
| K-07 | Dev mode | any with `?debug=true` | `use-is-rebalance-completed.ts:20` | Completed card never shows | RX `monitoring-data → debugExpired` | see L |

## L. Diagnostics / development-only tooling

| ID | Function / state | Role, prerequisites | Owner | Current behaviour | Evidence | Disposition |
| --- | --- | --- | --- | --- | --- | --- |
| L-01 | Enablement | anyone | `state/updaters/DevModeUpdater.tsx` | `?debug=true` in the URL **or** hostname `localhost` | RX `monitoring-data → ondoCap.debug` | engineering: user-reachable switch that changes launch inputs |
| L-02 | Rebalance percent slider | debug | `rebalance-debug.tsx:27-67` | 0–100, blocked at or below progression + 2, disabled during a live auction; "Above Ondo single-trade limit" warning | RX | decision: launcher-facing control or not |
| L-03 | Expected price volatility | debug | `:91-122` | low / medium / high / degen (2 / 5 / 10 / 50 %) feeds `priceError` | RX (rendered) | decision |
| L-04 | Price impact list, Metrics JSON, Parameters JSON | debug | `:124-142`, `rebalance-price-impact.tsx` | Collapsibles with raw JSON | RX (rendered) | out of scope for ordinary users |
| L-05 | Bids list | debug | H-08 | — | — | decision |
| L-06 | Behaviour changes in debug | debug | `rebalance-metrics-updater.tsx:95-99`, K-07 | Small-auction 100 % override off; completed card off | SI + RX | engineering: separate diagnostics from behaviour switches |

## M. Loading, missing prices, malformed data, recovery

| ID | Function / state | Role, prerequisites | Owner | Current behaviour | Evidence | Disposition |
| --- | --- | --- | --- | --- | --- | --- |
| M-01 | Prices pending | any | C-01, D-01, D-02 | Zeros and "Remove Tokens" title before metrics exist; no skeleton for progress | RX `pricesPending` | defect |
| M-02 | Hard price error | launcher | `rebalance-metrics-updater.tsx:181-186`, E-04 | Banner "Price data unavailable — cannot launch auction." + disabled launcher button with reason | RX tracked launch-price-guard | preserve |
| M-03 | One price missing | any | `:129-139` | Banner "Price unavailable for "X" — cannot launch auction."; round flips to EJECT; community button stays enabled | RO prior `cmc20.detail.priceGap` | preserve banner; F-08 decision |
| M-04 | Out-of-bounds token | any | `:140-157` | Banner "Token "X" is out of bounds. Rebalance must be closed." | SI | preserve |
| M-05 | Unexpected metrics error | any | `:157-159` | Banner "Unexpected error getting Rebalance data." | SI | preserve |
| M-06 | Auctions query failure | any | `use-rebalance-auctions.ts:83-86` | Caught → `[]` → no live-auction state, launch control re-exposed | RX `auctionsQueryFailure` | defect: silent; the workspace needs an "auction state unknown" signal |
| M-07 | Rebalance history failure | any | `auctions/updater.tsx` | `rebalancesAtom` stays undefined → list skeleton forever; detail never matches | SI (class shown by prior loading capture) | defect |
| M-08 | Metrics API failure | any | A-07 | Skeleton forever | RO prior | defect |
| M-09 | Liquidity API failure | any | hook `catch → EMPTY` | Panel shows "Unknown liquidity" badges, no error banner | SI | decision |
| M-10 | Token metadata missing (indexer lag) | any | `use-rebalance-params.ts:142-146`, G-05, `buildOpenAuctionArrays:67-71` | Launch fails closed ("token-metadata-missing" is rendered as the price-unavailable note); editor unavailable | SI + unit | preserve fail-closed; copy defect (reason mislabelled) |

## N. Roles, wallet and network transitions

| ID | Function / state | Role, prerequisites | Owner | Current behaviour | Evidence | Disposition |
| --- | --- | --- | --- | --- | --- | --- |
| N-01 | Phase model | — | subgraph `restrictedUntil`/`availableUntil` | restricted (launcher only) → permissionless (anyone) → expired; zero-width windows have no community phase | RX all phase cases | preserve |
| N-02 | Launcher resolution | connected | `isAuctionLauncherAtom` | Subgraph `auctionLaunchers` vs connected wallet (lower-cased) | RX tracked + `roles-phases` | preserve; engineering: refresh on wallet change (atom is reactive) |
| N-03 | Wallet connect while mounted | any | wagmi | Role re-evaluates; community ↔ launcher branch swaps | SI (atom derivation); connect exercised only before render | UN (mid-session connect not exercised) |
| N-04 | Wrong network | launcher | E-03 | Switch control | RX | preserve |
| N-05 | Disconnected in permissionless phase | visitor | F-04/F-05 | Enabled action that cannot complete | RX | defect |
| N-06 | Community launch by a launcher | launcher | D-05 | Launchers never see the community button, even in the permissionless phase | SI | decision: should a launcher be able to choose the unrestricted path? |

## O. Version and chain differences

| ID | Function / state | Owner | Current behaviour | Evidence | Disposition |
| --- | --- | --- | --- | --- | --- |
| O-01 | v5 tuple / `bidsEnabled` | `transforms.ts`, `use-rebalance-current-data.ts` | v5 exposes `bidsEnabled`; v4 assumes true | RX (v5 only) | UN: v4 detail never rendered (tuple encoder is v5-shaped) |
| O-02 | v4 (mainnet/open) | same, `use-rebalance-params.ts:89` | Different ABI; list bucketing works | RX list only (tracked multichain) | UN (v4 detail) |
| O-03 | v2 legacy | `legacy/*`, `/auctions/legacy` | Whole area replaced | SI | out of scope |
| O-04 | Chain-specific small-auction floor | `rebalance-metrics-updater.tsx:87-99` | BSC/Base < $100, Mainnet < $1000 → percent forced to 100 (non-dev) | SI | preserve; explain to launchers (decision) |
| O-05 | Auction length | `dtf.auctionLength` | 30 min (cmc20), 15 min (lcap) | RX | preserve |

## P. Navigation, keyboard, phone

| ID | Function / state | Owner | Current behaviour | Evidence | Disposition |
| --- | --- | --- | --- | --- | --- |
| P-01 | Route-backed selection | router | `/auctions/rebalance/:proposalId`; back/forward/reload keep it | RX prior `cmc20.restricted.*` | preserve in the workspace (deep links) |
| P-02 | Keyboard reach | detail | Back, title, launch/community, help buttons, liquidity refresh/retry, editor controls reachable; list rows, chart dots and hover disclosures not | RX `phone-keyboard → keyboard.*` | defects listed |
| P-03 | Phone 390: restricted detail | layout | Fits | RX `detail.390.restricted.fit` | preserve |
| P-04 | Phone 390: live auction with chart | layout | Fits at this snapshot: column 364 px, no element beyond the viewport (the 480 px overflow reported at `01a900c` was not reproduced) | RX `detail.390.live.fit`, `detail-390-live-top-dark.png` | preserve; re-measure after recomposition |
| P-05 | Phone 320 | layout | List, restricted and live detail fit; the completed card (`min-w-[350px]`) spans −15…335 px | RX `completed.320.fit`, `completed-320.png` | defect (completed card) |
| P-06 | Phone: weight editor | layout | Editor spans −103…493 px at 390: back control off-screen, table clipped both sides, no page scroll | RX `editor.390.fit`, `editor-390-top.png` | defect |
| P-07 | Hover-only disclosures | D-03, I-02 tooltips | Selling/Buying lists open on hover; badges open on hover/focus | RX | decision: keyboard/touch path |
| P-08 | Dialogs | J-04 | `window.confirm` blocks navigation | RX | engineering |
