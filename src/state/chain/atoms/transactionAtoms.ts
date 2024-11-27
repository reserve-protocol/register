import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { ReactNode } from 'react'
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

  return Object.values(history)
    .filter((tx) => tx.chainId === chainId && tx.account === account)
    .sort((a, b) => b.timestamp - a.timestamp)
})

export const addTransactionAtom = atom(
  null,
  (get, set, [hash, label, status = 'loading']: [Hex, ReactNode, string?]) => {
    const account = get(walletAtom)

    if (account && !get(transactionHistoryAtom)[hash]) {
      const chainId = get(chainIdAtom)

      try {
        set(transactionHistoryAtom, {
          ...get(transactionHistoryAtom),
          [hash]: {
            hash,
            label,
            timestamp: getCurrentTime(),
            chainId,
            account,
            status,
          },
        })
      } catch (e) {
        console.error('Error adding transaction', e)
      }
    }
  }
)

export const updateTransactionAtom = atom(
  null,
  (get, set, [hash, status, block]: [Hex, 'success' | 'error', number?]) => {
    const history = get(transactionHistoryAtom)

    if (history[hash]) {
      try {
        set(transactionHistoryAtom, {
          ...history,
          [hash]: { ...history[hash], status, block },
        })
      } catch (e) {
        console.error('Error updating transaction', e)
      }
    }
  }
)

// Can only have 1 running tx at the time, so only check last one
export const isTransactionRunning = atom(
  (get) => get(currentTxHistoryAtom)[0]?.status === 'loading'
)
