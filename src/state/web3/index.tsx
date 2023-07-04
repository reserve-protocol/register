import '@rainbow-me/rainbowkit/styles.css'
import React from 'react'
import TransactionManager from './components/TransactionManager'
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { configureChains, createConfig, WagmiConfig } from 'wagmi'
import { mainnet, optimism } from 'wagmi/chains'
import { jsonRpcProvider } from '@wagmi/core/providers/jsonRpc'
import AtomUpdater from './AtomUpdater'

// TODO: find a way to easy switch between tenderly/mainnet
const { chains, publicClient } = configureChains(
  [mainnet, optimism],
  [
    // alchemyProvider({ apiKey: process.env.ALCHEMY_ID }),
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
  projectId: 'd28805a208cd2a52707fc6fa0d8f3dd5',
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
    <RainbowKitProvider chains={chains}>
      <AtomUpdater />
      <TransactionManager />
      {children}
    </RainbowKitProvider>
  </WagmiConfig>
)

export default Web3Provider
