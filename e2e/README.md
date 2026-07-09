# e2e (Playwright)

Fully offline Index-DTF e2e suite. Only Vite + Chromium run live; every external
boundary (RPC, subgraph, Reserve API, wallet) is intercepted. Fast, deterministic,
CI-cheap. Architecture decisions live in `docs/wiki/domains/e2e.md` — read that first.

## Quick loop

```bash
pnpm e2e:smoke     # fast @smoke set, offline, chromium (boots dev server on :3005)
pnpm e2e           # full suite (all non-@smoke specs)
pnpm e2e:ui        # Playwright UI mode
pnpm e2e:capture   # refresh snapshots from live prod
pnpm e2e:check     # snapshot structure + staleness gate (hard-fails >45 days)
```

The dev server is reused if already running on :3005; first run boots it (~20s).
Never uses :3000 — that's the human's dev server.

## How the mocks layer

One auto fixture (`fixtures/base.ts`) installs every boundary on each test:

- **`helpers/rpc.ts`** — JSON-RPC for all known RPC hosts. `eth_chainId` respects
  the URL's chain. Multicall3 `aggregate3` is decoded/encoded with viem (never
  hand-rolled). `eth_call` answers from a per-`(address, selector)` override table
  (seeded: getVotes → voting power; Chainlink `latestRoundData` → fresh price);
  unknown reads return zero-words **and log** `[E2E] unmocked eth_call`.
- **`helpers/subgraph.ts`** — Goldsky, dispatched by GraphQL `operationName`
  (body-substring fallback), snapshot-backed per DTF. Yield subgraph → empty shape.
- **`helpers/api.ts`** — api.reserve.org by pathname, snapshot-backed per DTF.
  Geolocation is unrestricted US by default (override via `test.use({ compliance })`).
- **`helpers/provider.ts`** — injected EIP-6963 + EIP-1193 wallet (`fixtures/wallet.ts`).
  HTTP interception is the PRIMARY read path; the provider forwards reads to the
  same dispatch as a belt. Connecting is an explicit `connectWallet(page)`.
- **`helpers/clock.ts`** — `freezeTime` + `proposalTime`/`rebalanceTime` to pin
  governance/rebalance phases against snapshot timestamps.

`helpers/registry.ts` is the single DTF catalog (one per chain + one deprecated),
shared by mocks, capture, and tests. `helpers/snapshots.ts` loads the
`{_meta, data}` envelope from `snapshots/<chain>/<slug>/*.json`.

## Fail-loud philosophy

Every mock that can't answer calls the logger (`[E2E] unmocked ...`). The base
fixture collects those lines:

- **@smoke tests fail at teardown** if any occurred — a green smoke run is
  trustworthy without reading logs.
- **Flow tests** only attach the lines to the report (lenient).

Faking-to-zero without logging is banned — gaps must surface. When a spec hits an
unmocked call, add the answer to the relevant helper (RPC override, subgraph op,
or API endpoint), not a `test.skip`.

## Adding a snapshot / DTF

1. Add the DTF to `REGISTRY` in `helpers/registry.ts` (address, chain, slug).
2. `pnpm e2e:capture` — pulls live data into `snapshots/<chain>/<slug>/`.
   Time-series (historical price, exposure) are downsampled to ≤200 points;
   window params + downsampling are recorded in each file's `_meta.window`.
3. `pnpm e2e:check` must pass (structure, coverage, freshness).

Snapshots are committed. Refresh before they age out (45-day hard fail).
