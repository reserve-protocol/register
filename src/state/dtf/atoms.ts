import { Token } from '@/types'
import { AvailableChain } from '@/utils/chains'
import { atom } from 'jotai'
import { Address } from 'viem'

// TODO: placeholders
export interface IToken extends Token {
  chain: AvailableChain
}

export interface ITokenBasket {
  tokens: Token[]
  weights: bigint[]
  percents: string[]
}

export interface ITokenMeta {
  description: string
  tags: string[]
  logo: string
  website: string
  telegram: string
  twitter: string
  deployerNote: string
}

export interface ITokenConfiguration {
  fee: number
  IsManaged: boolean
}

export interface ITokenGovernance {
  address: Address
  deployer: Address
  token: Token
}

export const iTokenAddressAtom = atom<Address | null>(null)

export const iTokenAtom = atom<null | IToken>(null)

export const iTokenBasketAtom = atom<null | ITokenBasket>(null)

export const iTokenMetaAtom = atom<null | ITokenMeta>(null)

export const iTokenConfigurationAtom = atom<null | ITokenConfiguration>(null)

export const iTokenGovernanceAtom = atom<null | ITokenGovernance>(null)
