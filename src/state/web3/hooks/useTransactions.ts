import { useMemo } from 'react'
import { currentTxAtom } from 'state/atoms'
import { useAtomValue } from 'jotai/utils'

export const useTransactions = (ids: string[], sample = 20) => {
  // Usually used to fetch last N txs, slice it to last 20 for fast lookup
  const txs = useAtomValue(currentTxAtom).slice(-sample)
  return useMemo(
    () => txs.filter((tx) => ids.includes(tx.id)),
    [JSON.stringify(txs), ids]
  )
}

export const useTransaction = (id: string) => {
  const txs = useAtomValue(currentTxAtom)

  return useMemo(() => {
    // This hook is usually used to get the last txs,
    // reverse lookup for performance makes sense
    for (let i = txs.length - 1; i >= 0; --i) {
      if (txs[i].id === id) return txs[i]
    }

    return []
  }, [txs, id])
}
