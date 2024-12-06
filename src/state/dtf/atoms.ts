import { Token } from '@/types'
import { AvailableChain } from '@/utils/chains'
import { atom } from 'jotai'
import { Address } from 'viem'

// TODO: placeholders
interface FToken extends Token {
  chain: AvailableChain
}

interface FTokenBasket {
  tokens: Token[]
  weights: bigint[]
}

interface FTokenMeta {
  description: string
  tags: string[]
  logo: string
  website: string
  telegram: string
  twitter: string
  deployerNote: string
}

interface FTokenConfiguration {
  fee: number
  IsManaged: boolean
}

interface FTokenGovernance {
  address: Address
  deployer: Address
}

export const fTokenAddressAtom = atom<Address | null>(null)

export const fTokenAtom = atom<null | FToken>(null)

export const fTokenBasketAtom = atom<null | FTokenBasket>(null)

export const fTokenMetaAtom = atom<null | FTokenMeta>(null)

export const fTokenConfigurationAtom = atom<null | FTokenConfiguration>(null)

export const fTokenGovernanceAtom = atom<null | FTokenGovernance>(null)
