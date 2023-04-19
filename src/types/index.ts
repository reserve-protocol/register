import { BigNumber } from '@ethersproject/bignumber'
import { Interface } from '@ethersproject/abi'
import { Contract, ContractTransaction } from '@ethersproject/contracts'

export type RoleKey =
  | 'owners'
  | 'pausers'
  | 'freezers'
  | 'longFreezers'
  | 'guardians'

export type AddressMap = { [chainId: number]: string }

export interface StringMap {
  [key: string]: any
}

export interface BalanceMap {
  [key: string]: {
    value: BigNumber
    decimals: number
    balance: string
  }
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

export interface ContractCall {
  abi: Interface
  address: string
  method: string
  args: any[]
}

export interface TransactionState {
  id: string // uuid generated
  description: string
  status: string
  value: string
  call: {
    abi: string
    address: string
    method: string
    args: any[]
  }
  hash?: string
  error?: string
  confirmedAt?: number
  extra?: { [x: string]: string }
  // timestamps
  createdAt?: number // timestamp UTC
  updatedAt?: number // timestamp UTC
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
export interface RawCall {
  address: string
  data: string
}

export type Awaited<T> = T extends PromiseLike<infer U> ? U : T

export type Params<
  T extends TypedContract,
  FN extends ContractFunctionNames<T> | ContractMethodNames<T>
> = Parameters<T['functions'][FN]>

export type RawCallResult =
  | {
      value: string
      success: boolean
    }
  | undefined

export type MulticallState = {
  [address: string]:
    | {
        [data: string]: RawCallResult
      }
    | undefined
}

export type Falsy = undefined | false | '' | null

export type TypedContract = Contract & {
  functions: Record<string, (...args: any[]) => any>
}

export type ContractFunctionNames<T extends TypedContract> = keyof {
  [P in keyof T['functions'] as ReturnType<
    T['functions'][P]
  > extends Promise<ContractTransaction>
    ? P
    : never]: void
} &
  string

export type ContractMethodNames<T extends TypedContract> = keyof {
  [P in keyof T['functions'] as ReturnType<T['functions'][P]> extends Promise<
    any[]
  >
    ? P
    : never]: void
} &
  string

// Generic token definition ERC20 + extra data
export interface Token {
  address: string
  symbol: string
  name: string
  decimals: number
  logo?: string
}

export interface BigNumberMap {
  [x: string]: BigNumber
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

/**
 * ReserveToken
 *
 * This interface represents a complete RToken ecosystem
 */
export interface ReserveToken extends Token {
  collaterals: Token[] // current basket collateral list
  stToken?: Token // staking RSR token
  main?: string // main contract address
  isRSV?: boolean // only for RSV
  logo?: string // rToken logo
  unlisted?: boolean // Mark if the token is not listed
  mandate?: string
  meta?: RTokenMeta
  redemptionAvailable?: number
  issuanceAvailable?: number
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
