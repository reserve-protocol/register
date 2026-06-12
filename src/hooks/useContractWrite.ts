import { useCallback, useMemo } from 'react'
import {
  useSimulateContract,
  UseSimulateContractParameters,
  useWriteContract,
} from 'wagmi'
import type { Abi } from 'abitype'
import { useAtomValue } from 'jotai'
import { isWalletInvalidAtom } from 'state/atoms'
import { ContractFunctionName } from 'viem'

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

  const contractWrite = useWriteContract()
  const { writeContract } = contractWrite

  const handleWrite = useCallback(() => {
    if (data?.request) {
      writeContract(data.request)
    }
  }, [data?.request, writeContract])

  return useMemo(
    () => ({
      ...contractWrite,
      gas: undefined,
      validationError: error,
      isReady: !!data?.request && isSuccess,
      isLoading: contractWrite.isPending,
      hash: contractWrite.data,
      write: handleWrite,
    }),
    [error, isLoading, contractWrite, handleWrite]
  )
}

export default useContractWrite
