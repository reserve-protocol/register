import { useMemo } from 'react'
import {
  useContractWrite as _useContractWrite,
  usePrepareContractWrite,
} from 'wagmi'
import { getSafeGasLimit } from './../utils/index'
import useGasEstimate from './useGasEstimate'
import type { Abi } from 'abitype'
import type { UsePrepareContractWriteConfig } from 'wagmi'
import { useAtomValue } from 'jotai'
import { isWalletInvalidAtom } from 'state/atoms'

// Extends wagmi to include gas estimate and gas limit multiplier
const useContractWrite = <
  TAbi extends Abi | readonly unknown[],
  TFunctionName extends string,
  TChainId extends number
>(
  call: UsePrepareContractWriteConfig<TAbi, TFunctionName, TChainId> = {} as any
) => {
  const isE2E = import.meta.env.VITE_TESTING && window.e2e
  const isWalletInvalid = useAtomValue(isWalletInvalidAtom)
  const { config, isSuccess, error } = usePrepareContractWrite(
    !isWalletInvalid
      ? ({
          ...call,
          ...(isE2E ? { gas: 1000000n } : {}),
        } as UsePrepareContractWriteConfig)
      : undefined
  )

  const gas = useGasEstimate(isSuccess ? config.request : null)

  const contractWrite = _useContractWrite({
    ...config,
    request: {
      ...config.request,
      gas: gas.result && !isE2E ? getSafeGasLimit(gas.result) : undefined,
    },
  })

  return useMemo(
    () => ({
      ...contractWrite,
      gas,
      validationError: error,
      isReady:
        !!call?.address && (!!gas.result || isE2E) && !!contractWrite.write,
      hash: !contractWrite.isError ? contractWrite.data?.hash : undefined,
    }),
    [contractWrite]
  )
}

export default useContractWrite
