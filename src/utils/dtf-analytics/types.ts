import { Address } from 'viem'

// Input types from subgraph
export interface TokenDailySnapshot {
  id: string
  timestamp: number
  dailyTotalSupply: string // BigInt
  dailyMintAmount: string // BigInt
  dailyMintCount: number
  dailyBurnAmount: string // BigInt
  dailyRevenue: string // BigInt
  dailyProtocolRevenue: string // BigInt
  dailyGovernanceRevenue: string // BigInt
  dailyExternalRevenue: string // BigInt
  currentHolderCount: number
  blockNumber: number
}

export interface DTFMetadata {
  id: Address
  mintingFee: string // BigInt D18
  tvlFee: string // BigInt D18
  annualizedTvlFee: string // BigInt D18
  timestamp: number // deployment timestamp
  stToken?: {
    id: Address
    token: {
      totalSupply: string
      symbol: string
    }
    underlying: {
      address: Address
      symbol: string
      decimals: number
    }
  }
}

// Price data types
export interface DailyPrice {
  timestamp: number
  price: number
}

export interface PriceMap {
  [dateKey: string]: number // YYYY-MM-DD -> price
}

// Input DTF info (from useIndexDTFList)
export interface DTFInput {
  address: Address
  symbol: string
  name: string
  chainId: number
}

// Output type for monthly metrics
export interface DTFMonthlyMetrics {
  dtfAddress: string
  dtfSymbol: string
  dtfName: string
  chainId: number
  chainName: string
  month: number // 1-12
  year: number
  monthKey: string // YYYY-MM for sorting

  // Supply & TVL (month-end values)
  totalSupply: number
  marketCapUsd: number
  tokensLocked: number
  tokensLockedUsd: number
  cumulativeTokensLocked: number
  cumulativeTokensLockedUsd: number
  tvlUsd: number // marketCap + tokensLockedUsd

  // Revenue (summed from daily)
  totalRevenue: number
  totalRevenueUsd: number
  tvlFeeRevenue: number // Derived
  tvlFeeRevenueUsd: number
  mintingFeeRevenue: number // Derived
  mintingFeeRevenueUsd: number

  // Minting (summed from daily)
  monthlyMinted: number
  monthlyMintedUsd: number

  // Revenue Distribution (summed from daily)
  governanceRevenue: number
  governanceRevenueUsd: number
  externalRevenue: number
  externalRevenueUsd: number
  protocolRevenue: number
  protocolRevenueUsd: number
  estRsrBurnAmount: number

  // Stats (month-end value)
  holderCount: number

  // Prices used (month-end or average)
  dtfPrice: number
  rsrPrice: number
  voteLockPrice: number

  // Cumulative values (running totals from inception to this month)
  cumulativeRevenue: number
  cumulativeRevenueUsd: number
  cumulativeMinted: number
  cumulativeMintedUsd: number
  cumulativeGovernanceRevenue: number
  cumulativeGovernanceRevenueUsd: number
  cumulativeExternalRevenue: number
  cumulativeExternalRevenueUsd: number
  cumulativeProtocolRevenue: number
  cumulativeProtocolRevenueUsd: number
  cumulativeEstRsrBurnAmount: number
}

// Progress callback for UI
export interface ExportProgress {
  current: number
  total: number
  currentDtf?: string
  phase?: 'fetching' | 'calculating' | 'generating'
}

export type ProgressCallback = (progress: ExportProgress) => void

// CSV headers configuration
export interface CSVHeader {
  key: keyof DTFMonthlyMetrics | string
  label: string
}
