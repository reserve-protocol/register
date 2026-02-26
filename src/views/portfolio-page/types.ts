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
  decimals: number
  amount: string
  value: number
  performance7d: number | null
  price: number
  marketCap: number
  mintAPY?: number | null
  averageCost: number | null
  unrealizedPnL: number | null
}

export interface PortfolioYieldDTF {
  address: Address
  chainId: number
  name: string
  symbol: string
  decimals: number
  amount: string
  value: number
  performance7d: number | null
  mintAPY: number | null
  price: number
  marketCap: number
  averageCost: number | null
  unrealizedPnL: number | null
}

export interface PortfolioPendingWithdrawal {
  endId: number
  amount: string
  availableAt: number
  delay: number
  value: number
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
  rsrAmount: string
  votingWeight: number
  pendingWithdrawals: PortfolioPendingWithdrawal[]
}

export interface PortfolioVoteLock {
  stTokenAddress: Address
  chainId: number
  name: string
  symbol: string
  underlying: { address: Address; symbol: string; name: string }
  dtfs: { address: Address; name: string; symbol: string }[]
  apy: number
  amount: string
  value: number
  votingPower: string
  delegation?: Address
  rewards: PortfolioReward[]
  locks: {
    lockId: string
    amount: string
    unlockTime: number
    delay: number
    value: number
  }[]
  votingWeight: number
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
  decimals: number
  amount: string
  value: number
}

export interface PortfolioRSRBalance {
  chainId: number
  amount: string
  value: number
  price: number
  performance7d: number | null
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
