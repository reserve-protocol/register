import { atom } from 'jotai'

export interface RPayTx {
  id: string
  type: string
  amountUSD: string
  timestamp: number
}

export const rpayTransactionsAtom = atom<RPayTx[]>([])

export const rpayOverviewAtom = atom({
  volume: 0,
  txCount: 0,
  holders: 0,
  dayVolume: 0,
  dayTxCount: 0,
})
