import { BigNumber } from '@ethersproject/bignumber'
import { Interface } from '@ethersproject/abi'
import { Contract, ContractTransaction } from '@ethersproject/contracts'
import { TransactionReceipt } from '@ethersproject/providers'

export interface StringMap {
  [key: string]: any
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
  call: ContractCall
  hash?: string
  receipt?: TransactionReceipt
  requiredAllowance?: [string, BigNumber][]
  // timestamps
  createdAt?: string // timestamp UTC
  updatedAt?: string // timestamp UTC
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
  transfersCount?: number
  holdersCount?: number
  supply?: number
  logo?: string
}

export interface Collateral {
  // collateral contract id
  id: string
  // static asset index when consulting the basket weights
  index: number
  // ERC20 token used as collateral
  token: Token
}

// Token collateral basket
export interface Basket {
  id: string // Basket contract address
  collaterals: Collateral[]
}

export interface BigNumberMap {
  [x: string]: BigNumber
}

/**
 * ReserveToken
 *
 * This interface represents a complete RToken ecosystem
 */
export interface ReserveToken {
  id: string // RToken `Main` contract address
  token: Token // ERC20 stable coin
  basket: Basket
  facade?: string
  basketHandler?: string
  // If insurance is null, Staking is not enabled
  insurance?: {
    // amount of staked RSR
    staked: number
    // stToken or also called stRSR, ERC20 token specific for this RToken
    token: Token
  }
  isRSV?: boolean
}
