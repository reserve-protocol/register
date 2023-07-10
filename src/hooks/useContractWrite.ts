import { useMemo } from 'react'
import {
  UsePrepareContractWriteConfig,
  useContractWrite as _useContractWrite,
  usePrepareContractWrite,
} from 'wagmi'
import { getSafeGasLimit } from './../utils/index'
import useGasEstimate from './useGasEstimate'

// Extends wagmi to include gas estimate and gas limit multiplier
const useContractWrite = (call: UsePrepareContractWriteConfig) => {
  const { config, isSuccess } = usePrepareContractWrite(call)
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
