import { atom } from 'jotai'
import { Address } from 'viem'
import { basketAtom } from '../../atoms'

export const liquiditySimulationAmountAtom = atom<number>(10000)

export type LiquidityLevel = 'low' | 'medium' | 'high' | 'insufficient' | 'error' | 'unknown' | 'failed'

export interface TokenLiquidity {
  address: Address
  priceImpact: number
  liquidityLevel: LiquidityLevel
  liquidityScore: number
  error?: string
}

export const liquidityCheckStatusAtom = atom<
  'idle' | 'loading' | 'success' | 'error'
>('idle')
export const tokenLiquidityMapAtom = atom<Record<string, TokenLiquidity>>({})

export const isCheckingLiquidityAtom = atom(
  (get) => get(liquidityCheckStatusAtom) === 'loading'
)

