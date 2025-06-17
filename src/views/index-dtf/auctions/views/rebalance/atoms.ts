import { TokenPriceWithSnapshot } from '@/hooks/use-asset-prices-with-snapshot'
import { AuctionMetrics } from '@reserve-protocol/dtf-rebalance-lib'
import { Token } from '@/types'
import { Rebalance } from '@reserve-protocol/dtf-rebalance-lib'
import { atom } from 'jotai'
import { currentRebalanceAtom } from '../../atoms'

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

export const rebalancePercentAtom = atom(0)
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
