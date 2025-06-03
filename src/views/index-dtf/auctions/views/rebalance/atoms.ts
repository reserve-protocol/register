import { TokenPriceWithSnapshot } from '@/hooks/use-asset-prices-with-snapshot'
import { AuctionMetrics } from '@/lib/index-rebalance-4.0.0/open-auction'
import { Token } from '@/types'
import { Rebalance } from '@reserve-protocol/dtf-rebalance-lib'
import { atom } from 'jotai'

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

export const rebalanceMetricsAtom = atom<AuctionMetrics>(undefined)

export const rebalancePercentAtom = atom(0)
export const rebalanceAuctionsAtom = atom<Auction[]>([])

export const rebalanceStateAtom = atom<RebalanceState | undefined>(undefined)
