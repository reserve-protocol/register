import { Address } from 'viem'

export type RoleKey =
  | 'owners'
  | 'pausers'
  | 'freezers'
  | 'longFreezers'
  | 'guardians'

export type AddressMap = { [chainId: number]: Address }

export interface StringMap {
  [key: string]: any
}

export interface BalanceMap {
  [key: string]: {
    value: bigint
    decimals: number
    balance: string
  }
}

export interface Allowance {
  token: Address
  spender: Address
  amount: bigint
  symbol: string
  decimals: number
}

export interface Proposal {
  id: string
  description: string
  creationTime: string
  state: string
  calldatas: string
  targets: string
  proposer: string
}

export interface WalletTransaction {
  [x: string]: TransactionState[]
}

export interface TransactionMap {
  [x: string]: WalletTransaction
}

export interface TransactionRecord {
  type: string
  amount?: number
  amountUSD: number | string
  timestamp: number
  hash?: string
}

export interface Wallet {
  address: string
  alias: string
}

// Generic token definition ERC20 + extra data
export interface Token {
  address: Address
  symbol: string
  name: string
  decimals: number
}

export interface BigNumberMap {
  [x: string | Address]: bigint
}

export interface RTokenMeta {
  address: string
  name: string
  symbol: string
  decimals: number
  logo?: string
  about?: string
  website?: string
  governance?: {
    voting?: string
    discussion?: string
  }
  support?: {
    email?: string
    url?: string
  }
  social?: {
    blog?: string
    chat?: string
    facebook?: string
    forum?: string
    github?: string
    gitter?: string
    instagram?: string
    linkedin?: string
    reddit?: string
    slack?: string
    telegram?: string
    twitter?: string
    youtube?: string
  }
}

export interface AccountToken {
  address: string
  name: string
  symbol: string
  usdPrice: number
  balance: number
  usdAmount: number
  apy: number
}

export interface AccountPosition {
  name: string
  symbol: string
  balance: number
  apy: number
  exchangeRate: number
  rsrAmount: number
  usdAmount: number
}

export interface TokenStats {
  staked: number
  stakedUsd: string
  supply: number
  supplyUsd: string
  cumulativeVolume: number
  cumulativeVolumeUsd: string
  transferCount: number
  dailyTransferCount: number
  dailyVolume: string
}

export interface CollateralPlugin {
  symbol: string // collateral symbol
  address: string // collateral plugin address
  decimals: number // 6-18
  targetUnit: string // USD / EUR / etc
  referenceUnit: string // Underlay ERC20 (USDC)
  collateralToken: string // Wrapper token (usually yield token)
  collateralAddress: string
  depositContract?: string // Only for aave collaterals erc20() contract from collateral
  description: string // Small description
  rewardToken: string[] // yield token aave / compound wrapped Asset
  custom?: boolean
  underlyingToken?: string
  collateralDecimals?: number // Decimals of exogenous collateral deposited in wrapper e.g. aUSDC
}
