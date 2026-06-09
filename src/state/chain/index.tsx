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
import { WagmiProvider, createConfig, fallback, http } from 'wagmi'
import { arbitrum, base, bsc, mainnet } from 'wagmi/chains'
import { hashFn, structuralSharing } from 'wagmi/query'
import { dtfSdkChains, registerRpcUrls } from '@/utils/rpc-urls'
import AtomUpdater from './updaters/AtomUpdater'

const connectors = connectorsForWallets(
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

export const wagmiConfig = createConfig({
  chains: [mainnet, base, arbitrum, bsc],
  connectors,
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
const Disclaimer: DisclaimerComponent = ({ Text, Link }) => (
  <div>
    By connecting a wallet, you agree to ABC Labs{' '}
    <a href="https://reserve.org/terms_and_conditions/">
      Terms of Service and consent to its Privacy Policy
    </a>
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
