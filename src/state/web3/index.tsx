import '@rainbow-me/rainbowkit/styles.css'
import { Web3ReactProvider } from '@web3-react/core'
import web3Connectors from 'components/wallets/connectors'
import { BlockUpdater } from 'hooks/useBlockNumber'
import React from 'react'
import MulticallUpdater from './components/MulticallUpdater'
import TransactionManager from './components/TransactionManager'
import WalletUpdater from './components/WalletUpdater'

import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { configureChains, createConfig, WagmiConfig } from 'wagmi'
import { mainnet, optimism } from 'wagmi/chains'

import { publicProvider } from 'wagmi/providers/public'

const { chains, publicClient } = configureChains(
  [mainnet, optimism],
  [
    // alchemyProvider({ apiKey: process.env.ALCHEMY_ID }),
    publicProvider(),
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
      <Web3ReactProvider connectors={web3Connectors}>
        <MulticallUpdater />
        <BlockUpdater />
        <WalletUpdater />
        <TransactionManager />
        {children}
      </Web3ReactProvider>
    </RainbowKitProvider>
  </WagmiConfig>
)

export default Web3Provider
