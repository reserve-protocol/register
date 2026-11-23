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
