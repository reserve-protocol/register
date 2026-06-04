import { Address } from 'viem'
import { RESERVE_API } from '@/utils/constants'
import { LiquidityLevel, TokenLiquidity } from '@/utils/liquidity'
import { SwapLeg } from '@/utils/zapper'

// Client for the reserve-api POST /rebalance/liquidity endpoint, which resolves
// Zapper DEX liquidity per asset and — for Ondo tokenized equities — market
// hours, trading limits, price and upcoming pauses, in a single request.

export type LiquiditySide = 'buy' | 'sell'

export type LiquidityTrade = {
  address: string
  side: LiquiditySide
  amountUsd: number
  price: number
  decimals: number
}

export type OndoUpcoming = {
  code?: string
  message?: string
  start: string | null
  end: string | null
}

export type OndoInfo = {
  symbol: string
  ticker?: string
  price?: number
  tradingOpen: boolean
  // Regular-session per-account notional cap (stable ceiling) + whether the
  // trade fits within it. Not market liquidity — it's Ondo's per-account limit.
  capacityUsd?: number
  withinCapacity: boolean
  reason?: { code: string; message: string } | null
  upcoming: OndoUpcoming[]
}

export type OndoMarket = {
  isOpen: boolean
  session: string
  nextOpen: string | null
  nextClose: string | null
  timestamp: string
}

type LiquidityResult = {
  priceImpact: number
  level: string
  score: number
  counterpart?: string
  swapPath?: SwapLeg[]
  error?: string
}

export type LiquidityAsset = {
  address: string
  side: LiquiditySide
  amountUsd: number
  liquidity: LiquidityResult
  ondo?: OndoInfo
}

export type RebalanceLiquidityResponse = {
  market: OndoMarket | null
  totals: { sellUsd: number; buyUsd: number }
  assets: LiquidityAsset[]
}

export const fetchRebalanceLiquidity = async (
  chainId: number,
  nativePrice: number,
  trades: LiquidityTrade[]
): Promise<RebalanceLiquidityResponse> => {
  const response = await fetch(`${RESERVE_API}rebalance/liquidity`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chainId, nativePrice, trades }),
  })

  if (!response.ok) throw new Error(`rebalance liquidity ${response.status}`)

  return response.json()
}

// Map an endpoint asset into the existing TokenLiquidity shape so the current
// LiquidityBadge and summary code keep working unchanged.
export const toTokenLiquidity = (asset: LiquidityAsset): TokenLiquidity => ({
  address: asset.address as Address,
  priceImpact: asset.liquidity.priceImpact,
  liquidityLevel: asset.liquidity.level as LiquidityLevel,
  liquidityScore: asset.liquidity.score,
  error: asset.liquidity.error,
  counterpart: asset.liquidity.counterpart,
  swapPath: asset.liquidity.swapPath,
})
