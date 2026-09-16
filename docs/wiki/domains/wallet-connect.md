---
title: Wallet Connection (Reown AppKit)
updated: 2026-09-16
type: domain
sources:
  - src/state/chain/index.tsx
  - src/hooks/use-wallet-modal.ts
  - src/components/account/index.tsx
  - src/views/index-dtf/deploy/steps/confirm-deploy/success/index.tsx
  - e2e/fixtures/wallet.ts
  - e2e/tests/flows/wallet-connect.spec.ts
---

Wallet UI is **Reown AppKit** (`@reown/appkit` + `@reown/appkit-adapter-wagmi`)
on top of wagmi/viem. Replaced RainbowKit in September 2026 because RainbowKit
stopped shipping and its mobile handoff was poor; Reown owns WalletConnect, so
mobile deep links and the relay are theirs end to end.

Shape:
- `src/state/chain/index.tsx` builds one `WagmiAdapter` (networks, transports,
  polling intervals; no custom connectors) and calls
  `createAppKit` once at module load. `wagmiConfig` is still exported from the
  same module, so the RToken atoms and `state/wallet/atoms.ts` are untouched.
- AppKit adds the injected (EIP-6963), WalletConnect and Coinbase connectors
  itself, and adds `safe()` when `location.ancestorOrigins` identifies an
  `app.safe.global` iframe. Do not register `safe()` unconditionally: AppKit
  lists that unusable connector outside Safe. Alternate Safe hosts and older
  browsers without that API need separate compatibility validation.
  Rabby, Bitget, Binance and Ledger are pinned to the top through
  `featuredWalletIds` (WalletConnect explorer ids); everything else is
  reachable through the searchable "all wallets" list.
- `useWalletModal()` (`src/hooks/use-wallet-modal.ts`) is the only app-side
  seam: `openConnectModal`, `openAccountModal`; `useWalletModalOpen()` is a
  separate subscription (true while *any* AppKit view is open) because only
  `seamless-transaction.tsx` needs it and AppKit state re-renders often. Components never import AppKit directly, so the
  vendor can be swapped again in one file.
- The header chip and the portfolio connect button render from wagmi
  `useAccount()` plus `useEnsName`; AppKit only owns the modal. The header
  shows addresses as 4+4 (`0xf3…2266`, RainbowKit parity — the 360px header
  has no room for more), cuts ENS labels over 24 characters and width-caps
  only ENS names (a plain address must never clip); the shared ENS hook still
  returns the full name.

Disclaimer: the old custom RainbowKit disclaimer is now AppKit's built-in
legal footer, fed by `termsConditionsUrl` / `privacyPolicyUrl`. AppKit renders
its own wording ("By connecting your wallet, you agree to our Terms of Service
and Privacy Policy"); the text is not customizable. `features.legalCheckbox`
would turn it into a required checkbox if legal ever wants explicit consent.

Feature surface: AppKit defaults enable email, all supported social logins,
onramp, swaps, send, history and analytics; no local `features` overrides remain.
Reown's project dashboard controls remote availability for email/socials,
onramp, swaps and activity, and can override those defaults. If a feature is
absent in production, check the project's dashboard configuration and plan.
Register's existing Mixpanel wallet tracking stays in the wallet updater;
AppKit owns analytics for interactions inside its modal.

Network switching inside the modal is off (`enableNetworkSwitch: false`):
chain selection stays in the app (`chainIdAtom`) and the wrong-network state
is the header tooltip, as before; the picker would also expose Arbitrum, which
is deprecated for Index DTFs.

Theming: `themeMode: 'dark'` (parity with the old always-dark RainbowKit
theme) and `--apkt-font-family` set to the app font. The modal is shadow DOM:
Tailwind and design tokens do not reach it; only `themeVariables` do.

Safe over WalletConnect (investigated 2026-09-15/16, not a blocker, no code):
AppKit's WC connector proposes the session with `optionalNamespaces` only, then
picks the connected chain from the session's approved chains (adapter
`connectors/WalletConnectConnector.js` ~L60-69), so a chain-bound Safe never
receives a switch to a chain it did not approve. The adapter's post-connect
`switchChain(res.chainId)` (`client.js` ~L413) targets that same approved
chain, and `@walletconnect/universal-provider` handles
`wallet_switchEthereumChain` for an approved chain locally
(`handleSwitchChain` → `isChainApproved` → `setDefaultChain`, no relay
request). Residual behaviour, same as before the migration: the app's own
`switchChainAsync` to the page chain does reach the wallet, and a Safe rejects
it — that is the existing wrong-network toast. A Safe on a chain outside
`networks` (e.g. Polygon) fails the connect with `ChainNotConfiguredError`
instead of connecting on a wrong chain. `useConnectWithReset`
(disconnect-before-open) stays.

