import { Token } from '@/types'
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

export const rebalancePercentAtom = atom(0)
export const rebalanceAuctionsAtom = atom<Auction[]>([])
