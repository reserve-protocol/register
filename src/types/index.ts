export interface StringMap {
  [key: string]: any
}

export type Falsy = undefined | false | '' | null

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
  id: string
  index: number
  token: Token
}

export interface Vault {
  id: string
  collaterals: Collateral[]
}

export interface ReserveToken {
  id: string
  token: Token
  stToken: Token
  vault: Vault
  // If insurance is null, Staking is not enabled
  insurance?: {
    staked: number
  }
}
