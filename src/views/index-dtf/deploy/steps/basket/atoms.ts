import { atom } from 'jotai'
import { LiquidityLevel, TokenLiquidity } from '@/utils/liquidity'

export type { LiquidityLevel, TokenLiquidity }

export const liquiditySimulationAmountAtom = atom<number>(10000)

export const liquidityCheckStatusAtom = atom<
  'idle' | 'loading' | 'success' | 'error'
>('idle')
export const tokenLiquidityMapAtom = atom<Record<string, TokenLiquidity>>({})

export const isCheckingLiquidityAtom = atom(
  (get) => get(liquidityCheckStatusAtom) === 'loading'
)

