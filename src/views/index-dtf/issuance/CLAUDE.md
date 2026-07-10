# Issuance View — Agent Guide

Self-contained context for changing this view. Mock mechanics live in
`e2e/CLAUDE.md` (cookbook); architecture in `docs/wiki/domains/e2e.md`; the
three zap mechanisms and the react-zapper one-instance rule in
`docs/wiki/zapper.md`; SDK data flows in `docs/wiki/sdk.md`. The automated
wizard has its own `async-mint/CLAUDE.md`.

## What this view is

Three distinct mint/redeem surfaces on one route, don't mix them up:

- **Zap (default `swap` panel)** — the `@reserve-protocol/react-zapper` widget
  wrapped in `../components/zapper/zapper-wrapper.tsx`, mounted inline in
  `index.tsx`. One instance per route (hard rule — shared module-level atoms;
  see wiki). Quotes/slippage/minAmountOut are computed server-side; the widget
  just sends the backend's prepared `{to,data,value}`.
- **Manual (`/issuance/manual`)** — `manual/**`, direct folio `mint`/`redeem`.
  `updater.tsx` reads balances, allowances, and `toAssets(1e18, 0)` (per-share
  basket quote) into atoms; on-chain math lives in `manual/atoms.ts` and
  `index-manual-issuance.tsx`.
- **Automated (`panelMode === 'auto'`, `/automated`)** — `async-mint/**`
  CoW-backed wizard. See `async-mint/CLAUDE.md`; **no e2e coverage yet**.

## Did a diff here — which test?

| You changed | Run / extend |
|---|---|
| Zap widget mount, wrapper props, compliance gating on swap | `e2e/tests/smoke/zap.spec.ts` + `flows/zap-buy-sell.spec.ts` |
| Zap buy/sell tx (calldata, approval, success view) | `flows/zap-buy-sell.spec.ts` |
| Manual mint/redeem math, approve-all, updater reads | `flows/issuance-manual.spec.ts` |
| Panel/mode-switch, page mount | `e2e/tests/smoke/issuance.spec.ts` |
| Compliance/geo gating | `flows/compliance.spec.ts` |
| `async-mint/**` | no spec — deferred (see below) |

Quick loop: `pnpm e2e:smoke` (issuance + zap smokes, seconds); flows
`pnpm exec playwright test --project=full e2e/tests/flows/{zap-buy-sell,issuance-manual,compliance}.spec.ts`.

## How to mock issuance states

Everything runs on **base/lcap** (`0x4dA9…E6e8`). Two different mock shapes:

- **Zap surface**: `seedZapSurface(overrides, DTF)` seeds the folio's own
  name/symbol; `mockZapperRoutes(page, DTF, log)` serves ONE pinned quote per
  direction keyed on (chainId, tokenIn, tokenOut, amountIn) — **fill the exact
  pinned `amountIn`** or you hit the fail-loud 500. Aggregators (odos/velora/
  enso) answer a deterministic error on purpose so `best` mode has one
  candidate. `seedDtfBalance` funds the sell side + pre-answers the approve
  simulation. Assert the submitted tx equals the quote's `tx` byte-for-byte.
  Time is deliberately NOT frozen here (nothing derives from snapshot
  timestamps; every mock answers instantly).
- **Manual surface**: seed `toAssets(1e18,0)` (per-share rates from
  `chain-state.json`), then per basket token `balanceOf`, `allowance`, AND the
  `useIsUSDT` `approve(deployer,1)` simulate probe (bool) — the page fires all
  three on mount. Frozen clock + `advanceTime` pumps (write flow). Stage
  post-tx allowances/balances BEFORE the click, then pump so the block-driven
  updater refetch reads them.
- **Compliance**: `test.use({ compliance: {...} })` drives top-level
  `/v2/compliance/geolocation`; per-DTF `overrides.api` on
  `/v2/compliance/geolocation/dtf/<addr>` (needs a `restriction` field:
  `vpn` | `geolocation-prohibited`). Restricted → `compliance-alert` testid +
  widget `data-restricted="true"` + inputs gone + `txLog` empty. Top-level
  `isVPN` is NOT a gating input — the `vpn` reason arrives via the per-DTF
  endpoint only.

## Domain traps

- **`useIsUSDT` simulate probe** (`src/hooks/useIsUSDT.ts`): the manual page
  runs `approve(INDEX_DEPLOYER, 1)` on every basket token via
  `useSimulateContract` to sniff USDT-forks — an unmocked eth_call unless
  seeded. USDT-forks then approve `BIGINT_MAX` and show the revoke UI
  (`asset-list.tsx`).
- **Mint `minSharesOut` / redeem `minAmountsOut` are computed CLIENT-side** in
  `index-manual-issuance.tsx` (unlike zap, which is server-side). Mint (v2 ABI):
  `shares * (1e18 - max(mintFee, 0.0015e18)) - 1n) / 1e18`; v1 folios have no
  `minSharesOut` arg. Redeem: `requiredAmount * 95n / 100n` (flat 5% slippage).
  Tests decode and assert these exactly — changing the formula breaks them.
- **`maxMintAmount` divides by `rate + 1n`** (`manual/atoms.ts`): `toAssets`
  floors but mint pulls with Ceil rounding, so the naive max overshoots by a
  wei and reverts. Don't "simplify" the `+1n` away.
- **Version gate**: v1 folios use `dtfIndexAbi` (2-arg mint), v2+ uses
  `dtfIndexAbiV2` (3-arg mint w/ minSharesOut). base/lcap is v2.
- **Zapper is one-instance-per-route** — the modal mount in
  `index-dtf-container.tsx` is skipped on issuance routes on purpose. Don't add
  a second `Zapper`; shared atoms fight last-writer-wins (wiki).

## Coverage: what's covered vs a conscious gap

Covered (SUCCESS paths only, base/lcap): zap buy (ETH→LCAP, no approval) + sell
(approve→swap) with byte-exact calldata; manual approve-all→mint + redeem with
decoded args and post-tx balance; compliance top-level geo-block, per-DTF VPN
block, and unrestricted-open — but ONLY on the zap surface.

Not covered — **planned next pass**: tx revert/reject paths on every surface
(`overrides.transaction({ kind: 'revert' })` / `{ kind: 'reject' }` exists,
unused);
zap edge states — the widget's zap-mint components (low-liquidity warning,
`zapper-healthcheck`, dust/warning checkboxes, error message) need new captured
high-impact + error quote snapshots (orchestrator-owned) before they can be
driven; compliance on the MANUAL surface; deprecated-DTF redeem-only UX
(`sellOnly` prop is set but unexercised).

Not covered — **deferred (engineer review)**: the automated async-mint wizard
entirely (no testids yet; CoW lifecycle) — a missing async-mint test is a
decision, not a gap.

Engineer review is required for behavior changes here (issuance/redemption/zap
is a repo stop-condition surface) — tests passing is not sign-off.
