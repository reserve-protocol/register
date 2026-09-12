import { loadSnapshot } from '../../../../../e2e/helpers/snapshots'
import { REGISTRY, YIELD_REGISTRY } from '../../../../../e2e/helpers/registry'
import type { MockOverrides } from '../../../../../e2e/helpers/overrides'
import type { VoteLockPosition } from '../../../../../src/views/earn/views/index-dtf/hooks/use-vote-lock-positions'
import { readFileSync } from 'node:fs'
import type { Hex } from 'viem'

const daos: VoteLockPosition[] = JSON.parse(
  readFileSync(new URL('../daos.json', import.meta.url), 'utf8')
)

export const sourceDaos: VoteLockPosition[] = daos.filter(
  (row) =>
    ['vlSQUILL-OPEN', 'vlRSR-LCAP', 'vlRSR-CMCindex'].includes(
      row.token.symbol
    ) ||
    (row.chainId === 56 && row.token.symbol === 'vlRSR')
)

interface TokenListReplay {
  op: string
  variables: { tokenIds?: string[] }
  data: {
    tokens: {
      id: string
      symbol: string
      rToken: { contracts: { id: string }[] }
    }[]
    tokenDailySnapshots: { token: { id: string } }[]
  }
}

export function seedEarnSource(overrides: MockOverrides) {
  overrides.api({ pathname: '/dtf/daos' }, sourceDaos)
  for (const fixture of YIELD_REGISTRY) {
    const entry = loadSnapshot<TokenListReplay[]>(
      `${fixture.snapshotDir}/yield-graph.json`
    ).find((item) => item.op === 'GetTokenListOverview')!
    const selected = entry.data.tokens.find(
      (token) => token.id.toLowerCase() === fixture.address.toLowerCase()
    )!
    const basket = selected.rToken.contracts[0].id.toLowerCase()
    const rpc = loadSnapshot<Record<string, Hex>>(
      `${fixture.snapshotDir}/rtoken-chain-state.json`
    )
    overrides.ethCall(basket, '0xe45a5b2d', rpc[`${basket}:0xe45a5b2d`])
    overrides.subgraph(
      {
        operationName: entry.op,
        chain: fixture.chainId,
        variables: { tokenIds: entry.variables.tokenIds },
      },
      {
        ...entry.data,
        tokens: entry.data.tokens.filter(
          (token) => token.id.toLowerCase() === fixture.address.toLowerCase()
        ),
        tokenDailySnapshots: entry.data.tokenDailySnapshots.filter(
          (snapshot) =>
            snapshot.token.id.toLowerCase() === fixture.address.toLowerCase()
        ),
      }
    )
  }
}

export const sourceLcap = sourceDaos.find(
  (row) => row.token.symbol === 'vlRSR-LCAP'
)!
export const lcapFixture = REGISTRY.find((row) => row.slug === 'lcap')!
