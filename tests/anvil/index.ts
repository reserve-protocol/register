import { createAnvil as _createAnvil } from '@viem/anvil'
import { Address, Chain } from 'viem'
import { mainnet } from '@wagmi/core/chains'

export type Balance = Record<string, number>

export type Anvil = {
  rpc: () => string
  chain: () => Chain
  // setBalance: (address: Address, balance: Balance) => Promise<void>
  stop: () => Promise<void>
}

export const createAnvil = async (): Promise<Anvil> => {
  const anvil = _createAnvil({
    blockTime: 1,
    blockBaseFeePerGas: 0,
    gasLimit: 20_000_000,
    forkUrl: `https://eth-mainnet.alchemyapi.io/v2/${process.env.GUARDIAN_UI_ALCHEMY_API_KEY}`,
    chainId: mainnet.id,
    // forkBlockNumber: 17586536n,
  })

  await anvil.start()
  const rpc = `http://${anvil.host}:${anvil.port}`
  return {
    rpc: () => rpc,
    chain: () => mainnet,
    // setBalance: async (address: Address, balance: Balance) => {
    //   await anvil.setBalance(address, balance)
    // },
    stop: async () => {
      await anvil.stop()
    },
  }
}
