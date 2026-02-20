import { Address } from 'viem'

// Current portfolio response
export interface PortfolioResponse {
  totalHoldingsUSD: number
  indexDTFs: PortfolioIndexDTF[]
  yieldDTFs: PortfolioYieldDTF[]
  stakedRSR: PortfolioStakedRSR[]
  voteLocks: PortfolioVoteLock[]
  rsrBalances: PortfolioRSRBalance[]
}

export interface PortfolioIndexDTF {
  address: Address
  chainId: number
  name: string
  symbol: string
  logo?: string
  balance: number
  value: number
  performance7d: number
}

export interface PortfolioYieldDTF {
  address: Address
  chainId: number
  name: string
  symbol: string
  logo?: string
  balance: number
  value: number
  performance7d: number
}

export interface PortfolioStakedRSR {
  stTokenAddress: Address
  chainId: number
  dtfName: string
  dtfAddress: Address
  dtfSymbol: string
  dtfLogo?: string
  apy: number
  balance: number
  valueUSD: number
  valueRSR: number
  activeProposals: PortfolioProposal[]
}

export interface PortfolioVoteLock {
  stTokenAddress: Address
  chainId: number
  stTokenSymbol: string
  stTokenName: string
  stTokenLogo?: string
  dtfs: { address: Address; name: string; symbol: string; chainId: number }[]
  apy: number
  balance: number
  value: number
  votingPower: number
  voteWeight: number
  delegation?: Address
  rewards: PortfolioReward[]
  locks: { lockId: bigint; amount: number; unlockTime: number }[]
  activeProposals: PortfolioProposal[]
}

export interface PortfolioProposal {
  id: string
  dtfName: string
  dtfSymbol: string
  dtfAddress: Address
  dtfLogo?: string
  chainId: number
  description: string
  state: string
  forVotes: number
  againstVotes: number
  abstainVotes: number
  creationTime: number
  // Route info for navigation
  isIndexDTF: boolean
}

export interface PortfolioReward {
  address: Address
  chainId: number
  symbol: string
  name: string
  logo?: string
  balance: number
  value: number
  stTokenAddress: Address
}

export interface PortfolioRSRBalance {
  chainId: number
  balance: number
  value: number
  performance7d: number
}

// Historical portfolio response
export interface HistoricalPortfolioResponse {
  timeseries: HistoricalDataPoint[]
}

export interface HistoricalDataPoint {
  timestamp: number
  totalHoldingsUSD: number
}

export type PortfolioPeriod = '24h' | '7d' | '1m' | '3m' | '6m' | 'All'
