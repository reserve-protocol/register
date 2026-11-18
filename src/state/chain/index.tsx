import { DtfSdkProvider } from '@reserve-protocol/react-sdk'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import {
  SolarisEthereumProvider,
  connectorsForWallets,
  darkTheme,
  type DisclaimerComponent,
} from 'solariskit'
import 'solariskit/styles.css'
import {
  base as baseAccountWallet,
  injectedWallet,
  safeWallet,
  walletConnectWallet,
} from 'solariskit/wallets'
import { WagmiProvider, createConfig, fallback, http } from 'wagmi'
import { arbitrum, base, bsc, mainnet } from 'wagmi/chains'
import { hashFn, structuralSharing } from 'wagmi/query'
import { dtfSdkChains, registerRpcUrls } from '@/utils/rpc-urls'

import AtomUpdater from './updaters/AtomUpdater'

const APP_NAME = 'Reserve Register'

// WHY: the kit lists its generic injected entry even with no provider; EIP-6963 wallets are discovered either way.
const hasInjectedProvider = 'ethereum' in window

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Popular',
      wallets: [
        ...(hasInjectedProvider ? [injectedWallet] : []),
        walletConnectWallet,
        baseAccountWallet,
        safeWallet,
      ],
    },
  ],
  {
    appName: APP_NAME,
    appDescription: 'Create, manage & trade tokenized indexes on Reserve.',
    appUrl: window.location.origin,
    appIcon: `${window.location.origin}/logo192.png`,
    projectId: import.meta.env.VITE_WALLETCONNECT_ID || 'test-project',
  }
)

export const wagmiConfig = createConfig({
  chains: [mainnet, base, arbitrum, bsc],
  connectors,
  // Limit polling on fast chains without slowing mainnet transaction confirmations.
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

const Disclaimer: DisclaimerComponent = ({ Text, Link }) => (
  <Text>
    By connecting your wallet, you agree to our{' '}
    <Link href="https://reserve.org/terms_and_conditions/">
      Terms of Service
    </Link>{' '}
    and{' '}
    <Link href="https://reserve.org/terms-and-conditions#privacy">
      Privacy Policy
    </Link>
  </Text>
)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      queryKeyHashFn: hashFn,
      structuralSharing,
    },
  },
})

const ChainProvider = ({ children }: { children: ReactNode }) => {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <SolarisEthereumProvider
          theme={darkTheme({ borderRadius: 'medium' })}
          appInfo={{ appName: APP_NAME, disclaimer: Disclaimer }}
        >
          <AtomUpdater />
          <DtfSdkProvider
            chains={dtfSdkChains}
            etherscanApiKey={import.meta.env.VITE_ETHERSCAN_API_KEY}
          >
            {children}
          </DtfSdkProvider>
        </SolarisEthereumProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default ChainProvider
