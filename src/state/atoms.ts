import { atom } from 'jotai'
import { atomWithImmer } from 'jotai/immer'
import { ReserveToken } from 'types'

export interface Wallet {
  address: string
  alias: string
}
export const reserveTokensAtom = atom<ReserveToken[]>([])
export const rTokenAtom = atom<ReserveToken | null>(null)

export const walletsAtom = atomWithImmer<Wallet[]>([])
export const currentWalletAtom = atom<Wallet | null>(null)
