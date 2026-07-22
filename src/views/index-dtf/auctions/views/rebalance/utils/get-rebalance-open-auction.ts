import { TokenPriceWithSnapshot } from '@/hooks/use-asset-prices-with-snapshot'
import { Token, Volatility } from '@/types'
import {
  FolioVersion,
  getOpenAuction,
  getTargetBasket,
  WeightRange,
} from '@reserve-protocol/dtf-rebalance-lib'
import { Rebalance as RebalanceV4 } from '@reserve-protocol/dtf-rebalance-lib/dist/4.0.0/types'
import { Rebalance as RebalanceV5 } from '@reserve-protocol/dtf-rebalance-lib/dist/types'
import { AUCTION_PRICE_VOLATILITY } from '../atoms'
import { getRebalanceTokens } from './transforms'

export type OpenAuctionArrays = {
  decimals: bigint[]
  currentPrices: number[]
  targetBasketPrices: number[]
  priceError: number[]
  initialFolioAssets: bigint[]
  currentFolioAssets: bigint[]
  weights: WeightRange[]
}

export type OpenAuctionBuildResult =
  | { ok: true; arrays: OpenAuctionArrays }
  | {
      ok: false
      reason: 'price-unavailable' | 'token-metadata-missing'
      token: string
    }

// A 0/absent price must never reach the weight math — it silently skews the auction calldata.
const isUsablePrice = (price: number | undefined): price is number =>
  typeof price === 'number' && Number.isFinite(price) && price > 0

// Validates exactly the prices the lib consumes: currentPrices always, snapshot prices only for non-tracking targets.
export function buildOpenAuctionArrays(
  rebalanceTokens: string[],
  tokenMap: Record<string, Token>,
  initialPrices: Record<string, number>,
  initialWeights: Record<string, WeightRange>,
  initialAssets: Record<string, bigint>,
  currentAssets: Record<string, bigint>,
  prices: TokenPriceWithSnapshot,
  tokenPriceVolatility: Record<string, Volatility>,
  useCurrentPricesForTarget: boolean
): OpenAuctionBuildResult {
  const decimals: bigint[] = []
  const currentPrices: number[] = []
  const targetBasketPrices: number[] = []
  const priceError: number[] = []
  const initialFolioAssets: bigint[] = []
  const currentFolioAssets: bigint[] = []
  const weights: WeightRange[] = []

  for (const token of rebalanceTokens) {
    const address = token.toLowerCase()
    const currentPrice = prices[address]?.currentPrice
    const targetPrice = useCurrentPricesForTarget
      ? currentPrice
      : initialPrices[address]

    if (!isUsablePrice(currentPrice) || !isUsablePrice(targetPrice)) {
      return { ok: false, reason: 'price-unavailable', token: address }
    }

    // A token absent from the subgraph token list (indexer lag) fails closed like a missing price.
    const tokenMeta = tokenMap[address]
    if (!tokenMeta) {
      return { ok: false, reason: 'token-metadata-missing', token: address }
    }

    decimals.push(BigInt(tokenMeta.decimals))
    currentPrices.push(currentPrice)
    targetBasketPrices.push(targetPrice)
    priceError.push(
      AUCTION_PRICE_VOLATILITY[tokenPriceVolatility[address] || 'medium']
    )
    initialFolioAssets.push(initialAssets[address] || 0n)
    currentFolioAssets.push(currentAssets[address] || 0n)
    weights.push(initialWeights[address])
  }

  return {
    ok: true,
    arrays: {
      decimals,
      currentPrices,
      targetBasketPrices,
      priceError,
      initialFolioAssets,
      currentFolioAssets,
      weights,
    },
  }
}

// Thrown (not returned) so every getRebalanceOpenAuction caller fails loud; UX callers check buildRebalanceOpenAuctionArrays directly.
export class PriceUnavailableError extends Error {
  readonly token: string
  constructor(token: string) {
    super(`price unavailable for token ${token}`)
    this.name = 'PriceUnavailableError'
    this.token = token
  }
}

// Shared by getRebalanceOpenAuction (throws on failure) and the launch button (renders a disabled state).
export function buildRebalanceOpenAuctionArrays(
  version: FolioVersion,
  tokens: Token[],
  rebalance: RebalanceV4 | RebalanceV5,
  currentAssets: Record<string, bigint>,
  initialAssets: Record<string, bigint>,
  initialPrices: Record<string, number>,
  initialWeights: Record<string, WeightRange>,
  prices: TokenPriceWithSnapshot,
  tokenPriceVolatility: Record<string, Volatility>,
  isTrackingDTF: boolean,
  isHybridDTF = false
): OpenAuctionBuildResult {
  const tokenMap = tokens.reduce(
    (acc, token) => {
      acc[token.address.toLowerCase()] = token
      return acc
    },
    {} as Record<string, Token>
  )

  const rebalanceTokens = getRebalanceTokens(rebalance, version)

  return buildOpenAuctionArrays(
    rebalanceTokens,
    tokenMap,
    initialPrices,
    initialWeights,
    initialAssets,
    currentAssets,
    prices,
    tokenPriceVolatility,
    isTrackingDTF || isHybridDTF
  )
}

function getRebalanceOpenAuction(
  version: FolioVersion,
  tokens: Token[],
  rebalance: RebalanceV4 | RebalanceV5,
  supply: bigint,
  initialSupply: bigint,
  currentAssets: Record<string, bigint>,
  initialAssets: Record<string, bigint>,
  initialPrices: Record<string, number>,
  initialWeights: Record<string, WeightRange>,
  prices: TokenPriceWithSnapshot,
  isTrackingDTF: boolean,
  tokenPriceVolatility: Record<string, Volatility>,
  rebalancePercent = 90,
  isHybridDTF = false
) {
  const built = buildRebalanceOpenAuctionArrays(
    version,
    tokens,
    rebalance,
    currentAssets,
    initialAssets,
    initialPrices,
    initialWeights,
    prices,
    tokenPriceVolatility,
    isTrackingDTF,
    isHybridDTF
  )

  if (!built.ok) {
    throw new PriceUnavailableError(built.token)
  }

  const {
    decimals,
    currentPrices,
    targetBasketPrices,
    priceError,
    initialFolioAssets,
    currentFolioAssets,
    weights,
  } = built.arrays

  const targetBasket = getTargetBasket(weights, targetBasketPrices, decimals)

  // Pass version to the library function
  return getOpenAuction(
    version,
    rebalance,
    supply,
    initialSupply,
    initialFolioAssets,
    targetBasket,
    currentFolioAssets,
    decimals,
    currentPrices,
    priceError,
    rebalancePercent / 100
  )
}

export default getRebalanceOpenAuction
