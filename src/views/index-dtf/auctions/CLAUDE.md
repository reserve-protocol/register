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
round) comes from **RPC** (`getRebalance()` selector `0xaa3b5568`, plus the
SDK's `nextAuctionId()`/`auctions(id)` latest-auction read), auction
**HISTORY** comes from the **subgraph** (`GetIndexDtfRebalances` →
`rebalances.json`), and per-rebalance **metrics** come from the **API**
(`/dtf/rebalance`). Version identity is `folioVersionAtom` (pending until the
SDK resolves `version()`); nothing here reads or encodes while it is pending. A test
that mocks the wrong layer passes wrongly or fails confusingly — see Traps.

## Did a diff here — which test?

| You changed | Run / extend |
|---|---|
| List rendering, bucketing, empty active state | `e2e/tests/smoke/auctions.spec.ts` |
| Active vs historical bucketing, active/completed detail | `e2e/tests/flows/auctions.spec.ts` |
| Rebalance detail (round, progress, metrics, liquidity) | `e2e/tests/flows/auctions.spec.ts` |
| Any hook/atom/updater under `views/rebalance*/` | both: `pnpm exec playwright test --project=full e2e/tests/flows/auctions.spec.ts` + smoke |
| Launch buttons, `use-launch-preflight`, `utils/launch-readiness`, receipt handling, v6 auction length | `pnpm exec playwright test --project=full --project=smoke e2e/tests/index-dtf/auctions/launch-write.spec.ts` + `pnpm exec vitest run src/views/index-dtf/auctions/views/rebalance/tests` |
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
  a curated allowlist (hybrid REQUIRES weight control but is not implied by it —
  the D1 weightControl derivation was reverted, Luis 2026-07-21) — cmc20
  is tracking so it stays non-hybrid; a hybrid (allowlisted native)
  DTF forces a Manage-Weights step before the launch button, so mock
  `weightControl` to drive that step. ENGINEER REVIEW STILL REQUIRED for the openAuction
  weight/price MATH (`getRebalanceOpenAuction`) — the spec proves the call fires,
  not that the args are numerically correct.
- **Covered** (`launch-write.spec.ts`, full project): launch GUARDS — a
  failing latest-auction read after a cached success disables the launcher
  (`auctions-live-state-unavailable`); a stale page nonce is refused at click
  time by the pre-send re-read (`use-launch-preflight.ts`, no tx); a reverted
  receipt releases "Launching…"; the community button follows the RPC
  `restrictedUntil` (launcher-extended) and shows
  `auctions-community-launch-countdown` while the indexed window says
  permissionless. Unit seams: `tests/launch-readiness.test.ts` (Folio window
  rules), `tests/use-ondo-limit-status.test.tsx` (v6 Ondo cap = v5 cap with the
  RPC length; unavailable while it loads), `tests/rebalance-metrics-updater.test.tsx`
  (no transient error before the v6 length loads).
- **Deferred** (needs testids/roles + engineer review): `bid` writes; legacy v2
  UI and `/auctions/legacy` route.
- **Covered** (`flows/auctions-multichain.spec.ts`): historical bucketing +
  API metrics + idle empty active section + in-window active row on
  `bsc/cmc20` and `mainnet/open`.
- **Covered** (`index-dtf/auctions/version-identity-nav.spec.ts`): the launch
  button recovers after a direct cmc20 → photon → cmc20 hop through the command
  menu (container stays mounted, version atom reset, cached same version).
- **Evidence only** (`index-dtf/auctions/rebalance-evidence.spec.ts`): skipped
  unless `E2E_EVIDENCE_DIR` is set; captures the launcher's active detail and
  the list for stage handoffs. Never a gate.

## Edge cases to keep covered (or consciously skip)

- Idle: active section shows `auctions-empty-state`, zero `auctions-active-item`.
- Detail active branch renders header/title, hides `auctions-rebalance-completed`
  AND `auctions-rebalance-error` (an error banner = incoherent decoded tuple).
- Expired detail flips to the completed card (`isCompletedAtom`).
- Disconnected visitor (launcher CTAs gate on `isAuctionLauncherAtom`).
- Manage Weights fails closed: any rebalance token missing from the subgraph
  token map, or a 0 supply, renders `manage-weights-unavailable` instead of the
  basket — weights from a partial map would misattribute shares and silently
  break Save (unit-pinned in `manage-weights/tests/`).

## Traps

- The active-detail flow asserts a **hardcoded round `'2'`** on
  `auctions-round[data-round]`, derived from the ±40% weight skew over captured
  chain-state. A basket-changing re-capture breaks it opaquely — assert `> 0` or
  document at the assertion (backlogged).
- Rebalance list, auction history and current/historical rebalance state come
  from `@reserve-protocol/react-sdk` hooks for v5/v6 (`useIndexDtfRebalances`,
  `useIndexDtfRebalanceAuctions`, `useIndexDtfCurrentRebalance`,
  `useIndexDtfLatestAuction`); v4 keeps the Register-local reads by decision.
  The view still stores the string-typed shapes — `utils/sdk-mappers.ts` is the
  only conversion point. The SDK's auctions query is matched by
  `body.includes('auctions(')` in `e2e/helpers/subgraph.ts` BEFORE the
  `governances` branch; the SDK's latest-auction read starts at
  `nextAuctionId()`, answered `0` by the `*:` wildcard in `e2e/helpers/rpc.ts`.
- `isAuctionOngoingAtom` is RPC-first: once `latestAuctionAtom` resolves (SDK
  read at one block) it decides; indexed auctions only decide while it is
  unresolved or on v4. "Ongoing" is wider than the SDK's biddable `isActive`:
  an auction of the current nonce that has not ended blocks a launch, warm-up
  included (the first fork launch stayed enabled for 30 s on `isActive`). Don't
  gate a write on indexed rows — the indexer lags receipts and re-enables the
  launch button.
- Launch readiness never trusts a cached read: both buttons close on any live
  read error (current rebalance, latest auction, v6 `maxAuctionLength`) and
  re-read nonce/window/latest auction right before `writeContract`; the launcher
  also refuses (`state-refreshed`) when the re-read moved supply, basket balances
  or the v6 `maxAuctionLength`, or its prices are over a minute old, because
  `openAuction` is sized from the page's reads (`hasSizingDrift` /
  `isPriceSnapshotStale` in `utils/launch-readiness.ts`) (community
  also honours Folio's 120 s unrestricted buffer after the rebalance start and
  the last auction's end — `cooldown` in `utils/launch-readiness.ts`; the
  refused reason lands on the button as `data-blocker`). Errored live reads keep
  polling so the buttons reopen without a reload. Live
  windows come from the RPC rebalance read — Folio extends `restrictedUntil`
  on every launcher `openAuction`, which the indexer never sees. Folio 6.0
  math needs the RPC `maxAuctionLength` everywhere it sizes an auction (launch,
  metrics, Ondo cap): read it through `hooks/use-rebalance-auction-length.ts`
  and treat "not loaded" as unavailable, never as a 1% cap or an error.
- Real launches run on the fork lane (`playwright.fork.config.ts`,
  `.claude/skills/fork-e2e/SKILL.md`): Register reads the production subgraph
  through `e2e/fork/scripts/subgraph-proxy.mjs`, truncated at the fork block,
  because an auction the subgraph already knows about switches this view to the
  running/finished cards and unmounts the launch buttons.
- Don't "fix" a live-state test by moving `getRebalance` data into the subgraph
  mock (or history into RPC) — the layers are distinct on purpose.

Engineer review is required for behavior changes here (on-chain rebalance math /
launcher permissions are a repo stop-condition surface) — tests passing is not
sign-off.

Real-fork coverage: BSC CMC20 launch (`e2e/fork/tests/launch-cmc20.fork.spec.ts`) and the chain-1 stack lane (`e2e/fork/tests/launch-native-v6.fork.spec.ts`, run through `e2e/fork/scripts/stack-lane.sh`); see the hub skill `stack-e2e`. The live auction card carries `data-testid="auctions-active-auction"` and `data-auction-id` (subgraph id `<dtf>-<n>`); while it renders, `RebalanceAction` and the launch button are gone, so an "auction ongoing" proof asserts the card.
