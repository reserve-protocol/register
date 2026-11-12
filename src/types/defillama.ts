// DefiLlama pool as served by reserve-api GET /v1/yields/pools.
export interface DefiLlamaPool {
  pool: string
  symbol: string
  project: string
  chain: string
  apy: number
  apyBase: number
  apyReward: number | null
  apyMean30d: number | null
  stablecoin?: boolean
  tvlUsd: number
  poolMeta: string | null
  underlyingTokens: string[] | null
  rewardTokens?: string[] | null
  url?: string
}
