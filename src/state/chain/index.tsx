import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import {
  arbitrum,
  base,
  bsc,
  mainnet,
  type AppKitNetwork,
} from '@reown/appkit/networks'
import { createAppKit } from '@reown/appkit/react'
import { DtfSdkProvider } from '@reserve-protocol/react-sdk'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { WagmiProvider, fallback, http } from 'wagmi'
import { hashFn, structuralSharing } from 'wagmi/query'
import { dtfSdkChains, registerRpcUrls } from '@/utils/rpc-urls'

import AtomUpdater from './updaters/AtomUpdater'

const projectId = import.meta.env.VITE_WALLETCONNECT_ID || 'test-project'
const networks: [AppKitNetwork, ...AppKitNetwork[]] = [
  mainnet,
  base,
  arbitrum,
  bsc,
]

const toCustomRpcUrls = (chainId: number) =>
  registerRpcUrls[chainId as keyof typeof registerRpcUrls].map((url) => ({ url }))

// WalletConnect explorer ids, pinned to the top of the modal in this order.
const FEATURED_WALLET_IDS = [
  '18388be9ac2d02726dbac9777c96efaac06d744b2f6d580fccdd4127a6d01fd1', // Rabby
  '38f5d18bd8522c244bdd70cb4a68e0e718865155811c043f052fb9f1c51de662', // Bitget
  '8a0ee50d1f22f6651afcae7eb4253e52a3310b90af5daef78a8c4929a9bb99d4', // Binance
  '19177a98252e07ddfc9af2083ba8e07ef627cb6103467ffebb3f8f4205fd7927', // Ledger
]

const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  // WHY: without these AppKit rewrites chain.rpcUrls.default to Reown's proxy.
  customRpcUrls: {
    [`eip155:${mainnet.id}`]: toCustomRpcUrls(mainnet.id),
    [`eip155:${base.id}`]: toCustomRpcUrls(base.id),
    [`eip155:${arbitrum.id}`]: toCustomRpcUrls(arbitrum.id),
    [`eip155:${bsc.id}`]: toCustomRpcUrls(bsc.id),
  },
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

export const wagmiConfig = wagmiAdapter.wagmiConfig

createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata: {
    name: 'Reserve Register',
    description: 'Create, manage & trade tokenized indexes on Reserve.',
    url: window.location.origin,
    icons: [`${window.location.origin}/logo192.png`],
  },
  themeMode: 'dark',
  themeVariables: {
    '--apkt-font-family': "'TWK Lausanne', system-ui, sans-serif",
  },
  termsConditionsUrl: 'https://reserve.org/terms_and_conditions/',
  privacyPolicyUrl: 'https://reserve.org/terms-and-conditions#privacy',
  featuredWalletIds: FEATURED_WALLET_IDS,
  // WHY: chain selection stays in the app UI (chainIdAtom); the modal picker would expose Arbitrum.
  enableNetworkSwitch: false,
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

const ChainProvider = ({ children }: { children: ReactNode }) => {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AtomUpdater />
        <DtfSdkProvider
          chains={dtfSdkChains}
          etherscanApiKey={import.meta.env.VITE_ETHERSCAN_API_KEY}
        >
          {children}
        </DtfSdkProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default ChainProvider
