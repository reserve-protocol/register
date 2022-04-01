import { atom } from 'jotai'
import { atomWithImmer } from 'jotai/immer'
import { ReserveToken } from 'types'

export interface Wallet {
  address: string
  alias: string
}
export const reserveTokensAtom = atom<{ [x: string]: ReserveToken }>({})
export const selectedRTokenAtom = atom('')
export const rTokenAtom = atom<ReserveToken | null>(
  (get) => get(reserveTokensAtom)[get(selectedRTokenAtom)]
)

export const walletsAtom = atomWithImmer<{ [x: string]: Wallet }>({})
export const selectedAccountAtom = atom('')
export const walletAtom = atom<Wallet | null>(
  (get) => get(walletsAtom)[get(selectedAccountAtom)]
)
