# Evidence index

Audit of the current rebalance / auction flow at
`404bcbc414cf54eed988a9e6c95b74fa0c6e7251` in the primary checkout
`/Users/lill-kire/Code/register` (2026-09-13). All captures are ordinary
viewport screenshots (1400×900, 390×844, 320×844) taken on the auditor's own
preview on `127.0.0.1:3047` with the repository's strict offline mocks and the
injected EIP-6963 test wallet. Observation logs (`*/observations.json`) hold the
values quoted in the report; keys are cited as `area → key`. No transaction
left the mock wallet: every send is an intercepted `eth_sendTransaction`
recorded in the fixture `txLog` and asserted in the specs.

## Runtime and toolchain

| Item | Used | Note |
| --- | --- | --- |
| Node | 22.22.0 (`/opt/homebrew/opt/node@22/bin`) | repo declares ≥ 24 / `.nvmrc` 24.15.0; no Node 24 is installed on this machine |
| pnpm | not invoked | no install, upgrade or lockfile change; binaries run from the existing `node_modules` |
| Playwright | 1.59.1 (`./node_modules/.bin/playwright`), cached Chromium | one worker, no retries |
| Preview | `node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 3047 --strictPort` with the pinned env from `playwright.config.ts` (`VITE_E2E=true`, empty RPC keys, `VITE_WALLETCONNECT_ID=test-project`) | 3047 was free; 3005 (user preview) and 3043 untouched; stopped at the end |
| Working tree | HEAD `404bcbc41`; uncommitted lab/doc changes present (see below) | no file under `src/`, `e2e/tests/`, `e2e/helpers/`, `e2e/fixtures/`, `e2e/snapshots/` was modified by this audit |

## Source fingerprint

`fingerprint-start.txt` and `fingerprint-end.txt` list the SHA-256 of every
file under `src/views/index-dtf/auctions/` (81 files) at the start and the end
of the audit; `fingerprint-summary.txt` records both digests and the
comparison result. Uncommitted changes in the checkout at the time
(`git status --porcelain`, recorded in `fingerprint-summary.txt`) touch only
`docs/`, `e2e/TEST_MAP.md`, `e2e/design-system/**` and
`src/views/internal/design-system/**` — none of the audited production sources.
A sibling untracked folder `docs/plans/design-system-current-rebalance-readiness/`
appeared during the audit (another worker's package; not read or touched).

## Reproduce

```sh
cd /Users/lill-kire/Code/register
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"

# 1. Owned preview (never 3005 / 3043)
VITE_E2E=true VITE_WALLETCONNECT_ID=test-project VITE_STAGING_API= VITE_USE_STAGING= \
VITE_MAINNET_URL= VITE_INFURA= VITE_ALCHEMY= VITE_ANKR= \
node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 3047 --strictPort

# 2. The repository's own auction specs against that preview (16 cases: smoke, full, mobile)
./node_modules/.bin/playwright test \
  --config docs/plans/design-system-current-rebalance-flow-audit/harness/playwright.tracked.config.ts

# 3. The audit harness (5 specs; writes evidence/*/observations.json, PNGs, fixtures, harness-report.json)
./node_modules/.bin/playwright test \
  --config docs/plans/design-system-current-rebalance-flow-audit/harness/playwright.review.config.ts
```

`REVIEW_BASE_URL` overrides the target for both configs. Neither config starts,
reuses or stops a server. Observation logs are append-only per key; delete
`evidence/*/observations.json` for a run that should start clean.

## Results

| Run | Result |
| --- | --- |
| Tracked auction specs (`flows/auctions`, `flows/auctions-multichain`, `index-dtf/auctions/{lifecycle,launch-price-guard,launch-write}`, `smoke/auctions`) | 16 / 16 passed (`tracked-report.json`) |
| Audit harness, final complete run (32 cases) | 32 / 32 passed, 0 flaky, 0 skipped, 118 s (`harness-report.json`) |
| Earlier harness iterations | run 1 stalled on a harness bug (unguarded `textContent()` waits), run 2 passed 31/32 with one harness-side error (connecting a wallet in a wallet-less case); both fixed, neither reflects application behaviour |

## Mocks and overlays

Base mocks are the repository's (`e2e/fixtures/base.ts`, `e2e/helpers/{rpc,subgraph,api,provider}.ts`,
`e2e/harness/*`): strict default-deny egress, snapshot-backed subgraph/API/RPC,
idle `getRebalance()` tuple, frozen clock (`freezeAt` / `advance`). Per-test
overlays used by the harness (all in `harness/fixtures.ts` unless noted):

