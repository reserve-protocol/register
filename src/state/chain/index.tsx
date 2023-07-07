import {
  RainbowKitProvider,
  darkTheme,
  getDefaultWallets,
} from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import { jsonRpcProvider } from '@wagmi/core/providers/jsonRpc'
import { alchemyProvider } from '@wagmi/core/providers/alchemy'
import { publicProvider } from '@wagmi/core/providers/public'
import React from 'react'
import { WagmiConfig, configureChains, createConfig } from 'wagmi'
import { mainnet, optimism } from 'wagmi/chains'

import AtomUpdater from './AtomUpdater'

// TODO: find a way to easy switch between tenderly/mainnet
const { chains, publicClient } = configureChains(
  [mainnet, optimism],
  [
    // alchemyProvider({ apiKey: import.meta.env.VITE_ALCHEMY }),
    jsonRpcProvider({
      rpc: (chain) => ({
        http: `https://rpc.tenderly.co/fork/6805d14a-cd3b-4cf0-8ae0-444a42c39539`,
      }),
    }),
    // publicProvider(),
  ]
)

const { connectors } = getDefaultWallets({
  appName: 'Register',
  projectId: import.meta.env.VITE_WALLETCONNECT_ID,
  chains,
})

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
})

/**
 * Wrapper around web3ReactProvider
 * Handles basic logic as well as adds related chain providers
 */
const Web3Provider = ({ children }: { children: React.ReactNode }) => (
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

export default Web3Provider
