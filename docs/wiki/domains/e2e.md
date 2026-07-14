---
title: E2E Suite
updated: 2026-07-13
type: domain
sources:
  - e2e/**
  - playwright.config.ts
  - .github/workflows/playwright.yml
---

# E2E Suite (Playwright)

Offline Index-DTF acceptance coverage for home/discover, overview, issuance,
zaps, compliance, auctions, governance, and settings. The suite characterizes
Register behavior at the installed `@reserve-protocol/react-sdk` version; SDK
mapper/math/calldata correctness remains the SDK repositories' responsibility.

## How the suite is organized (foundational)

Tests are grouped by **route → subroute** (domain), not by test-type; the
canonical coverage matrix is `e2e/TEST_MAP.md`. EVERY page is
tested across three dimensions, and a spec missing any of them is incomplete:

1. **State-space** — every product-distinct state (governance proposals =
   TYPE × STATE × standard/optimistic; rebalance = idle/running/restricted/
   permissionless/completed/expired), not one happy render.
2. **Loading lifecycle** — ordered phases L0 blank → L1 skeleton (right
   shape/box, no reflow) → L2 partial (each island resolves independently, 0
   unexpected layout shift) → L3 full (behavior/value assertions). Do NOT assert
   on a skeleton-phase testid as if it were the loaded page.
3. **Mobile** — the same L0–L3 at a phone viewport (`@mobile` project) + mobile
   chrome.

Known quality gap (2026-07-13): the original suite was built flat (`smoke/` +
`flows/`) and desktop-happy-path-only, so several specs assert on a testid that
renders during the skeleton phase — they test the shell, race hydration, and
miss layout shift. Migrating to the domain tree + adding the lifecycle/mobile
dimensions is tracked in `e2e/TEST_MAP.md`. `e2e/CLAUDE.md` § Foundational Rule
is binding for all new specs.

## Trust contract

- Only Vite on port 3005 and Chromium are live. The base fixture registers a
  default-deny egress route first, then exact RPC, Goldsky, Reserve API, zapper,
  wallet, analytics, and inert-asset handlers. Unknown egress is a test failure.
- Every committed smoke and flow test fails when a helper logs an unmocked
  request. `allowUnmocked` exists only for local exploration and must not appear
  in committed acceptance specs.
- API overrides match method + exact path + selected query identity; subgraph
  overrides match operation + selected variables; RPC overrides match address +
  full calldata. `boundaryRequests` records API/subgraph/HTTP and wallet RPC
  traffic for source, parameter, and request-count assertions.
- Live protocol state comes from RPC. Subgraph captures supply history/events.
  Registry DTF reads are seeded from captured chain state; captured v4 and v5
  versions stay address-specific so version gates cannot collapse to one value.

## Transactions and time

The injected EIP-6963/EIP-1193 provider records every send in the per-test
`txLog` with a unique hash. Receipt and transaction lookups accept only recorded
hashes AND require the querying chain to match the tx's chain (a hash sent on
one chain fails loud when queried from another). Tests may queue pending
success, revert, or user rejection. Write specs assert chain, target, value, decoded
function/arguments, approval spender/amount, order, and explorer hash—not just a
success toast.

Frozen specs call `freezeTime` before navigation and only `advanceTime` after
actions/queries. `advanceTime` advances browser timers and the Node-side RPC
clock together. Raw `page.clock.runFor` and fixed `waitForTimeout` calls in specs
are forbidden; wait for a boundary request or observable UI state, then pump the
clock for React Query notification/receipt timers.

## Snapshots

`helpers/registry.ts` is the single catalog. Full capture writes a temporary
tree, captures shared featured/discover/protocol data plus every required DTF
file, validates the manifest, and atomically publishes only on complete success.
Targeted capture updates its requested files without advancing global freshness.
`e2e:check` validates the complete manifest (`snapshot-manifest.ts` owns the
required-file list — don't hardcode counts in docs), each file timestamp, global
age, and DTF/chain identity.

## Commands and CI

- `pnpm e2e:smoke`: the `@smoke` project.
- `pnpm e2e:full`: all non-smoke behavior specs.
- `pnpm e2e`: both projects.
- `pnpm e2e:check`: manifest, identity, and freshness.
- `pnpm e2e:capture:yield`: re-capture the yield RToken eth_call + subgraph maps.
- `pnpm exec vitest run e2e/helpers/tests`: mock-contract unit tests.

CI uses pnpm, Node 24, current actions, and Chromium only. PR/push runs
typecheck, the mock-contract unit tests, snapshot check, and smoke; nightly/
manual adds the full project. Workflow scope routes Index+Yield DTF, home,
state, and hook changes through that gate.

Speed: local workers are capped at 5 (one Vite server doesn't scale past it).
Quick-loop tiers — unit tests <1s → one scoped spec ~3–5s → smoke ~16s → full
~78s; snapshots are parse-cached per worker. Prefer the narrowest tier for a
change (the domain guides' diff→test tables name the spec). An unmocked-call
failure names the function + the helper to model it in (`e2e/CLAUDE.md` has the
boundary map + new-test recipe).

## Maintenance rules

Prefer snapshot-derived identities and value assertions over shell visibility.
Model a new boundary centrally; do not add spec-local catch-alls. Keep translated
copy out of selectors, use structural test IDs, and never duplicate the registry.
When migrating an SDK consumer, first land a behavior characterization against
the old implementation, change the consumer, then run its focused flow + smoke.
Link both SDK workspaces together when validating unreleased paired changes; pin
the released paired versions before merge. On any SDK version bump, re-paste the
hand-copied `GetIndexDTF` query in `e2e/scripts/capture.ts` from the new SDK
dist (it is not exported) and re-run `pnpm e2e:capture` — the `dtf-data` canary
smoke fails on drift but only a fresh capture fixes it.

Coverage intentionally does not claim forked-chain execution, visual/pixel
regression, v6 contracts, or full settings/auction write families yet. Mobile
and the loading lifecycle are NO LONGER non-goals — they are required dimensions
per the Foundational Rule (previously skipped; now tracked debt in
`e2e/TEST_MAP.md`). Governance, issuance, compliance, and transaction-contract
edits require engineer review.

## Coverage pass 2 (landed 2026-07-10)

Failure paths (reject + revert) are covered for every write flow — vote/queue/
execute, mint/redeem, zap buy/sell — and register's error handling proved
CORRECT (viem marks reverted receipts as query-status error, so success
branches can't fire); the suite now regression-locks that. Multichain:
governance states + auctions bucketing run on bsc/cmc20 (v5) and mainnet/open
(v4) with chain-correct explorer links. Propose: fee-change calldata
round-trips (UI % → `setTVLFee`/`setMintFee` args), injection + empty-change
guards; basket propose covers form/guards only. Zap edges: impact ≥5%
acknowledgment gate (via the `overrides.ethBalance` opt-in), quote-error
recovery, client-side insufficient-funds (server flag is dead code).
Compliance: manual-surface gating + over-block guard (overview/governance stay
open). Three captured edge fixtures (`zap-buy-highimpact`, `zap-buy-
insufficient`, `zap-error` with real 500) are preserved flow files.

Still open, in priority order: golden `startRebalance` calldata fixture to
unlock full basket-propose submit; v4 write-ABI coverage on mainnet/open
(wallet-connected); central price mock only knows current-basket tokens
(blocks rebalance-preview on non-lcap chains); Tenderly simulation model
(currently gated off per-test); basket-settings (trading-gov params) spec;
propose-form + error-state testids; centralize the reverted-tx reason re-call.
Deferred (needs src/roles + engineer review): settings distribute-fees write,
auction launch/bid, async-mint wizard, manage/factsheet, legacy v2 auctions,
wallet disconnect mid-flow. Validation caveat: zod form bounds are bypassed on
localhost/dev, so bounds need schema unit tests, not e2e.

## Yield DTF (RToken) — Phase F + audit hardening (2026-07-12)

Foundation: `YIELD_REGISTRY` (eUSD mainnet, hyUSD base) + `rtokenPath`; a
record/replay eth_call map per RToken captured at a pinned block by
`scripts/capture-yield.ts` (`pnpm e2e:capture:yield`); yield seams in rpc.ts,
subgraph.ts (`resolveYieldQuery`), api.ts (yield price tokens). Render smokes for
THREE read-only views render offline with zero unmocked calls: `yield-overview`
(name/symbol/price/backing), `yield-issuance` (manual mint/redeem panels, Zaps
toggled off), `yield-staking` (StRSR exchange-rate + estimated APY). The capture
script walks all three views (`overview`/`issuance`/`staking`) at ONE pinned
block into the shared `rtoken-chain-state.json` + `yield-graph.json` (graph ops
deduped). Value derivations are shared via `helpers/yield.ts`
(`yieldTokenMeta`/`yieldPinnedTimestamp`). Structural testids added
(attribute-only) on the yield views: `issuance-mint-panel`,
`issuance-redeem-panel`, `issuance-manual-toggle`, `staking-exchange-rate`,
`staking-apy`.

Two additional captured-boundary kinds the per-view smokes needed (both
trust-preserving — an UNcaptured read still fails loud):
- **Storage reads** — the staking withdraw updater reads the stToken draft-era
  slot via `eth_getStorageAt` on every render. Capture records the exact
  `address:slot → word`; replay serves it chain-scoped, no blanket zero word.
- **Allow-failure reverts** — the config updater probes a legacy
  `Broker.auctionLength()` (and other legacy fns) that REVERT on modern
  contracts; the app reads them with `allowFailure` and ignores the failure.
  Capture records the revert as a `YIELD_REVERT_SENTINEL` marker; replay serves
  a genuine multicall `success:false` so the app stays on its on-chain branch.
- **Yield geo-compliance** — RToken issuance reads `geolocationAtom`, which
  probes Cloudflare `cdn-cgi/trace` (distinct from the index Reserve-API
  compliance). The base fixture serves a deterministic trace carrying the
  `compliance` fixture's country, so mint-enabled state is test-controllable.

Trust rules (post-audit; the whole point is that a yield test can't go green
while wrong):

- **Chain-scoped replay** — the eth_call map is keyed `chainId:address:calldata`
  and the subgraph key `chainId::op::query::identity`, so a shared address (RSR
  feed) or a no-identity op can't serve one chain's data to another.
- **Fail-loud, no wildcard fall-through** — under `setYieldReplay(chainId)`, an
  uncaptured contract read fails loud rather than borrowing the index
  `*:selector` tables or the $1 Chainlink default. Only time/balance infra backs
  the captured map. There is NO blanket `hasRole`/`eth_getStorageAt` answer —
  removed until a write flow models them exactly.
- **Index isolation** — the yield subgraph resolver engages only while a yield
  test is active (`isYieldReplayActive`; index pages incidentally poll a
  dtf-yield subgraph). A read arriving off the fixture's chain (or on the zero
  address) is a pre-`chainIdAtom`-switch transient, absorbed unlogged; a read
  AT the fixture's chain on a real address still fails loud, so a stuck-chain
  bug surfaces as an assertion failure, never a false green.
- `e2e:check` validates yield snapshot identity, pinned block, nonempty map, and
  within-chain key collisions.

Still to build: remaining per-view smokes (auctions/governance/settings) then
flows (mint → stake → vote) — see the blueprint below. Overview/issuance/staking
render smokes are DONE (2026-07-12).

### Blueprint (for the remaining phases)

Feasibility confirmed: yield subgraph reachable, public no-auth RPCs
(`ethereum-rpc.publicnode.com`, `1rpc.io`) execute `eth_call` — capture needs no
credentials. Architecture is FUNDAMENTALLY different from Index: yield views
read almost everything from RPC via vendored ABIs (FacadeRead/FacadeAct, Main,
StRSR, BasketHandler, RToken, governor), NOT off-chain via the SDK. So the core
new mechanism is a **record/replay eth_call map** (`address:calldata → return`)
captured at a pinned block per RToken — do not hand-encode selectors like the
index chain-state seeding.

Fixtures: eUSD (mainnet `0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F`, active
staking + rewards) + hyUSD (base `0xCc7FF230365bD730eE4B352cC2492CEdAC49383e`).
Route shape `/:chain/token/:tokenId/<page>`. Skip arbitrum/KNOX.

Orchestrator-owned seams (additive, serialized, engineer-review): `YIELD_REGISTRY`
+ `rtokenPath` in registry.ts; URL-based index/yield fork (`resolveYieldQuery`)
in subgraph.ts leaving the index path untouched; record/replay lookup layer +
`eth_getStorageAt` case + `hasRole`/account wildcards in rpc.ts; extend
`knownPriceResponse` for yield tokens in api.ts; `captureYieldDtf` +
`YIELD_DTF_FILES` in the manifest; Tenderly gate in base.ts. Reuse unchanged:
provider/tx-ledger, overrides (incl. `ethBalance`), `mockZapperRoutes`.

Phases: F (capture eUSD+hyUSD eth_call map + subgraph snapshots + api tokens →
one overview render smoke green) → S (per-view render smokes: overview,
issuance, staking, auctions-idle, governance list/detail, settings) → W (flows:
manual mint `RToken.issue` FIRST — reuses wallet/tx-ledger; then stake RSR with
draft-queue/`getStorageAt`/time-advance; then vote). Defer: deploy (non-goal),
redeemCustom (needs undercollateralized fixture), auction/settings writes
(role-gated + golden simulate fixtures), propose submit (Tenderly), wrap/unwrap.

Related: [[project]], [[sdk]], [[yield-protocol]], [[subgraphs]].
