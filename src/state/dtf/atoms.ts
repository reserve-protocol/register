import { IndexDTF, TimeRange, Token } from '@/types'
import { AvailableChain, ChainId } from '@/utils/chains'
import { atom } from 'jotai'
import { Address } from 'viem'
import { walletAtom } from '../atoms'
import { UNIVERSAL_ASSETS, WORMHOLE_ASSETS } from '@/utils/constants'
import { checkVersion } from '@/utils'
import { Bridge, NativeToken } from '@/types/token-mappings'

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

export type Transaction = {
  id: string
  hash: string
  amount: number
  amountUSD: number
  timestamp: number
  chain: number
  to?: Address
  from?: Address
  type: 'Mint' | 'Redeem' | 'Transfer'
}

export type ExposureToken = {
  address: string
  symbol: string
  name?: string
  weight: number
  bridge?: Bridge
}

export type ExposureGroup = {
  native: NativeToken
  tokens: ExposureToken[]
  totalWeight: number
  change?: number
  hasNewlyAdded?: boolean
  marketCap?: number
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
export const indexDTF7dChangeAtom = atom<number | undefined>(undefined)
export const indexDTFBasketPerformanceChangeAtom = atom<
  Record<string, number | null>
>({})

export const performanceTimeRangeAtom = atom<TimeRange>('7d')
export const indexDTFPerformanceLoadingAtom = atom<boolean>(false)
export const indexDTFNewlyAddedAssetsAtom = atom<Record<string, boolean>>({})
export const indexDTFMarketCapAtom = atom<number | undefined>(undefined)
export const indexDTFBrandAtom = atom<IndexDTFBrand | undefined>(undefined)
export const indexDTFTransactionsAtom = atom<Transaction[]>([])

export const indexDTFFeeAtom = atom<number | undefined>(undefined)

export const indexDTFRebalanceControlAtom = atom<
  { weightControl: boolean; priceControl: number } | undefined
>(undefined)

export const indexDTFPriceAtom = atom((get) => {
  const dtf = get(indexDTFAtom)
  const basketPrices = get(indexDTFBasketPricesAtom)

  if (!dtf || !basketPrices) return undefined

  return basketPrices[dtf.token.id.toLowerCase()]
})

export const indexDTFVersionAtom = atom('4.0.0')

export const indexDTFExposureDataAtom = atom<ExposureGroup[] | null>(null)

export const indexDTFExposureMapAtom = atom((get) => {
  const exposureData = get(indexDTFExposureDataAtom)
  if (!exposureData) return null

  const map = new Map<string, ExposureGroup>()
  exposureData.forEach((group) => {
    if (group.native?.symbol) {
      map.set(group.native.symbol, group)
    }
  })
  return map
})

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

export const isSingletonRebalanceAtom = atom((get) => {
  const version = get(indexDTFVersionAtom)

  return checkVersion('4.0.0', version)
})

// ! Exclusive case for CFB DTF
export const isHybridDTFAtom = atom((get) => {
  const dtf = get(indexDTFAtom)

  return (
    dtf?.id.toLowerCase() === '0x4da9a0f397db1397902070f93a4d6ddbc0e0e6e8' ||
    // TODO: remove this after testing
    dtf?.id.toLowerCase() === '0x1532536c22366dde6b5174ebe519578bccc6b5a3' ||
    dtf?.id.toLowerCase() === '0x045dc337c12a9a5d2c790d01554913b1a9e1044a' ||
    dtf?.id.toLowerCase() === '0xdb35c98b919053f77356e7d89b11069cf9185764' ||
    dtf?.id.toLowerCase() === '0x2b3e7fec6995acc564fd587974fd29b94992ba3a'
  )
})
