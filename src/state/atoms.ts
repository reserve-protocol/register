import { TRANSACTION_STATUS } from 'utils/constants'
import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import {
  MulticallState,
  RawCall,
  ReserveToken,
  TransactionState,
  Wallet,
} from 'types'

export const reserveTokensAtom = atomWithStorage<{ [x: string]: ReserveToken }>(
  'reserveTokens',
  {}
)
export const selectedRTokenAtom = atomWithStorage('selectedRToken', '')
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

export const balancesAtom = atom<{ [x: string]: number }>({})

// Calls state
export const callsAtom = atom<RawCall[]>([])
export const multicallStateAtom = atom<MulticallState>({})

// Transactions state
export const transactionsAtom = atom<TransactionState[]>([])
export const addTransactionAtom = atom(
  null,
  (get, set, tx: TransactionState[]) => {
    set(transactionsAtom, [...get(transactionsAtom), ...tx])
  }
)
export const currentTransactionAtom = atom(0)
export const transactionAtom = atom<TransactionState | null>(
  (get) => get(transactionsAtom)[get(currentTransactionAtom)]
)

export const txAtom = atom<{ [x: string]: TransactionState[] }>({})

export const pendingTx = atom<TransactionState[]>((get) =>
  get(txAtom)[get(selectedAccountAtom)].filter(
    (tx) => tx.status === TRANSACTION_STATUS.PENDING
  )
)

// Explore tx processing after signing
export const miningTx = atom<TransactionState[]>((get) =>
  get(txAtom)[get(selectedAccountAtom)].filter(
    (tx) => tx.status === TRANSACTION_STATUS.MINING
  )
)
