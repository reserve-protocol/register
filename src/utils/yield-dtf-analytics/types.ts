import { Address } from 'viem'

// Re-export shared types
export type {
  ExportProgress,
  ProgressCallback,
  CSVHeader,
} from '../dtf-analytics/types'

// Input types from reserve subgraph
export interface YieldTokenDailySnapshot {
  timestamp: string // BigInt string from subgraph
  dailyTotalSupply: string // BigInt D18
  dailyMintAmount: string // BigInt D18
  dailyBurnAmount: string // BigInt D18
  cumulativeUniqueUsers: number
  priceUSD: string // BigDecimal string e.g. "1.23"
  basketRate: string // BigDecimal string
}

export interface YieldRTokenDailySnapshot {
  timestamp: string // BigInt string from subgraph
  rsrStaked: string // BigInt D18
  rsrExchangeRate: string // BigDecimal string
  rsrPrice: string // BigDecimal string
}

// Input DTF info
export interface YieldDTFInput {
  address: Address
  symbol: string
  name: string
  chainId: number
}

// Output type for monthly metrics
export interface YieldDTFMonthlyMetrics {
  symbol: string
  name: string
  chainId: number
  chainName: string
  month: number
  year: number
  monthKey: string

  // Month-end values
  totalSupply: number
  price: number
  marketCap: number
  holderCount: number

  // Monthly sums
  monthlyMinted: number
  monthlyBurned: number
  holderRevenueUsd: number
  stakerRevenueUsd: number
  totalRevenueUsd: number

  // RSR staking (month-end)
  rsrStaked: number
  rsrStakedUsd: number
  rsrExchangeRate: number
  rsrPrice: number

  // Cumulative running totals
  cumulativeMinted: number
  cumulativeBurned: number
  cumulativeHolderRevenueUsd: number
  cumulativeStakerRevenueUsd: number
  cumulativeTotalRevenueUsd: number
}
