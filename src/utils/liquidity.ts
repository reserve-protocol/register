import { Address } from 'viem'
import { SwapLeg } from './zapper'

export type LiquidityLevel =
  | 'low'
  | 'medium'
  | 'high'
  | 'insufficient'
  | 'error'
  | 'unknown'
  | 'failed'

export interface TokenLiquidity {
  address: Address
  priceImpact: number
  liquidityLevel: LiquidityLevel
  liquidityScore: number
  error?: string
  counterpart?: string
  swapPath?: SwapLeg[]
}

export const priceImpactToLevel = (impact: number): LiquidityLevel => {
  if (impact <= 0) return 'high'
  if (impact <= 1) return 'high'
  if (impact <= 3) return 'medium'
  return 'low'
}

export const priceImpactToScore = (impact: number): number => {
  if (impact <= 0) return 100
  return (1 - Math.min(impact, 10) / 10) * 100
}

