import { createAnvil as _createAnvil } from '@viem/anvil'
import { Address, Chain } from 'viem'
import { mainnet } from '@wagmi/core/chains'
import { config } from 'dotenv'

config()

export type TokenBalances = Record<Address, number>

export type Anvil = {
  rpc: () => string
  chain: () => Chain
  setBalance: (account: Address, balances: TokenBalances) => Promise<void>
  stop: () => Promise<void>
}

export const createAnvil = async (): Promise<Anvil> => {
  const anvil = _createAnvil({
    blockTime: 1,
    blockBaseFeePerGas: 0,
    gasLimit: 20_000_000,
    forkUrl: `https://eth-mainnet.g.alchemy.com/v2/${process.env.E2E_ALCHEMY_KEY}`,
    chainId: mainnet.id,
    // forkBlockNumber: 17086178n,
  })

  await anvil.start()
  const rpc = `http://${anvil.host}:${anvil.port}`
  return {
    rpc: () => rpc,
    chain: () => mainnet,
    setBalance: async (account: Address, balances: TokenBalances) => {
      for (const [address, balance] of Object.entries(balances)) {
        // await anvil.setBalance(account, Address.fromString(address), balance)
      }
    },
    stop: async () => {
      await anvil.stop()
    },
  }
}