| Overlay | Purpose | Synthetic? |
| --- | --- | --- |
| `encodeTuple(dtf, rebalance, { skewPercent })` | active `getRebalance()` tuple from the chain-state basket; ±40 % skew (same as `e2e/helpers/rebalance-tuple.ts`) or 0 % for a finished basket | derived from snapshots; skew is synthetic |
| `liveAuction(...)`, `bid(...)` | per-rebalance auctions subgraph response (`getGovernanceStats`) with optional bids | synthetic (`fixtures/cmc20-live-auction-with-bids.json`) |
| `liquidityPayload(...)` | `POST /rebalance/liquidity` with error / high-impact / Ondo legs | synthetic (`fixtures/cmc20-liquidity-payload.json`) |
| `metricsPayload(...)` | `GET /dtf/rebalance` in the SDK completed-rebalance shape | synthetic values, real nonce/timestamps |
| `enrolLauncher(...)` | `GetIndexDTF` overlay adding the test wallet to `auctionLaunchers` | same technique as the tracked launch specs |
| `BSC_USDT` balance fill | connected-wallet basket balance read the central mock does not seed | same as tracked specs |
| `harness.tx.confirm() / decline() / revert()` | queued outcome of the next `eth_sendTransaction`; revert plus `ethCallRevert(sent.to, sent.data, …)` for the receipt replay | mock wallet |
| `/v1/discover/dtfs → []` | makes cmc20 "unlisted" so the in-browser filler is eligible (cowbot case, `allowUnmocked`) | synthetic |
| `?debug=true` | production's own dev-mode switch (`DevModeUpdater.tsx`) | — |

Public inputs: `e2e/snapshots/{bsc/cmc20,base/lcap}/{rebalances,governance,chain-state,dtf}.json`
(cmc20 rebalance nonce 11 with a 24 h restricted window; lcap nonce 5 with a
zero-width window). `fixtures/launch-openAuction-calldata.json` is the
intercepted calldata of the first launcher launch (nonce 11, 18 tokens).

## Folders

| Folder | Spec | Contents |
| --- | --- | --- |
| `roles-phases/` | `harness/roles-phases.review.spec.ts` | disconnected restricted / permissionless (click) / lcap zero-window; connected non-launcher crossing and rejection; launcher wrong network and ready state; keyboard trail; hover card |
| `launch-lifecycle/` | `harness/launch-lifecycle.review.spec.ts` | confirm → refresh → live; indexer lag and second send; reject; revert; auction ending; expiry while open (+reload); in-session completion |
| `hybrid-weights/` | `harness/hybrid-weights.review.spec.ts` | lcap launcher: entry, editor, discard, edit, save, reopen, launch calldata, reload; non-launcher view |
| `monitoring-data/` | `harness/monitoring-data.review.spec.ts` | bids and bid inspection; liquidity panel; Ondo cap (debug vs plain); auctions-query failure; prices pending; debug on expired; unknown proposal; cowbot attempt |
| `phone-keyboard/` | `harness/phone-keyboard.review.spec.ts` | 390/320 list, restricted detail, live detail (dark), completed card, weight editor (390); desktop keyboard inventory |
| `fixtures/` | harness | synthetic payloads and the intercepted calldata |
| `tracked-report.json`, `harness-report.json` | Playwright JSON reporters | run statistics |

## Captures the auditor inspected

`launch-lifecycle/expired-while-open-1400.png`, `indexer-lag-rearmed-1400.png`,
`auction-ended-next-launch-1400.png`; `monitoring-data/prices-pending-1400.png`,
`liquidity-panel-1400.png`; `phone-keyboard/detail-390-live-top-dark.png`,
`completed-320.png`, `editor-390-top.png`; `monitoring-data/cowbot-1000.png`,
`live-auction-bid-selected-1400.png`; `roles-phases/disconnected-permissionless-after-click-1400.png`;
`hybrid-weights/after-save-ready-1400.png`; plus the captures listed in the
report's findings. Remaining PNGs were produced by the same specs and are
retained for inspection, not claimed as reviewed.

## Limitations

- Offline mocks only: no live subgraph, API, chain, wallet or CoW relay;
  numbers in synthetic payloads are illustrative.
- Wrong-network behaviour is unresolved: with the wallet fixture on Base the
  BSC launch control rendered and no `wallet_switchEthereumChain` request was
  recorded (`roles-phases → launcher.wrongNetwork`); wallet connect/disconnect
  mid-session was not exercised.
- v4 and v2 detail views, the cowbot stopped/error states, the badge
  click-to-retry, liquidity API failure and two error banners are
  source-inspected only (see the matrix's SI/UN rows).
- Node 22 instead of the declared Node ≥ 24; no CI claim.
- Hit-testing and focus trails measure this Chromium build, not touch hardware
  or a screen reader.
