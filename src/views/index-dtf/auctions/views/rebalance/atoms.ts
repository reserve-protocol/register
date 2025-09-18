import { Token, Volatility } from '@/types'
import {
  AuctionMetrics,
  WeightRange,
} from '@reserve-protocol/dtf-rebalance-lib'
import { atom } from 'jotai'
import { currentRebalanceAtom } from '../../atoms'

export const AUCTION_PRICE_VOLATILITY: Record<Volatility, number> = {
  low: 0.02,
  medium: 0.05,
  high: 0.1,
  degen: 0.5,
}

export type Auction = {
  id: string
  tokens: Token[]
  weightLowLimit: string[]
  weightSpotLimit: string[]
  weightHighLimit: string[]
  rebalanceLowLimit: string
  rebalanceSpotLimit: string
  rebalanceHighLimit: string
  priceLowLimit: string[]
  priceHighLimit: string[]
  startTime: string
  endTime: string
  blockNumber: string
  timestamp: string
  transactionHash: string
  bids: {
    id: string
    bidder: string
    sellToken: Token
    buyToken: Token
    sellAmount: string
    buyAmount: string
    blockNumber: string
    timestamp: string
    transactionHash: string
  }[]
}

export const rebalanceMetricsAtom = atom<AuctionMetrics | undefined>(undefined)

export const rebalancePercentAtom = atom(90)
export const rebalanceAuctionsAtom = atom<Auction[]>([])

export const rebalanceTokenMapAtom = atom<Record<string, Token>>((get) => {
  const rebalance = get(currentRebalanceAtom)

  if (!rebalance) return {}

  return rebalance.rebalance.tokens.reduce(
    (acc, token) => {
      acc[token.address.toLowerCase()] = token
      return acc
    },
    {} as Record<string, Token>
  )
})

export const refreshNonceAtom = atom(0)

export const isAuctionOngoingAtom = atom((get) => {
  const auctions = get(rebalanceAuctionsAtom)

  return auctions.some((auction) => {
    return new Date(parseInt(auction.endTime) * 1000) > new Date()
  })
})

export const priceVolatilityAtom = atom<Volatility>('medium')

// Advanced rebalance atoms for hybrid DTFs
export const savedWeightsAtom = atom<Record<string, WeightRange> | undefined>(
  undefined
)
export const areWeightsSavedAtom = atom<boolean>(false)
export const areWeightsSettledAtom = atom<boolean>((get) => {
  const auctions = get(rebalanceAuctionsAtom)
  const areWeightsSaved = get(areWeightsSavedAtom)

  return auctions.length > 0 || areWeightsSaved
})
export const showManageWeightsViewAtom = atom<boolean>(false)
export const managedWeightUnitsAtom = atom<Record<string, string>>({})
export const originalRebalanceWeightsAtom = atom<
  Record<string, WeightRange> | undefined
>(undefined)

// Similar to proposedIndexBasketAtom but for manage weights
export interface IndexAssetShares {
  token: Token
  currentShares: string
  currentUnits: string
}
export const managedBasketAtom = atom<
  Record<string, IndexAssetShares> | undefined
>(undefined)

// Derived atom that returns the current active auction with its index or null
export const activeAuctionAtom = atom<{
  auction: Auction
  index: number
} | null>((get) => {
  const auctions = get(rebalanceAuctionsAtom)
  const currentTime = Math.floor(Date.now() / 1000)

  const activeAuctionIndex = auctions.findIndex(
    (auction) => parseInt(auction.endTime) > currentTime
  )

  if (activeAuctionIndex === -1) {
    return null
  }

  return {
    auction: auctions[activeAuctionIndex],
    index: activeAuctionIndex + 1, // 1-based index for display
  }
})
