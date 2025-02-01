import { IndexDTF, Token } from '@/types'
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

export const iTokenAddressAtom = atom<Address | undefined>(undefined)

export const iTokenBasketAtom = atom<ITokenBasket | undefined>(undefined)

export const iTokenMetaAtom = atom<ITokenMeta | undefined>(undefined)

export const iTokenConfigurationAtom = atom<ITokenConfiguration | undefined>(
  undefined
)

export const iTokenGovernanceAtom = atom<ITokenGovernance | undefined>(
  undefined
)

// Final atoms
export const indexDTFBasketAtom = atom<Token[] | undefined>(undefined)

export const indexDTFBasketPricesAtom = atom<Record<string, number>>({})

export const indexDTFBasketAmountsAtom = atom<Record<string, number>>({})

export const indexDTFBasketSharesAtom = atom<Record<string, string>>({})

export const indexDTFAtom = atom<IndexDTF | undefined>(undefined)

export const indexDTFFeeAtom = atom<number | undefined>(undefined)

export const indexDTFPriceAtom = atom((get) => {
  const dtf = get(indexDTFAtom)
  const basketPrices = get(indexDTFBasketPricesAtom)

  if (!dtf || !basketPrices) return undefined

  return basketPrices[dtf.token.id.toLowerCase()]
})
