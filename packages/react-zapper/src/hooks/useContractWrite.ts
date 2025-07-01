import { useCallback, useMemo } from 'react'
import {
  useEstimateGas,
  useSimulateContract,
  UseSimulateContractParameters,
  useWriteContract,
} from 'wagmi'
import type { Abi } from 'abitype'
import { ContractFunctionName, encodeFunctionData } from 'viem'

// Gas multiplier helper function
const getSafeGasLimit = (gas: bigint, multiplier = 200n) =>
  (gas * multiplier) / 100n

/**
 * Hook for contract write operations with gas estimation and validation
 * Extends wagmi to include gas estimate and gas limit multiplier
 */
const useContractWrite = <
  TAbi extends Abi | readonly unknown[],
  TFunctionName extends ContractFunctionName<TAbi, 'nonpayable' | 'payable'>,
>(
  call: UseSimulateContractParameters<TAbi, TFunctionName> = {} as any
) => {
  const { data, error, isLoading, isSuccess } = useSimulateContract(
    call as UseSimulateContractParameters
  )

  const enabled =
    call?.query?.enabled !== undefined ? call?.query?.enabled : true

  if (call.args && enabled && process.env.NODE_ENV === 'development') {
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
      writeContract: () => {
        if (data?.request && gas) {
          writeContract({ ...data.request, gas: getSafeGasLimit(gas) })
        }
      },
      isError: !!error || contractWrite.isError,
      error: error || contractWrite.error,
    }),
    [
      error,
      isLoading,
      contractWrite,
      gas,
      handleWrite,
      data?.request,
      isSuccess,
    ]
  )
}

export default useContractWrite
