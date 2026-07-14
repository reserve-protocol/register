# E2E Buildout Plan — fill the map, 3 dimensions per page

Plan for filling `E2E_TEST_MAP.md` under the new domain org. Follows
`skills/planning.md` (slices sized for one fresh context; setup/lifecycle/mobile
travel WITH the behavior they cover, not as horizontal phases).

## Goal

Every route→subroute in `E2E_TEST_MAP.md` covered across all three dimensions —
state-space, loading lifecycle (L0→L3), mobile — with strict-mock/snapshot-
derived assertions, organized under `e2e/tests/<domain>/<route>/`.

## Current state

42 flat specs (`smoke/` + `flows/`), ~125 tests, desktop-happy-path-only, now
running **green against the published SDK 0.4.0 + react-zapper 2.6.0 baseline**.
Index DTF core is broad; yield is overview/issuance/staking render-only; General
(home/discover/earn/portfolio/explorer, tokens/top100, deploy), manage/factsheet,
the automated CoW wizard, most write flows, ALL mobile, and ALL loading-lifecycle
are gaps.

A 2026-07 full code-level deep-read (7 domains) is complete; findings are in
`E2E_BUG_LEDGER.md` (~55 findings, ranked) and reconciled into `E2E_TEST_MAP.md`
§ 2026-07. Status changes since the last plan:
- ✅ **#15** (zero-denom DoS) and **#1/#18** (chain-init subgraph/REST) FIXED and
  un-fixmed — the react-zapper/SDK work closed them.
- 🐛 **#17** (register `tokenJar()` wrong-chain RPC) confirmed **still open** —
  the react-zapper fix didn't cover register's own `chainIdAtom` consumers.
