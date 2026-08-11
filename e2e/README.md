# e2e (Playwright)

Fully offline Index-DTF e2e suite. Only Vite + Chromium run live; every external
boundary (RPC, subgraph, Reserve API, wallet) is intercepted. Fast, deterministic,
CI-cheap. Architecture decisions live in `docs/wiki/domains/e2e.md` — read that first.

## Quick loop

```bash
pnpm e2e:smoke     # fast @smoke set, offline, chromium (boots dev server on :3005)
pnpm e2e:full      # all non-@smoke behavioral specs
pnpm e2e           # both Playwright projects (smoke + full)
pnpm e2e:ui        # Playwright UI mode
pnpm e2e:capture   # refresh snapshots from live prod
pnpm e2e:capture --only=dtf    # ONLY dtf.json + chain-state.json per DTF
pnpm e2e:capture --only=chain  # ONLY chain-state.json (live RPC reads)
pnpm e2e:check     # snapshot structure + staleness gate (hard-fails >45 days)
```

Use the `--only` modes after an SDK bump: they refresh the SDK-shaped
`GetIndexDTF` payload and the on-chain basket reads WITHOUT churning the
proposal/governance/historical snapshots that committed flow specs pin to.
`tests/smoke/dtf-data.spec.ts` is the canary — it fails when the captured
dtf.json shape drifts from the installed SDK's `GetIndexDtfDocument` (the
query is copied verbatim into `scripts/capture.ts`; the SDK doesn't export it).

Each run boots its own server on :3005 (~20s) — `reuseExistingServer` is off so
a foreign server can never bypass the pinned E2E env; if :3005 is occupied the
run fails (free it with `lsof -ti :3005 | xargs kill`).
Never uses :3000 — that's the human's dev server.

## How the mocks layer

One auto fixture (`fixtures/base.ts`) installs every boundary on each test and
default-denies any non-local request that is not explicitly modeled:

