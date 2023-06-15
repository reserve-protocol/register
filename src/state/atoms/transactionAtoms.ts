import { atom } from 'jotai'
import { atomWithStorage, createJSONStorage } from 'jotai/utils'
import {
  MulticallState,
  RawCall,
  TransactionMap,
  TransactionState,
  WalletTransaction,
} from 'types'
import { TRANSACTION_STATUS } from 'utils/constants'
import { chainIdAtom, walletAtom } from './chainAtoms'

// Store multicalls, fetched on every block
export const callsAtom = atom<RawCall[]>([])
export const multicallStateAtom = atom<MulticallState>({})

// Transactions storage layer
const txStorage = createJSONStorage<TransactionMap>(() => localStorage)
txStorage.getItem = (key: string): TransactionMap => {
  const data = localStorage?.getItem(key)

  if (!data) return {}

  try {
    const parsed = JSON.parse(data) as TransactionMap

    return Object.keys(parsed).reduce((txMap, chainId) => {
      txMap[chainId] = Object.keys(parsed[chainId]).reduce((txs, wallet) => {
        txs[wallet] = parsed[chainId][wallet].map((tx) => {
          if (
            tx.status === TRANSACTION_STATUS.SIGNING ||
            tx.status === TRANSACTION_STATUS.PENDING
          ) {
            return { ...tx, status: TRANSACTION_STATUS.UNKNOWN }
          }

          return tx
        })

        return txs
      }, {} as WalletTransaction)

      return txMap
    }, {} as TransactionMap)
  } catch (e) {
    console.error('Error parsing transaction', e)
    localStorage.setItem(key, JSON.stringify({}))
    return {}
  }
}

// List of recent user transactions
export const txAtom = atomWithStorage<TransactionMap>(
  'transactions',
  {},
  txStorage
)
export const currentTxAtom = atom((get) => {
  const chain = get(chainIdAtom)
  const account = get(walletAtom) ?? ''
  const txs = get(txAtom)

  return txs[chain] && txs[chain][account] ? txs[chain][account] : []
})

// Return list of transactions ordered by status
export const pendingTxAtom = atom((get) => {
  const result = {
    pending: <[number, TransactionState][]>[],
    signing: <[number, TransactionState][]>[],
    mining: <[number, TransactionState][]>[],
  }

  return get(currentTxAtom).reduce((acc, current, index) => {
    if (current.status === TRANSACTION_STATUS.PENDING) {
      acc.pending = [...acc.pending, [index, current]]
    }

    if (current.status === TRANSACTION_STATUS.MINING) {
      acc.mining = [...acc.mining, [index, current]]
    }

    if (current.status === TRANSACTION_STATUS.SIGNING) {
      acc.signing = [...acc.signing, [index, current]]
    }

    return acc
  }, result)
})

// Add transaction to queue
export const addTransactionAtom = atom(
  null,
  (get, set, tx: TransactionState[]) => {
    const txs = get(txAtom)
    const chainId = get(chainIdAtom)
    const account = get(walletAtom)

    if (!chainId || !account) {
      return
    }

    const currentTx =
      txs[chainId] && txs[chainId][account] ? txs[chainId][account] : []

    set(txAtom, {
      ...txs,
      [chainId]: {
        ...(txs[chainId] ?? {}),
        [account]: [...currentTx, ...tx].slice(-50),
      },
    })
  }
)

// Update tx status
export const updateTransactionAtom = atom(
  null,
  (get, set, data: [number, Partial<TransactionState>]) => {
    const txs = get(txAtom)
    const chainId = get(chainIdAtom)
    const account = get(walletAtom)
    const [index, newData] = data

    if (!chainId || !account) {
      return
    }

    const currentTx =
      txs[chainId] && txs[chainId][account] ? txs[chainId][account] : []

    set(txAtom, {
      ...txs,
      [chainId]: {
        [account]: [
          ...currentTx.slice(0, index),
          { ...currentTx[index], ...newData },
          ...currentTx.slice(index + 1),
        ],
      },
    })
  }
)
