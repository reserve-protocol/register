import { TransactionResponse } from '@ethersproject/providers'
import { Contract } from 'ethers'
import { useState, useCallback, useEffect } from 'react'
import {
  TransactionOptions,
  TransactionStatus,
  useTransactionsContext,
  connectContractToSigner,
  useEthers,
} from '@usedapp/core'

export interface IContractCall {
  contract: Contract
  functionName: string
  options?: TransactionOptions
}

const getState = (
  prevState: TransactionStatus[],
  value: TransactionStatus,
  index: number
): TransactionStatus[] => {
  return [...prevState.slice(0, index), value, ...prevState.slice(index + 1)]
}

const useMultiContractFunction = (
  calls: IContractCall[]
): { send(args: any): Promise<void>; state: TransactionStatus[] } => {
  const { library, chainId } = useEthers()
  const [state, setState] = useState<TransactionStatus[]>(
    new Array(calls.length).fill({ status: 'None' })
  )
  const { addTransaction } = useTransactionsContext()

  useEffect(() => {
    if (calls.length !== state.length) {
      setState(new Array(calls.length).fill({ status: 'None' }))
    }
  }, [calls?.length ?? 0])

  const send = useCallback(
    async (args: any[]) => {
      if (!chainId) return

      const callStatus = [...state]

      for (let i = 0; i < calls.length; i++) {
        let transaction: TransactionResponse | undefined = undefined

        try {
          const { contract, options, functionName } = calls[i]
          const contractWithSigner = connectContractToSigner(
            contract,
            options,
            library
          )

          transaction = <TransactionResponse>(
            await contractWithSigner[functionName](...args[i])
          )

          callStatus[i] = { transaction, status: 'Mining', chainId }
          setState(callStatus)
          addTransaction({
            transaction: {
              ...transaction,
              chainId,
            },
            submittedAt: Date.now(),
            transactionName: options?.transactionName,
          })
          const receipt = await transaction.wait()
          ;(callStatus[i] = {
            receipt,
            transaction,
            status: 'Success',
            chainId,
          }),
            setState(callStatus)
        } catch (e: any) {
          const errorMessage =
            e.error?.message ?? e.reason ?? e.data?.message ?? e.message
          callStatus[i] = {
            status: 'Exception',
            errorMessage,
            chainId,
          }
          if (transaction) {
            callStatus[i] = {
              status: 'Fail',
              transaction,
              receipt: e.receipt,
              errorMessage,
              chainId,
            }
          }
          setState(callStatus)
          return
        }
      }
    },
    [state.length, addTransaction, library, chainId]
  )

  return { send, state }
}

export default useMultiContractFunction
