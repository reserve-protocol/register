import { Address } from 'viem'

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
}

export const priceImpactToLevel = (impact: number): LiquidityLevel => {
  const absImpact = Math.abs(impact)
  if (absImpact <= 1) return 'high'
  if (absImpact <= 3) return 'medium'
  return 'low'
}

export const priceImpactToScore = (impact: number): number => {
  const absImpact = Math.abs(impact)
  return (1 - Math.min(absImpact, 10) / 10) * 100
}
