import { currentTxAtom } from 'state/atoms'
import { useAtomValue } from 'jotai/utils'

export const useTransactions = (ids: string[]) => {
  const txs = useAtomValue(currentTxAtom)

  return txs.filter((tx) => ids.includes(tx.id))
}

export const useTransaction = (id: string) => {
  const txs = useAtomValue(currentTxAtom)

  return txs.find((tx) => tx.id === id)
}
