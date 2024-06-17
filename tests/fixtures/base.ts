import { test } from '@playwright/test'
import {
  Account,
  Address,
  PublicClient,
  WalletClient,
  createPublicClient,
  createTestClient,
  createWalletClient,
  http,
  parseEther,
} from 'viem'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { Anvil, TokenBalances, createAnvil } from '../anvil'
import { setERC20Balance } from '../utils/balances'

declare global {
  interface Window {
    e2e: { rpc: string; chainId: number; privateKey: Address }
  }
}

type TestParams = {
  privateKey: Address
}

type Web3 = {
  account: Account
  publicClient: PublicClient
  walletClient: WalletClient
  fork: Anvil
  setBalance: (balances: TokenBalances) => Promise<void>
}

type TestProps = {
  web3: Web3
}

const defaultTestParams = {
  privateKey: generatePrivateKey(),
} as const

const base = ({ privateKey }: TestParams = defaultTestParams) =>
  test.extend<TestProps>({
    bypassCSP: true,
    web3: async ({ page }, use) => {
      const account = privateKeyToAccount(privateKey)
      const fork = await createAnvil()
      const chain = fork.chain()
      const rpc = fork.rpc()

      const walletClient = createWalletClient({
        account,
        chain,
        transport: http(rpc),
      })
      const publicClient = createPublicClient({ chain, transport: http(rpc) })

      const injected = { privateKey: privateKey, rpc, chainId: chain.id }

      await page.addInitScript((_injected) => {
        window.e2e = _injected
      }, injected)

      const anvilProvider = createTestClient({
        mode: 'anvil',
        chain,
        transport: http(rpc),
      })

      const setBalance = async (balances: TokenBalances) => {
        for (const [address, balance] of Object.entries(balances)) {
          await setERC20Balance(
            account.address,
            address as Address,
            parseEther(balance),
            anvilProvider,
            publicClient
          )
        }
      }

      await use({ account, publicClient, walletClient, fork, setBalance })

      await fork.stop()
    },
  })

export default base
