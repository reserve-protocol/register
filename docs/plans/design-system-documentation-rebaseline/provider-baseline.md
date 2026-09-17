# Design-system documentation provider/runtime baseline

**Stage:** S1 discovery baseline
**Measured revision:** `02434707c0614d2262b10560eebb05cde4319931`
**Merge parents:** `783030433e61c73c554eb348126ff53657cd079c` and `e0f32138971fc87e85456e4e6d2e6ef3739c827a`
**Environment:** production Vite build served on local loopback; Chromium at 1400 × 900; fresh browser context per route; four-second observation after the route became visibly ready.

This baseline records what the current design-system lab inherits from the product application before the documentation shell changes. It is evidence for the S2a-1 shell boundary, not approval of the current provider architecture or a hosted-performance benchmark.

## Routes measured

- Representative heavy overview: `/internal/design-system/components`
- Current Charts deep link: `/internal/design-system/components/chart#chart-next-families-review`

The run executed the real production build. All non-local requests were intercepted and blocked in the browser before transmission. Findings below therefore describe **runtime-observed outbound attempts**, not successful responses from external services.

## Configured inherited surface

The lab currently enters through the normal application root and inherits:

- referral capture and unconditional Sentry initialization, including `sendDefaultPii: true` (`src/index.tsx`);
- Mixpanel initialization with automatic page-view tracking and autocapture (`src/app.tsx`);
- Helmet, Sentry error handling, the product router and redirect/scroll effects, language and tooltip providers, `ChainProvider`, the global updater tree, product `Layout`, Toaster, and application routes (`src/app.tsx`);
- Wagmi, React Query, RainbowKit, `AtomUpdater`, and the DTF SDK provider (`src/state/chain/index.tsx`);
- DevMode, CMS, Prices, RToken, CollateralYield, Account, TokenBalances, and Index-DTF-icons updaters (`src/state/updater.tsx`);
- the product Header, `#app-container`, and lazy chat boundary (`src/components/layout/index.tsx`).

The closed command menu in the product Header also mounts DTF-list hooks. This causes Reserve API and Goldsky reads without opening search. Account and token-balance reads remained gated because no wallet was connected.

## Runtime-observed outbound attempts

Both routes attempted requests to:

- mainnet RPC endpoints through PublicNode and Tenderly;
- Reserve API icon and Discover-DTF endpoints;
- DefiLlama yield pools;
- three Yield-DTF Goldsky subgraphs;
- AppKit remote configuration and WalletConnect pulse telemetry;
- Google Tag Manager and Meta Pixel scripts;
- one Sentry envelope;
- token and image hosts.

The overview additionally attempted several specimen asset URLs. Mixpanel initialized and created queue, session, and cookie state, but no direct Mixpanel network request was observed during the blocked four-second window. AppKit/RainbowKit created local/session storage plus `WALLET_CONNECT_V2_INDEXED_DB`, `cbwsdk`, and `mixpanelBrowserDb`. Console output included a Binance wallet-connector WebSocket attempt.

## Denied-network usability and wallet behavior

With every non-local request denied, both routes:

- became visibly ready and retained usable navigation and documentation content;
- avoided the application error fallback;
- rendered the 73 px product header with Search, theme, language, More, Connect, and mobile-navigation controls;
- correctly omitted the global chat launcher;
- opened no browser dialog or wallet prompt;
- attempted no `eth_requestAccounts`, signing, chain-switch, transaction-send, or other wallet-write method.

Only RPC reads were observed: `eth_getBlockByNumber` and `eth_call`. The components overview contained three visible specimen dialogs from the mounted state-sheet wall; these were staking/governance examples, not wallet prompts. The Charts route had no visible dialog.

### Retained injected-provider trace

On 2026-09-16, a supplemental current-tree run injected an instrumented EIP-1193 provider as `window.ethereum` before application code executed. The provider retained every requested method and returned an empty account list. The run used a temporary Vite configuration without the Sentry build plugin, a fresh browser context per route, the same 1400 × 900 viewport and four-second post-ready observation window, and browser interception that blocked every non-local request before transmission.

| Route               | Methods reaching injected provider | Account-request/sign/switch/send/write methods | Browser dialogs |
| ------------------- | ---------------------------------- | ---------------------------------------------- | --------------- |
| Components overview | `eth_accounts` × 2                 | None                                           | None            |
| Charts deep link    | `eth_accounts` × 2                 | None                                           | None            |

The trace contains no `eth_requestAccounts`, permission request, signing, chain-switch, transaction-send, or other write method. It supplements the production-build request trace above; its development-server request totals are intentionally not used as performance or dependency measurements.

## Comparative measurements

