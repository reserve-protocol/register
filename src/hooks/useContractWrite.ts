import { useMemo } from 'react'
import {
  useContractWrite as _useContractWrite,
  usePrepareContractWrite,
} from 'wagmi'
import { getSafeGasLimit } from './../utils/index'
import useGasEstimate from './useGasEstimate'
import type { Abi } from 'abitype'
import type { UsePrepareContractWriteConfig } from 'wagmi'

// Extends wagmi to include gas estimate and gas limit multiplier
const useContractWrite = <
  TAbi extends Abi | readonly unknown[],
  TFunctionName extends string,
  TChainId extends number
>(
  call: UsePrepareContractWriteConfig<TAbi, TFunctionName, TChainId> = {} as any
) => {
  const { config, isSuccess, error } = usePrepareContractWrite(
    call as UsePrepareContractWriteConfig
  )

  const gas = useGasEstimate(isSuccess ? config.request : null)

  const writeConfig = useMemo(() => {
    return {
      ...config,
      request: {
        ...config.request,
        gas: gas.result ? getSafeGasLimit(gas.result) : undefined,
      },
    }
  }, [gas.result, config])

  const contractWrite = _useContractWrite(writeConfig)

  return useMemo(
    () => ({
      ...contractWrite,
      gas,
      isReady: !!gas.result && !!contractWrite.write,
      hash: !contractWrite.isError ? contractWrite.data?.hash : undefined,
    }),
    [contractWrite, gas]
  )
}

export default useContractWrite
