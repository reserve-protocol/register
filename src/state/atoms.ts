import { TRANSACTION_STATUS } from 'utils/constants'
import { atom } from 'jotai'
import { atomWithStorage, splitAtom } from 'jotai/utils'
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
export const connectedAccountAtom = atom('')

export const walletAtom = atom<Wallet | null>(
  (get) => get(walletsAtom)[get(selectedAccountAtom)]
)

export const currentWalletAtom = atom<Wallet | null>(
  (get) => get(walletsAtom)[get(connectedAccountAtom)]
)

export const balancesAtom = atom<{ [x: string]: number }>({})
export const allowanceAtom = atom<{ [x: string]: number }>({})

// Calls state
export const callsAtom = atom<RawCall[]>([])
export const multicallStateAtom = atom<MulticallState>({})

// Transactions state
export const transactionsAtom = atom<TransactionState[]>([])

export const currentTransactionAtom = atom(0)
export const transactionAtom = atom<TransactionState | null>(
  (get) => get(transactionsAtom)[get(currentTransactionAtom)]
)

export const txAtom = atom<{ [x: string]: TransactionState[] }>({})
export const currentTxAtom = atom(
  (get) => get(txAtom)[get(selectedAccountAtom)] || []
)

export const pendingTxAtom = atom((get) => {
  const result = {
    pending: <[number, TransactionState][]>[],
    mining: <[number, TransactionState][]>[],
    validating: <[number, TransactionState][]>[],
  }

  return get(currentTxAtom).reduce((acc, current, index) => {
    if (current.status === TRANSACTION_STATUS.PENDING) {
      acc.pending = [...acc.pending, [index, current]]
    }

    if (current.status === TRANSACTION_STATUS.PENDING_ALLOWANCE) {
      acc.validating = [...acc.validating, [index, current]]
    }

    if (current.status === TRANSACTION_STATUS.MINING) {
      if (current.status === TRANSACTION_STATUS.PENDING) {
        acc.mining = [...acc.mining, [index, current]]
      }
    }

    return acc
  }, result)
})

export const addTransactionAtom = atom(
  null,
  (get, set, tx: TransactionState[]) => {
    const txs = get(txAtom)
    const account = get(selectedAccountAtom)
    set(txAtom, { ...txs, [account]: [...(txs[account] ?? []), ...tx] })
  }
)

export const updateTransactionAtom = atom(
  null,
  (get, set, data: [number, Partial<TransactionState>]) => {
    const txs = get(txAtom)
    const account = get(selectedAccountAtom)
    const currentTx = txs[account]
    const [index, newData] = data

    set(txAtom, {
      ...txs,
      [account]: [
        ...currentTx.slice(0, index),
        { ...currentTx[index], ...newData },
        ...currentTx.slice(index + 1),
      ],
    })
  }
)
