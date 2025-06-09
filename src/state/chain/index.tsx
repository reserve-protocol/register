import {
  DisclaimerComponent,
  RainbowKitProvider,
  connectorsForWallets,
  darkTheme,
} from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import {
  bitgetWallet,
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
import binanceWallet from '@binance/w3w-rainbow-connector-v2'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ROUTES } from 'utils/constants'
import { WagmiProvider, createConfig, fallback, http } from 'wagmi'
import { arbitrum, base, mainnet, bsc } from 'wagmi/chains'
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
        bitgetWallet,
        binanceWallet,
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
  chains: [mainnet, base, arbitrum, bsc],
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
    [bsc.id]: fallback([
      http(`https://bsc-mainnet.infura.io/v3/${import.meta.env.VITE_INFURA}`),
      http(`https://rpc.ankr.com/bsc/${import.meta.env.VITE_ANKR}`),
      http(
        `https://bsc-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY}`
      ),
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
  <div>
    By connecting a wallet, you agree to ABC Labs{' '}
    <a href="https://reserve.org/terms_and_conditions/">
      Terms of Service and consent to its Privacy Policy
    </a>
  </div>
)

// TODO: Fix types, react version mismatch
const ChainProvider = ({ children }: { children: any }) => {
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