| Measure                   | Components overview | Charts deep link |
| ------------------------- | ------------------: | ---------------: |
| DOM elements              |               6,714 |            1,046 |
| Body-text characters      |              93,306 |            6,969 |
| App scroll height         |           49,977 px |         4,866 px |
| Used JS heap              |             76.6 MB |          60.3 MB |
| JS files                  |                  14 |               14 |
| JS encoded / transferred  |            3.226 MB |         3.226 MB |
| JS decoded                |           12.365 MB |        12.365 MB |
| Total resources encoded   |            3.836 MB |         3.481 MB |
| Total resources decoded   |           13.206 MB |        12.839 MB |
| External request attempts |                  86 |               79 |
| `eth_getBlockByNumber`    |                  38 |               36 |
| `eth_call`                |                  16 |               16 |

The largest loaded chunks were identical on both routes:

| Chunk               |  Encoded |  Decoded |
| ------------------- | -------: | -------: |
| Wallet              | 1.288 MB | 5.322 MB |
| Main                | 1.076 MB | 3.765 MB |
| Performance chart   |   380 KB | 1.587 MB |
| Design-system route |   281 KB | 1.156 MB |

Loopback navigation reached DOMContentLoaded in approximately 324–329 ms. This is useful only for comparing later local runs of the same setup; it is not a hosted-user performance result.

## U10 disposition

**Recommendation pending explicit human approval:** use the same-build, route-aware shell for S2a-1 as the smallest reversible option. Denied-network documentation remains usable, and neither the production-build trace nor the injected-provider trace observed a wallet prompt or account-request/sign/switch/send/write call. Bypassing the product Header and chat boundary while temporarily retaining providers therefore minimizes the first implementation boundary; this evidence does not autonomously approve that direction.

The inherited App-root provider boundary is **not** accepted as the long-term documentation architecture. The initial payload, 5.322 MB decoded wallet chunk, storage initialization, analytics/Sentry attempts, and roughly 79–86 external attempts per cold route are materially excessive for neutral documentation. No privacy or performance budget has yet been approved, so this baseline cannot establish that the inherited cost is acceptable.

If S2a-1 is approved, rerun the exact production-build denied-network baseline and the injected EIP-1193 trace after the shell edit, on the same two routes, viewport, fresh-context setup, and observation window. The shell must preserve denied-network usability and must not introduce a wallet prompt or account-request/sign/switch/send/write behavior. If external attempts, storage initialization, or the inherited payload are materially unchanged, stop for an explicit human decision between a provider split and a standalone documentation entry before any hosted preview or further migration expansion. Apply the same stop if the results violate a subsequently approved privacy or performance budget.

## Limitations

- External requests were intentionally blocked before transmission, so the run proves route behavior under denial and records attempted dependencies; it does not validate third-party responses or their timing.
- The injected EIP-1193 trace covers calls that reached the supplied `window.ethereum` provider. It does not represent every possible wallet transport, including connector-owned WalletConnect or Coinbase providers, separately announced EIP-6963 providers, direct viem HTTP/WebSocket transports, or extension-internal behavior. The broader browser request trace and denied-network run remain necessary alongside it.
- The production build used dummy or empty service credentials and blank Sentry authentication. No Sentry release was created and no source maps were uploaded, although the Sentry build plugin still initialized telemetry.
- Heap values come from Chromium's `performance.memory` and are comparative signals, not precise retained-memory profiles.
- A four-second post-ready window captures cold-route startup activity, not delayed background refreshes or longer sessions.
- The local preview and machine conditions are unsuitable for claims about hosted latency.

## Reproduction

From the exact revision above:

1. Install the locked dependencies with `pnpm install --frozen-lockfile` if the worktree does not already have them.
2. Create an isolated production build with the third-party service credentials set to dummy or empty values and Sentry authentication blank. Use `pnpm build`; keep the output outside any active application preview.
3. Serve that build on an unused loopback-only port, for example `pnpm exec vite preview --host 127.0.0.1 --port 3053 --outDir <isolated-build-directory>`.
4. Run a Playwright Chromium measurement with a fresh context per route, viewport 1400 × 900, service workers blocked, and request interception that aborts every hostname other than `127.0.0.1` or `localhost` before transmission.
5. For each route, wait for its stable visible marker, observe for four seconds, and record request/RPC methods, wallet prompts and browser dialogs, route readiness/fallback state, DOM and text size, scroll height, heap, resources, chunks, and browser storage.

The S1 measurement script used for this run was temporary task evidence and is intentionally not added to the application or long-lived verification surface. A later durable verification should be created only if the post-S2a-1 rerun shows this boundary needs ongoing enforcement.
