import '@rainbow-me/rainbowkit/styles.css'
import { Web3ReactProvider } from '@web3-react/core'
import web3Connectors from 'components/wallets/connectors'
import React, { useEffect } from 'react'
import TransactionManager from './components/TransactionManager'

import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import {
  configureChains,
  createConfig,
  useAccount,
  useBlockNumber,
  useNetwork,
  usePublicClient,
  useWalletClient,
  WagmiConfig,
} from 'wagmi'
import { mainnet, optimism } from 'wagmi/chains'

import { useSetAtom } from 'jotai'
import {
  blockAtom,
  chainIdAtom,
  publicClientAtom,
  walletAtom,
  walletClientAtom,
} from 'state/atoms'
import { publicProvider } from 'wagmi/providers/public'
import { jsonRpcProvider } from '@wagmi/core/providers/jsonRpc'

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

const Updater = () => {
  const { address: account } = useAccount()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()
  const { data: blockNumber } = useBlockNumber({ watch: true })
  const { chain } = useNetwork()
  // Setters
  const setWallet = useSetAtom(walletAtom)
  const setWalletClient = useSetAtom(walletClientAtom)
  const setPublicClient = useSetAtom(publicClientAtom)
  const setBlockNumber = useSetAtom(blockAtom)
  const setChain = useSetAtom(chainIdAtom)

  useEffect(() => {
    setWallet(account ?? '')
  }, [account])

  useEffect(() => {
    setWalletClient(walletClient ? walletClient : undefined)
  }, [walletClient])

  useEffect(() => {
    setPublicClient(publicClient ? publicClient : undefined)
  }, [publicClient])

  useEffect(() => {
    setBlockNumber(blockNumber ? Number(blockNumber) : undefined)
  }, [blockNumber])

  useEffect(() => {
    if (chain && !chain.unsupported) {
      setChain(chain.id)
    }
  }, [chain])

  return null
}

/**
 * Wrapper around web3ReactProvider
 * Handles basic logic as well as adds related chain providers
 */
const Web3Provider = ({ children }: { children: React.ReactNode }) => (
  <WagmiConfig config={wagmiConfig}>
    <RainbowKitProvider chains={chains}>
      <Updater />
      <TransactionManager />
      {children}
    </RainbowKitProvider>
  </WagmiConfig>
)

export default Web3Provider
