# Issuance View — Agent Guide

Mock mechanics: `e2e/CLAUDE.md`. Architecture: `docs/wiki/domains/e2e.md`. Zap
mechanisms + the one-Zapper-per-route rule: `docs/wiki/zapper.md`. SDK flows:
`docs/wiki/sdk.md`. The automated wizard has its own `async-mint/CLAUDE.md`.

## Three surfaces on one route

- **Zap** (default `swap` panel) — `@reserve-protocol/react-zapper` via
  `../components/zapper/zapper-wrapper.tsx`, mounted inline in `index.tsx`.
  Quotes/slippage/minAmountOut are server-side; the widget sends the prepared
  `{to,data,value}`. ONE instance per route (shared module-level atoms).
- **Manual** (`/issuance/manual`) — `manual/**`, direct folio `mint`/`redeem`.
  `updater.tsx` reads balances/allowances/`toAssets(1e18, 0)` into atoms;
  math in `manual/atoms.ts` + `index-manual-issuance.tsx`.
- **Automated** (`panelMode === 'auto'`) — `async-mint/**`, CoW-backed wizard.
  No e2e coverage (deferred, engineer review).

## Diff → test

| Changed | Run |
|---|---|
| Zap mount, wrapper props, compliance gating | `smoke/zap.spec.ts` + `flows/zap-buy-sell.spec.ts` |
| Zap buy/sell tx (calldata, approval, success) | `flows/zap-buy-sell.spec.ts`, `flows/failures-zap.spec.ts` |
| Zap guardrails (impact gate, dead quote, insufficient) | `flows/zap-edge.spec.ts` |
| Manual mint/redeem math, approve-all, updater | `flows/issuance-manual.spec.ts`, `flows/issuance-manual-boundaries.spec.ts` |
| Panel/mode switch, page mount | `smoke/issuance.spec.ts` |
| Compliance / geo gating | `flows/compliance.spec.ts`, `flows/compliance-surfaces.spec.ts` |
| Deprecated DTF (sell-only) | `flows/issuance-deprecated.spec.ts` |

Quick loop: `pnpm e2e:smoke`; full: `pnpm exec playwright test --project=full
e2e/tests/flows/{zap-buy-sell,issuance-manual,compliance}.spec.ts`.

## Mocking (all on base/lcap `0x4dA9…E6e8`)

- **Zap**: `seedZapSurface` seeds folio name/symbol and pins `/current/prices`
  for both legs to capture-time values (react-zapper ≥ 2.10 re-values quotes
  with Reserve prices; a spec's earlier `overrides.price` wins).
  `mockZapperRoutes` serves ONE pinned quote per direction keyed on
  (chainId, tokenIn, tokenOut, amountIn) — type the exact pinned `amountIn` or
  hit the fail-loud 500. Aggregators + CoW (`api.cow.fi`) answer a
  deterministic error so `best` mode has one candidate; CoW's vault-relayer
  allowance read is a known spender in `helpers/rpc.ts`. `seedDtfBalance`
  funds sells + pre-answers the approve simulation. Assert the submitted tx
  equals the quote's `tx` byte-for-byte. Time is not frozen.
- **Widget structure (2.10)** — contract in `e2e/helpers/zapper.ts`: no
  Buy/Sell tab triggers; Radix panels keep `…-content-buy|sell` + `data-state`;
  `flipZapDirection` clicks the arrow (absent under `sellOnly`);
  `selectZapToken` settles the token (the slippage `0.5%` button is also
  `aria-haspopup="menu"`); default token is USDC — pick ETH BEFORE typing;
  `formatZapOutput` mirrors the amount-out rendering; the success view is a
  dialog portalled outside the widget.
- **Guardrails (2.10)**: insufficient balance only disables the submit (and
  skips simulation) — the quote still resolves; >8% true impact is toxic-
  filtered before the ≥5% checkbox, so the gate exists only in [5%, 8%)
  (zap-edge pins ETH into it); a dead quote round is NOT an error — silent
  "Sourcing liquidity", submit disabled, retries.
- **Reverted tx replay**: seed `overrides.ethCallRevert(tx.to, tx.data, …)` —
  wagmi replays the calldata to extract the reason; a zero-word answer yields
  an empty reason (react-zapper < 2.10.4 froze on it).
- **Manual**: seed `toAssets(1e18,0)`, then per basket token `balanceOf`,
  `allowance` AND the `useIsUSDT` `approve(deployer,1)` simulate probe. Frozen
  clock + `advanceTime` pumps; stage post-tx allowances/balances BEFORE the
  click, then pump so the block-driven refetch reads them.
- **Compliance**: `test.use({ compliance })` drives `/v2/compliance/geolocation`;
  per-DTF `overrides.api` on `/v2/compliance/geolocation/dtf/<addr>` with
  `restriction: 'vpn' | 'geolocation-prohibited'`. Restricted → `compliance-alert`
  + widget `data-restricted="true"` + inputs gone + empty `txLog`. Top-level
  `isVPN` is not a gate; `vpn` arrives via the per-DTF endpoint only.

## Domain traps

- `useIsUSDT` probes `approve(INDEX_DEPLOYER, 1)` on every basket token —
  unmocked eth_call unless seeded; USDT-forks approve `BIGINT_MAX` + revoke UI.
- Manual `minSharesOut` / `minAmountsOut` are CLIENT-side (zap is server-side):
  mint `shares * (1e18 - max(mintFee, 0.0015e18)) - 1n) / 1e18` (v2; v1 has no
  arg), redeem `requiredAmount * 95n / 100n`. Tests decode these exactly.
- `maxMintAmount` divides by `rate + 1n` (`toAssets` floors, mint pulls Ceil) —
  don't "simplify" the `+1n` away.
- Version gate: v1 folios `dtfIndexAbi` (2-arg mint), v2+ `dtfIndexAbiV2`.
- `ZapperWrapper` renders ONE `<Zapper>` element type across wallet state —
  switching component types on `isConnected` remounted the widget mid-tx.

## Coverage

Covered: zap buy/sell success (byte-exact calldata), reject + revert on every
step (manual + zap), zap edge states (impact gate, dead quote, insufficient
funds), manual approve-all→mint/redeem, compliance top-level + per-DTF VPN +
unrestricted (zap surface; manual mint gating in `compliance-surfaces`),
deprecated sell-only UX. Not covered: low-liquidity checkbox (planned, needs a
deepLiquidity capture); async-mint wizard (deferred, engineer review).

Engineer review is required for behavior changes here — tests passing is not
sign-off.
