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
import { arbitrum, base, mainnet } from 'wagmi/chains'
import { infuraProvider } from 'wagmi/providers/infura'
import AtomUpdater from './updaters/AtomUpdater'
import { setupConfig } from './utils/mocks'
import { ChainId } from 'utils/chains'

const ANKR_PREFIX = {
  [ChainId.Mainnet]: 'eth',
  [ChainId.Base]: 'base',
  [ChainId.Arbitrum]: 'arbitrum',
}

export const { chains, publicClient } = configureChains(
  [mainnet, base, arbitrum],
  import.meta.env.VITE_MAINNET_URL
    ? [
        jsonRpcProvider({
          rpc: () => ({
            http: import.meta.env.VITE_MAINNET_URL,
          }),
        }),
      ]
    : [
        infuraProvider({ apiKey: import.meta.env.VITE_INFURA }),
        jsonRpcProvider({
          rpc: (chain) => {
            return {
              http: `https://rpc.ankr.com/${ANKR_PREFIX[chain.id]}/${
                import.meta.env.VITE_ANKR
              }`,
            }
          },
        }),
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