- Map corrections: no "Whitelist" proposal type (it's **Optimistic**); **Bridge
  is a static link page**.
- Two new HIGH bugs are one-line/quick fixes worth landing early: **H1**
  (`use-platform-fee.ts:31` div-by-zero, twin of FIX-B) and **M1/#17**
  (`indexDTF?.chainId`).

`INDEX_DTF_FINDINGS.md` is superseded by `E2E_BUG_LEDGER.md`.

## Non-goals (this plan)

Forked-chain execution, pixel/visual regression, v6 fixtures, permissionless
deploy wizard writes. The app FIXES (INDEX_DTF_FINDINGS) — coverage first, fixes
after triage (each fix un-fixmes its regression test).

## Acceptance evidence

- `pnpm e2e` (desktop-full + mobile-full) green; per-route L0–L3 asserted.
- Layout-shift probe reports 0 unexpected reflows per covered route (or a
  logged finding for each real shift).
- `E2E_TEST_MAP.md` status column: no ⬜ for a shipped route; 🐛 rows have a
  `test.fixme` regression.
- Each map node reachable from `e2e/tests/<domain>/<route>/`.

## Test seams

- Playwright `page` + `boundaryRequests` (identity/counts) + `txLog` (decoded
  writes) + `overrides.*` (per-test state) — existing.
- NEW seam (S0): `overrides.hold(boundary)` / a controllable-latency response so
  a spec can FREEZE L1 (skeleton) and L2 (one island resolved, others pending),
  plus a `layoutShift(locator)` probe (boundingRect deltas across a transition),
  plus a `mobile` project + viewport fixture. Without these the lifecycle
  dimension has no seam — S0 is the blocker for every lifecycle assertion.

## Slices (work the first unblocked; each is one fresh context)

**S0 · Lifecycle+mobile seam (expand) — blocks all lifecycle/mobile slices.**
Add `overrides.hold`/delayed-response, the `layoutShift` probe, a `@mobile`
Playwright project (iPhone-13 viewport) + fixture, and a `_shared/lifecycle.ts`
helper encoding the L0–L3 assertion pattern + a `describeLifecycle(route)` sugar.
Unit-test the probe. Demonstrable: one existing route (overview) asserts L0–L3 +
mobile via the new helper. Blocked by: none.

**S1 · Domain-tree migration (migrate, green batches) — blocked by: none.**
Move the 42 specs into `e2e/tests/<domain>/<route>/` + retag (`@smoke`/`@mobile`),
no logic change, keep green each batch (expand→migrate→contract: leave the
old dirs until the last batch, then delete). Demonstrable: `pnpm e2e` green from
the new tree; old dirs gone.

**S2 · Overview (index) full — blocked by: S0.** Highest traffic + layout-shift
home + SPA nav. State-space (render×3, chart ranges, empty/single-point/price-0
#20, deprecated), L0–L3 with the layout-shift review (the known shift work),
mobile. Un-fixme SPA assertions only after FIX-A (post-triage).

**S3 · Issuance (index) full — blocked by: S0.** Zap + manual + automated,
across states + L0–L3 + mobile. Rolls in the existing math/edge specs.

**S4 · Governance proposal matrix — blocked by: S0.** Split by TYPE (one slice
each: basket, dtf-settings, basket-settings, DAO/other, WHITELIST) × STATE ×
standard/optimistic, each with its detail-preview + decoded action + L0–L3 +
mobile. The largest area; sub-slice per type so each fits one context.

**S5 · Auctions/rebalance states — blocked by: S0.** idle/running/restricted/
permissionless/completed/expired + launch/community/bid write + permission
matrix + legacy v2, L0–L3 + mobile.

**S6 · Settings/roles + manage + factsheet — blocked by: S0.** Value assertions
(rolls in existing settings spec), distributeFees, manage SIWE/upload/save,
factsheet, L0–L3 + mobile.

**S7 · Yield full — blocked by: S0.** overview/issuance/stake/auctions/gov/
settings across states + L0–L3 + mobile (extends the yield capture per view).

**S8 · General routes — blocked by: S0.** home, discover, earn (index/yield/
defi), portfolio, explorer (transactions/tokens/collaterals/governance/revenue),
bridge, create-gates — each state-space + L0–L3 + mobile. Needs new snapshots
(explorer/portfolio/bridge boundaries) — capture per route.

## Progress log

- **S0 seam — DONE & verified.** First-class harness at `e2e/harness/`:
  `hold.ts` (lifecycle gate), `controller.ts` (`DtfHarness`: `chain`/`wallet`/`tx`/
  `mock`/`requests` + `goto`/`gotoYield`/`seedBalance`), `lifecycle.ts`
  (`maxDelta`/`maxPositionDelta`/`expectStableBox`/`expectStablePosition`),
  `index.ts` (`harness` fixture). Wallet fixture gained `wallet` (opt-out) +
  `walletChain` options. Hold gate wired into all 3 dispatchers + teardown
  `releaseAll`. **15 unit tests** (`harness-hold`, `harness-pure`). Playwright
  `mobile` project (Pixel 7, off-CI); `@mobile` adds a mobile run without
  excluding desktop; `pnpm e2e:mobile`. Modeled `AccountBalanceWeekAgo` centrally.
- **S2 overview — lifecycle + first edge-case DONE.**
  `overview/lifecycle.spec.ts`: hero L1→L3 (no positional reflow) + chart L2
  island (independent resolution), both desktop-smoke + mobile, green.
  `overview/edge-cases.spec.ts`: **M6** (data-type shows unit price) —
  confirmed failing un-fixmed (bug real), kept `test.fixme` as ledger validation.
  Testids added: `overview-{name,price,chart,basket}-skeleton`,
  `overview-datatype-<v>` (+`data-active`). Price provenance verified
  `indexDTFPriceAtom` (CLAUDE.md stale).
  REMAINING (overview): H3 0-supply/price-0 → perpetual chart skeleton (reach via
  totalSupply RPC override), M5 zero-weight → infinite basket skeleton, M4 pct
  firstValue=0; mobile chrome (CTA bar, mobile basket tabs — need testids);
  chart-type toggle. Existing render/chart/holdings/deprecated coverage stays
  (smoke/overview + flows/overview) — migrate to harness opportunistically, not
  a rewrite.
- **S3 issuance — `seedManualIssuance` helper DONE; manual-basket lifecycle
  DEFERRED (flaky).** Built the reusable **`harness.seedManualIssuance(dtf)`**
  (folio toAssets/symbol + per-token balance/allowance/USDT-probe from
  chain-state) — reused by every manual-issuance spec. The manual-basket
  lifecycle spec worked in isolation but flaked under load (multicall batch
  non-determinism — see Harness findings); removed, not committed. Issuance
  REMAINING: zap lifecycle (react-zapper widget island), automated CoW wizard
  (needs testids), H2 async-compliance fixme, manual math states (reuse existing).
- **S6 settings — roles lifecycle DONE.** `settings/lifecycle.spec.ts`: hold
  GetIndexDTF → `settings-roles-skeleton` → roster, desktop + mobile, green
  (settings' fee/tokenJar/pendingFees RPC reads are already covered by the shared
  mock — no extra seeding). Testid `settings-roles-skeleton` added.
  REMAINING (settings): M9/M10 fee-bug fixmes need error-state design (the app
  shows fabricated fallbacks with NO error indicator — that absence IS the bug;
  validating needs either an error-state testid or a share-math assertion on a
  DTF with a known governance recipient). Manage + Factsheet still zero-testid.
- **Lifecycle+mobile dimension DONE for 4 index-dtf domains** (all reliable
  subgraph/api-op holds, green desktop+mobile): overview (hero L1→L3 + chart L2),
  settings (roles), auctions (list), governance (proposal list). Testids added:
  `{overview-name,-price,-chart,-basket}-skeleton`, `settings-roles-skeleton`,
  `auctions-list-skeleton`, `governance-list-skeleton`, `issuance-basket-{skeleton,
  row}`, `overview-datatype-<v>`. Suite: 22 smoke + 18 harness unit tests green.
- **S7 yield — mobile dimension STARTED.** `yield-dtf/staking/render.spec.ts`:
  exchange-rate + APY render offline on desktop + mobile (harness with
  `test.use({ wallet: false })` + `setYieldReplay(chainId)` + `chain.freezeAt(
  yieldPinnedTimestamp)` + `gotoYield`). Confirms the harness works for yield
  (RPC replay) too. Yield is RPC-driven so lifecycle-freeze isn't reliable
  (use render+mobile + state-space, not island freezes). Suite: 23 smoke green.
- **S8 general — discover lifecycle DONE.** `general/discover/lifecycle.spec.ts`:
  hold the API-fed list (`/v1/discover/dtfs` — NOT subgraph; `useIndexDTFList`
  fetches REST) → `discover-table-skeleton` → rows. Desktop-only (@smoke) — the
  discover placeholder is `hidden lg:block`. Added `discover-table-skeleton` +
  shared `data-table-loading` testids. KEY: general-route data sources are mixed
  (discover=REST, home-featured=REST `/discover/featured`, earn=DefiLlama/subgraph)
  — always check the ACTUAL fetch (hook source) before choosing the hold boundary.
- **S7 yield — state-space + mobile.** `yield-dtf/issuance/state-space.spec.ts`:
  eUSD (active) shows mint AND redeem; hyUSD (mint-paused) is redeem-only (mint
  panel absent) — desktop + mobile. NOTE: yield issuance defaults to the Zap
  panel; click `issuance-manual-toggle` before asserting mint/redeem. Reachable
  via `setYieldReplay` + `freezeAt(yieldPinnedTimestamp)` + `wallet:false`.
- **Coverage so far: 9 new domain-tree specs / 27 smoke tests** — index
  lifecycle (overview ×2 / settings / auctions / governance), overview edge
  (M6,H3), overview deprecated state-space, discover lifecycle, yield (staking
  render + issuance state-space active/paused). Suite: **27 smoke + 18 harness
  unit tests green, stable, 0 typecheck errors.**
- **State-space pattern proven:** navigate a fixture in the target state (e.g.
  `REGISTRY.find(d=>d.deprecated)` for inactive; hyUSD for mint-paused), assert
  the state's testid (`overview-inactive-badge`, mint-panel absent), tag
  `@smoke @mobile`. No new harness needed — the fixtures already encode states.
- **12 domain-tree specs / 30 smoke green, stable.** Added issuance zap
  render+mobile (`seedZapSurface` + `mockZapperRoutes`, base fixtures still
  available in a harness spec via destructuring `{ harness, overrides,
  unmockedCalls }`; `wallet:false`), plus **factsheet** (`dtf-factsheet`) and
  **manage** (`dtf-manage`) render+mobile — both were zero-coverage/zero-testid
  routes, now covered. Coverage map: overview (lifecycle×2/edge/deprecated),
  issuance (zap render), settings/auctions/governance/discover (lifecycle),
  yield (staking render / issuance state-space), factsheet, manage.
- **21 domain-tree specs / 40 smoke green, stable. Write matrix = 4 flows**
  (settings distributeFees, issuance mint + redeem + rejected-mint failure path —
  the decline dimension is now proven end-to-end). PHOTON (bsc, `0xa0Fe…10Fb`)
  added to the registry + captured in isolation (new `--dtf=<slug>` capture flag
  does a full single-DTF capture with zero drift on existing snapshots; verified
  byte-identical). PHOTON featured governance renders through the full real BSC
  mock stack (5th DTF, disconnected). **Finding:** PHOTON's governance is
  optimistic-capable (`isOptimistic=true` on-chain) but all 8 captured proposals
  were submitted STANDARD (`isOptimistic=false`), so the OptimisticBadge / optimistic
  proposal-flow is not reachable from real data — logged as coverage debt with the
  anchor testid + pay-down path. (Optimistic slice needs a real optimistic proposal
  fixture or a list-overlay helper, NOT a fabricated field.)
- **22 domain specs / 42 smoke green. Write matrix = 6 flows.** Added the
  auctions launch PERMISSION MATRIX (`index-dtf/auctions/launch-write.spec.ts`):
  launcher → `openAuction()`, non-launcher permissionless → `openAuctionUnrestricted()`.
  Key discoveries: `isHybridDTFAtom` is HARDCODED to LCAP+Venionaire (hybrid DTFs
  force a Manage-Weights step before the launch button) → used bsc/cmc20 (non-hybrid);
  launcher permission is a subgraph field (`auctionLaunchers`) → overlaid GetIndexDTF;
  community-launch window reads from subgraph `getRebalances` (not the RPC tuple) and
  captured windows are zero-width → widened it. Extracted `helpers/rebalance-tuple.ts`
  (shared encode/proposalId, auctions flow still 4/4). Exercised the `walletChain`
  control (#2) for the bsc write. ENGINEER REVIEW owed on `getRebalanceOpenAuction` math.
- **23 domain specs / 43 smoke green + 4 fixme. Explorer slice done.** GH0
  ROOT-CAUSED + confirmed: `useTransactionData.ts:111-113` guards `data[chain]`
  but derefs `data[chain].entries.map` unguarded → a per-chain response without
  `entries` (incl. the still-queried DEPRECATED Arbitrum chain) crashes the whole
  explorer landing page. Deterministic repro in `general/explorer/render.spec.ts`
  (`test.fixme`, 1-line fix `?? []`). Added 3 central mock branches
  (`getAllIndexProposals`/`getDTFGovernance`/`Transactions`, array-shaped empty)
  + 3 negative unit tests. Governance-tab render committed (stable); transactions
  render is coverage debt until GH0's guard lands (would ship flaky). No capture
  needed — the explorer aggregates cross-DTF, so central empty branches suffice.
  **Same unguarded pattern in the governance tab** (`use-proposals-data.ts`:
  `governanceRes.dtfs`/`result.proposals`) — flag for the same fix.
- **25 domain specs / 46 smoke / 47 unit green. Yield WRITE landed (Phase W kickoff).**
  `yield-dtf/staking/unstake-write.spec.ts`: mainnet/eUSD, connected wallet on
  walletChain 1, switch to Unstake tab → fill → modal → simulation resolves →
  `unstake()` decoded to stRSR with the right amount. Built the FOUNDATIONAL
  connected-wallet-yield mock layer (reusable for all yield writes):
  - yield eth_call path now consults per-test `overrides.ethCall` (via
    `lookupEthCall`, EXACT match — NOT the index `lookupOverride`, which would leak
    `*:selector`/$1-feed wildcards into yield, audit P1; guarded by a unit test);
  - the connected wallet's `balanceOf`/`allowance` default to 0 SILENTLY (honest
    empty wallet) instead of a fail-loud storm — but a NON-wallet balanceOf still
    fails loud (unit-tested);
  - `FacadeRead.pendingUnstakings` → empty `Pending[]`; `getAccountTokens`/
    `getAccountStakeHistory` → null; react-zapper native sentinel → 0.
  - 5 negative unit tests lock all of the above. TabMenu got an opt-in `testid` prop.
  ENGINEER REVIEW owed on the unstake amount/flow semantics.
- **26 domain specs / 47 smoke. Yield STAKE write landed too.**
  `yield-dtf/staking/stake-write.spec.ts`: default Stake tab, seed RSR balance +
  MAX allowance (skip approve) + self-delegate (`delegates()`→account so it uses
  `stake()` not `stakeAndDelegate`) + approve/stake simulations → `stake()` decoded
  to stRSR. Proves the foundation handles BOTH approval (stake) and no-approval
  (unstake) flows. Stake/unstake testids + reused the connected-wallet-yield layer.
- **Yield staking WRITE trio: stake + unstake COVERED; withdraw is a near-miss**
  (button renders via `pendingUnstakings` overlay, but the write gates on the
  captured `rTokenStateAtom` collateralization/trading multicall — coverage debt).
  Write matrix = **8 flows**. Full suite green: flows 102 · smoke 47 (+4 fixme) ·
  unit 47 · tsc 0 · wiki green.
- **NEXT (in priority):** yield withdraw (model `rTokenStateAtom` multicall) + M11 redeem-frozen fixme + GH0 guard fix (Luis)
  flows (`openAuction`/`openAuctionUnrestricted` permission matrix — needs
  testids on the launch buttons + a synthesized `getRebalance` tuple with
  `availableUntil>restrictedUntil` since lcap has zero-width windows);
  (c) yield writes (stake/unstake/withdraw + M11 redeem-frozen fixme);
  (d) settings M9/M10 (need error-state testids or share-math assertions);
  (e) general earn/portfolio/explorer (NEW REST/subgraph captures + GH1–GH4
  bugs); (f) Manage/Factsheet/automated-wizard testids then specs.
- **NEXT:** more general lifecycle (home featured via `/discover/featured`,
  earn/portfolio/explorer need new captures); yield overview/issuance mobile;
  then per-domain STATE-SPACE + edge/bug fixmes + writes:
  governance TYPE×STATE + PHOTON optimistic (add `0xa0Fe…10Fb` bsc to registry +
  capture), auctions writes (openAuction permission matrix), yield writes
  (stake/unstake/redeem-frozen M11), settings M9/M10, general route bugs
  (GH1–GH4). Manage/Factsheet/automated-wizard need testids first.
  Pattern per domain: (1) find an island + add its `<area>-<island>-skeleton`
  testid, (2) hold that boundary (subgraph op / api path / rpc selector), (3)
  poll hold.hits, release, assert content, `:visible`-scope duplicated layouts,
  (4) tag `@smoke @mobile`. Edge/bug specs: fixme + verify-fails-un-fixmed.

### Harness sufficiency findings (from building specs)

- **Lifecycle freezing: subgraph/API op holds are RELIABLE; RPC-island (multicall
  inner-selector) holds are FLAKY under parallel load.** Overview/settings/auctions
  lifecycle specs (hold one subgraph op / api path) are stable across the full
  smoke run. The issuance manual-basket lifecycle (hold the batched `toAssets`
  inner-selector) passed in isolation + mobile but flaked under 5-worker load:
  wagmi's multicall **batch composition is non-deterministic**, so `toAssets` lands
  in a different aggregate run-to-run, and only sometimes in the parked one. The
  multicall-aware hold is still correct + unit-tested; it's just not a reliable
  seam for a COMMITTED spec. Rule: **freeze lifecycle via subgraph/API ops**
  (deterministic); for RPC-only islands, either hold a whole page-level subgraph
  op or assert state-space/values instead of a mid-load skeleton frame. Issuance
  manual lifecycle deferred; `seedManualIssuance` + the multicall hold stay (both
  reusable + tested).


- **RPC-island lifecycle freeze needed hold enhancements** (goal: "confirm harness
  sufficient"). Added: `mock.hold({boundary:'rpc', method?, to?, selector?})` and
  **multicall3-aware** matching (decodes `aggregate3` 0x82ad56cb → matches inner
  calls). 18 harness unit tests. Subgraph/API holds work directly (overview
  proved it); RPC-island holds now match batched reads too — in unit tests.
- **RESOLVED — multicall-aware hold PROVEN live.** Diagnostic confirmed the app
  reads `toAssets` (0xd17618bf) as the 9th inner call of a multicall3 `aggregate3`
  (0x82ad56cb) on the folio; the gate decodes it and matches (`GATE-DBG matched=
  true`, holds=1). The earlier `hits=0` was a **spec race** (checked `hold.hits`
  synchronously before the batched read fired) — fixed by `expect.poll(() =>
  hold.hits)`, same as the overview spec. Harness is sufficient for batched-RPC
  island freezing.
- **OPEN — issuance manual lifecycle needs `seedManualIssuance(dtf)` helper.**
  The manual page (connected wallet) fires per-basket-token `balanceOf`,
  `allowance`, and the USDT `approve(deployer,1)` simulate probe — unseeded → 18
  unmocked calls at teardown. `flows/issuance-manual.spec.ts` already seeds these;
  extract that into a reusable `harness.seedManualIssuance(dtf)` (or a helper),
  THEN the lifecycle spec (hold `{boundary:'rpc', selector:'0xd17618bf'}`, poll
  `hold.hits`, release, assert `issuance-basket-skeleton` clears) passes. This
  helper is reused by every manual-issuance spec.

### Continuation handoff (for a fresh context)

- **Fixed point:** harness at `e2e/harness/` is the entry for ALL new specs
  (`import { test, expect } from '<rel>/harness'`). Patterns proven: (a) lifecycle
  via `harness.mock.hold({boundary,...})` → assert skeleton → `release()` →
  assert content + `expectStablePosition`; (b) edge-case/bug via a `test.fixme`
  asserting DESIRED behavior with a `// BUG <ledger-id>` note — VERIFY it fails
  un-fixmed first (swap `test.fixme(`↔`test(`), then restore; (c) mobile via
  `@smoke @mobile` (runs desktop-smoke + mobile) or `@mobile` (+full); mobile-only
  chrome specs guard `test.skip(({},i)=>i.project.name!=='mobile', ...)`.
- **Testid rule:** add `data-testid` to any surface a spec needs (no text/copy
  selectors); skeletons get `<area>-<island>-skeleton`; toggles get
  `<area>-<name>-<value>` + `data-active`.
- **Done:** S0 harness (15 unit tests), S2 overview (2 lifecycle green desktop+
  mobile; M6+H3 fixme-validated). Smoke 19 green.
- **Reusable helpers now on the harness:** `mock.hold` (subgraph/api/rpc +
  multicall-aware), `seedBalance`, `seedManualIssuance`. Next helper to extract:
  `seedFeeRegistry(dtf, numerator, denominator)` (from `settings.spec.ts:110` —
  `daoFeeRegistry()` 0x9980cb23 → registry addr, then `getFeeDetails` →
  `[recipient,num,den,floor]`) into `harness/seed.ts`.
- **Next unblocked slice:** S6 settings edge-cases (fastest — snapshots+testids
  exist). Extract `seedFeeRegistry`, then two fixme+BUG validations:
  **M9** seed num==den (e.g. 1n,1n → platformFee 100) → assert recipient shares
  (`settings-fee-governance/-deployer/-other-*`) stay well-formed %s (bug:
  `PERCENT_ADJUST=100/(100-100)=Infinity` → NaN/0%); **M10** seed a registry
  read error → assert an indeterminate/error indicator, not the fabricated
  50%/33% fallback shown as real. Verify each fails un-fixmed, then keep fixme.
  Then a settings lifecycle (island skeletons already have testids from the
  deep-read: roles skeleton exists). THEN S4 governance (PHOTON capture: add
  `0xa0Fe4e0aEca5479705ce996615B2EACB6b6a10Fb` bsc to registry.ts + `pnpm
  e2e:capture`), S5 auctions writes, S7 yield, S8 general.

## Harness sufficiency: CONFIRMED across ALL dimensions

Every dimension the plan needs is now demonstrated green on the harness (each a
proven, verified pattern the remaining specs just replicate):
- **Lifecycle** (hold gate, subgraph/api-op) — overview/settings/auctions/governance/discover.
- **Mobile** (`@smoke @mobile`, Pixel 7) — all of the above.
- **State-space** (fixtures encode states) — overview-deprecated, yield active/paused.
- **Render** (zero-coverage routes) — factsheet, manage, issuance-zap, yield-staking.
- **Edge/bug** (fixme + verify-fails-un-fixmed) — M6, H3, **M9** (validated:
  platformFee=100 → "Governance Share 0%"). Reusable `harness.seedFeeRegistry(
  dtf, num, den)` added (enables M10 next). 14 specs / 31 smoke / 3 bug fixmes.
- **Writes** (`wallet.connect` + `tx.confirm/decline/revert` + decoded `txLog`) —
  settings `distributeFees()`, issuance manual **mint()** + **redeem()** (3 flows,
  stable under load — writes are deterministic unlike mid-load skeleton timing).
  Redeem needs `seedManualIssuance` + `seedBalance(dtf,'100')` (DTF share balance).

Remaining work = REPLICATING these patterns across more states/writes per domain
(+ network captures for PHOTON optimistic and general earn/portfolio/explorer).
The harness itself needs no more capability — 18 unit tests, all dimensions proven.

**18 domain-tree specs / 35 smoke, stable.** Full spec list: overview
(lifecycle×2 / edge M6,H3 / deprecated), issuance (zap render / compliance),
settings (lifecycle / distributeFees write / fee-edge M9), auctions (lifecycle),
governance (lifecycle), discover (lifecycle), portfolio (disconnected state),
bridge (static render), yield (overview render / staking render / issuance
state-space), factsheet, manage. 3 bug fixmes (M6, H3, M9). Testids added to
zero-coverage routes: `dtf-factsheet`, `dtf-manage`, `yield-overview`,
`portfolio-connect-prompt`, `bridge-page`, `data-table-loading`,
`discover-table-skeleton`. **Routes covered: 13** (index ×7, yield ×3, general ×4: discover/portfolio/
bridge/earn-defi). Added `earn-defi` render (base fixture mocks DefiLlama empty).
**Explorer DEFERRED — found a NEW HIGH bug GH0**: the explorer route CRASHES on
the generic empty-subgraph mock (`undefined.map`, timing-flaky). Explorer needs
its OWN array-shaped empty mock branches per query AND the app needs a `?? []`
guard before a spec can commit. Testid `explorer-page` added. **4 bugs found/
validated: M6, H3, M9, GH0.** NOTE: yield replay specs are ~15s each — smoke ~40s.

## Sequencing

S0 first (unblocks everything). Then S1 (migration) in parallel-safe batches.
Then S2–S8 by value: S2 (overview/layout-shift) → S3 (issuance/money) → S4
(governance matrix) → S5/S6 → S7 (yield) → S8 (general). Each S2–S8 slice is a
candidate for one focused agent (area-owned specs; `overrides`/capture as the
escape hatch; shared helpers stay orchestrator-owned). Fixes (INDEX_DTF_FINDINGS)
land in a separate post-triage pass, each un-fixme-ing its regression.

## Resolved decisions (per Luis)

- **Mobile in CI**: `@mobile` does NOT run on CI (kept local / nightly) — smoke
  stays desktop on PRs.
- **Layout-shift budget**: a small CLS threshold is acceptable (not strict "0
  reflows") — intentional expand-animations (balance card, cover collapse) are
  allowed; assert against a budget, log real shifts.
- **Fix ordering**: coverage-first, BUT land the quick-win fixes opportunistically
  when their area is touched — **H1** (deploy fee div-by-zero guard) and **M1/#17**
  (`indexDTF?.chainId`) are one-liners that each flip a fixme; do them in the slice
  that adds their regression test rather than deferring to a separate triage pass.

## Resolved (Luis, 2026-07)

- **Testids: in-scope.** Add `data-testid`s to any surface a spec needs (Manage,
  Factsheet, automated wizard, auctions/yield writes, general routes, all skeleton
  islands). Attribute-only, no behavior change. **No text/copy-based selectors** —
  Lingui-translated accessible names are banned as locators; every assertion keys
  off a `data-testid` (or `href`/URL/`txLog`).
- **Optimistic fixture is REAL, not synthesized.** Add **PHOTON** —
  `0xa0Fe4e0aEca5479705ce996615B2EACB6b6a10Fb` on **BSC** (Reserve AI Photonics
  DTF; owner+trading+stToken governance all `isOptimistic: true`, verified via
  subgraph) — to `e2e/helpers/registry.ts` and capture it (`pnpm e2e:capture`).
  This unblocks the entire optimistic slice (S4) with real on-chain data.
- **Bugs: hunt at the END, tests are the validation.** Coverage-first with NO
  fixes now. Where a spec asserts correct behavior and the app is buggy, the test
  **fails or is `test.fixme`'d with a `// BUG:` note + ledger id** — those failing
  tests ARE the end-of-run proof the suite catches the ~55 ledger findings. The
  final pass reconciles: each real bug ⇒ a red/fixme test; fix ⇒ flip to green.
