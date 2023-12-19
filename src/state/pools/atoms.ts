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
  underlyingTokens: { address: string; symbol: string; logo: string }[]
  rewardTokens: string[]
  url: string
}

export interface RTokenPoolsMap {
  [x: string]: {
    minApy: number
    maxApy: number
    pools: Pool[]
  }
}

export const ALL_LISTED_RTOKEN_ADDRESSES = new Set(
  Object.values(LISTED_RTOKEN_ADDRESSES).reduce((acc, curr) => [
    ...acc,
    ...curr,
  ])
)

export const poolsAtom = atom<Pool[]>([])

export const rTokenPoolsAtom = atom<RTokenPoolsMap>((get) => {
  const pools = get(poolsAtom)

  if (!pools.length) {
    return {}
  }

  return pools.reduce((rTokenPools, pool) => {
    for (const token of pool.underlyingTokens) {
      if (
        ALL_LISTED_RTOKEN_ADDRESSES.has(token.address.toLowerCase()) ||
        BRIDGE_RTOKEN_MAP[token.address]
      ) {
        const address = BRIDGE_RTOKEN_MAP[token.address] || token.address

        if (rTokenPools[address]) {
          rTokenPools[address].pools.push(pool)
          rTokenPools[address].minApy = Math.min(
            rTokenPools[address].minApy,
            pool.apy
          )
          rTokenPools[address].maxApy = Math.max(
            rTokenPools[address].maxApy,
            pool.apy
          )
        } else {
          rTokenPools[address] = {
            minApy: pool.apy,
            maxApy: pool.apy,
            pools: [pool],
          }
        }
      }
    }

    return rTokenPools
  }, {} as RTokenPoolsMap)
})
