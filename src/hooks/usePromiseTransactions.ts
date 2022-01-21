import { TransactionResponse } from '@ethersproject/providers'
import {
  connectContractToSigner,
  TransactionOptions,
  TransactionStatus,
  useEthers,
  useTransactionsContext,
} from '@usedapp/core'
import { Contract } from 'ethers'
import { useCallback, useEffect, useState } from 'react'
import { CHAIN_ID } from '../constants'

export interface IContractCall {
  contract: Contract
  functionName: string
  options?: TransactionOptions
}

const useMultiContractFunction = (
  calls: IContractCall[]
): { send(): Promise<void>; state: TransactionStatus[] } => {
  const { library } = useEthers()
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
    async (args: any[] = []) => {
      const callStatus = [...state]

      for (let i = 0; i < calls.length; i += 1) {
        let transaction: TransactionResponse | undefined

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

          callStatus[i] = { transaction, status: 'Mining', chainId: CHAIN_ID }
          setState(callStatus)
          addTransaction({
            transaction: {
              ...transaction,
              chainId: CHAIN_ID,
            },
            submittedAt: Date.now(),
            transactionName: options?.transactionName,
          })
          const receipt = await transaction.wait()
          callStatus[i] = {
            receipt,
            transaction,
            status: 'Success',
            chainId: CHAIN_ID,
          }
          setState(callStatus)
        } catch (e: any) {
          const errorMessage =
            e.error?.message ?? e.reason ?? e.data?.message ?? e.message
          callStatus[i] = {
            status: 'Exception',
            errorMessage,
            chainId: CHAIN_ID,
          }
          if (transaction) {
            callStatus[i] = {
              status: 'Fail',
              transaction,
              receipt: e.receipt,
              errorMessage,
              chainId: CHAIN_ID,
            }
          }
          setState(callStatus)
          return
        }
      }
    },
    [state.length, addTransaction, library]
  )

  return { send, state }
}

export default useMultiContractFunction