- **`helpers/rpc.ts`** — JSON-RPC for all known RPC hosts. `eth_chainId` respects
  the URL's chain. Multicall3 `aggregate3` is decoded/encoded with viem (never
  hand-rolled). `eth_call` answers from a per-`(address, selector)` override table
  (seeded: getVotes → voting power; Chainlink `latestRoundData` → fresh price);
  unknown reads return zero-words **and log** `[E2E] unmocked eth_call`.
  Registry DTFs additionally get address-specific answers seeded from
  `snapshots/<chain>/<slug>/chain-state.json` (captured live): real
  `totalAssets()` basket, `totalSupply`, `decimals`, the folio's actual
  protocol `version()` (v4 vs v5 gates write ABIs), and `name/symbol/decimals`
  for every basket token — this is what makes the SDK's basket derivation
  (and the overview's data layer) resolve offline. Precedence: per-test
  `overrides.ethCall` > address-specific > `*:` wildcard > fail-loud zero.
- **`helpers/subgraph.ts`** — Goldsky, dispatched by GraphQL `operationName`
  (body-substring fallback), snapshot-backed per DTF. Yield subgraph → empty shape.
- **`helpers/api.ts`** — api.reserve.org by pathname, snapshot-backed per DTF.
  Geolocation is unrestricted US by default (override via `test.use({ compliance })`).
- **`helpers/provider.ts`** — injected EIP-6963 + EIP-1193 wallet (`fixtures/wallet.ts`).
  HTTP interception is the PRIMARY read path; the provider forwards reads to the
  same dispatch as a belt. Connecting is an explicit `connectWallet(page)`.
  Every sent transaction is recorded in `txLog` with a unique hash; receipt and
  transaction lookups are correlated to that record. Tests can queue success,
  revert, pending-poll, or user-rejection outcomes with `overrides.transaction()`.
- **`helpers/clock.ts`** — `freezeTime` + `proposalTime`/`rebalanceTime` to pin
  governance/rebalance phases against snapshot timestamps.

`helpers/registry.ts` is the single DTF catalog (one per chain + one deprecated),
shared by mocks, capture, and tests. `helpers/snapshots.ts` loads the
`{_meta, data}` envelope from `snapshots/<chain>/<slug>/*.json`.

## Live API mode (validating the real Reserve / zapper APIs)

The committed suite is offline and stays that way. Live mode is a separate
opt-in project (`pnpm e2e:live`, `@live`-tagged specs under `tests/live/`,
excluded from smoke/full/mobile) that swaps ONLY the API boundary for a
recording passthrough:

```bash
E2E_LIVE_ZAPPER_API=zrs1 pnpm e2e:live                       # planner surface only
E2E_LIVE_RESERVE_API=production E2E_LIVE_ZAPPER_API=zrs1 pnpm e2e:live   # both
```

The two surfaces are independent env vars, each taking a named target or an
absolute URL (anything else is a hard error, not a silent offline fallback):

| Var | Targets | Surface (`surfaceForPath`) |
|---|---|---|
| `E2E_LIVE_RESERVE_API` | `production` (api.reserve.org), `staging`, `https://…` | everything except the two paths below |
| `E2E_LIVE_ZAPPER_API` | `zrs1` (zrs-1.reserve-api.com), `production`, `staging`, `https://…` | `/api/zapper/**`, `/api/prices/**` |

What live mode does and does not touch:

- **Live**: the configured surface's HTTP responses, rewritten onto the target
  origin, recorded in `boundaryRequests` exactly like a mocked call, and
  validated against `helpers/live-contracts.ts` (zod shape + invariants:
  `minAmountOut <= amountOut`, non-zero `amountOut`, a `tx` whenever funds are
  sufficient, candle `high >= low`, open/close inside high/low). Drift fails the
  test; the unmocked-egress default-deny is still in force.
- **Still mocked, always**: RPC, subgraph, wallet, receipts, chain state, and
  the CoW/velora/enso aggregators (an explicit disabled 503, so the planner zap
  is the provider under validation). Chain state therefore stays pinned to the
  committed snapshots — see the hybrid-test limitation below.

Coverage: `tests/live/reserve-api-contract.spec.ts` and
`zapper-api-contract.spec.ts` are request-level (no browser) and cover prices,
current/historical DTF, candles, compliance, discover, portfolio, exposure,
rebalance + liquidity, the zappable token lists, planner health, buy quotes and
the ungoverned deploy quote. `pricing-live.spec.ts` and `zap-widget-live.spec.ts`
drive the real UI against live responses.

Limitations (all deliberate, tracked in `docs/wiki/progress.md` § E2E coverage debt):

- **Hybrid tests can be invalidated by real basket changes.** The UI specs join
  live API data with pinned chain state; when the live basket gains or loses a
  token the SDK cannot join the two and the spec skips with a `basketDrift`
  message telling you to run `pnpm e2e:capture`. It reports drift, it does not
  paper over it.
- **`/api/zapper/{chain}/tokens` is ~500 MB.** It is probed in bounded form
  (`liveProbe`), never buffered.
- **The token list is pinned as known drift**: `fetchZapperTokens` reads
  `data.tokens[]`, every deployment answers `{status, result[]}`, and the
  helper's catch-all turns that into "nothing is zappable" with no error. The
  spec asserts the mismatch with `test.fail()`.
- **Deploy is quote-level only.** On-chain deployment is not executed; the
  deploy transaction the planner returns is not submitted to a real chain.

## Fail-loud philosophy

Every mock that can't answer calls the logger (`[E2E] unmocked ...`). The base
fixture collects those lines and **every committed test fails at teardown** if
any occurred. A deliberately exploratory spec may opt out explicitly with
`test.use({ allowUnmocked: true })`; that opt-out is not acceptable in committed
acceptance coverage. Unknown external egress also fails and is reported.

Faking-to-zero without logging is banned — gaps must surface. When a spec hits an
unmocked call, add the answer to the relevant helper (RPC override, subgraph op,
or API endpoint), not a `test.skip`.

## Writing a flow spec (the write-path recipe)

`tests/flows/governance-vote.spec.ts` is the reference. Every flow follows the
same shape — copy it:

1. **Freeze first, before `goto`.** `freezeTime(page, proposalTime(p, 'active'))`
   (or `rebalanceTime`) pins snapshot-derived state into a known phase. The SDK
   derives live proposal/rebalance state from snapshot data + the frozen clock,
   so a frozen window keeps state stable no matter how the snapshot ages.
2. **`connectWallet(page)`** for write flows — imports from `fixtures/wallet`.
   The injected provider is `window.ethereum`, so wagmi auto-connects on mount;
   the helper tolerates both auto-connect and the explicit RainbowKit modal.
3. **Drive the UI with `data-testid` locators**, never translated copy.
4. **Pump the clock at every wait point with `advanceTime`** (see below).
5. **Assert user-visible state** — a success `data-testid`, an updated tally,
   a disabled button. For post-tx state that changed, use an overlay (below).
6. **End clean** — zero `[E2E] unmocked` lines. Run the spec, read the report's
   `unmocked-calls` attachment, fill each gap in the right helper, repeat.

### Clock-pump protocol (freeze → act → runFor)

A paused `page.clock` stops **every timer**, and that includes two things beyond
polling that are easy to forget:

- **react-query's `notifyManager` batches state flushes on `setTimeout`.** A
  query can fetch and resolve, but its data never reaches React until the clock
  advances. Symptom: a button that should enable (voter state, `isReady` from a
  contract simulate) stays disabled forever. wagmi's account/chain store flushes
  synchronously and does *not* need a pump — that asymmetry is why the wallet
  connects but query-driven UI hangs.
- **Receipt polling** (`useWaitForTransactionReceipt`) polls on an interval.

So after **any action that kicks off async reads**, advance the clock:

```ts
await connectWallet(page)
await advanceTime(page, 5_000)   // flush voter-state read → vote button enables

await page.getByTestId('vote-option-for').click()
await advanceTime(page, 5_000)   // flush castVote simulate → submit enables

await page.getByTestId('vote-submit-btn').click()
await advanceTime(page, 10_000)  // receipt polling → pending → confirming → success
await expect(page.getByTestId('vote-success')).toBeVisible()

await advanceTime(page, 5_000)   // post-tx refetch (query invalidation) settles
```

`advanceTime` moves the browser clock and the Node-side RPC clock together, so
block and Chainlink timestamps cannot drift. Every call gets a comment naming
the timer it satisfies. Raw `page.clock.runFor` is forbidden in specs.

### Post-tx overlay (observing state that changed)

Snapshots are static, but after a tx the UI must see new state (a vote tally, an
allowance). The `overrides` fixture is a per-test overlay every dispatcher checks
**before** its snapshots — mutate it mid-test, no route re-registration, auto-reset
between tests:

```ts
// after the vote, the app refetches the voting snapshot; serve a bumped tally
const overlay = loadEnrichedProposal(PROPOSAL_ID)!
overrides.subgraph({
  operationName: 'GetIndexDtfProposalVotingSnapshot',
  variables: { id: PROPOSAL_ID },
}, {
  proposal: { ...overlay.proposal, forWeightedVotes: '42000000000000000000000000' },
})
// ...cast the vote, then pump so the invalidation-driven refetch hits the overlay
```

Four typed setters, keyed the way each dispatcher matches:

- `overrides.subgraph({ operationName, variables }, data)` — exact operation and
  the specified identity variables.
- `overrides.ethCall(address, calldata, hex)` — address plus full calldata.
- `overrides.api({ method, pathname, search }, data)` — exact method/path and
  the specified query fields.
- `overrides.transaction(outcome)` — queue a `success`, `revert`, or `reject`
  result; success/revert can specify `pendingPolls`.

Set the overlay **before** the action that triggers the refetch; the initial
render already fetched the un-overlaid value, so you get a clean before/after.

## Adding a snapshot / DTF

1. Add the DTF to `REGISTRY` in `helpers/registry.ts` (address, chain, slug).
2. `pnpm e2e:capture` — pulls live data into `snapshots/<chain>/<slug>/`.
   Time-series (historical price, exposure) are downsampled to ≤200 points;
   window params + downsampling are recorded in each file's `_meta.window`.
3. `pnpm e2e:check` must pass (structure, coverage, freshness).

Snapshots are committed. A full capture writes to a temporary tree, verifies the
required manifest, and publishes atomically; a failed endpoint cannot partially
refresh the suite or advance its marker. Targeted captures update only their
requested files and do not advance global freshness. `e2e:check` validates all
required files, every per-file timestamp, and DTF/chain identity. Refresh before
the 45-day hard fail.

## Transaction assertion contract

Any write-flow acceptance test must inspect `txLog`, not only the success toast.
Assert the chain, target, value, function selector/decoded arguments, approval
spender and amount, transaction order, and that the explorer link contains the
recorded unique hash. This is the suite's contract with Register's transaction
builder; protocol math and calldata construction still require SDK unit/live
tests. Governance, issuance, compliance, auction, fee, deployment, and staking
writes require engineer review before shipping.
