---
title: E2E Suite
updated: 2026-07-09
type: domain
sources:
  - e2e/**
  - playwright.config.ts
  - .github/workflows/playwright.yml
---

# E2E Suite (Playwright)

Index-DTF e2e coverage: home/discover → dtf overview → issuance → buy/sell → rebalance → governance → settings. Built on branch `feature/e2e-suite`. Co-working doc for Claude + Codex — keep the phase table current when you land work.

## Architecture (decided 2026-07-09, informed by the abandoned `feature/e2e` branch)

**Fully offline at test time.** Only the Vite app + Chromium run live; every external boundary is intercepted with `page.route()` / an injected provider. No Anvil, no live RPC/subgraph/API. Fast, deterministic, CI-cheap.

- **Wallet**: injected EIP-6963 + EIP-1193 mock provider (`addInitScript` before app JS, announces as "Test Wallet" to RainbowKit; `window.ethereum` fallback). Wallet methods handled inline (accounts, chain switch, sendTransaction → fixed hash, signatures → dummies). wagmi **auto-connects** the injected provider on mount — `connectWallet(page)` waits for `header-wallet` and only drives the RainbowKit modal as fallback. Read methods forward to the same RPC dispatch as the HTTP mock as a **redundant belt** — the primary read path is HTTP host interception: wagmi/SDK reads go through configured `http()` transports (`src/state/chain/index.tsx`, `src/utils/rpc-urls.ts`), NOT the connector provider. Never "simplify" by trusting provider-forwarding alone.
- **RPC**: intercept known RPC hosts, per-method dispatch. `eth_chainId` respects the URL's chain; tx receipts derived per chain from that chain's block number + confirmation count (never a hardcoded Base-shaped constant). Multicall3 `aggregate3` decoded/encoded **with viem** (`decodeFunctionData`/`encodeFunctionResult`) — never hand-rolled ABI codecs. `eth_call` answered from a per-(address, function) override table backed by snapshots; unknown calls return zero-words and **log `[E2E] unmocked eth_call`**; the base fixture collects these and **fails `@smoke` tests on any unmocked call** (flows stay lenient while iterating) — a green smoke run must be trustworthy without reading logs.
- **Subgraph** (goldsky): dispatch by GraphQL `operationName`, snapshot-backed per DTF. Unmatched → GraphQL error `[E2E] unmocked operation` (fail-loud).
- **Reserve API**: dispatch by pathname, snapshot-backed per DTF (keyed by `address`/`folio` param). Unmocked endpoint → 500 + console.error (fail-loud). Geolocation endpoint mocked unrestricted by default; restricted variants are a fixture option.
- **Zapper (buy/sell)**: `useZapSwapQuery` hits the zapper API with input-dependent params (tokenIn/tokenOut/amountIn/slippage; 500ms debounce, 12s refetch). Snapshot keyed by DTF address can answer exactly one input — zap snapshots are keyed by `(chain, tokenIn, tokenOut, amountIn)` and specs pin their inputs to captured amounts; the returned calldata is swallowed by the mock provider's `eth_sendTransaction`. Phase 1 ships only the healthcheck stub; the real boundary lands with the buy/sell flow work.
- **Blocked**: analytics (Sentry/Mixpanel), llama/merkl yields, image CDNs. WalletConnect/relay endpoints get **fulfilled with empty 200s, not aborted** — aborts throw during eager connector setup and pollute the fail-loud console.
- **Env pinning**: the Playwright webServer launches with a locked minimal env — no `VITE_STAGING_API` (staging flips `RESERVE_API`/zapper host), no `VITE_MAINNET_URL`/`VITE_INFURA`/`VITE_ALCHEMY`/`VITE_ANKR` (they add RPC hosts the intercept list doesn't match). A developer `.env` must not be able to route around the mocks.
- **Snapshots**: captured from live prod by `e2e/scripts/capture.ts` into `e2e/snapshots/<chain>/<slug>/*.json`, `{_meta:{source,capturedAt,...}, data}` envelope. **One DTF registry** (`e2e/helpers/registry.ts`) shared by capture, mocks, and tests — never duplicate it. Staleness checker hard-fails CI past max age. Capture **downsamples time series** (historical-price/exposure) to ≤200 points — the old branch's 17k-line raw captures are repo bloat that helped kill it.
- **Clock**: `page.clock` frozen relative to snapshot timestamps (`proposalTime`/`rebalanceTime` helpers) so governance/rebalance states are deterministic and don't rot as snapshots age. **Freezing is state-pinning, not free**: debounces (zap 500ms), react-query `staleTime`/`refetchInterval` (zap 12s), and receipt polling never elapse under a paused clock — every flow spec explicitly pumps time with `page.clock.runFor(...)` at each wait point. **Biggest trap (1b discovery): a paused clock freezes react-query's `notifyManager`** — queries fetch and resolve but data never reaches React until the clock advances; wagmi's account store flushes synchronously, so the wallet "connects" while all query-driven UI hangs. Pump at every wait point, comment which timer each pump satisfies.
- **Post-tx transitions**: snapshots are static, but flows must observe state change after a tx. The `overrides` fixture (`e2e/helpers/overrides.ts`, fresh per test) is consulted by every dispatcher before snapshots: `overrides.subgraph(operationName, data)` · `overrides.ethCall(address, selector, hex)` · `overrides.api(pathSubstring, data)`. Mutate mid-test (no route re-registration), pair with a clock pump to trigger the refetch. Never hack post-tx state per-spec outside this mechanism.

**Hard lessons from the old branch (do not repeat):**
1. Infra without tests is dead code — the old wallet + clock fixtures were never imported by a single spec. Every fixture lands **with** a spec that uses it.
2. No English-copy selectors — Lingui will break them. `data-testid` on structural containers and on any control whose label is translated; role queries only for structural/nameless roles (`getByRole('button', {name})` resolves the *translated* accessible name — it rots like text selectors). Pin the test locale to `en`. Scoped locators over `.first()`.
3. No `test.skip` conditioned on snapshot contents — pin snapshot state with the frozen clock instead; skipped tests rot silently.
4. Faked-to-zero RPC masks gaps — log every unmocked read.
5. Don't capture moving-window time series raw; normalize timestamps relative to capture time.

## Layout & conventions

- `e2e/fixtures/` — `base.ts` (auto-mock everything, one import per spec), `wallet.ts` (connected-wallet layer).
- `e2e/helpers/` — `registry.ts` (DTF catalog), `rpc.ts`, `subgraph.ts`, `api.ts`, `provider.ts`, `clock.ts`, `snapshots.ts`, `overrides.ts` (per-test overlay).
- `e2e/tests/smoke/` — fast render/nav checks, tagged `@smoke`. `e2e/tests/flows/` — behavioral suites (issuance, governance votes, etc.).
- Registry DTFs: one per chain (base/bsc/mainnet) + one deprecated. Selectors: `data-testid` for containers, roles for controls. Testid naming: `<area>-<element>` kebab-case (`dtf-governance`, `discover-search`, `header-wallet`). `grep -rn data-testid src/views src/components` to see what's instrumented before adding more.
- Web server: Playwright boots (or reuses) the dev server on **port 3005** — never touch :3000 (Luis's own dev server).
- **Ownership (Phase 2 parallelism)**: spec files are area-owned, one agent per area. `e2e/fixtures/*`, `e2e/helpers/*`, and shared-component testids belong to the orchestrator — swarm agents report gaps back instead of editing shared files in place.
- Intercepted hosts (the full mock boundary): `*.publicnode.com`, `*.tenderly.co`, `*.infura.io`, `*alchemy*`, `*.ankr.com`, `*.binance.org`, `*.ninicoin.io`, `*.defibit.io`, `*.llamarpc.com` (RPC) · `api.goldsky.com` (subgraphs) · `api.reserve.org` (reserve-api) · blocked: Sentry/Mixpanel, WalletConnect, `yields.llama.fi`, `yields.reserve.org`, `api.merkl.xyz`, image CDNs.
- Verify wiring: `llm-workflow.config.json` has an `e2e-smoke` rule on `e2e/**` + `playwright.config.ts` — `scope.mjs` prints it automatically. e2e TS must be covered by typecheck (own tsconfig if needed); untyped tests drift.

## Quick loop for agents (the point of all this)

After a UI change or new feature, verify in seconds without a human looking:

- `pnpm e2e:smoke` — full smoke set (~fast, offline, chromium only).
- `pnpm e2e:smoke --grep <area>` — one surface (e.g. `--grep governance`).
- `pnpm e2e e2e/tests/flows/<spec>` — one flow suite.
- Dev server is reused if already running on 3005; first run boots it (~20s).
- Delegate the run to a light subagent; it reports failures + `[E2E] unmocked` log lines back.

## SDK migration audit (Codex, 2026-07-09)

**Verdict:** this is the right acceptance harness for making Register thinner. Keep the three boundaries explicit: core SDK owns protocol reads, source mapping, version branching, deterministic health/math, and prepared calls; react-sdk owns query keys/options/cache/polling; Register owns routes, forms, wallet/tx lifecycle, compliance UX, copy, and presentation. E2E proves that the boundary move preserves the product, while SDK unit/live tests remain the proof for mapper, math, and calldata correctness.

### Trust blockers before E2E is a migration gate

1. **Enforce the offline claim with an outbound allowlist.** The 2026-07-09 audit run reached or attempted dozens of tracker/ad hosts (Google, Meta, LinkedIn, Spindl, ad pixels, etc.). Mock known product boundaries, stub known analytics, and fail any other non-local host. A new SDK/API/RPC host must fail rather than escape to the network.
2. **Make snapshot refresh atomic and complete.** `tryCapture()` can skip failed endpoints, while `e2e:check` currently checks one global timestamp and requires only each DTF's `dtf.json`; stale/missing endpoint files can survive a partial refresh that reports green. Define required shared/per-DTF files, validate each file's timestamp, and only advance the full-capture marker after the required set succeeds. Targeted `--only` refreshes should not advance that marker. Capture `featured-dtfs.json` through the script too.
3. **Run against the exact SDK pair being migrated.** The E2E branch currently characterizes installed 0.2.0 while `feature/sdk-integration` links the current core + react SDK workspaces. Link both packages together during migration, make raw-query canaries follow that exact version, and replace links with the released paired versions before merge. Do not prove old-package behavior and call the new-package migration covered.
4. **Make mocks strict on identity, not just pathname/selector.** Several current API branches return empty/constant data for an unknown DTF or select prices by chain without validating requested tokens. Final migration fixtures must match method + chain + address/token/query variables and fail mismatches; overlays need the same relevant specificity. A wrong parameter is an unmocked call, not a valid empty state.
5. **Finish raw SDK-shaped route hydration first.** Fable's in-progress `GetIndexDTF` + `chain-state.json` work is the correct immediate unblock. Do not accept overview/issuance/auctions/settings tests that only prove shells or skeletons once it lands; assert identity, basket, status, fee, and source-derived values.
6. **Fail unknown calls in every committed migration flow.** Lenient flow teardown is useful only while exploring. A flow used as migration acceptance must fail on any unmocked RPC/API/subgraph call; otherwise a query can error into a skeleton while the shell assertion stays green.
7. **Record and assert submitted transactions.** The provider currently returns a fixed hash for any `eth_sendTransaction`. Expose a per-test transaction log and assert `chainId`, `to`, `data`, `value`, decoded function/args, and approval spender. Receipts should correspond to the recorded request. This is mandatory for issuance, governance, fees, auctions, vote-lock, and deploy migrations.
8. **Cover protocol versions explicitly.** The global `version()` mock returns `5.0.0` for every address. Registry/chain state must own per-DTF version and include modern v5 + v6 plus a legacy v4 rebalance / v1 issuance case, or the product must explicitly gate those legacy flows before migration.
9. **Keep browser and RPC time synchronized.** `freezeTime()` pins both clocks, but direct `page.clock.runFor()` advances only the browser. Add one `advanceTime(page, ms)` helper that also advances mock RPC time, and use it everywhere frozen tests pump timers.
10. **Remove exploration artifacts before Phase 3.** Delete `_debug*`/`_dbg*`, console dumps, broad `any`, `expect(true)`, `waitForTimeout`, and temporary app behavior such as `issuance-debug-nodtf`. Test instrumentation should normally be attribute-only; structural instrumentation needs visual verification.
11. **Wire the gate to product changes.** `e2e-smoke` currently fires only for `e2e/**` and Playwright config changes. Index route/hooks/provider changes must trigger smoke; touched flows run during the inner loop, the entire suite on the PR/nightly. Also resolve the script/doc mismatch: `pnpm e2e` currently runs both Playwright projects, while the README calls it the non-smoke full project.
12. **Replace the legacy CI before trusting the badge.** Use pnpm + Node 24 + current actions, install Chromium only, run snapshot/type checks, smoke on PR, and the full project nightly with retained traces. The existing workflow still uses npm, Node 18, and old actions.

### Non-Yield migration coverage contract

| SDK migration slice | Current signal | Required unchanged-behavior acceptance |
| --- | --- | --- |
| Route model / overview / status / fee / brand | Multi-chain shells; value hydration blocked | Value-level identity, basket, platform fee, initial status, focused status refresh, brand media/files, deprecated badge + sell-only behavior; one real value case per chain. |
| Discovery and list status | Search/tab/navigation flows are a good start | Assert order, strict `type === index`, inactive filtering, missing-type behavior, batch/no-N+1 status reads, and route navigation into the hydrated model. |
| Price, exposure, factsheet | Chart/table shells only | Historical points and range switching, live appended point, loading/prefetch behavior, exposure vs collateral values, and source request parameters/counts. |
| Manual issuance | Smoke currently blocked | Modern mint + redeem, asset amounts, allowance deficits and approvals, accepted rounding/dust, redeem slippage minima, post-tx refresh, restricted/deprecated gates, and explicit v1 support/gate. |
| Settings and revenue | Partial value smoke; no write flow | bids/rebalance controls, fees/revenue tokens, pending shares, distribute-fees call payload, disabled states, and refreshed values after receipt. |
| Governance | Vote vertical slice proves wallet/clock/overlay stack | Add tx payload assertion; cover list/detail state windows, standard + optimistic voter state, proposal builders by family, queue/execute, governor-vs-timelock cancel, disable reasons, DTF-bound routes, and post-tx timing. |
| Rebalances, auctions, health | Idle/detail shells; raw DTF hydration in progress | RPC-backed live rebalance vs subgraph history, restricted/permissionless/expired windows, v4/v5/v6 gates, liquidity and Ondo safe-percent warnings, historical-block boundaries, active auctions, and exact open/close/end/bid calls. |
| Vote-lock / staking | No Index E2E coverage | standard vs optimistic balances/power, deposit/withdraw/delegate/claim calls, delay acknowledgement, disabled states, and refreshed balances/voting power. |
| Direct deploy / Create DAO | No coverage | Stable deployment nonce across rerender/approval/simulate/submit/retry, deployer approval spender, buffered + individual fallback, USDT revoke-first, versioned payload, receipt event extraction, and stable staking-token nonce. Zapper deploy stays separate. |
| Zapper regression boundary | Exploratory spec only | Captured quote keyed by full inputs, health/token support, mint + redeem, compliance/deprecated gates, exact returned transaction, debounce/refetch under frozen time, and no second mounted Zapper. Keep Register-owned until the SDK Zapper plan lands. |
| Index account portfolio | Not covered | Index holdings and transactions, 60s refresh where required, period/cache behavior, and response parity; omit Yield-specific assertions until the later Yield phase. |

### Migration execution rule

Before replacing a Register source or builder, land a characterization flow against the old implementation. Migrate one consumer, keep the test unchanged, then run the focused flow + smoke. Domain calculations and calldata still get focused SDK tests; E2E must not duplicate those algorithms in its expected-value helpers. Add request-count/source assertions where they protect performance or the RPC-vs-subgraph live-truth boundary.

Audit evidence at the moment of review (the Phase 2 worktree was actively changing): E2E TypeScript and `e2e:check` green; smoke 6/9; combined Playwright run 18/25. Failures were the known raw-DTF hydration/unfinished issuance-governance-settings-zap work, not a rejection of the architecture.

## Phase plan

| Phase | Scope | Status |
| --- | --- | --- |
| 1a. Foundation | playwright config (smoke/full projects, port 3005, pinned env), registry, mocks (rpc/subgraph/api/provider), capture + staleness scripts, snapshots, data-testids, boot smoke spec, agent README | done (commit `feat: e2e foundation`) — gates green ×2, smoke flake-free, 2.6MB snapshots |
| 1b. Vertical slice | ONE full write flow (vote on a proposal: connect wallet → vote → tx receipt → optimistic/refetched state) proving wallet + clock-pump + receipt + post-tx overlay stack BEFORE the swarm — lesson #1 applies to our own infra | done — `flows/governance-vote.spec.ts` green ×3, zero unmocked; overlay fixture + clock-pump protocol in README; wallet fixture proven (wagmi auto-connect); `governance { token timelock }` capture-query gap fixed + enriched centrally |
| 2. Test swarm | parallel Opus agents, one per area: home/discover, overview, issuance (manual mint/redeem), buy/sell (zap — needs real zapper boundary), rebalance/auctions, governance (list/detail/vote/propose/queue/execute), settings, **geo-restricted variants + deprecated-DTF states** | in progress — home ✅, overview/settings/auctions ✅ (value assertions staged behind raw-DTF hydration fix, in flight); issuance/zap/governance resumed after session-limit kill; shared fixes landed: api-staging host, per-DTF compliance default, /dtf/rebalance, advanceTime (Codex #9), e2e:full script, gate globs on index src (Codex #11) |
| 2.5 Trust blockers | Codex audit items actionable pre-CI: outbound default-deny allowlist (#1), per-test tx log + payload assertions (#7), committed flows fail on unmocked (#6), artifact sweep (#10), strict identity matching (#4), per-DTF version() (#8, in flight via chain-state) | pending |
| 3. CI + hardening | **Replace** legacy `.github/workflows/playwright.yml` (npm-based, no split) — smoke on PR, full nightly; 3× repeat flake pass, snapshot freshness gate, retro + wiki closeout | pending |

Non-goals for now: Anvil/forknet tx realism, mobile viewports, yield-dtf surfaces, visual regression screenshots. Revisit after Phase 3.

Related: [[project]] (safety rules, UI register), [[sdk]] (data-source routing the mocks must respect).
