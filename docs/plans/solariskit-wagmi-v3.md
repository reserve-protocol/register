# solariskit + wagmi v3

## Goal

Replace Reown AppKit with `solariskit` (Akshat's RainbowKit fork) as Register's wallet UI. solariskit
needs wagmi v3, so wagmi moves from 2.19 to 3.7 here and in `@reserve-protocol/react-zapper`, which
releases 3.0.0 first. Branch `feat/solariskit-wagmi-v3`, cut from `feat/index-dtf-v6` and moved onto master once v6 merged (2026-11-18). react-zapper 3.0.0 is published and pinned.

## Current state

- AppKit 1.8.23 on wagmi 2.19.5. All kit code is behind `src/state/chain/index.tsx` and
  `src/hooks/use-wallet-modal.ts`; 12 consumers call `useWalletModal`. The header chip is custom.
- The pre-AppKit RainbowKit setup is at `018a47b7e^:src/state/chain/index.tsx`.
- wagmi v3 keeps the v2 hook and mutate names as deprecated aliases. Removed: `useFeeData`,
  `wagmi/experimental`, `useWriteContracts`. Connector SDKs are peers the app installs.
- solariskit 1.12.1: `SolarisEthereumProvider` inside `QueryClientProvider`; wallets are injected
  (EIP-6963), WalletConnect, Base Account and Safe only; WalletConnect lazily loads
  `@reown/appkit/core`; `openConnectModal` is `undefined` while connected; no chain UI unless
  `useChainModal`, `ChainSelectButton` or `ConnectButton` is rendered.
- `@reserve-protocol/async-zap-sdk` 0.8.0 declares `wagmi ^2.19.5` and uses three hooks that exist in v3.

## Non-goals

- Renaming deprecated wagmi names (`useAccount`, `writeContract`): v6 authors are on wagmi 2, which
  has no `useConnection`, and the rename would conflict on every rebase. Post-merge codemod.
- Localising the connect modal, pinning featured wallets, changing the chain list.
- Email/social login, onramp, swap, send and activity: AppKit-only, they go away with it.

## Acceptance evidence

- `pnpm typecheck`, `pnpm lint`, `pnpm test:run`, `pnpm build`, `pnpm e2e:full`, `pnpm e2e:mobile`
  green, compared against the baseline taken on the v6 tip.
- Fork lane (v6 rebalance suite, optimistic governance upgrade) green through the `fork-e2e` skill.
- `pnpm why @wagmi/core @wagmi/connectors` shows one version of each; no `file:` entry in the lockfile.
- Connect and account modals inspected at 360/412/1280px; no chain switcher, Arbitrum unreachable.
- Human matrix on a preview build (real wallets): MetaMask and Rabby extensions, WalletConnect QR
  and mobile list, Ledger via WalletConnect, Base Account, Binance and Bitget in-app browsers, the
  Safe matrix from `docs/wiki/domains/wallet-connect.md`, atomic batch, automated mint, zapper,
  upgrade in place.

## Test seams

- `useWalletModal` (unit): each opener works in its own state and is a no-op otherwise.
- Offline Playwright with the injected EIP-6963 Test Wallet: connect, disconnect, wrong chain,
  every transaction flow; `e2e/tests/flows/wallet-connect.spec.ts` owns the modal contract.
- Fork lane with the Fork Wallet for real transactions.
- react-zapper: its own vitest harness on the wagmi `mock` connector, then Register's zap flows.

## Slices

- Slice R1: Register on wagmi v3 with AppKit unchanged, react-zapper from a local tarball of its
  wagmi v3 build; blocked by: react-zapper library migration (its repo).
- Slice R2: kit swap to solariskit (config, providers, modal seam, tests, e2e, docs for the wallet
  domain); blocked by: R1 and react-zapper 3.0.0 on npm.
- Slice R3: whole-app verification (fork lane, build, gate, human matrix); blocked by: R2.
- Slice R4: closeout (wiki, e2e docs, FOLLOWUPS, review panel, Engineer review handoff); blocked by: R3.

## Unresolved decisions

- None blocking. To raise with Akshat and Juampi before R2 ships: users who signed in through AppKit
  email or social login cannot connect afterwards, and RainbowKit was dropped in September 2026 for
  poor mobile handoff, which solariskit addresses by delegating the mobile list to AppKit's modal
  (unproven on devices until R3).
