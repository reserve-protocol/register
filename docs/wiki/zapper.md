---
title: Zapper
updated: 2026-07-08
type: context
---

# Zapper stack — mint/redeem swap surfaces

Three distinct mechanisms; don't mix them up. The CoW-suggestion card next to the widget is register-local — see [[zapper-prompt]].

## 1. `@reserve-protocol/react-zapper` ([react-zapper](https://github.com/reserve-protocol/react-zapper)) — Index DTF instant zap

Register pins the exact version (no caret) and wraps it in `src/views/index-dtf/components/zapper/zapper-wrapper.tsx` (also mutates `PROVIDER_ENABLED` to disable Odos on BSC, injects RainbowKit `connectWallet` and `locale`).

- **Locked settings for featured DTFs**: the wrapper passes `disabledSettings={{ deepLiquidity: true, forceMint: true }}` (prop added in 2.4.0) for the DTFs hardcoded in `locked-zap-settings.ts` (5 featured BSC DTFs from `/v1/discover/featured`: PHOTON, BUILDOUT, ROBOTS, POWER, NEOCLOUD). A disabled option renders its checkbox frozen unchecked (same treatment as the always-on dust checkbox) and the widget's updater force-resets the backing atom to `false` — including on SPA navigation from a DTF where the user had it checked.

- **v2 contract**: the widget consumes the HOST's `WagmiProvider` + `QueryClientProvider` (the old `wagmiConfig` prop was removed in 2.0.0). Peer floors: wagmi ^2.19, viem ^2.50, react-query ^5.87.
- **One instance per route — hard rule.** All widget state is module-level jotai atoms on the default store (no `Provider` isolation): two mounted `Zapper`s with different `chain`/`dtfAddress` fight last-writer-wins over shared atoms (`chainIdAtom`, `indexDTFAtom`, tab/modal atoms…). This caused register's real double-mount bug. Mounts: inline in `src/views/index-dtf/issuance/index.tsx`, modal in `index-dtf-container.tsx` — the modal mount is skipped on issuance routes on purpose. `useZapperModal()` shares the single instance.
- **Quotes**: provider registry (`zap` native + odos/velora/enso aggregators); `best` queries all enabled in parallel, picks max `minAmountOut` (ties → zap). Native zap hits `ZAPPER_API`; aggregators hit `RESERVE_API`. Slippage/minAmountOut computed **server-side**. Refresh default 9s (`refreshRate` prop); quotes carry `validUntil` (~60s TTL).
- **Tx**: backend returns ready `{to,data,value}`; widget sends via host wagmi. Approval = 120% of amountIn; gas = min(backend×2-3, 2^24 EIP-7825 cap).
- **Self-inits its own Mixpanel** with a hardcoded token (events `index-dtf-zap-swap`, `zap_*` clicks, contact events) — independent of register's analytics and not disableable; register's own zap events are additional.
- Footguns: `dtfAddress` should be lowercase (<2.3.3 broke Sell balances on checksummed input); `styles.css`/Tailwind content path required; native token sentinel `0xEeee…EEeE`.

## 2. `@reserve-protocol/async-zap-sdk` — Index DTF automated wizard

CoW-Swap-backed mint/redeem at `src/views/index-dtf/issuance/async-mint/**` (`useFolioMintZap`/`useFolioRedeemZap`). The SDK owns quoting/order signing; register owns UI + price-impact checks against Reserve API reference prices. Local agent doc: `src/views/index-dtf/issuance/async-mint/CLAUDE.md`.

## 3. Legacy zap v2 — Yield DTF only

`src/views/yield-dtf/issuance/components/zapV2/**` hitting `ZAPPER_API api/zapper/{chain}/*` and `RESERVE_API enso/swap` directly (`api/quote-providers.ts`). Predates the react-zapper package; maintenance only — never extend it for Index work.

## Shared backend

Both `RESERVE_API` and `ZAPPER_API` come from `src/utils/constants.ts` (staging-pinned, release TODO). Zapper healthcheck: `use-zap-healthcheck.ts` → `{ZAPPER_API}health`.
