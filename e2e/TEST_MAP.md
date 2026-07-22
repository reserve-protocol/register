# E2E Test Map — domain-organized coverage matrix

The authoritative map of what the e2e suite covers, organized by ROUTE →
SUBROUTE → STATE, with two cross-cutting dimensions applied to EVERY page:
the **loading lifecycle** and **mobile**. Replaces the flat `smoke/` + `flows/`
split. Status: ✅ covered · 🟡 partial · ⬜ gap · 🐛 known bug (test.fixme).

Three test dimensions, every page gets all three:
1. **State-space** — every meaningful state of the page (not just the happy render).
2. **Loading lifecycle** — blank → skeleton → partial → full (see § Lifecycle).
3. **Mobile** — the same, at the mobile breakpoint (see § Mobile).

---

## § Lifecycle (applies to EVERY route)

Observed problem: several current specs assert on a testid that renders during
the SKELETON phase, so they pass while the page is still loading — they test the
shell, not the data, and they mask layout shift. The lifecycle becomes a
first-class, ordered assertion per page:

| Phase | What to assert |
|---|---|
| **L0 blank** | Route mounts, no crash, container present (pre-data). |
| **L1 skeleton** | The skeleton has the RIGHT shape/count for the eventual content (a 5-row skeleton for a 5-row table), and occupies the SAME box the content will (no reflow). Assert skeleton testids exist. |
| **L2 partial** | Each independent data island resolves on its own (hero, chart, basket, balance, proposal list…). Assert each island's skeleton→content transition, and that resolving island A does NOT shift island B. **Layout-shift budget: 0 unexpected reflows.** |
| **L3 full** | All islands resolved → run the actual behavior/value assertions (what the current suite does). |

Mechanics: freeze the clock, delay specific boundary responses per-island
(`overrides` can hold a response), assert the skeleton, then release and assert
the content in the SAME layout box. A CLS-style probe records boundingRect
deltas across the transition. Skeleton testids (`<area>-skeleton`) are added
attribute-only where missing.

## § Mobile (applies to EVERY route)

Every page spec runs a `@mobile` variant at a phone viewport (e.g. 390×844,
`devices['iPhone 13']`) covering L0–L3 + the mobile-specific chrome (bottom nav,
hamburger/portal menu, mobile CTA bar, collapsed tables → cards, mobile
dialogs). Playwright project matrix: `{smoke, full} × {desktop, mobile}`.

---

## "General" (top-level routes)

| Route | Sub | States to cover | Lifecycle | Mobile | Status |
|---|---|---|---|---|---|
| Home | — | hero, featured marquee (weight-desc order), packing animation, empty/error featured | L0–L3 | ⬜ | 🟡 shell + featured count only |
| Discover | — | index list, search narrow/restore, index↔yield tab, deprecated-DTF search (Stage 2), empty/error, row→overview | L0–L3 | ⬜ | 🟡 search+tab+nav |
| Earn | IndexDTF / YieldDTF / DeFi | each earn tab list, sort, empty/error, APY columns | L0–L3 | ⬜ | ⬜ |
| Portfolio | — | connected holdings, empty (no activity), past-activity-only edge, disconnected | L0–L3 | ⬜ | ⬜ |
| Tokens (`/tokens`) | listed + unlisted | listed/unlisted RTokens tables; unlisted partial-chain survival (Z2, `general/tokens/unlisted-partial.spec.ts`) | L0–L3 | ⬜ | 🟡 Z2 partial-response only |
| Create Index DTF | deploy wizard | coming-soon gate + permissionless deploy path (multi-step: basket/CSV, governance, confirm) | L0–L3 | ⬜ | ⬜ (deferred non-goal) |
| Create Yield DTF | deploy wizard | multi-step deploy | L0–L3 | ⬜ | ⬜ (deferred non-goal) |
| Explorer | Transactions | list, filters, chain filter, pagination, empty | L0–L3 | ⬜ | ⬜ |
| Explorer | Tokens | list, filter, row link chain-correctness | L0–L3 | ⬜ | ⬜ |
| Explorer | Collaterals | list, status states | L0–L3 | ⬜ | ⬜ |
| Explorer | Governance | cross-DTF gov list | L0–L3 | ⬜ | ⬜ |
| Explorer | Revenue | available revenue table | L0–L3 | ⬜ | ⬜ |
| Bridge | — | bridge form, quote, chain select, errors | L0–L3 | ⬜ | ⬜ |

Explorer + Earn + Portfolio + Bridge are **entirely uncovered** today.

## "Index DTF" (`/:chain/index-dtf/:tokenId/*`)

