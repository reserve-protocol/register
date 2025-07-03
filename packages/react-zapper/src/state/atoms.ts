import { atom } from 'jotai'
import { Address } from 'viem'
import { Token, TokenBalance } from '../types'
import { ChainId } from '../utils/chains'

/**
 * Chain ID atom - configurable chain ID for the zapper
 */
export const chainIdAtom = atom<number>(ChainId.Mainnet)

/**
 * Wallet/Account atom - current connected wallet address
 */
export const walletAtom = atom<Address | undefined>(undefined)

/**
 * Token balances atom - maps token addresses to their balances
 */
export const balancesAtom = atom<Record<string, TokenBalance>>({})

/**
 * Index DTF atom - the current DTF token being zapped
 */
export const indexDTFAtom = atom<{
  id: Address
  chainId: number
  mintingFee: number
  tvlFee: number
  token: {
    id: Address
    name: string
    symbol: string
    decimals: number
    totalSupply: string
  }
} | null>(null)

/**
 * Index DTF brand atom - branding information for the DTF
 */
export const indexDTFBrandAtom = atom<{
  dtf?: {
    icon?: string
  }
} | null>(null)

/**
 * Index DTF basket atoms - basket information
 */
export const indexDTFBasketAtom = atom<Token[] | undefined>(undefined)
export const indexDTFBasketPricesAtom = atom<Record<string, number>>({})
export const indexDTFBasketAmountsAtom = atom<Record<string, number>>({})
export const indexDTFBasketSharesAtom = atom<Record<string, string>>({})

/**
 * Index DTF price atom - derived from basket prices
 */
export const indexDTFPriceAtom = atom((get) => {
  const dtf = get(indexDTFAtom)
  const basketPrices = get(indexDTFBasketPricesAtom)

  if (!dtf || !basketPrices) return undefined

  return basketPrices[dtf.token.id.toLowerCase()]
})

export const indexDTFIconsAtom = atom<Record<number, Record<string, string>>>(
  {}
)
