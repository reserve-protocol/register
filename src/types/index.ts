export interface StringMap {
  [key: string]: any
}

export type Falsy = undefined | false | '' | null

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
