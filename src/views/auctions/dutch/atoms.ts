import { atom } from 'jotai'
import { Trade } from '../atoms'

export interface DutchTrade extends Trade {
  boughtAmount?: number
  startBlock: number
  endBlock: number
  settleTxHash?: string
  isSettled?: boolean
  kind?: number
}

export const ongoingDutchTradesAtom = atom<DutchTrade[]>([])
export const endedDutchTradesAtom = atom<DutchTrade[]>([])
