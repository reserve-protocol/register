---
title: Wallet Connection (solariskit)
updated: 2026-11-17
type: domain
sources:
  - src/state/chain/index.tsx
  - src/hooks/use-wallet-modal.ts
  - src/hooks/use-read-contracts.ts
  - src/components/account/index.tsx
  - e2e/fixtures/wallet.ts
  - e2e/tests/flows/wallet-connect.spec.ts
---

Wallet UI is **solariskit** (Akshat's RainbowKit fork) on wagmi v3 / viem.
It replaced Reown AppKit in November 2026; AppKit had replaced RainbowKit two
months earlier because RainbowKit stopped shipping and its mobile handoff was
poor. solariskit keeps AppKit only as the WalletConnect modal (mobile wallet
list and the desktop "Open" button), so `@reown/appkit` stays installed as a
lazily loaded peer. The version is pinned exact: the fork ships breaking minors.

Shape:
- `src/state/chain/index.tsx` builds the wagmi config with `createConfig`
  (chains, transports, per-chain polling) and `connectorsForWallets`, and mounts
  `SolarisEthereumProvider` inside `QueryClientProvider` (the provider calls
  wagmi query hooks). `wagmiConfig` is exported from the same module for the
  RToken atoms and `state/wallet/atoms.ts`.
- Wallets: injected (EIP-6963 discovery, plus a generic "Browser Wallet"
  listed only when `window.ethereum` exists),
  WalletConnect, Base Account and Safe. The kit ships no other factories;
  Rabby, Bitget, Binance and MetaMask appear through EIP-6963, Ledger and
  mobile wallets through WalletConnect. Safe lists only inside an iframe.
- Wallet SDKs are app dependencies now (wagmi v3 made them optional peers):
  `@walletconnect/ethereum-provider`, `@reown/appkit`, `@base-org/account`,
  `@safe-global/safe-apps-sdk`, `@safe-global/safe-apps-provider`. A missing
  one fails when the wallet is clicked, not at build time. `@reown/appkit` is
  pinned to the version `@walletconnect/ethereum-provider` depends on, so one
  copy is installed. `vite.config.ts` keeps these out of the eager `wallet`
  chunk so the kit can lazy-load them.
- `useWalletModal()` (`src/hooks/use-wallet-modal.ts`) is the only app-side
  seam: `openConnectModal`, `openAccountModal`; `useWalletModalOpen()` is true
  while either modal is open. Components never import the kit directly.
  The kit exposes each opener only in its own state: connect while no wallet
  is connected (including while wagmi reconnects), account while connected.
  The other one is a no-op, so a connect CTA must only render disconnected.
- The header chip and the portfolio connect button render from wagmi
  `useAccount()` plus `useEnsName`; the kit only owns the modals. The header
  shows addresses as 4+4 (`0xf3…2266`), cuts ENS labels over 24 characters and
  width-caps only ENS names (a plain address must never clip).
- The provider wraps the app in a `<div data-solaris>`; `#root > div` in
  `src/app.css` gives it full height so sticky children keep working.

Not available any more: email and social login, onramp, swap, send and
activity (AppKit features). Users who signed in that way cannot connect.

Chain selection stays in the app (`chainIdAtom`). Never render the kit's
`ConnectButton`, `ChainSelectButton` or call `useChainModal`, and never pass
`initialChain`: those are the only ways to reach the kit's network picker,
which would expose Arbitrum (deprecated for Index DTFs). The account modal has
copy, disconnect and an explorer link only.

Disclaimer: a custom `DisclaimerComponent` with the same wording AppKit showed
("By connecting your wallet, you agree to our Terms of Service and Privacy
Policy"). The kit is English only; the modals do not follow the app locale.

Theming: `darkTheme({ borderRadius: 'medium' })`; the font inherits from the
page. The modals are light DOM under `[data-solaris]` with `--solaris-*`
variables; do not style kit internals.

Connect-time chain: the kit connects on wagmi's current chain (`useChainId()`:
the last connected chain, mainnet on a fresh browser), not the wallet's, and
asks the wallet to switch if it is elsewhere. AppKit behaved the same way (a
Test Wallet moved to Base while wagmi remembered BSC is switched back to BSC
at connect on both kits), so this is not new. Fixing it means changing the
target precedence in the kit's `useWalletConnectors`; it is a follow-up.

Safe over WalletConnect is unverified on this kit. The risk follows from the
paragraph above: a chain-bound Safe on a chain other than wagmi's current one
is asked to switch at connect and rejects. The RainbowKit-era setup stripped
`chainId` from WalletConnect connects for this reason (git: `018a47b7e^`,
`src/state/chain/index.tsx`); it is not restored because it would not cover
the kit's follow-up switch. `useConnectWithReset` (disconnect-before-open)
stays.

Manual matrix (needs real wallets; rerun on every kit bump): MetaMask and
Rabby extensions; WalletConnect QR and the mobile wallet list; Ledger via
WalletConnect; Base Account; Binance and Bitget in-app browsers; Safe web over
WalletConnect and Safe Mobile (fresh connect, then hard refresh) for Safe on
Ethereum → Base DTF, Safe on Base → Ethereum DTF, Safe on BSC → Base DTF and
Safe on Base → Base DTF; the Safe iframe for the same cases. Pass = no
unexpected switch prompt, header reports the wallet's chain, cross-chain cases
show the wrong-network tooltip, refresh reconnects without a prompt. Existing
WalletConnect sessions from the AppKit build do not restore: reconnect once.

wagmi v3 behaviour to know:
- `useReadContracts` no longer skips the query while a contract has no
  address (v2 did). `src/hooks/use-read-contracts.ts` restores that, and
  oxlint rejects importing `useReadContracts` from `wagmi`. `useReadContract`
  (singular) still guards itself.
- `useBalance` lost `token` and `formatted`; ERC-20 balances are `balanceOf`
  reads. `useFeeData` is gone (`useEstimateFeesPerGas`).
- `useSimulateContract` now needs a connected account and is disabled without
  one.
- `useAccount`, `writeContract` and the other v2 names still work but are
  deprecated; the rename is a follow-up in `docs/plans/FOLLOWUPS.md`.
- `@reserve-protocol/async-zap-sdk` still declares a wagmi v2 peer; a
  `peerDependencyRules` entry in `pnpm-workspace.yaml` allows v3.

The deploy success page uses wagmi's `useWatchAsset` to add the new ERC-20 to
the connected wallet, matching Index navigation.

E2E: `e2e/fixtures/base.ts` fulfils the WalletConnect/Reown hosts with `{}`.
The injected Test Wallet is announced over EIP-6963 and lists under
"Installed" by its announced name; a recently used wallet's button gains a
"Recent" suffix, so do not match its name exactly. wagmi usually reconnects it
on mount; `connectWallet(page)` tolerates both paths. The kit looks up the ENS
avatar record of a resolved name, so a spec that gives the wallet an ENS name
must also answer `resolveWithGateways`. `flows/wallet-connect` owns the modal
contract: legal footer, WalletConnect and Base listed, Safe absent outside an
iframe, no network picker, account view, disconnect that sticks, and header
bounds for a plain address and short/long ENS names at 360/412/1280px. Unit
tests need no kit mock; `src/hooks/tests/use-wallet-modal.test.tsx` covers the
seam.

Build: `NODE_OPTIONS=--max-old-space-size=6144` in the `build` script dates
from AppKit; it has not been re-measured on this kit. Source maps and the
Sentry plugin only run when `SENTRY_AUTH_TOKEN` is present.
