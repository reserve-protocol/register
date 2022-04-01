import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { ReserveToken, Wallet } from 'types'

export const reserveTokensAtom = atom<{ [x: string]: ReserveToken }>({})
export const selectedRTokenAtom = atom('')
export const rTokenAtom = atom<ReserveToken | null>(
  (get) => get(reserveTokensAtom)[get(selectedRTokenAtom)]
)

export const walletsAtom = atomWithStorage<{ [x: string]: Wallet }>(
  'wallets',
  {}
)
export const selectedAccountAtom = atomWithStorage('trackedAccount', '')
export const walletAtom = atom<Wallet | null>(
  (get) => get(walletsAtom)[get(selectedAccountAtom)]
)
