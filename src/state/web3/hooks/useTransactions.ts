import { useMemo } from 'react'
import { currentTxAtom } from 'state/atoms'
import { useAtomValue } from 'jotai/utils'
import { TransactionState } from 'types'

export const useTransactions = (ids: string[], sample = 20) => {
  // Usually used to fetch last N txs, slice it to last 20 for fast lookup
  const txs = useAtomValue(currentTxAtom).slice(-sample)

  return useMemo(
    () => txs.filter((tx) => ids.includes(tx.id)),
    [JSON.stringify(txs), ids.join('')]
  )
}

export const useLastTransaction = (): TransactionState | null => {
  const txs = useAtomValue(currentTxAtom)

  return txs[txs.length - 1]
}

export const useTransaction = (id: string): TransactionState | null => {
  const txs = useAtomValue(currentTxAtom)

  return useMemo(() => {
    if (!id) {
      return null
    }
    // This hook is usually used to get the last tx,
    // reverse lookup for performance makes sense
    for (let i = txs.length - 1; i >= 0; --i) {
      if (txs[i].id === id) return txs[i]
    }

    return null
  }, [txs, id])
}
