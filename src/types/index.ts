import { Address, Hex } from 'viem'

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
  | 'USDM'
  | 'PXETH'
  | 'AERODROME'

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
  symbol?: string
  hash: string
  chain?: number
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
  logoURI?: string
  price?: number
}

export interface Collateral extends Token {
  protocol: ProtocolKey
  displayName?: string
}

export interface ReserveToken extends Token {
  logo: string
  collaterals: Collateral[]
  stToken?: Token
  main?: Address
  mandate?: string
  listed?: boolean
  supply?: number
  basketsNeeded?: number
  targetUnits?: string
  chainId: number
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
  chain: number
}

export interface AccountPosition {
  name: string
  symbol: string
  balance: number
  exchangeRate: number
  rsrAmount: number
  usdAmount: number
  chain: number
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
  calldatas: `0x${string}`[]
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
  network_id: number
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

export type Trader = 'backingManager' | 'rsrTrader' | 'rTokenTrader'

export type IndexDTF = {
  id: Address
  proxyAdmin: Address
  timestamp: number
  chainId: number
  deployer: Address
  ownerAddress: Address
  mintingFee: number
  tvlFee: number
  annualizedTvlFee: number
  mandate: string
  auctionDelay: number
  auctionLength: number
  auctionApprovers: Address[]
  auctionLaunchers: Address[]
  brandManagers: Address[]
  feeRecipients: {
    address: Address
    percentage: string
  }[]
  ownerGovernance?: {
    id: Address
    votingDelay: number
    votingPeriod: number
    proposalThreshold: number
    quorumNumerator: number
    timelock: {
      id: Address
      guardians: Address[]
      executionDelay: number
    }
  }
  tradingGovernance?: {
    id: Address
    votingDelay: number
    votingPeriod: number
    proposalThreshold: number
    quorumNumerator: number
    timelock: {
      id: Address
      guardians: Address[]
      executionDelay: number
    }
  }
  token: {
    id: Address
    name: string
    symbol: string
    decimals: number
    totalSupply: string
  }
  stToken?: {
    id: Address
    token: {
      name: string
      symbol: string
      decimals: number
      totalSupply: string
    }
    underlying: {
      name: string
      symbol: string
      address: Address
      decimals: number
    }
    governance?: {
      id: Address
      votingDelay: number
      votingPeriod: number
      proposalThreshold: number
      quorumNumerator: number
      timelock: {
        id: Address
        guardians: Address[]
        executionDelay: number
      }
    }
    rewardTokens: Token[]
  }
  totalRevenue: number
  protocolRevenue: number
  governanceRevenue: number
  externalRevenue: number
}

export type IndexAuction = {
  sell: Address
  buy: Address
  sellLimit: {
    spot: bigint
    low: bigint
    high: bigint
  }
  buyLimit: {
    spot: bigint
    low: bigint
    high: bigint
  }
  prices: {
    start: bigint
    end: bigint
  }
  ttl: bigint
}

export type DecodedCalldata = {
  signature: string
  parameters: string[]
  callData: Hex
  data: unknown[]
}
