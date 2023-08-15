import {
  RainbowKitProvider,
  darkTheme,
  getDefaultWallets,
} from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import { alchemyProvider } from '@wagmi/core/providers/alchemy'
import { publicProvider } from '@wagmi/core/providers/public'
import React from 'react'
import { Chain, WagmiConfig, configureChains, createConfig } from 'wagmi'
import { baseGoerli, mainnet, base } from 'wagmi/chains'
import AtomUpdater from './updaters/AtomUpdater'

// Mainnet fork
export const tenderly = {
  ...mainnet,
  id: 3,
  name: 'Tenderly',
  network: 'tenderly',
  rpcUrls: {
    public: { http: [import.meta.env.VITE_TENDERLY_URL] },
    default: { http: [import.meta.env.VITE_TENDERLY_URL] },
  },
} as const satisfies Chain

export const { chains, publicClient } = configureChains(
  [mainnet, tenderly, base],
  [alchemyProvider({ apiKey: import.meta.env.VITE_ALCHEMY }), publicProvider()]
)

const { connectors } = getDefaultWallets({
  appName: 'Register',
  projectId: import.meta.env.VITE_WALLETCONNECT_ID,
  chains,
})

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
})

/**
 * Wrapper around web3ReactProvider
 * Handles basic logic as well as adds related chain providers
 */
const ChainProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider
        chains={chains}
        theme={darkTheme({
          borderRadius: 'medium',
        })}
      >
        <AtomUpdater />
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  )
}

export default ChainProvider
