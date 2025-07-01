import { atom } from 'jotai'
import { Address } from 'viem'
import { Token, TokenBalance } from '../types'

/**
 * Chain ID atom - configurable chain ID for the zapper
 */
export const chainIdAtom = atom<number>(1) // Default to mainnet

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
  token: Token
  chainId: number
  mintingFee?: number
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
 * Index DTF price atom - current price of the DTF token
 */
export const indexDTFPriceAtom = atom<number | null>(null)