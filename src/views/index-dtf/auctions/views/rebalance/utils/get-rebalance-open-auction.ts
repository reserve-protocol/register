import { TokenPriceWithSnapshot } from '@/hooks/use-asset-prices-with-snapshot'
import { Token } from '@/types'
import {
  getOpenAuction,
  getTargetBasket,
  Rebalance,
  WeightRange,
} from '@reserve-protocol/dtf-rebalance-lib'
import { AUCTION_PRICE_VOLATILITY } from '../atoms'

function getRebalanceOpenAuction(
  tokens: Token[],
  rebalance: Rebalance,
  supply: bigint,
  initialSupply: bigint,
  currentAssets: Record<string, bigint>,
  initialAssets: Record<string, bigint>,
  initialPrices: Record<string, number>,
  initialWeights: Record<string, WeightRange>,
  prices: TokenPriceWithSnapshot,
  isTrackingDTF: boolean,
  rebalancePercent = 90,
  priceVolatility = AUCTION_PRICE_VOLATILITY.MEDIUM,
  isHybridDTF = false
) {
  const tokenMap = tokens.reduce(
    (acc, token) => {
      acc[token.address.toLowerCase()] = token
      return acc
    },
    {} as Record<string, Token>
  )

  // Lets start by creating a map of the basket tokens
  const decimals: bigint[] = []
  const currentPrices: number[] = []
  const snapshotPrices: number[] = []
  const priceError: number[] = []
  const initialFolioAssets: bigint[] = []
  const currentFolioAssets: bigint[] = []
  const weights: WeightRange[] = []

  rebalance.tokens.forEach((token) => {
    const lowercasedAddress = token.toLowerCase()
    const tokenDecimals = tokenMap[lowercasedAddress].decimals

    decimals.push(BigInt(tokenDecimals))
    currentPrices.push(prices[lowercasedAddress].currentPrice)

    // Calculate snapshot price from initialPrices
    snapshotPrices.push(initialPrices[lowercasedAddress])
    priceError.push(priceVolatility)
    initialFolioAssets.push(initialAssets[lowercasedAddress] || 0n)
    currentFolioAssets.push(currentAssets[lowercasedAddress] || 0n)
    weights.push(initialWeights[lowercasedAddress])
  })

  const targetBasket = getTargetBasket(
    weights,
    isTrackingDTF || isHybridDTF ? currentPrices : snapshotPrices,
    decimals
  )

  return getOpenAuction(
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
