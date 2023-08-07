import {
  RainbowKitProvider,
  darkTheme,
  getDefaultWallets,
} from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import { alchemyProvider } from '@wagmi/core/providers/alchemy'
import { jsonRpcProvider } from '@wagmi/core/providers/jsonRpc'
import { publicProvider } from '@wagmi/core/providers/public'
import React from 'react'
import { WagmiConfig, configureChains, createConfig } from 'wagmi'
import { baseGoerli, mainnet } from 'wagmi/chains'
import AtomUpdater from './updaters/AtomUpdater'

const isTenderlyEnv = !!(
  import.meta.env.DEV && import.meta.env.VITE_TENDERLY_URL
)

const { chains, publicClient } = configureChains(
  [mainnet, baseGoerli],
  [
    isTenderlyEnv
      ? jsonRpcProvider({
          rpc: (chain) => ({
            // TODO: For multichain support we may also want tenderly fork for every chain
            http: import.meta.env.VITE_TENDERLY_URL,
          }),
        })
      : alchemyProvider({ apiKey: import.meta.env.VITE_ALCHEMY }),
    publicProvider(),
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
const ChainProvider = ({ children }: { children: React.ReactNode }) => (
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

export default ChainProvider

// {isTenderlyEnv && <UpdateOracles />}
