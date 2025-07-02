import { useCallback, useMemo } from 'react'
import {
  useEstimateGas,
  useSimulateContract,
  UseSimulateContractParameters,
  useWriteContract,
} from 'wagmi'
import { getSafeGasLimit } from './../utils/index'
import type { Abi } from 'abitype'
import { useAtomValue } from 'jotai'
import { isWalletInvalidAtom } from 'state/atoms'
import { ContractFunctionName, encodeFunctionData } from 'viem'

// Extends wagmi to include gas estimate and gas limit multiplier
const useContractWrite = <
  TAbi extends Abi | readonly unknown[],
  TFunctionName extends ContractFunctionName<TAbi, 'nonpayable' | 'payable'>,
>(
  call: UseSimulateContractParameters<TAbi, TFunctionName> = {} as any
) => {
  const isWalletInvalid = useAtomValue(isWalletInvalidAtom)
  const { data, error, isLoading, isSuccess } = useSimulateContract(
    !isWalletInvalid ? (call as UseSimulateContractParameters) : undefined
  )

  const enabled =
    call?.query?.enabled !== undefined ? call?.query?.enabled : true

  if (call.args && enabled) {
    console.log(
      'callData',
      encodeFunctionData({
        abi: call.abi as any,
        functionName: call.functionName,
        args: call.args as any,
      })
    )
  }

  const { data: gas } = useEstimateGas(
    data?.request && enabled
      ? {
          to: data.request.address,
          data: encodeFunctionData({
            abi: call.abi as any,
            functionName: call.functionName,
            args: call.args as any,
          }),
        }
      : undefined
  )

  const contractWrite = useWriteContract()
  const { writeContract } = contractWrite

  const handleWrite = useCallback(() => {
    if (data?.request && gas) {
      writeContract({ ...data.request, gas: getSafeGasLimit(gas) })
    }
  }, [data?.request, writeContract, gas])

  return useMemo(
    () => ({
      ...contractWrite,
      gas,
      validationError: error,
      isReady: !!data?.request && isSuccess,
      isLoading: contractWrite.isPending,
      hash: contractWrite.data,
      write: handleWrite,
    }),
    [error, isLoading, contractWrite, gas, handleWrite]
  )
}

export default useContractWrite
