import binanceWallet from '@binance/w3w-rainbow-connector-v2'
import {
  DisclaimerComponent,
  RainbowKitProvider,
  connectorsForWallets,
  darkTheme,
} from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import {
  bitgetWallet,
  coinbaseWallet,
  injectedWallet,
  ledgerWallet,
  rabbyWallet,
  safeWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets'
import { DtfSdkProvider } from '@reserve-protocol/react-sdk'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import {
  WagmiProvider,
  createConfig,
  fallback,
  http,
  type CreateConnectorFn,
} from 'wagmi'
import { arbitrum, base, bsc, mainnet } from 'wagmi/chains'
import { hashFn, structuralSharing } from 'wagmi/query'
import { dtfSdkChains, registerRpcUrls } from '@/utils/rpc-urls'
import AtomUpdater from './updaters/AtomUpdater'

const rainbowConnectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [
        injectedWallet,
        walletConnectWallet,
        coinbaseWallet,
        bitgetWallet,
        binanceWallet,
        rabbyWallet,
        safeWallet,
        ledgerWallet,
      ],
    },
  ],
  {
    appName: 'Reserve Register',
    projectId: import.meta.env.VITE_WALLETCONNECT_ID || 'test-project',
  }
)

// The WalletConnect connector follows session approval with a
// `wallet_switchEthereumChain` to the requested chain (RainbowKit always
// requests one — it falls back to the first configured chain) whenever the
// session lands on a different chain. Chain-bound wallets like Safe can't
// switch chains, so that request fails/hangs and the whole connect() dies
// before wagmi ever reports connected (the WC session itself persists, which
// is why a refresh "fixes" it). Strip the requested chain for WalletConnect
// connects: connect to whatever chain the wallet is on and let the app's
// existing wrong-network UX handle mismatches after the fact.
const connectors: CreateConnectorFn[] = rainbowConnectors.map(
  (createConnectorFn) => {
    const wrapped: CreateConnectorFn = (config) => {
      const connector = createConnectorFn(config)
      if (connector.type !== 'walletConnect') return connector
      return {
        ...connector,
        connect: ((parameters = {}) =>
          connector.connect({
            ...parameters,
            chainId: undefined,
          })) as typeof connector.connect,
      }
    }
    return wrapped
  }
)

export const wagmiConfig = createConfig({
  chains: [mainnet, base, arbitrum, bsc],
  connectors,
  // WHY: viem defaults pollingInterval to clamp(chain.blockTime / 2, 500ms, 4s),
  // so BSC (750ms blocks) polls every ~500ms and Base every ~1s. Set explicit
  // intervals to stop hammering RPC on fast chains. Mainnet stays at its 4s
  // default — slowing it further would also lag tx-receipt confirmations, which
  // share this interval.
  pollingInterval: {
    [mainnet.id]: 4_000,
    [base.id]: 3_000,
    [arbitrum.id]: 3_000,
    [bsc.id]: 3_000,
  },
  transports: {
    [mainnet.id]: fallback(registerRpcUrls[mainnet.id].map((url) => http(url))),
    [base.id]: fallback(registerRpcUrls[base.id].map((url) => http(url))),
    [arbitrum.id]: registerRpcUrls[arbitrum.id].length
      ? fallback(registerRpcUrls[arbitrum.id].map((url) => http(url)))
      : http(),
    [bsc.id]: fallback(registerRpcUrls[bsc.id].map((url) => http(url))),
  },
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      queryKeyHashFn: hashFn,
      structuralSharing,
    },
  },
})
const Disclaimer: DisclaimerComponent = () => (
  <div className='text-primary-foreground'>
    By connecting a wallet, you agree to ABC Labs{' '}
    <a className='text-primary underline' target='blank' href="https://reserve.org/terms_and_conditions/">
      Terms of Service
    </a> and consent to its <a className='text-primary underline' target='blank' href="https://reserve.org/terms-and-conditions#privacy">Privacy Policy</a>
  </div>
)

const ChainProvider = ({ children }: { children: ReactNode }) => {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            borderRadius: 'medium',
          })}
          appInfo={{ appName: 'Reserve Register', disclaimer: Disclaimer }}
        >
          <AtomUpdater />
          <DtfSdkProvider
            chains={dtfSdkChains}
            etherscanApiKey={import.meta.env.VITE_ETHERSCAN_API_KEY}
          >
            {children}
          </DtfSdkProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default ChainProvider
