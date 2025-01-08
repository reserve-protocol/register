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
import { ContractFunctionName } from 'viem'

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
  const { data: gas } = useEstimateGas(data?.request)

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
      isReady: !!gas && isSuccess,
      isLoading: contractWrite.isPending,
      hash: contractWrite.data,
      write: handleWrite,
    }),
    [error, isLoading, contractWrite, gas, handleWrite]
  )
}

export default useContractWrite
