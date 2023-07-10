import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { chainIdAtom, walletAtom } from 'state/atoms'
import { getCurrentTime } from 'utils'
import { Address, Hex } from 'viem'

export interface TransactionState {
  hash: Hex
  label: string
  status: 'loading' | 'success' | 'error'
  timestamp: number // unix utc timestamp
  block?: number // block mined at
  chainId: number
  account: Address
}

// TODO: Check tx status on mount
// TODO: Only store last 50 txs
export const transactionHistoryAtom = atomWithStorage<{
  [x: Hex]: TransactionState
}>('txHistory', {})

// Get current txs for wallet&chain
export const currentTxHistoryAtom = atom((get) => {
  const history = get(transactionHistoryAtom)
  const account = get(walletAtom)
  const chainId = get(chainIdAtom)

  return Object.values(history).filter(
    (tx) => tx.chainId === chainId && tx.account === account
  )
})

export const addTransactionAtom = atom(
  null,
  (get, set, [hash, label]: [Hex, string]) => {
    const account = get(walletAtom)

    if (account && !get(transactionHistoryAtom)[hash]) {
      const chainId = get(chainIdAtom)

      set(transactionHistoryAtom, {
        ...get(transactionHistoryAtom),
        [hash]: {
          hash,
          label,
          timestamp: getCurrentTime(),
          chainId,
          account,
          status: 'loading',
        },
      })
    }
  }
)

export const updateTransactionAtom = atom(
  null,
  (get, set, [hash, status]: [Hex, 'success' | 'error']) => {
    const history = get(transactionHistoryAtom)

    if (history[hash]) {
      set(transactionHistoryAtom, {
        ...history,
        [hash]: { ...history[hash], status },
      })
    }
  }
)

export const txInProgressAtom = atom((get) => {
  const history = get(transactionHistoryAtom)

  return Object.values(history)
    .filter((tx) => tx.status === 'loading')
    .map((tx) => tx.hash)
})

// Can only have 1 running tx at the time, so only check last one
export const isTransactionRunning = atom(
  (get) => !!get(txInProgressAtom).length
)
