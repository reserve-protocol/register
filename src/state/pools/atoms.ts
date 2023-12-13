import { atom } from 'jotai'
import { atomWithLoadable } from 'utils/atoms/utils'

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

type PoolMap = Record<string, string>

export const poolsAtom = atom<Pool[]>([])

const DEFILLAMA_ENDPOINT = 'https://yields.llama.fi/poolsEnriched?pool='

// export const poolsUrlsAtom = atomWithLoadable(async (get) => {
//   const pools = get(poolsAtom)
//   const mapping: PoolMap = {}

//   const results = await Promise.all(
//     pools.map((pool) =>
//       fetch(`${DEFILLAMA_ENDPOINT}${pool.id}`).then((res) => res.json())
//     )
//   )

//   console.log('results', results)

//   return mapping
// })
