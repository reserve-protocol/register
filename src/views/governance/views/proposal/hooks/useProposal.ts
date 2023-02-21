import { useCallback, useMemo } from 'react'
import { proposalTxIdAtom } from './../atoms'
import useDebounce from 'hooks/useDebounce'
import useTransactionCost from 'hooks/useTransactionCost'
import { useAtomValue, useSetAtom } from 'jotai'
import { addTransactionAtom } from 'state/atoms'
import { TransactionState } from 'types'
import { proposalDescriptionAtom } from '../atoms'
import { v4 as uuid } from 'uuid'
import { getTransactionWithGasLimit } from 'utils'

const useProposal = (tx: TransactionState) => {
  const addTransaction = useSetAtom(addTransactionAtom)
  const debouncedTx = useDebounce(tx, 100)
  const [fee, gasError, gasLimit] = useTransactionCost([debouncedTx])
  const proposalDescription = useAtomValue(proposalDescriptionAtom)
  const isValid = !!proposalDescription
  const setId = useSetAtom(proposalTxIdAtom)

  const handlePropose = useCallback(() => {
    const id = uuid()
    addTransaction([{ ...getTransactionWithGasLimit(tx, gasLimit), id }])
    setId(id)
  }, [tx, gasLimit, addTransaction])

  return useMemo(
    () => ({
      fee,
      error: gasError,
      propose: handlePropose,
      isValid,
    }),
    [fee, gasError, isValid, handlePropose]
  )
}

export default useProposal
