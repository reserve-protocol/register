import type { Hex } from 'viem'
import { loadSnapshot } from '../helpers/snapshots'
import { YIELD_REGISTRY } from '../helpers/registry'
import type { MockOverrides } from '../helpers/overrides'

interface TokenListReplay {
  op: string
  variables: { tokenIds: string[] }
  data: {
    tokens: {
      id: string
      symbol: string
      rToken: {
        contracts: { id: string }[]
        rewardToken: { token: { symbol: string } }
      }
    }[]
    tokenDailySnapshots: { token: { id: string } }[]
  }
}

export function seedYieldEarn(overrides: MockOverrides, onlyChain?: number) {
  const selectedSymbols: string[] = []
  const discovery = loadSnapshot<{ address: string; status: string }[]>(
    'shared/discover-dtfs.json'
  )
  const mainnet = YIELD_REGISTRY.find((item) => item.chainId === 1)!
  const prices = loadSnapshot<Record<string, Hex>>(
    `${mainnet.snapshotDir}/rtoken-chain-state.json`
  )
  const rsrFeed = '0x759bbc1be8f90ee6457c44abc7d443842a976d02'
  overrides.ethCall(rsrFeed, '0xfeaf968c', prices[`${rsrFeed}:0xfeaf968c`])
  for (const fixture of YIELD_REGISTRY) {
    const entry = loadSnapshot<TokenListReplay[]>(
      `${fixture.snapshotDir}/yield-graph.json`
    ).find((item) => item.op === 'GetTokenListOverview')!
    const selected = entry.data.tokens.filter(
      (token) =>
        (token.id.toLowerCase() === fixture.address.toLowerCase() ||
          (fixture.chainId === 8453 && token.symbol === 'bsdETH')) &&
        (onlyChain === undefined || fixture.chainId === onlyChain)
    )
    for (const token of selected) {
      if (
        discovery.some(
          (item) =>
            item.address.toLowerCase() === token.id && item.status === 'active'
        )
      )
        selectedSymbols.push(token.rToken.rewardToken.token.symbol)
      const basket = token.rToken.contracts[0].id.toLowerCase()
      const rpc = loadSnapshot<Record<string, Hex>>(
        `${fixture.snapshotDir}/rtoken-chain-state.json`
      )
      const result = rpc[`${basket}:0xe45a5b2d`]
      if (!result || result === '0x')
        throw new Error('Missing recorded basket status')
      overrides.ethCall(basket, '0xe45a5b2d', result)
    }
    overrides.subgraph(
      {
        operationName: entry.op,
        chain: fixture.chainId,
        variables: { tokenIds: entry.variables.tokenIds },
      },
      {
        ...entry.data,
        tokens: selected,
        tokenDailySnapshots: entry.data.tokenDailySnapshots.filter((snapshot) =>
          selected.some((token) => token.id === snapshot.token.id)
        ),
      }
    )
  }
  return selectedSymbols
}
