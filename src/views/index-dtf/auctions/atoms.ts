import { Token } from '@/types'
import { atom } from 'jotai'

export type Rebalance = {
  id: string
  tokens: Token[]
  priceControl: string
  weightLowLimit: string[]
  weightSpotLimit: string[]
  weightHighLimit: string[]
  rebalanceLowLimit: string
  rebalanceSpotLimit: string
  rebalanceHighLimit: string
  priceLowLimit: string[]
  priceHighLimit: string[]
  auctionLauncherWindow: string
  availableUntil: string
  transactionHash: string
  blockNumber: string
  timestamp: string
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
}

export const rebalancesAtom = atom<Rebalance[] | undefined>(undefined)
export const rebalanceAuctionsAtom = atom<Auction[] | undefined>(undefined)
