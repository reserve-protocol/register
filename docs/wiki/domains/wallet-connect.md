---
title: Wallet Connection (Reown AppKit)
updated: 2026-09-16
type: domain
sources:
  - src/state/chain/index.tsx
  - src/hooks/use-wallet-modal.ts
  - src/components/account/index.tsx
  - e2e/fixtures/wallet.ts
  - e2e/tests/flows/wallet-connect.spec.ts
---

Wallet UI is **Reown AppKit** (`@reown/appkit` + `@reown/appkit-adapter-wagmi`)
on top of wagmi/viem. Replaced RainbowKit in September 2026 because RainbowKit
stopped shipping and its mobile handoff was poor; Reown owns WalletConnect, so
mobile deep links and the relay are theirs end to end.

Shape:
- `src/state/chain/index.tsx` builds one `WagmiAdapter` (networks, transports,
  polling intervals, explicit Binance connector) and calls
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

Feature surface: email, socials, onramp, swaps, send, history and analytics
are switched off locally in `features`. AppKit also reads a remote config for
the project id from Reown's cloud (onramp / swaps / activity / "UX by Reown"
branding come from there), so those toggles must also be off in the Reown
dashboard for the production project — the account view shows "Fund wallet"
when the remote onramp flag is on.

Network switching inside the modal is off (`enableNetworkSwitch: false`):
chain selection stays in the app (`chainIdAtom`) and the wrong-network state
is the header tooltip, as before; the picker would also expose Arbitrum, which
is deprecated for Index DTFs.

Theming: `themeMode: 'dark'` (parity with the old always-dark RainbowKit
theme) and `--apkt-font-family` set to the app font. The modal is shadow DOM:
Tailwind and design tokens do not reach it; only `themeVariables` do.

Safe over WalletConnect (investigated 2026-09-15, not a blocker): the old
chainId-stripping wrapper is gone and does not need a replacement. AppKit's WC
connector proposes the session with `optionalNamespaces` only, then picks the
connected chain from the session's approved chains (adapter
`connectors/WalletConnectConnector.js` ~L60-66), so a chain-bound Safe never
receives a switch to a chain it did not approve. The adapter's post-connect
`switchChain(res.chainId)` (`client.js` ~L414) targets that same approved
chain, and `@walletconnect/universal-provider` 2.23.7 handles
`wallet_switchEthereumChain` for an approved chain locally
(`handleSwitchChain` → `isChainApproved` → `setDefaultChain`, no relay
request). Reviewers (Dark, codex, research agent) flagged this path without
checking the provider layer; three independent code traces say it is inert.
Residual behaviour, same as before the migration: the app's own
`switchChainAsync` to the page chain does reach the wallet, and a Safe rejects
it — that is the existing wrong-network toast. New edge: a Safe on a chain
outside `networks` (e.g. Polygon) now fails the connect with
`ChainNotConfiguredError` instead of connecting on a wrong chain; nothing was
usable in that state anyway. `useConnectWithReset` (disconnect-before-open)
stays. No public dapp patches this path (CoW Swap only guards its own switch
calls by detecting Safe via WC peer metadata).

Residual risks to retest with a real Safe after any AppKit or
universal-provider bump (verified by codex on the same sources):
- If a wallet's settled session omits `namespaces.eip155.chains`, the
  connector falls back to chain 1 (`WalletConnectConnector.js` ~L63) and a
  switch to an unapproved chain can reach the relay. Safe web approves
  `chains: [safeChain]`; Safe Mobile was not verified.
- Safe App iframe reload: the adapter's `syncConnection` (`client.js`
  ~L376-390) reports the *requested* chain to AppKit instead of the Safe's
  chain, so AppKit's modal state and wagmi can disagree after a refresh. The
  app reads wagmi, so the header/wrong-network UX stays correct.

Manual matrix (Safe web WC and Safe Mobile; fresh connect, then hard
refresh): Safe on Ethereum → Base DTF; Safe on Base → Ethereum DTF; Safe on
BSC → Base DTF; Safe on Base → Base DTF (control). Pass = Safe shows no
chain-switch prompt, header reports the Safe's chain, cross-chain cases show
the wrong-network tooltip, refresh reconnects without a prompt. Safe iframe
via `safe()`: same three cross/control cases, checking wagmi and AppKit agree
on the chain after refresh.

Binance: `getWagmiConnectorV2()` returns wagmi's bare `injected()` inside the
Binance in-app browser, which AppKit already adds, so the explicit connector is
only registered outside that browser (otherwise the list shows two "Browser
Wallet" rows).

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
the normal modal. Exact ENS reverse-resolution RPC overrides exercise a plain
address plus short and long names; header and mobile navigation bounds are
checked at 360/412px, and the desktop header at 1280px. Screenshots go to
Playwright's test results.

Build: the production bundle needs ~6 GB of JS heap while Rollup renders the
sourcemapped chunks (AppKit pushed it over Node's ~4 GB default; master fit).
The `build` script sets `NODE_OPTIONS=--max-old-space-size=6144`, which is
what Cloudflare Pages runs. If Pages still fails on memory, the next lever is
dropping sourcemaps for the vendor `wallet` chunk.
