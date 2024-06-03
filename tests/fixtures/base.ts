import { test } from '@playwright/test'
import {
  Account,
  Address,
  PublicClient,
  WalletClient,
  createPublicClient,
  createWalletClient,
  http,
} from 'viem'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { Anvil, createAnvil } from '../anvil'

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

      await use({ account, publicClient, walletClient, fork })

      await fork.stop()
    },
  })

export default base
