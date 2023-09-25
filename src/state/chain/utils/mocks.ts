import { createPublicClient, createWalletClient, http } from 'viem'
import * as chains from 'viem/chains'
import { createConfig, CreateConfigParameters, WalletClient } from 'wagmi'
import { MockConnector } from 'wagmi/connectors/mock'

export const getMockWalletClient = () =>
  createWalletClient({
    transport: http(chains.foundry.rpcUrls.default.http[0]),
    chain: chains.foundry,
    account: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    key: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    pollingInterval: 100,
  })

export const getPublicClient = ({
  chainId = chains.foundry.id,
}: {
  chainId?: number
}) => {
  const chain = Object.entries(chains).find(
    ([_, chain]) => chain.id === chainId
  )?.[1]
  if (!chain) throw new Error(`Chain ${chainId} not found`)

  return createPublicClient({
    transport: http(chains.foundry.rpcUrls.default.http[0]),
    chain,
    pollingInterval: 100,
  })
}

type SetupClient = Partial<CreateConfigParameters> & {
  walletClient?: WalletClient
}

export function setupConfig({
  walletClient = getMockWalletClient(),
  ...config
}: SetupClient = {}) {
  return createConfig({
    autoConnect: true,
    connectors: [new MockConnector({ options: { walletClient } })],
    publicClient: ({ chainId }) => getPublicClient({ chainId }) as any,
    ...config,
  }) as any
}
