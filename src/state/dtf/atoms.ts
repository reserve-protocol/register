import { IndexDTF, TimeRange, Token } from '@/types'
import { AvailableChain } from '@/utils/chains'
import { atom } from 'jotai'
import { Address } from 'viem'
import { walletAtom } from '../atoms'
import { UNIVERSAL_ASSETS, WORMHOLE_ASSETS } from '@/utils/constants'
import { checkVersion } from '@/utils'
import { Bridge, MarketCapData, NativeToken } from '@/types/token-mappings'
import type { Amount, IndexDtfBrand } from '@reserve-protocol/react-sdk'

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

// One brand shape, owned by the SDK mapper (display-ready: '' defaults, files
// always present, basketType narrowed) — register stores it as-is.
export type IndexDTFBrand = IndexDtfBrand

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
  // On-chain (tokenized supply) mcap — shown on the Collateral tab
  marketCap?: number
  // Real-company mcap for Ondo tokenized equities — shown on the Exposure tab
  underlyingMarketCap?: number
  symbol: string
  name?: string
  weight: number
  bridge?: Bridge
  change?: number
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

export const indexDTFBasketAmountsAtom = atom<Record<string, Amount>>({})

export const indexDTFBasketSharesAtom = atom<Record<string, string>>({})

export const indexDTFAtom = atom<IndexDTF | undefined>(undefined)
export const indexDTF7dChangeAtom = atom<number | undefined>(undefined)

export const performanceTimeRangeAtom = atom<TimeRange>('ytd')
export const indexDTFPerformanceLoadingAtom = atom<boolean>(false)
export const indexDTFMarketCapAtom = atom<number | undefined>(undefined)
export const indexDTFBrandAtom = atom<IndexDTFBrand | undefined>(undefined)
export const indexDTFTransactionsAtom = atom<Transaction[]>([])

// undefined = read in flight; 'unavailable' = registry read failed. Consumers
// must render an explicit unavailable state — never substitute a made-up fee.
export const indexDTFFeeAtom = atom<number | 'unavailable' | undefined>(
  undefined
)

export const indexDTF24hVolumeAtom = atom<number>((get) => {
  const txs = get(indexDTFTransactionsAtom)
  const cutoff = Date.now() / 1000 - 24 * 60 * 60
  return txs
    .filter((t) => t.timestamp > cutoff)
    .reduce((acc, t) => acc + t.amountUSD, 0)
})

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
    } else {
      group.tokens.forEach((token) => {
        map.set(token.symbol, group)
      })
    }
  })
  return map
})

export const indexDTFExposureMCapMapAtom = atom((get) => {
  const exposureData = get(indexDTFExposureDataAtom)
  if (!exposureData) return {}

  const map = {} as MarketCapData
  exposureData.forEach((group) => {
    if (group.native?.coingeckoId) {
      map[group.native.coingeckoId] = group.marketCap || 0
    }

    group.tokens.forEach((token) => {
      map[token.address.toLowerCase()] = token?.marketCap || 0
    })
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

export const indexDTFStatusAtom = atom<'active' | 'deprecated' | 'unsupported'>(
  'active'
)

export const isSingletonRebalanceAtom = atom((get) => {
  const version = get(indexDTFVersionAtom)

  return checkVersion('4.0.0', version)
})

// A "hybrid" DTF is a NATIVE DTF (weightControl === true) — its weights are
// governance-controlled, so the auction launcher manages them (the deferWeights
// / Manage-Weights flow) rather than deriving them from price like a tracking
// DTF (weightControl === false). This was an address allowlist (LCAP + Venionaire
// + test DTFs, all confirmed weightControl=true on-chain); deriving it from
// weightControl covers every native DTF without hand-maintaining the list (D1).
export const isHybridDTFAtom = atom((get) => {
  const rebalanceControl = get(indexDTFRebalanceControlAtom)

  return rebalanceControl?.weightControl === true
})
