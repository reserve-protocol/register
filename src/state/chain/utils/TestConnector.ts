import { createWalletClient, http, type Chain, type Address } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { MockConnector } from 'wagmi/connectors/mock'

export default class TestConnector extends MockConnector {
  constructor({
    privateKey,
    rpc,
    chainId,
    chains,
  }: {
    privateKey: Address
    rpc: string
    chainId: number
    chains: Chain[]
  }) {
    const account = privateKeyToAccount(privateKey)
    super({
      chains,
      options: {
        chainId,
        flags: { isAuthorized: true },
        walletClient: createWalletClient({
          account,
          chain: chains[0],
          transport: http(rpc),
        }),
      },
    })
  }
}
