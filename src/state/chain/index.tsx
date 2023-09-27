import {
  RainbowKitProvider,
  darkTheme,
  getDefaultWallets,
} from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'

import { alchemyProvider } from '@wagmi/core/providers/alchemy'
import { publicProvider } from '@wagmi/core/providers/public'
import { jsonRpcProvider } from '@wagmi/core/providers/jsonRpc'
import React from 'react'
import { ChainId, defaultChain } from 'utils/chains'
import { WagmiConfig, configureChains, createConfig } from 'wagmi'
import { base, hardhat, mainnet } from 'wagmi/chains'
import AtomUpdater from './updaters/AtomUpdater'
import { setupConfig } from './utils/mocks'

const chainList = [mainnet, base, hardhat] as any
const providers = [
  alchemyProvider({ apiKey: import.meta.env.VITE_ALCHEMY }),
  publicProvider(),
] as any[]

if (import.meta.env.VITE_MAINNET_URL) {
  providers[0] = jsonRpcProvider({
    rpc: () => ({
      http: import.meta.env.VITE_MAINNET_URL,
    }),
  })
}

if (defaultChain !== ChainId.Mainnet) {
  const index = chainList.findIndex((c: any) => c.id === defaultChain)

  if (index !== -1) {
    chainList[0] = chainList[index]
    chainList[index] = mainnet
  }
}

export const { chains, publicClient } = configureChains(chainList, providers)

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
