import {
  RainbowKitProvider,
  darkTheme,
  getDefaultWallets,
} from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'

import { alchemyProvider } from '@wagmi/core/providers/alchemy'
import { publicProvider } from '@wagmi/core/providers/public'
import React from 'react'
import { ChainId, defaultChain } from 'utils/chains'
import { WagmiConfig, configureChains, createConfig } from 'wagmi'
import { base, baseGoerli, hardhat, mainnet } from 'wagmi/chains'
import AtomUpdater from './updaters/AtomUpdater'

const chainList = [mainnet, base, baseGoerli, hardhat] as any
const providers = [
  alchemyProvider({ apiKey: import.meta.env.VITE_ALCHEMY }),
  publicProvider(),
] as any[]

if (import.meta.env.VITE_TENDERLY_MAINNET_URL) {
  providers.splice(0, 1)
  chainList[0].rpcUrls = {
    public: { http: [import.meta.env.VITE_TENDERLY_MAINNET_URL] },
    default: { http: [import.meta.env.VITE_TENDERLY_MAINNET_URL] },
  }
}

if (import.meta.env.VITE_TENDERLY_URL) {
  // Mainnet fork
  const tenderly = {
    ...mainnet,
    id: 3,
    name: 'Tenderly',
    network: 'tenderly',
    rpcUrls: {
      public: { http: [import.meta.env.VITE_TENDERLY_URL] },
      default: { http: [import.meta.env.VITE_TENDERLY_URL] },
    },
  } as any // TODO: fix typing here
  chainList.push(tenderly)
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