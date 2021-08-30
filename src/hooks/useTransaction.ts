import { useTransactions } from '@usedapp/core'

export function useTransaction(txHash: string | undefined) {
  const { transactions } = useTransactions()

  if (!txHash) {
    return undefined
  }

  return transactions.find((tx) => tx.transaction?.hash === txHash)
}

export function useIsTransactionPending(txHash: string | undefined) {
  const tx = useTransaction(txHash)

  if (!tx) {
    return false
  }

  return !tx.receipt
}

export function useIsTransactionConfirmed(txHash: string | undefined) {
  const tx = useTransaction(txHash)

  if (!tx) {
    return false
  }

  return !!tx.receipt
}
