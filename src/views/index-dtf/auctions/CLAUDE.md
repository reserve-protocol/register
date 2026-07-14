# Auctions / Rebalance View — Agent Guide

Self-contained context for changing this view. Mock mechanics live in
`e2e/CLAUDE.md` (cookbook); architecture in `docs/wiki/domains/e2e.md`; the
rebalance/auction lifecycle (nonce, restricted vs permissionless window,
launcher role, rounds) is in `docs/wiki/index-protocol.md` — read it before
touching state here rather than re-deriving semantics.

## What this view is

Rebalance list (`rebalance-list/`, the AUCTIONS index route) + rebalance detail
(`rebalance/:proposalId`). The v5+ UI mounts under `data-testid="dtf-auctions"`;
the legacy v2 UI (`legacy/`) renders instead when
`indexDTFVersionAtom === '2.0.0'`, and also has its own `/auctions/legacy`
route. The critical split: LIVE rebalance state (is there an active auction, what
round) comes from **RPC `getRebalance()`** (selector `0xaa3b5568`), auction
**HISTORY** comes from the **subgraph** (`getRebalances` → `rebalances.json`),
and per-rebalance **metrics** come from the **API** (`/dtf/rebalance`). A test
that mocks the wrong layer passes wrongly or fails confusingly — see Traps.

## Did a diff here — which test?

| You changed | Run / extend |
|---|---|
| List rendering, bucketing, empty active state | `e2e/tests/smoke/auctions.spec.ts` |
| Active vs historical bucketing, active/completed detail | `e2e/tests/flows/auctions.spec.ts` |
| Rebalance detail (round, progress, metrics, liquidity) | `e2e/tests/flows/auctions.spec.ts` |
| Any hook/atom/updater under `views/rebalance*/` | both: `pnpm exec playwright test --project=full e2e/tests/flows/auctions.spec.ts` + smoke |
| Legacy v2 UI (`legacy/`) | not covered — deferred |

Quick loop: `pnpm exec playwright test e2e/tests/smoke/auctions.spec.ts`
(seconds), full flow (~10s). Both pin `base/lcap` (v5).

## How to mock auction / rebalance states

- **Idle (no active rebalance)**: default. `rpc.ts` answers `getRebalance()`
  with an encoded EMPTY tuple (nonce 0, no tokens, bids off). Freeze past every
  window (`idleTime()` = max `availableUntil` + 1 day) so every row buckets
  historical.
- **Active rebalance (detail)**: `overrides.ethCall(dtf.address, '0xaa3b5568',
  encodeActiveRebalance(latest))` — an address-specific override beats the `*:`
  idle wildcard. The tuple is built from the DTF's own chain-state basket
  (`chain-state.json`, the same data the RPC mock serves for
  `totalAssets`/`totalSupply`) so `dtf-rebalance-lib`'s coherence checks pass;
  weights are skewed ±40% so progression < 100% (unskewed reads "Finished").
- **List bucketing by phase**: `rebalanceTime(r, 'restricted' |
  'permissionless' | 'expired')` picks a frozen timestamp relative to the
  rebalance's window; the list compares `availableUntil` against it. NOTE the
  captured lcap rebalances have a zero-width window (`restrictedUntil ==
  availableUntil`), so only `'restricted'` lands in-window — `'permissionless'`
  is already past `availableUntil`.
- **Auction history rows**: subgraph `getRebalances` branch serves
  `rebalances.json` automatically; rows match proposals by `executionBlock ===
  blockNumber` (`proposalIdFor` resolves detail routes the same way).
- **Detail-only API fills**: `overrides.api({ pathname: '/zapper/tokens' }, [])`
  (volatility hook; the shared generic `/zapper` branch returns the healthcheck
  OBJECT and `tokens.map` crashes the view) and `overrides.api({ method:
  'POST', pathname: '/rebalance/liquidity' }, {...})`.
- **Settle**: data resolves in TWO react-query flush rounds under a frozen clock
  (`settleListData`: pump GetIndexDTF → dependent queries enable → pump
  rebalances + proposals). Per-row metrics fire a third pump after rows mount.

## Coverage (honest)

- **Covered** (flow + smoke): historical rows + API metric cells; in-window
  ACTIVE list row; active detail with a decoded Multicall3 proof `getRebalance()`
  came from RPC + asserted derived round; completed card; empty active section;
  idle smoke.
- **Covered** (`index-dtf/auctions/launch-write.spec.ts`, harness + wallet, bsc/cmc20):
  the launch PERMISSION MATRIX — a launcher submits `openAuction()` (GetIndexDTF
  overlay enrols the test wallet in `auctionLaunchers`), a non-launcher in the
  permissionless window submits `openAuctionUnrestricted()` (subgraph
  `getRebalances` window widened since captured windows are zero-width). Asserts
  target + selector + rebalance nonce. **cmc20 not lcap**: `isHybridDTFAtom` is
  hardcoded to LCAP+Venionaire and a hybrid DTF forces a Manage-Weights step
  before the launch button. ENGINEER REVIEW STILL REQUIRED for the openAuction
  weight/price MATH (`getRebalanceOpenAuction`) — the spec proves the call fires,
  not that the args are numerically correct.
- **Deferred** (needs testids/roles + engineer review): `bid` writes; legacy v2
  UI and `/auctions/legacy` route.
- **Covered** (`flows/auctions-multichain.spec.ts`): historical bucketing +
  API metrics + idle empty active section + in-window active row on
  `bsc/cmc20` and `mainnet/open`.

## Edge cases to keep covered (or consciously skip)

- Idle: active section shows `auctions-empty-state`, zero `auctions-active-item`.
- Detail active branch renders header/title, hides `auctions-rebalance-completed`
  AND `auctions-rebalance-error` (an error banner = incoherent decoded tuple).
- Expired detail flips to the completed card (`isCompletedAtom`).
- Disconnected visitor (launcher CTAs gate on `isAuctionLauncherAtom`).

## Traps

- The active-detail flow asserts a **hardcoded round `'2'`** on
  `auctions-round[data-round]`, derived from the ±40% weight skew over captured
  chain-state. A basket-changing re-capture breaks it opaquely — assert `> 0` or
  document at the assertion (backlogged).
- The auctions subgraph query is misnamed `getGovernanceStats` in
  `use-rebalance-auctions.ts` but selects `auctions(...)` — matched by
  `body.includes('auctions(')` in `e2e/helpers/subgraph.ts` BEFORE the real
  `governances` branch. Renaming the query requires updating that matcher or the
  hook silently degrades to `[]`.
- Don't "fix" a live-state test by moving `getRebalance` data into the subgraph
  mock (or history into RPC) — the layers are distinct on purpose.

Engineer review is required for behavior changes here (on-chain rebalance math /
launcher permissions are a repo stop-condition surface) — tests passing is not
sign-off.
