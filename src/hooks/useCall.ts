import { Interface } from '@ethersproject/abi'
import { useWeb3React } from '@web3-react/core'
import { useMemo } from 'react'
import { Falsy } from 'types'
import { useRawCalls } from './useRawCalls'

export interface ContractCall {
  abi: Interface
  address: string
  method: string
  args: any[]
}

export const useContractCalls = (calls: (ContractCall | Falsy)[]): any[] => {
  const { provider } = useWeb3React()

  const rawCalls = calls.map((call) =>
    provider && call
      ? {
          address: call.address,
          data: call.abi.encodeFunctionData(call.method, call.args),
        }
      : undefined
  )
  const results = useRawCalls(rawCalls)

  return useMemo(
    () =>
      results.map((result, idx) => {
        const call = calls[idx]

        if (!result || !call) {
          return undefined
        }

        try {
          if (result.success) {
            return {
              value: call.abi.decodeFunctionResult(call.method, result.value),
              error: undefined,
            }
          }
          const errorMessage: string = new Interface([
            'function Error(string)',
          ]).decodeFunctionData('Error', result.value)[0]
          return {
            value: undefined,
            error: new Error(errorMessage),
          }
        } catch (error) {
          return {
            value: undefined,
            error: error as Error,
          }
        }
      }),
    [results]
  )
}

export function useContractCall(
  call: ContractCall | Falsy
): { value: any; error: any } | undefined {
  return useContractCalls([call])[0]
}
