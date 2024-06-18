import { Address, Chain } from 'viem'
import { configureChains, createConfig, createStorage, mainnet } from 'wagmi'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import TestConnector from './TestConnector'

const noopStorage = {
  getItem: () => '',
  setItem: () => null,
  removeItem: () => null,
}

export function setupTestConfig(e2e: {
  rpc: string
  chainId: number
  privateKey: Address
}) {
  const { chains, publicClient } = configureChains<Chain>(
    [mainnet],
    [
      jsonRpcProvider({
        rpc: () => ({ http: e2e ? e2e.rpc : 'http://127.0.0.1:8545' }),
      }),
    ]
  )

  return createConfig({
    autoConnect: true,
    connectors: [new TestConnector({ chains, ...e2e })],
    publicClient,
    storage: createStorage({ storage: noopStorage }),
  })
}
