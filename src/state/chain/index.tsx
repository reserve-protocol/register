import {
  DisclaimerComponent,
  RainbowKitProvider,
  connectorsForWallets,
  darkTheme,
} from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import {
  braveWallet,
  coinbaseWallet,
  injectedWallet,
  ledgerWallet,
  metaMaskWallet,
  rabbyWallet,
  rainbowWallet,
  safeWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { ROUTES } from 'utils/constants'
import { WagmiProvider, createConfig, fallback, http } from 'wagmi'
import { arbitrum, base, mainnet } from 'wagmi/chains'
import { hashFn, structuralSharing } from 'wagmi/query'
import AtomUpdater from './updaters/AtomUpdater'

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [
        injectedWallet,
        metaMaskWallet,
        walletConnectWallet,
        coinbaseWallet,
        braveWallet,
        rabbyWallet,
        safeWallet,
        ledgerWallet,
        rainbowWallet,
      ],
    },
  ],
  {
    appName: 'Reserve Register',
    projectId: import.meta.env.VITE_WALLETCONNECT_ID || 'test-project',
  }
)

export const wagmiConfig = createConfig({
  chains: [mainnet, base, arbitrum],
  connectors,
  transports: {
    [mainnet.id]: import.meta.env.VITE_MAINNET_URL
      ? http(import.meta.env.VITE_MAINNET_URL)
      : fallback([
          http(`https://mainnet.infura.io/v3/${import.meta.env.VITE_INFURA}`),
          http(
            `https://eth-mainnet.alchemyapi.io/v2/${import.meta.env.VITE_ALCHEMY}`
          ),
          http(`https://rpc.ankr.com/mainnet/${import.meta.env.VITE_ANKR}`),
        ]),
    [base.id]: fallback([
      http(`https://base-mainnet.infura.io/v3/${import.meta.env.VITE_INFURA}`),
      http(
        `https://base-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY}`
      ),
      http(`https://rpc.ankr.com/base/${import.meta.env.VITE_ANKR}`),
    ]),
    [arbitrum.id]: fallback([
      http(
        `https://arbitrum-mainnet.infura.io/v3/${import.meta.env.VITE_INFURA}`
      ),
      http(`https://rpc.ankr.com/arbitrum/${import.meta.env.VITE_ANKR}`),
    ]),
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
  <Text>
    By connecting a wallet, you agree to ABC Labs{' '}
    <Link href={ROUTES.TERMS}>Terms of Service</Link> and consent to its{' '}
    <Link href={`${ROUTES.TERMS}?target=privacy`}>Privacy Policy</Link>
  </Text>
)

const ChainProvider = ({ children }: { children: React.ReactNode }) => {
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
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default ChainProvider
