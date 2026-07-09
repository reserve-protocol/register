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

- **Wallet**: injected EIP-6963 + EIP-1193 mock provider (`addInitScript` before app JS, announces as "Test Wallet" to RainbowKit; `window.ethereum` fallback). Wallet methods handled inline (accounts, chain switch, sendTransaction → fixed hash, signatures → dummies). Read methods forward to the same RPC dispatch as the HTTP mock as a **redundant belt** — the primary read path is HTTP host interception: wagmi/SDK reads go through configured `http()` transports (`src/state/chain/index.tsx`, `src/utils/rpc-urls.ts`), NOT the connector provider. Never "simplify" by trusting provider-forwarding alone.
- **RPC**: intercept known RPC hosts, per-method dispatch. `eth_chainId` respects the URL's chain; tx receipts derived per chain from that chain's block number + confirmation count (never a hardcoded Base-shaped constant). Multicall3 `aggregate3` decoded/encoded **with viem** (`decodeFunctionData`/`encodeFunctionResult`) — never hand-rolled ABI codecs. `eth_call` answered from a per-(address, function) override table backed by snapshots; unknown calls return zero-words and **log `[E2E] unmocked eth_call`**; the base fixture collects these and **fails `@smoke` tests on any unmocked call** (flows stay lenient while iterating) — a green smoke run must be trustworthy without reading logs.
- **Subgraph** (goldsky): dispatch by GraphQL `operationName`, snapshot-backed per DTF. Unmatched → GraphQL error `[E2E] unmocked operation` (fail-loud).
- **Reserve API**: dispatch by pathname, snapshot-backed per DTF (keyed by `address`/`folio` param). Unmocked endpoint → 500 + console.error (fail-loud). Geolocation endpoint mocked unrestricted by default; restricted variants are a fixture option.
- **Zapper (buy/sell)**: `useZapSwapQuery` hits the zapper API with input-dependent params (tokenIn/tokenOut/amountIn/slippage; 500ms debounce, 12s refetch). Snapshot keyed by DTF address can answer exactly one input — zap snapshots are keyed by `(chain, tokenIn, tokenOut, amountIn)` and specs pin their inputs to captured amounts; the returned calldata is swallowed by the mock provider's `eth_sendTransaction`. Phase 1 ships only the healthcheck stub; the real boundary lands with the buy/sell flow work.
- **Blocked**: analytics (Sentry/Mixpanel), llama/merkl yields, image CDNs. WalletConnect/relay endpoints get **fulfilled with empty 200s, not aborted** — aborts throw during eager connector setup and pollute the fail-loud console.
- **Env pinning**: the Playwright webServer launches with a locked minimal env — no `VITE_STAGING_API` (staging flips `RESERVE_API`/zapper host), no `VITE_MAINNET_URL`/`VITE_INFURA`/`VITE_ALCHEMY`/`VITE_ANKR` (they add RPC hosts the intercept list doesn't match). A developer `.env` must not be able to route around the mocks.
- **Snapshots**: captured from live prod by `e2e/scripts/capture.ts` into `e2e/snapshots/<chain>/<slug>/*.json`, `{_meta:{source,capturedAt,...}, data}` envelope. **One DTF registry** (`e2e/helpers/registry.ts`) shared by capture, mocks, and tests — never duplicate it. Staleness checker hard-fails CI past max age. Capture **downsamples time series** (historical-price/exposure) to ≤200 points — the old branch's 17k-line raw captures are repo bloat that helped kill it.
- **Clock**: `page.clock` frozen relative to snapshot timestamps (`proposalTime`/`rebalanceTime` helpers) so governance/rebalance states are deterministic and don't rot as snapshots age. **Freezing is state-pinning, not free**: debounces (zap 500ms), react-query `staleTime`/`refetchInterval` (zap 12s), and receipt polling never elapse under a paused clock — every flow spec explicitly pumps time with `page.clock.runFor(...)` at each wait point.
- **Post-tx transitions**: snapshots are static, but flows must observe state change after a tx (allowance after approve, proposal state after vote). Mocks support **per-test overlays** — a fixture helper swaps a route's response mid-test (`overrideSnapshot`/scenario override), paired with a clock pump to trigger the refetch. Design in Phase 1 vertical slice; never hack it per-spec.

**Hard lessons from the old branch (do not repeat):**
1. Infra without tests is dead code — the old wallet + clock fixtures were never imported by a single spec. Every fixture lands **with** a spec that uses it.
2. No English-copy selectors — Lingui will break them. `data-testid` on structural containers and on any control whose label is translated; role queries only for structural/nameless roles (`getByRole('button', {name})` resolves the *translated* accessible name — it rots like text selectors). Pin the test locale to `en`. Scoped locators over `.first()`.
3. No `test.skip` conditioned on snapshot contents — pin snapshot state with the frozen clock instead; skipped tests rot silently.
4. Faked-to-zero RPC masks gaps — log every unmocked read.
5. Don't capture moving-window time series raw; normalize timestamps relative to capture time.

## Layout & conventions

- `e2e/fixtures/` — `base.ts` (auto-mock everything, one import per spec), `wallet.ts` (connected-wallet layer).
- `e2e/helpers/` — `registry.ts` (DTF catalog), `rpc.ts`, `subgraph.ts`, `api.ts`, `provider.ts`, `clock.ts`, `snapshots.ts`.
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

## Phase plan

| Phase | Scope | Status |
| --- | --- | --- |
| 1a. Foundation | playwright config (smoke/full projects, port 3005, pinned env), registry, mocks (rpc/subgraph/api/provider), capture + staleness scripts, snapshots, data-testids, boot smoke spec, agent README | in progress |
| 1b. Vertical slice | ONE full write flow (vote on a proposal: connect wallet → vote → tx receipt → optimistic/refetched state) proving wallet + clock-pump + receipt + post-tx overlay stack BEFORE the swarm — lesson #1 applies to our own infra | pending |
| 2. Test swarm | parallel Opus agents, one per area: home/discover, overview, issuance (manual mint/redeem), buy/sell (zap — needs real zapper boundary), rebalance/auctions, governance (list/detail/vote/propose/queue/execute), settings, **geo-restricted variants + deprecated-DTF states** | pending |
| 3. CI + hardening | **Replace** legacy `.github/workflows/playwright.yml` (npm-based, no split) — smoke on PR, full nightly; 3× repeat flake pass, snapshot freshness gate, retro + wiki closeout | pending |

Non-goals for now: Anvil/forknet tx realism, mobile viewports, yield-dtf surfaces, visual regression screenshots. Revisit after Phase 3.

Related: [[project]] (safety rules, UI register), [[sdk]] (data-source routing the mocks must respect).