| Route | Sub | States to cover | Lifecycle | Mobile | Status |
|---|---|---|---|---|---|
| Overview | — | render ×3 chains, chart per range, **empty/single-point/price-0 chart** (🐛 #20 infinite skeleton), exposure vs collateral mcap, deprecated badge, SPA cross-chain nav (🐛 #1/#18 wrong-chain) | L0–L3 (the layout-shift work lives here) | ⬜ | 🟡 render+chart+edges; SPA fixme |
| Issuance | Zap | buy/sell + calldata, impact≥5% gate, quote-error, insufficient funds, low-liquidity variant, compliance | L0–L3 | ⬜ | ✅ zap; ⬜ low-liq/mobile |
| Issuance | Manual | mint/redeem + math boundaries (MAX/rounding/minOut/decimals), reject/revert, compliance on manual | L0–L3 | ⬜ | ✅ math+failures; ⬜ mobile |
| Issuance | Automated | async-mint CoW wizard: gnosis-required, configure, quote, sign, lifecycle, error | L0–L3 | ⬜ | ⬜ (no testids yet) |
| Governance | Overview | proposal LIST + pagination/"show all", delegates, vote-lock sidebar, empty (no proposals) | L0–L3 | ⬜ | 🟡 list+delegates |
| Governance | **Proposal (view/vote)** | **BIG MATRIX — see § Proposal matrix below** | L0–L3 per state | ⬜ | 🟡 several states |
| Governance | Create — Basket | form + price/liquidity preview, submit `startRebalance` calldata (needs golden fixture), validation | L0–L3 | ⬜ | 🟡 form/guards only |
| Governance | Create — DTF Settings | fee round-trip decode, injection, empty-change guard | L0–L3 | ⬜ | ✅ calldata; ⬜ mobile |
| Governance | Create — DAO (Other) | param change decode | L0–L3 | ⬜ | ✅ |
| Governance | Create — Basket Settings | trading-gov params (🐛 #3 phantom threshold) | L0–L3 | ⬜ | 🐛 fixme |
| Governance | Create — **Whitelist** | whitelist proposal type — **entirely uncovered** | L0–L3 | ⬜ | ⬜ |
| Governance | **Optimistic Governance** | the optimistic variant of ALL the above (different flow/stages) — subset run | L0–L3 | ⬜ | ⬜ |
| Auctions | Rebalance list | idle/history/active bucketing, ×3 chains | L0–L3 | ⬜ | ✅ read; ⬜ mobile |
| Auctions | Rebalance detail | **states: idle, running/restricted, running/permissionless, completed, expired**; launch/community-launch/bid WRITES + permission matrix; legacy v2 auctions | L0–L3 per state | ⬜ | 🟡 active+completed read; writes ⬜ |
| Details + Roles (Settings) | — | exact fee %s, roles roster, distributeFees write, 🐛 #15 zero-denom DoS, 🐛 #16 fabricated-fee fallback | L0–L3 | ⬜ | ✅ values+roles; ⬜ mobile |
| Manage | — | brand SIWE / upload / save flow | L0–L3 | ⬜ | ⬜ |
| Factsheet | — | render, data | L0–L3 | ⬜ | ⬜ |

## "Yield DTF" (`/:chain/token/:tokenId/*`)

| Route | Sub | States to cover | Lifecycle | Mobile | Status |
|---|---|---|---|---|---|
| Overview | — | render ×2 fixtures, backing, price, charts, edges | L0–L3 | ⬜ | ✅ render; ⬜ edges/mobile |
| Issuance | Manual | mint/redeem, redeem-only (paused hyUSD), math, compliance geo | L0–L3 | ⬜ | 🟡 render only |
| Issuance | Zap | zap mint/redeem, quote states | L0–L3 | ⬜ | ⬜ |
| Stake | — | stake/unstake/withdraw/cancel, exchange-rate, cooldown vs available, draft queue, staked-history snapshots-partial survival (Z38, `history-partial.spec.ts`, desktop+mobile) | L0–L3 | 🟡 Z38 only | 🟡 render + stake/unstake write + Z38 partial-response |
| Auctions | — | revenue auctions, recollateralization, dutch bid, claim — read + write | L0–L3 | ⬜ | ⬜ |
| Governance | Overview | proposal list, delegates | L0–L3 | ⬜ | ⬜ |
| Governance | Create proposal | RToken param proposals | L0–L3 | ⬜ | ⬜ |
| Governance | Proposal (per parameter) | vote/view for EACH governed parameter (own matrix) | L0–L3 | ⬜ | ⬜ |
| Details + Roles | — | pause/freeze/unfreeze writes (role-gated), roles roster | L0–L3 | ⬜ | ⬜ |

Yield governance/auctions/settings + all yield mobile + yield lifecycle are gaps.

---

## § Proposal matrix (the big one)

Every proposal is different — TYPE determines the create form + the decoded
calldata + the detail-view changes rendered; STATE determines the workflow stage
+ available actions. Cover the product TYPE × STATE, not one representative.

**Types:** BASKET · DTF (settings) · BASKET_SETTINGS · OTHER (DAO) · WHITELIST — ×
**standard vs optimistic** governance.

**States / workflow stages** (each with its CTA + decoded action):
PENDING (before voteStart) · ACTIVE (vote: For/Against/Abstain) · DEFEATED ·
QUORUM_NOT_REACHED · SUCCEEDED (queue) · QUEUED (execute, after ETA) ·
EXECUTED · CANCELED (canceller-gated) · EXPIRED.

Per TYPE, the DETAIL view renders the type-specific "changes" preview
(basket diff, fee diff, gov-param diff, whitelist diff) — assert the preview
matches the proposed on-chain change, and the executed result matches.

Coverage today: standard states (PENDING/DEFEATED/QUORUM/EXECUTED/QUEUED) on a
governance-param proposal ✅; vote support variants ✅; permissions/cancel ✅;
DTF-settings + DAO create ✅. **Gaps:** per-TYPE detail previews, basket + basket-
settings + whitelist detail/execute, optimistic variant, PENDING→ACTIVE→SUCCEEDED
transitions with live tally, EXPIRED.

---

## § Proposed folder reorganization

```
e2e/tests/
  general/          home · discover · earn · portfolio · explorer-* · bridge · create-*
  index-dtf/
    overview/       render · charts-edges · spa-nav
    issuance/       zap · manual · automated
    governance/     overview · proposal-<state> · create-<type> · optimistic
    auctions/       rebalance-list · rebalance-<state> · writes · legacy
    settings/       values-roles · distribute-fees
    manage/  factsheet/
  yield-dtf/
    overview/ issuance/ staking/ auctions/ governance/ settings/
  _shared/          lifecycle helpers, mobile matrix, boundary catalog
```
Tags: `@smoke` (fast render+lifecycle-L1), `@mobile` (mobile project),
default = full behavior. Playwright projects: desktop-smoke, desktop-full,
mobile-smoke, mobile-full.

Migration is mechanical (move + retag existing 42 specs into the tree; no logic
change), then fill the ⬜ gaps + add the lifecycle/mobile dimensions per page.

---

## § 2026-07 deep-read reconciliation (authoritative — supersedes stale rows above)

A full code-level read of every domain (7 parallel deep-dives) corrected the map
and surfaced concrete states/edge-cases; bugs found are recorded in git history.

**Status corrections**
- 🐛 **#15 zero-denom DoS → ✅ CLOSED** (FIX-B; crash test un-fixmed, passes).
- 🐛 **#1/#18 chain-init subgraph/REST → ✅ CLOSED** (react-zapper 2.6.0; SPA tests un-fixmed, pass).
- 🐛 **#17 chain-init (register `tokenJar()` RPC) → STILL OPEN** — the react-zapper fix did NOT cover register's own `chainIdAtom` RPC consumers. Add an **RPC-chain SPA assertion** (eth_call chain, not just subgraph).
- **"Whitelist" proposal type does NOT exist.** `ProposalType = standard | optimistic` only. The four create forms are **Basket · DTF Settings · Basket Settings · DAO**. Allowlist calldata has no propose UI (falls to raw-call preview). Replace every "Whitelist" cell with **Optimistic**.
- **Bridge is a STATIC link page** — no form/quote/chain-select. Scope to href/deep-link/copy only.

**Highest-value gaps the deep-read confirmed (ranked)**
1. **Optimistic governance — entire surface uncovered, no fixture** (challenge-vote AGAINST-only, veto window, SUCCEEDED→execute-no-queue, selector-registry preview, eligibility fork, optimistic delegates tab, optimistic-params create form). Largest combinatorial + highest-risk (fail-open eligibility M17).
2. **Governance detail "changes" previews per TYPE** — 18 dtf-settings handlers + basket rebalance diff + gov-param diffs are decoded-but-untested; a decode bug silently misleads voters. Orthogonal to STATE (previews render identically in every state).
3. **Automated CoW issuance wizard — zero coverage AND zero testids** (gnosis-check → configure → quote-summary → execution lifecycle → success; slow-quote 20s cancel; ondo-paused; convert-held). Testids must be added first.
4. **Yield DTF — all write flows uncovered** (mint/redeem/stake/unstake/withdraw/cancel/dutch-bid/claim/vote/pause-freeze); render-only smokes today. Prioritize stake→unstake→cooldown→withdraw lifecycle + paused/frozen/redeem-only gating (hyUSD fixture already redeem-only).
5. **Auctions `openAuction`/`openAuctionUnrestricted` writes + permission matrix** (launcher vs community vs disconnected; restricted vs permissionless window — needs a synthesized `getRebalance()` tuple since lcap has zero-width windows) + positive `auctions-rebalance-error` + legacy v2 (read-only, launch button dead).
6. **General routes — portfolio / explorer(×5) / earn(×3) / tokens / top100** entirely uncovered; each needs NEW capture (see below). Deploy gates uncovered (no capture; assert route wiring).
7. **Loading lifecycle (L1/L2) + mobile — uncovered everywhere.** No `<area>-skeleton` testids; the layout-shift surfaces (overview time-range selector reflow, chart→null collapse, balance/cover animations) are exactly where dimension-2 belongs.

**Per-domain edge cases worth a dedicated test** (beyond the happy path)
- **Overview:** price-0 / 0-supply (H3/M3 permanent skeletons), all-zero-weight exposure (M5 infinite basket skeleton), Market-Cap/Supply data-type shows unit price (M6), `%`-change firstValue=0 (M4), candlestick↔line toggle (default candlestick — current test only passes via line fallback), young-DTF range availability + auto-reset-to-`all` reflow, stale `dataType`/`chartType` on yield→standard SPA nav (M13).
- **Issuance (index):** v1 vs v2 mint calldata (minSharesOut present/absent), redeem dust minOut=0 (zero slippage floor), USDT-fork approve→revoke→re-approve, approve-all partial/retry, manual deprecated sell-only (manual surface, not just zap), async compliance fail-open (H2), async convert-held, async no-collateral-legs skip-to-mint, wallet-disconnect mid-wizard reset.
- **Governance:** CANCELED & EXPIRED as *fetched* terminal states (only post-tx CANCELED tested), QUEUED-with-null-ETA stuck (M15), delegate/undelegated-balance CTA replacing vote, shared-governor propose menu (3 vs 4 options), threshold/quorum/delay round-trips, vote-lock card variants (reward-token single/multi, APR badge threshold, governed-DTFs hovercard).
- **Auctions:** restricted↔permissionless window boundary, `<`vs`<=` completion off-by-one (L4), token map mismatch white-screen (M7), hybrid manage-weights, Ondo cap auto-default.
- **Settings/Manage/Factsheet:** Manage SIWE→upload→save→error + brand-manager gate (M8 whitelist backdoor); Factsheet performance math (`calculatePerformance`, monthly P&L, CSV, inception clamp, empty state); Settings optimistic veto rows, reward-tokens card, governance-token hidden-when-no-stToken, trading-gov hidden-when-equal-owner, `platformFee===100` Infinity (M9). **Manage + Factsheet have ZERO testids today.**
- **Yield:** frozen-redeem enabled-but-reverts (M11), undercollateralized redeem block + dead `redeemCustom` path, cooldown/draft time-boundary (pending↔available split, `endId` semantics L17), settings role-gating (pauser/freezer/owner), legacy single-pause branch.
- **General:** portfolio past-activity-only hides tx history (GM1), empty-vs-loading-vs-error tri-state everywhere (GH1/GM2/GM3/GM6), earn Arb↔BSC chain swap (GM5) + BSC casing drop (GL2) + yield search bypasses DTF filter (GL3), explorer revenue Arb-gates-all (GH2), tokens dead sort (GH3), top100 dedup/table↔card swap, deploy route collision (GH4), empty-chain-filter empties table (GL1).

**NEW capture fixtures required** (not covered by existing SDK/subgraph/zapper/RPC boundaries)
- **Portfolio:** REST `v1/portfolio/{a}`, `v1/historical/portfolio/{a}?period=×6`, `v1/portfolio/{a}/transactions` — variants: full / empty / past-activity-only / error / impersonation (`?account=`).
- **Explorer:** per-tab subgraph + RPC (transactions, tokens, collaterals, governance+block-number, revenue FacadeRead).
- **Earn:** DefiLlama `yields.llama.fi/pools`, REST `dtf/daos` (vote-lock), yield subgraph `tokenDailySnapshots`.
- **Tokens / Top100:** yield `rtokens` subgraph / `TOP100_QUERY` subgraph.
- **Automated wizard:** CoW quote + order-status boundaries (+ ondo-paused).
- **Synthesized (no capture):** optimistic proposal fixture, rebalance `getRebalance()` tuple with `availableUntil>restrictedUntil`, price-0/0-supply DTF, all-zero-weight basket, QUEUED-null-ETA proposal.

**Engineer-review surfaces** (tests are coverage, not sign-off): all governance
calldata/decode + optimistic, auctions `openAuction*` + weight/limit math, yield
mint/redeem/stake writes + pause/freeze, all fee math, the price/supply SDK
pipeline (H3), and #17 chain correctness.
