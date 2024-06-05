import { createAnvil as _createAnvil } from '@viem/anvil'
import { Address, Chain } from 'viem'
import { mainnet } from '@wagmi/core/chains'
import { config } from 'dotenv'

config()

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
    forkUrl: `https://eth-mainnet.g.alchemy.com/v2/${process.env.E2E_ALCHEMY_KEY}`,
    chainId: mainnet.id,
    // forkBlockNumber: 17586536n,
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
