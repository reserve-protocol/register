import { createAnvil as _createAnvil } from '@viem/anvil'
import { mainnet } from '@wagmi/core/chains'
import { config } from 'dotenv'
import { Address, Chain } from 'viem'

config()

export type TokenBalances = Record<Address, string>

export type Anvil = {
  rpc: () => string
  chain: () => Chain
  stop: () => Promise<void>
}

export const createAnvil = async (): Promise<Anvil> => {
  const anvil = _createAnvil({
    blockTime: 1,
    blockBaseFeePerGas: 0,
    gasLimit: 20_000_000,
    gasPrice: 0,
    forkUrl: `https://eth-mainnet.g.alchemy.com/v2/${process.env.E2E_ALCHEMY_KEY}`,
    chainId: mainnet.id,
    // forkBlockNumber: 17086178n,
  })

  await anvil.start()
  const rpc = `http://${anvil.host}:${anvil.port}`
  return {
    rpc: () => rpc,
    chain: () => mainnet,
    stop: async () => {
      await anvil.stop()
    },
  }
}
