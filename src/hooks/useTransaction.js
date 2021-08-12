import { useTransactions } from '@usedapp/core'

export function useTransaction(txHash) {
  const { transactions } = useTransactions()

  if (!txHash) {
    return undefined
  }

  return transactions.find((tx) => tx.transaction?.hash === txHash)
}

export function useIsTransactionPending(txHash) {
  const tx = useTransaction(txHash)

  if (!tx) {
    return false
  }

  return !tx.receipt
}

export function useIsTransactionConfirmed(txHash) {
  const tx = useTransaction(txHash)

  if (!tx) {
    return false
  }

  return !!tx.receipt
}
