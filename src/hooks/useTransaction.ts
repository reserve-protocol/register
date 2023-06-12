import { useSetAtom } from 'jotai'
import { useCallback, useEffect, useState } from 'react'
import { addTransactionAtom } from 'state/atoms'
import { useTransactionState } from 'state/web3/hooks/useTransactions'
import { TransactionState } from 'types'
import { getTransactionWithGasLimit } from 'utils'
import { TRANSACTION_STATUS } from 'utils/constants'
import { v4 as uuid } from 'uuid'
import useTransactionCost from './useTransactionCost'

const useTransaction = (tx: TransactionState | null) => {
  const addTransaction = useSetAtom(addTransactionAtom)
  const [fee, gasError, gasLimit] = useTransactionCost(tx ? [tx] : [])
  const [txId, setTxId] = useState('')
  const txState = useTransactionState(txId)

  const execute = useCallback(() => {
    if (tx) {
      const id = uuid()
      setTxId(id)
      addTransaction([{ ...getTransactionWithGasLimit(tx, gasLimit), id }])
    }
  }, [addTransaction, tx])

  useEffect(() => {
    if (
      txState?.status &&
      ![TRANSACTION_STATUS.SIGNING, TRANSACTION_STATUS.PENDING].includes(
        txState.status
      )
    ) {
      setTxId('')
    }
  }, [txState?.status])

  return {
    canExecute: tx && !!fee && !txId,
    error: gasError,
    execute,
    isExecuting: !!txId,
  }
}

export default useTransaction
