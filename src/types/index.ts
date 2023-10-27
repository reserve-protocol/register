import { Address } from 'viem'

export type RoleKey =
  | 'owners'
  | 'pausers'
  | 'freezers'
  | 'longFreezers'
  | 'guardians'

export type ProtocolKey =
  | 'AAVE'
  | 'AAVEv3'
  | 'MORPHO'
  | 'COMP'
  | 'FLUX'
  | 'COMPv3'
  | 'CONVEX'
  | 'CURVE'
  | 'SDR'
  | 'STARGATE'
  | 'GENERIC'

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

export interface ReserveToken extends Token {
  logo: string
  collaterals: Token[]
  stToken?: Token
  main?: Address
  mandate?: string
  listed?: boolean
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
  address: Address // collateral plugin address
  erc20: Address // erc20 contract address for asset
  decimals: number // 6-18
  targetName: string // USD / EUR / etc
  rewardTokens: Address[] // yield token aave / compound wrapped Asset
  underlyingToken?: string
  underlyingAddress?: Address
  collateralToken?: string // Yield bearing token for aave
  collateralAddress?: Address
  protocol: ProtocolKey
  version: string
  custom?: boolean
  maxTradeVolume: string
  oracleTimeout: number
  chainlinkFeed: Address
  delayUntilDefault: string
}

export interface ProposalEvent {
  id?: bigint
  proposalId?: bigint
  proposer: string
  startBlock: bigint
  endBlock: bigint
  description: string
  targets: string[]
  values: bigint[]
  calldatas: string[]
}
export interface SimulationConfig {
  targets: Address[]
  values: bigint[]
  calldatas: string[]
  description: string
}

// --- Tenderly types, Request ---
// Response from tenderly endpoint that encodes state data
export type StorageEncodingResponse = {
  stateOverrides: {
    // these keys are the contract addresses, all lower case
    [key: string]: {
      value: {
        // these are the slot numbers, as 32 byte hex strings
        [key: string]: string
      }
    }
  }
}

type StateObject = {
  balance?: string
  code?: string
  storage?: Record<string, string>
}

export type TenderlyPayload = {
  network_id: '1' | '3' | '4' | '5' | '42'
  block_number?: number
  transaction_index?: number
  from: string
  to: string
  input: string
  gas: number
  gas_price?: string
  value?: string
  simulation_type?: 'full' | 'quick'
  save?: boolean
  save_if_fails?: boolean
  state_objects?: Record<string, StateObject>
  block_header?: {
    number?: string
    timestamp?: string
  }
  generate_access_list?: boolean
}

interface GeneratedAccessList {
  address: string
  storage_keys: string[]
}

export interface TenderlySimulation {
  transaction: any
  simulation: any
  contracts: any[]
  generated_access_list: GeneratedAccessList[]
}
