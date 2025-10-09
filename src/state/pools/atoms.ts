import { atom } from 'jotai'
import { BRIDGE_RTOKEN_MAP, LISTED_RTOKEN_ADDRESSES } from 'utils/constants'

export interface Pool {
  id: string
  symbol: string
  apy: number
  apyBase: number
  apyReward: number
  stablecoin: boolean
  project: string
  chain: string
  tvlUsd: number
  underlyingTokens: { address: string; symbol: string; logo: string; chain?: number }[]
  rewardTokens: string[]
  url: string
  defillamaId?: string
}

export interface DTFPoolsMap {
  [x: string]: {
    minApy: number
    maxApy: number
    pools: Pool[]
  }
}

export const ALL_LISTED_DTF_ADDRESSES = new Set(
  Object.values(LISTED_RTOKEN_ADDRESSES).reduce((acc, curr) => [
    ...acc,
    ...curr,
  ])
)

export const poolsAtom = atom<Pool[]>([])

export const dtfPoolsAtom = atom<DTFPoolsMap>((get) => {
  const pools = get(poolsAtom)

  if (!pools.length) {
    return {}
  }

  return pools.reduce((dtfPools, pool) => {
    for (const token of pool.underlyingTokens) {
      if (
        ALL_LISTED_DTF_ADDRESSES.has(token.address.toLowerCase()) ||
        BRIDGE_RTOKEN_MAP[token.address]
      ) {
        const address = BRIDGE_RTOKEN_MAP[token.address] || token.address

        if (dtfPools[address]) {
          dtfPools[address].pools.push(pool)
          dtfPools[address].minApy = Math.min(
            dtfPools[address].minApy,
            pool.apy
          )
          dtfPools[address].maxApy = Math.max(
            dtfPools[address].maxApy,
            pool.apy
          )
        } else {
          dtfPools[address] = {
            minApy: pool.apy,
            maxApy: pool.apy,
            pools: [pool],
          }
        }
      }
    }

    return dtfPools
  }, {} as DTFPoolsMap)
})
