import { TokenPriceWithSnapshot } from '@/hooks/use-asset-prices-with-snapshot'
import { AuctionMetrics } from '@reserve-protocol/dtf-rebalance-lib'
import { Token } from '@/types'
import { Rebalance } from '@reserve-protocol/dtf-rebalance-lib'
import { atom } from 'jotai'
import { currentRebalanceAtom } from '../../atoms'

export const PRICE_VOLATILITY: Record<string, number> = {
  LOW: 0.025,
  MEDIUM: 0.075,
  HIGH: 0.25,
  DEGEN: 0.6, // not used yet
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

export type RebalanceState = {
  rebalance: Rebalance
  supply: bigint
  currentFolio: Record<string, bigint>
  initialFolio: Record<string, bigint>
  prices: TokenPriceWithSnapshot
  isTrackingDTF: boolean
}

export const rebalanceMetricsAtom = atom<AuctionMetrics | undefined>(undefined)

export const rebalancePercentAtom = atom(90)
export const rebalanceAuctionsAtom = atom<Auction[]>([])

export const rebalanceStateAtom = atom<RebalanceState | undefined>(undefined)

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

export const priceVolatilityAtom = atom<keyof typeof PRICE_VOLATILITY>('MEDIUM')

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
