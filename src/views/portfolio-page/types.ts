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
  address: Address
  stRSRAddress: Address
  name: string
  symbol: string
  chainId: number
  amount: string
  value: number
  performance7d: number | null
  apy: number | null
  votingPower: string
  delegate: Address | null
  activeProposals: PortfolioStakedProposal[]
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
  activeProposals: PortfolioStakedProposal[]
}

// Raw proposal from API (nested in stakedRSR / voteLocks)
export interface PortfolioStakedProposal {
  id: string
  description: string
  state: string
  proposer: string
  creationTime: string
  voteStart: string
  voteEnd: string
  quorumVotes: string
  forWeightedVotes: string
  againstWeightedVotes: string
  abstainWeightedVotes: string
  totalWeightedVotes: string
  queueTime: string | null
  executionETA: string | null
}

// Enriched proposal for display (parent DTF info injected)
export interface PortfolioProposal extends PortfolioStakedProposal {
  dtfName: string
  dtfSymbol: string
  dtfAddress: Address
  chainId: number
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
