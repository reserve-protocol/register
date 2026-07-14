# E2E Bug Ledger — code-derived findings (2026-07)

Consolidated from a deep read of register during e2e planning. Supersedes the
index-only `INDEX_DTF_FINDINGS.md` and extends it to yield + general + deeper
index. Each row: location · severity · symptom · fix · whether it needs
**Engineer review** (on-chain math / money / permissions / shared defaults — a
repo stop-condition; a green test is NOT sign-off) · the test that would catch it.

Verification legend: ✔︎ personally re-read the code this pass · ◦ agent-reported
with file:line (high confidence, not yet independently re-read).

---

## ✅ Closed this cycle (validated by e2e)

| id | area | what | evidence |
|---|---|---|---|
| #15 | container/settings | zero fee-denominator DoS (whole-page crash) | FIX-B guard in `PlatformFeeUpdater`; `settings.spec.ts` crash test **un-fixmed, passes** ✔︎ |
| #1/#18 | overview/SPA | chain-init wrong-chain subgraph + REST | fixed in react-zapper 2.6.0 (sync chain seed); `spa-chain-identity` + `spa-state-cleanup` wrong-chain tests **un-fixmed, pass** ✔︎ |

---

## 🔴 HIGH

| id | location | symptom | fix | eng-review | catch-with |
|---|---|---|---|---|---|
| H1 ✔︎ | `src/hooks/use-platform-fee.ts:31` | Unguarded twin of FIX-B: `Number(feeNumerator*100n/feeDenominator)` with no zero guard. Used by permissionless deploy (`deploy/permissionless/index.tsx`, `revenue-distribution-settings.tsx`). `feeDenominator=0` → `RangeError: Division by zero` → deploy revenue step crashes. | `feeDenominator === 0n ? fallback : …` (same as FIX-B). | yes (money) | deploy revenue spec w/ `seedFeeRegistry(_,0n)` |
| H2 ◦ | async-mint `steps/quote-summary.tsx` (+ `configure-mint.tsx:243`) | CoW wizard mint/redeem **not gated on `isRestricted`**. Configure gate is `pointer-events-none` (keyboard-bypassable via Tab→Enter); quote-summary submit/mint guard only on `walletClientMissing`; a late VPN re-detect leaves submit open. | Gate the real submit/mint + "Get quote" buttons on `isRestricted`. | yes (regulatory) | compliance spec on automated wizard (needs testids first) |
| H3 ◦ | `src/views/index-dtf/overview/.../use-dtf-price-history.ts:150` | `enabled: Boolean(… && supply && currentPrice)`. `supply` is `0n` (falsy) for a fresh DTF; `currentPrice` falsy at 0. → historical query never fires → chart is a **permanent skeleton**, no error state. | Gate on `supply !== undefined` / `currentPrice !== undefined`; add empty/zero state. | yes (SDK/price pipeline) | overview lifecycle spec, price-0 / 0-supply fixture |
| H4 ◦ | `proposal-md-description.tsx` (index **and** yield) | Raw `<iframe>` in an on-chain proposal description **renders and loads its src** → attacker-controlled external frame. (#2) | `rehype-sanitize` / iframe+script denylist. | yes (security) | `governance-description-render.spec.ts` (already `test.fixme`) |

---

## 🟠 MEDIUM

| id | location | symptom | fix | eng-review | catch-with |
|---|---|---|---|---|---|
| M1 ✔︎ | `index-settings-fees.tsx:99,105` (#17) | `FeesInfo` reads `tokenJar()` with `chainId = useAtomValue(chainIdAtom)` (still set late in container `useLayoutEffect`); siblings use `indexDTF?.chainId`. Fresh Base/BSC DTF → wrong-chain `tokenJar()` RPC → mis-labels a staking-vault-routed governance fee as "Other recipient". NOT covered by the react-zapper fix. | Use `indexDTF?.chainId`. | yes (chain correctness) | NEW RPC-chain SPA assertion (eth_call chain, not just subgraph) |
| M2 ◦ | `propose-basket-settings/updater.tsx:48,127` (#3) | Threshold scale-confusion (`proposalThresholdToPercentage` identity vs `/1e18` baseline) → phantom `setProposalThreshold` calldata on **every** basket-settings proposal; empty-change guard never trips. Likely same pattern in `propose-dao-settings/updater.tsx`. | Align scales in the change-detector. | yes (governance calldata) | `governance-propose-basket-settings.spec.ts` (2 `test.fixme`) |
| M3 ◦ | `chart-overlay.tsx:116` | Genuine `$0` price → `if(!price)` renders a perpetual price-hero skeleton (never "$0"). Pairs with H3. | Distinguish loading from resolved-0. | — | overview lifecycle, price-0 fixture |
| M4 ◦ | `percentage-change.tsx:42` | `firstValue===0` substitutes the raw penultimate price as the "%"; `undefined` first value → `NaN%`. | Guard degenerate/undefined first value. | — | overview % hero unit + spec |
| M5 ◦ | `basket-table-body.tsx:45` | `isExposure && !exposureRows?.length` shows `BasketSkeleton` for both `null` (loading) and `[]` (loaded-empty) → all-zero-weight DTF = **infinite skeleton**. | Split null vs empty; add empty state. | — | overview basket edge, zero-weight fixture |
| M6 ◦ | `data-type-selector.tsx` + `chart-overlay.tsx:102` | "Market Cap" / "Supply" data-types show the **unit price** (hero value not parameterized by `dataType`); chart Y-axis switches but hero doesn't. | Parameterize hero value by `dataType`. | — | overview data-type spec (needs testids) |
| M7 ◦ | `use-rebalance-params.ts:135` | `tokenMap[token].decimals` where `token` is on-chain but `tokenMap` is subgraph-keyed; a mismatch throws in a `useMemo` with no try/catch → **rebalance detail white-screens**. (Same unguarded pattern `get-rebalance-open-auction.ts:52,55`.) | Guard the lookup; fall to error banner. | yes (on-chain data) | auctions detail spec, token-mismatch fixture |
| M8 ✔︎ | `state/dtf/atoms.ts:206` | `isBrandManagerAtom` unions each DTF's `brandManagers` with **4 hardcoded EOAs** (`TODO: server`) → those addrs are brand-manager of **every** DTF; Manage submit UI builds+signs SIWE for any folio. | Source roster from server; drop hardcoded allowlist. | yes (permission) | manage permission spec |
| M9 ◦ | `index-settings-fees.tsx:62` + `dtf-settings-preview.tsx:280` | `PERCENT_ADJUST = 100/(100-platformFee)`; `platformFee===100` → `Infinity` → all recipient shares render `0%`/`NaN%`. Two copies (settings + gov fee-recipients preview). | Guard `platformFee>=100`. | yes (fee math) | settings + gov-preview fee spec |
| M10 ◦ | `index-dtf-container.tsx:355` + `index-settings-fees.tsx:62,74` (#16) | On any `getFeeDetails`/registry read failure, a hardcoded fallback (50/33%) is shown as **real** platform fee, no error/staleness flag; it scales every recipient share. | Surface indeterminate/error state. | yes (misleading money) | `settings.spec.ts` documents it (masking) — promote to a flagged assertion |
| M11 ◦ | yield `issuance/.../redeem/index.tsx:36` (+ zap `issuance/index.tsx:46`) | Redeem gated only on `!isValid \|\| !isCollaterized`, never `frozen`; `RToken.redeem` is `notFrozen` → button shows enabled on a frozen RToken, tx reverts. | Add `frozen` to the gate. | yes (money) | yield redeem frozen fixture |
| M12 ◦ | yield `issuance/.../issue/Issue.tsx:28,77` | `useMaxIssuable` declared `async` but calls hooks + `setMaxIssuable(0n)` **during render** + `simulateContract` every render (no dep guard) → "update while rendering" + RPC spam. | Move to `useEffect`/query with deps. | — | offline harness would surface the loop; yield issuance lifecycle spec |
| M13 ◦ | `state/dtf/atoms.ts:131,133` + `price-chart-atoms.ts:6,10` | `dataTypeAtom`/`chartTypeAtom`/`indexDTF7dChangeAtom`/`indexDTFMarketCapAtom` are module-level, **not reset on DTF change**; yield→standard SPA nav carries `priceBTC`/`yield` mode into a DTF that doesn't offer it. | Reset in container `resetState`. | — | `spa-state-cleanup.spec.ts` extension |
| M14 ◦ | `proposal/updater.tsx:49` (#C-adjacent) + `spa-state-cleanup.spec.ts:101` | `indexDTFVersionAtom` not cleared on cross-chain nav (stale v5 version into a v4 DTF until refetch); version gates write-ABI. | Add to `resetState`. | yes (write-ABI selection) | `spa-state-cleanup.spec.ts:101` (`test.fixme`) |
| M15 ◦ | `proposal-flow.ts:29` (`isQueuedReadyToExecute`) | Requires `typeof executionETA==='number'`; a QUEUED record with null ETA → Execute never enables, only Cancel shows → proposal stuck. | Handle null ETA. | yes (governance) | QUEUED-null-ETA fixture |
| M16 ◦ | `proposal-execute-button.tsx:16` | Execute gate uses `getCurrentTime()` (real `Date.now`), not the mocked chain clock → executability decided by wall-clock vs frozen `executionETA`; wrong where block-time≠wall-time + test-fragile. | Use the block/chain clock. | yes (governance timing) | queue-execute lifecycle spec |
| M17 ◦ | SDK `governance/utils` `getOptimisticFinalState` via `proposal-flow.ts:15` | Optimistic "Ready to execute" returns SUCCEEDED whenever `againstWeightedVotes===0n` even with `vetoThresholdVotes` undefined → Execute CTA before veto window resolves (fail-open). | Guard veto-window resolution. | yes (governance) | optimistic fixture (none exists) |
| M18 ◦ | `dtf-settings-preview.tsx:645` (UpdateQuorumNumerator) | Unknown/legacy governor → `quorumDenominator` stays 0 → renders "quorum: 0.00%" instead of real value. | Resolve denominator or show indeterminate. | — | gov-param preview spec |

---

## 🟡 LOW (hygiene / display / fragility)

| id | location | symptom |
|---|---|---|
| L1 ◦ | `use-dtf-price-history.ts:82` | `Number(formatEther(supply))` for marketCap/supply synthetic point — Number-for-money, precision loss on large supply. |
| L2 ◦ | `rebalance-auctions.tsx:69` | `parseFloat(formatUnits(...))` + `buyAmount/sellAmount` (`Infinity` at 0 sell) — Number-for-money in bid chart. |
| L3 ◦ | yield `staking/atoms.ts:98,113,161` | Reward/position math in JS floats on 18-dec wei — display drift on large balances. |
| L4 ◦ | rebalance-list `:22,26` vs `atoms.ts:117` | `<` vs `<=` boundary: at `availableUntil===now` list buckets historical while detail still shows active action panel (1s window). |
| L5 ◦ | `state/dtf/atoms.ts:256` | `isHybridDTFAtom` hardcoded address allowlist (incl. "remove after testing") gates weight math. |
| L6 ◦ | `community-launch-auctions-button.tsx:42` | Launch eligibility derived from subgraph timestamps, not live nonce/`bidsEnabled` (soft fail-open; contract reverts). |
| L7 ◦ | rebalance-list `:34` | Duplicate `auctions-empty-state` testid (active+historical) — unscoped queries ambiguous (test-fragility). |
| L8 ◦ | auctions `updater.tsx:55` | `console.log('response', …)` ships subgraph payload to prod console. |
| L9 ◦ | manage `submit-button.tsx:331` | Spinner precedence bug: no spinner during the `uploading` phase (operator precedence). |
| L10 ◦ | manage `submit-button.tsx:300` | `setError(msg)` state never rendered — server reason lost, only generic toast. |
| L11 ◦ | manage `manage-about.tsx:108` | `ImageUploader` missing `value` prop (logo) — filename label always generic; cover uploader passes it (inconsistent). |
| L12 ◦ | factsheet `factsheet-chart.tsx:261` | `chartData.length===0` → renders `null` (blank box, no "no data"). |
| L13 ◦ | `proposal/updater.tsx:49` | `shouldKeepLocalProposalState` pins optimistic EXECUTED/CANCELED/QUEUED over refetch → a never-confirmed/reorged tx stays in UI. |
| L14 ◦ | `proposal-detail-content.tsx:28` | 2nd description line containing "forum" is stripped as a forum link — legit prose dropped. |
| L15 ◦ | `proposal-detail-votes.tsx:95` | Optimistic view renders only AGAINST votes; FOR/ABSTAIN rows silently dropped. |
| L16 ◦ | yield `governance/VoteModal.tsx:40` | Vote `isValid` not gated on proposal state; non-Active reverts on `castVote`. |
| L17 ◦ | yield `staking/atoms.ts:36,40` | `availableAt` overwritten by last draft; `availableIndex=BigInt(availableAt)` (timestamp, not index) — needs contract-semantics confirmation before a withdraw/cancel e2e trusts `endId`. |
| L18 ◦ | overview `index-campaign-overview.tsx` | Dead code — `IndexCampaignOverview` imported/rendered nowhere. Wire up or delete; no test should target it. |
| L19 ◦ | issuance-deprecated | exit-only bug (existing `test.fixme`). |

---

## General routes

Systemic anti-pattern across earn / explorer / portfolio: **undefined data with
`loading=false` renders a permanent skeleton — no error UI.** (`atoms.ts:46`,
`useRTokenPools.ts:280`, `portfolio-chart.tsx`, `explorer/*`). One shared
"error vs empty vs loading" tri-state fix would close most rows below.

### 🔴 HIGH

| id | location | symptom | fix |
|---|---|---|---|
| GH0 ✔︎ ROOT-CAUSED | explorer transactions tab (default route) | **CONFIRMED**: `useTransactionData.ts:111-113` guards `if (data[chain])` then reads `data[chain].entries.map(...)` UNguarded. A per-chain response without `entries` (subgraph error/partial/schema drift) throws `Cannot read properties of undefined (reading 'map')`; the error boundary replaces the ENTIRE explorer landing page with "An unexpected error occurred". Reproduced deterministically via `overrides.subgraph({operationName:'Transactions'}, {})`. Repro test: `general/explorer/render.spec.ts` (`test.fixme`, un-fixme when fixed). Same unguarded pattern also in the governance tab's `use-proposals-data.ts` (`governanceRes.dtfs` / `result.proposals`). | **1-line fix**: `(data[chain]?.entries ?? []).map(...)`. Explorer now has its own array-shaped empty mock branches (`getAllIndexProposals`/`getDTFGovernance`/`Transactions`) + negative unit tests, so render specs are committed. |
| GH2 ◦ | `explorer/revenue/index.tsx:202` | `arbitrumPending` ANDed into the loading gate → a slow/failing **Arbitrum** facade read gates the entire Yield/Trades view though Mainnet+Base are ready (Arb is deprecated). | Drop Arb from the gate. |
| GH3 ◦ | `tokens/UnlistedTokensTable.tsx:126`, `tokens/atoms.ts:6` | Sort is **dead server-side** (legacy `Table` never forwards `onSort`; subgraph always `totalSupply desc`); header clicks reorder only the fetched top-N; "Mkt Cap" sorts by supply not USD; `sortKeyMap` fields don't match schema (would 400 if wired). | Wire sort or remove the affordance. |
| GH4 ◦ | `app-routes.tsx:74` + `constants.ts:228` | `/deploy/index-dtf` (coming-soon) vs `/deploy-index` (the **real permissionless deploy, publicly reachable, no entry gate**) differ by one char. Product + test trap. `deploy-coming-soon.tsx:67` submit failure only `console.error`s. | Reconcile routes; gate/flag the real deploy. |

### 🟠 MEDIUM

| id | location | symptom | fix |
|---|---|---|---|
| GM1 ◦ | `portfolio-page/index.tsx:167` | Past-activity-only wallet (sold out, has tx history) → `hasReserveActivity` false → `EmptyPortfolioPrompt`, **never mounts `<Transactions/>`**. | Include tx history in the activity check. |
| GM2 ◦ | `use-historical-portfolio.ts:109` | `isLoading` hardwired to `q7d.isLoading`; any **other period erroring → infinite chart skeleton**. | Track per-period status. |
| GM3 ◦ | `explorer/collaterals/index.tsx:50` | `allowFailure:false` + no loading prop → one failing collateral read stalls the whole tab on "No results", flashes "No results" mid-load. | `allowFailure:true` + loading state. |
| GM4 ◦ | `explorer/governance/index.tsx:136`, `use-proposals-data.ts:269` | Yield proposal state computed against **block 0** (`blocks?.[chain]||0`) until block loads → transient wrong ACTIVE/PENDING → e2e flake. | Gate on block resolved. |
| GM5 ◦ | `earn/views/defi/atoms.ts:10` | Default chain filter includes Arbitrum + highlights "All chains", but clicking "All chains" sets `[Base,Mainnet,BSC]` — silently **drops Arb, adds BSC**. | Reconcile the two chain sets. |
| GM6 ◦ | `tokens/useUnlistedTokens.ts:64`, `top100/use-top100-list.ts:57` | Subgraph **error rendered as empty state** (no error branch, no retry) — outage looks like "no results". | Add error state. |
| GM7 ◦ | `top100/api.ts:114,259` | `ALLOWED_DTFS` appended with **no dedup** (a DTF in both query + allowlist shows twice); unguarded `BigInt(dtf.totalSupply)` can throw in a render `useMemo`. | Dedup by address+chain; guard parse. |

### 🟡 LOW

| id | location | symptom |
|---|---|---|
| GL1 ✔︎ | `use-filtered-index-dtf.ts:22`, `use-filtered-yield-dtf.ts:25` | Deselecting **all** chains → `!chains.length` short-circuits `return false` → empties the table (recoverable). |
| GL2 ◦ | `earn/hooks/useRTokenPools.ts:210` | `capitalize()` → `"Bsc"` but DefiLlama returns `"BSC"` → **all Binance pools dropped** by casing. |
| GL3 ◦ | `earn/views/yield-dtf/atoms.ts:42` | Non-empty search **early-returns, bypassing the DTF-dropdown filter** (index-dtf tab does NOT — good regression pair). |
| GL4 ◦ | `earn/views/defi/components/featured-pools.tsx:22` | `<3` eligible pools → 3 permanent skeleton placeholders. |
| GL5 ◦ | `bridge/index.tsx:184` | `getBridgeUrl` hardcodes `toChainId=8453`, ignoring `token.l2` — false affordance if a non-Base target is added. |
| GL6 ◦ | `utils/index.ts` `CHAIN_TO_NETWORK` (`constants.ts:158`) | No BSC/Arb fallback → an unmapped `chainId` yields `/undefined/…` row links (API-trust boundary). |

**Verified CORRECT (no bug):** featured/marquee weight-desc ordering holds
(`utils.ts:35,193`); row-link chain-correctness across discover/portfolio/
explorer/tokens/top100 (per-row `chainId`, no wrong-chain wiring). **Map
correction:** Bridge is a **static link page** — no form/quote/chain-select
exist; scope its spec to href/deep-link/copy only.

---

## Notes

- Engineer-review rows are repo stop-conditions — they ship with an explicit
  handoff note; a green regression test is coverage, not sign-off.
- Recurring root causes worth a single systemic fix:
  - **Div-by-zero in fee math** (H1, M9, #15-closed) — a shared guarded
    `platformFeePercent()` util would kill three copies at once.
  - **Number-for-money** (L1, L2, L3) — display-only today, but violates the
    BigInt rule; audit before any of these feed a tx.
  - **Wall-clock vs chain-clock / not-reset-on-nav atoms** (M1, M13, M14, M16) —
    the chain-init/stale-state family; the react-zapper fix closed the zapper
    slice, these are the register-side remainder.
</content>
