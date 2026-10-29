---
title: Zapper
updated: 2026-10-29
type: context
---

# Zapper stack — mint/redeem swap surfaces

Three distinct mechanisms; don't mix them up. The CoW-suggestion card next to the widget is register-local — see [[zapper-prompt]].

## 1. `@reserve-protocol/react-zapper` ([react-zapper](https://github.com/reserve-protocol/react-zapper)) — Index DTF instant zap

Register pins the exact version (no caret) and wraps it in `src/views/index-dtf/components/zapper/zapper-wrapper.tsx` (injects the AppKit `connectWallet` opener from `useWalletModal` and `locale`).

- **Locked settings for featured DTFs**: the wrapper passes `disabledSettings={{ deepLiquidity: true, forceMint: true }}` (prop added in 2.4.0) for the DTFs hardcoded in `locked-zap-settings.ts` (5 featured BSC DTFs from `/v1/discover/featured`: PHOTON, BUILDOUT, ROBOTS, POWER, NEOCLOUD). A disabled option renders its checkbox frozen unchecked (same treatment as the always-on dust checkbox) and the widget's updater force-resets the backing atom to `false` — including on SPA navigation from a DTF where the user had it checked.

- **v2 contract**: the widget consumes the HOST's `WagmiProvider` + `QueryClientProvider` (the old `wagmiConfig` prop was removed in 2.0.0). Peer floors: wagmi ^2.19, viem ^2.50, react-query ^5.87.
- **One instance per route — hard rule.** All widget state is module-level jotai atoms on the default store (no `Provider` isolation): two mounted `Zapper`s with different `chain`/`dtfAddress` fight last-writer-wins over shared atoms (`chainIdAtom`, `indexDTFAtom`, tab/modal atoms…). This caused register's real double-mount bug. Mounts: inline in `src/views/index-dtf/issuance/index.tsx`, inline in the overview's xl rail (`overview/components/landing-mint`), modal in `index-dtf-container.tsx` — the modal mount is skipped on issuance routes and on `/overview` at xl on purpose. `useZapperModal()` shares the single instance.
- **Quotes**: provider registry (`zap` native + velora/enso aggregators); `best` queries all enabled in parallel, picks max `minAmountOut` (ties → zap). Native zap hits `ZAPPER_API`; aggregators hit `RESERVE_API`. Slippage/minAmountOut computed **server-side**. Refresh default 9s (`refreshRate` prop); quotes carry `validUntil` (~60s TTL).
- **Tx**: backend returns ready `{to,data,value}`; widget sends via host wagmi. Approval = 120% of amountIn; gas = min(backend×2-3, 2^24 EIP-7825 cap).
- **Self-inits its own Mixpanel** with a hardcoded token (events `index-dtf-zap-swap`, `zap_*` clicks, contact events) — independent of register's analytics and not disableable; register's own zap events are additional.
- Footguns: `dtfAddress` should be lowercase (<2.3.3 broke Sell balances on checksummed input); `styles.css`/Tailwind content path required; native token sentinel `0xEeee…EEeE`.

## 2. `@reserve-protocol/async-zap-sdk` — Index DTF automated wizard

CoW-Swap-backed mint/redeem at `src/views/index-dtf/issuance/async-mint/**` (`useFolioMintZap`/`useFolioRedeemZap`). The SDK owns quoting/order signing; register owns UI + price-impact checks against Reserve API reference prices. Local agent doc: `src/views/index-dtf/issuance/async-mint/CLAUDE.md`.

## 3. Legacy zap v2 — Yield DTF only

`src/views/yield-dtf/issuance/components/zapV2/**` hitting `ZAPPER_API api/zapper/{chain}/swap` (the Rust zapper, labelled "Zap") and `RESERVE_API enso/swap` directly (`api/quote-providers.ts`). Predates the react-zapper package; maintenance only — never extend it for Index work.

- Non-2xx answers surface the JSON `error` (`readZapError`); 4xx quotes are not retried.
- Arbitrum: the Rust zapper doesn't serve 42161, so every quote source falls back to Enso there.

## Index deploy (direct calls)

- **Simple deploy** (`hooks/useZapDeployQuery.ts`) POSTs `ZAPPER_API api/zapper/{chain}/deploy[-ungoverned]` and shows the zapper's `error` text. Baskets with fewer than 2 assets are blocked client-side (the zapper rejects them with a 400).
- **Basket liquidity badges** (`deploy/steps/basket/hooks/use-liquidity-check.ts`) use reserve-api `POST /rebalance/liquidity`: one `buy` per token at the simulation amount, `nativePrice: 0` so the server sizes it in the chain's native token. Levels come from the server (`error` = no route; `unknown`/`ondo` = not simulated).
- No "unsupported token" check: the Rust `/tokens` list is a static snapshot, so it would flag every newer token. Missing routes show up as the per-token `error` level instead.

## Shared backend

Both `RESERVE_API` and `ZAPPER_API` come from `src/utils/constants.ts` and default to `api.reserve.org`. When the hostname contains `staging` (or `VITE_USE_STAGING`) and `VITE_STAGING_API` is set, `RESERVE_API` uses `VITE_STAGING_API` and `ZAPPER_API` uses the fixed `https://api-staging.reserve.org/`. `ZAPPER_API api/zapper/*` is reserve-api's proxy to the Rust zapper (`/api/zapper2/*` is a synonym).