Documented residual risk, deliberately not guarded in code (decision
2026-09-16): if a wallet's settled session omits `namespaces.eip155.chains`,
the connector falls back to chain 1 (`WalletConnectConnector.js` ~L63) and the
adapter's post-connect switch to chain 1 can reach the wallet and be rejected,
failing the connect. Universal-provider derives approvals from the CAIP-10
accounts, so a Base/BSC-only account does not approve chain 1. Safe web's
published session includes the chains field; the missing-field case was only
reproduced with a provider fixture, never with a live Safe, and Safe Mobile
was not verified. An app-owned `SafeWagmiAdapter` override (a verbatim copy of
upstream `connectWalletConnect` that skipped that one switch) was written,
reviewed and dropped: it guarded an unobserved case, needed a re-diff on every
AppKit bump, and left wagmi reporting chain 1 while the Safe sat on another
chain. If a real Safe session ever hits this, the fix is that override
(history: commit 789016fdc) or an upstream AppKit fix — check released AppKit
versions first. On 2026-09-16 AppKit 1.8.24 still had identical connector and
post-connect switching logic.

Second residual risk: Safe App iframe reload — the adapter's `syncConnection`
(`client.js` ~L376-390) reports the *requested* chain to AppKit instead of the
Safe's chain, so AppKit's modal state and wagmi can disagree after a refresh.
The app reads wagmi, so the header/wrong-network UX stays correct.

Manual matrix (Safe web WC and Safe Mobile; fresh connect, then hard
refresh): Safe on Ethereum → Base DTF; Safe on Base → Ethereum DTF; Safe on
BSC → Base DTF; Safe on Base → Base DTF (control). Pass = Safe shows no
chain-switch prompt, header reports the Safe's chain, cross-chain cases show
the wrong-network tooltip, refresh reconnects without a prompt. Safe iframe
via `safe()`: same three cross/control cases, checking wagmi and AppKit agree
on the chain after refresh.

Binance uses AppKit's wallet discovery and WalletConnect flow, with its
explorer id retained in `featuredWalletIds`. The custom Binance wagmi connector
and its SDK dependency are removed; AppKit also handles the injected provider
inside the Binance in-app browser.

The deploy success page uses wagmi's `useWatchAsset` to add the new ERC-20 to
the connected wallet, matching Index navigation. Direct `window.ethereum`
access previously relied on types supplied transitively by Binance's package
and could target a different injected wallet.

RPC: AppKit rewrites `chain.rpcUrls.default` to Reown's proxy
(`rpc.walletconnect.org`) unless `customRpcUrls` is given, and wraps every
wagmi transport as `fallback([ours, reownProxy])`. We pass `customRpcUrls`
from `registerRpcUrls`, so chain objects keep our endpoints; the Reown proxy
remains the last-resort transport fallback.

E2E: `e2e/fixtures/base.ts` already fulfilled the WalletConnect/Reown API
hosts with `{}`; the migration added the Coinbase SDK telemetry abort (AppKit
initialises that connector eagerly). `e2e/helpers/provider.ts` answers
`wallet_revokePermissions` (AppKit sends it on disconnect). The injected test
wallet is always authorized, so AppKit usually auto-connects it on mount;
`connectWallet(page)` tolerates both paths. Unit tests mock
`@reown/appkit/react` in `src/setup-tests.ts` because AppKit boots
WalletConnect at import time and jsdom has no provider for it.

`flows/wallet-connect` checks that the iframe-only Safe option is absent from
the normal modal and that default email/social and fund/swap/send/activity controls
are visible. Exact ENS reverse-resolution RPC overrides exercise a plain
address plus short and long names; header and mobile navigation bounds are
checked at 360/412px, and the desktop header at 1280px. Screenshots go to
Playwright's test results. The stubbed Reown response exercises local defaults;
it does not prove production dashboard settings or live authentication/payment
flows. The deploy success action has no end-to-end coverage yet.

Build: the production bundle needs ~6 GB of JS heap while Rollup renders
sourcemapped chunks (AppKit pushed it over Node's ~4 GB default), so the
`build` script sets `NODE_OPTIONS=--max-old-space-size=6144`. Since 2026-09-16
source maps and the Sentry plugin only run when `SENTRY_AUTH_TOKEN` (or
`.env.sentry-build-plugin`) is present: maps are then `hidden` and deleted
after upload, so they are never served publicly; without the token no maps are
written. Local profile on 2026-09-16 (M-series, 14 cores): logos 7s (network,
only when the mapping file is older than a week), tsc 13s, vite 25s with maps
/ 17s without, SEO 0.5s. Cloudflare Pages must set the token for Sentry
symbolication to keep working.
