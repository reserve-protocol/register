// Raw pool response shape from https://yields.llama.fi/pools and /poolsEnriched.
// Only covers the fields we consume; the API returns more.
export interface DefiLlamaPool {
  pool: string
  symbol: string
  project: string
  chain: string
  apy: number
  apyBase: number
  apyReward: number | null
  stablecoin?: boolean
  tvlUsd: number
  poolMeta: string | null
  underlyingTokens: string[]
  rewardTokens?: string[]
  url?: string
}
