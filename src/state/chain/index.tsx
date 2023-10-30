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
import { base, hardhat, mainnet } from 'wagmi/chains'
import { infuraProvider } from 'wagmi/providers/infura'
import AtomUpdater from './updaters/AtomUpdater'
import { setupConfig } from './utils/mocks'

export const { chains, publicClient } = configureChains(
  [mainnet, base, hardhat],
  import.meta.env.VITE_MAINNET_URL
    ? [
        jsonRpcProvider({
          rpc: () => ({
            http: import.meta.env.VITE_MAINNET_URL,
          }),
        }),
      ]
    : [
        infuraProvider({ apiKey: 'b6bf7d3508c941499b10025c0776eaf8' }),
        infuraProvider({ apiKey: '9aa3d95b3bc440fa88ea12eaa4456161' }),
        alchemyProvider({ apiKey: import.meta.env.VITE_ALCHEMY }),
        publicProvider(),
      ]
)

const { connectors } = getDefaultWallets({
  appName: 'Register',
  projectId: import.meta.env.VITE_WALLETCONNECT_ID,
  chains,
})

export const wagmiConfig = import.meta.env.VITE_TESTING
  ? setupConfig()
  : createConfig({
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
