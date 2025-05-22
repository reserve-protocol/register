import { IndexDTF, Token } from '@/types'
import { AvailableChain, ChainId } from '@/utils/chains'
import { atom } from 'jotai'
import { Address } from 'viem'
import { walletAtom } from '../atoms'
import { UNIVERSAL_ASSETS, WORMHOLE_ASSETS } from '@/utils/constants'

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

export interface IndexDTFBrand {
  dtf: {
    icon: string
    cover: string
    mobileCover: string
    description: string
    notesFromCreator: string
    prospectus: string
    tags: string[]
    basketType: 'percentage-based' | 'unit-based'
  }
  creator: {
    name: string
    icon: string
    link: string
  }
  curator: {
    name: string
    icon: string
    link: string
  }
  socials: {
    twitter: string
    telegram: string
    discord: string
    website: string
  }
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

export const indexDTFBrandAtom = atom<IndexDTFBrand | undefined>(undefined)

export const indexDTFFeeAtom = atom<number | undefined>(undefined)

export const indexDTFPriceAtom = atom((get) => {
  const dtf = get(indexDTFAtom)
  const basketPrices = get(indexDTFBasketPricesAtom)

  if (!dtf || !basketPrices) return undefined

  return basketPrices[dtf.token.id.toLowerCase()]
})

export const indexDTFVersionAtom = atom('2.0.0')

// TODO: Retrieve from server, hardcoded for now
const WHITELISTED_ADDRESSES = [
  '0x2dc04Aeae96e2f2b642b066e981e80Fe57abb5b2',
  '0x8e0507C16435Caca6CB71a7Fb0e0636fd3891df4',
  '0x03d03A026E71979BE3b08D44B01eAe4C5FF9da99',
  '0xD84E0c72dc2F8363B46d4ADfC58BfD82E49222D9',
]

export const isBrandManagerAtom = atom((get) => {
  const dtf = get(indexDTFAtom)
  const wallet = get(walletAtom)

  const brandManagerAddresses = [
    ...(dtf?.brandManagers ?? []),
    ...WHITELISTED_ADDRESSES,
  ]

  return brandManagerAddresses.find(
    (manager) => manager.toLowerCase() === wallet?.toLowerCase()
  )
})

export const isAuctionLauncherAtom = atom((get) => {
  const dtf = get(indexDTFAtom)
  const wallet = get(walletAtom)

  return !!dtf?.auctionLaunchers.find(
    (launcher) => launcher.toLowerCase() === wallet?.toLowerCase()
  )
})

export const hasBridgedAssetsAtom = atom((get) => {
  const basket = get(indexDTFBasketAtom)

  return basket?.some(
    (token) =>
      WORMHOLE_ASSETS.has(token.address) || UNIVERSAL_ASSETS.has(token.address)
  )
})
