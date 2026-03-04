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
  const tokenMap = tokens.reduce(
    (acc, token) => {
      acc[token.address.toLowerCase()] = token
      return acc
    },
    {} as Record<string, Token>
  )

  // Use version-aware helper to get token addresses
  const rebalanceTokens = getRebalanceTokens(rebalance, version)

  // Build arrays for the library call
  const decimals: bigint[] = []
  const currentPrices: number[] = []
  const snapshotPrices: number[] = []
  const priceError: number[] = []
  const initialFolioAssets: bigint[] = []
  const currentFolioAssets: bigint[] = []
  const weights: WeightRange[] = []

  rebalanceTokens.forEach((token) => {
    const lowercasedAddress = token.toLowerCase()
    const tokenDecimals = tokenMap[lowercasedAddress].decimals

    decimals.push(BigInt(tokenDecimals))
    currentPrices.push(prices[lowercasedAddress].currentPrice)

    // Calculate snapshot price from initialPrices
    snapshotPrices.push(initialPrices[lowercasedAddress])
    priceError.push(
      AUCTION_PRICE_VOLATILITY[
        tokenPriceVolatility[lowercasedAddress] || 'medium'
      ]
    )
    initialFolioAssets.push(initialAssets[lowercasedAddress] || 0n)
    currentFolioAssets.push(currentAssets[lowercasedAddress] || 0n)
    weights.push(initialWeights[lowercasedAddress])
  })

  const targetBasket = getTargetBasket(
    weights,
    isTrackingDTF || isHybridDTF ? currentPrices : snapshotPrices,
    decimals
  )

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
