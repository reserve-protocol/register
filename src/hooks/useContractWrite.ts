import { useMemo } from 'react'
import {
  UsePrepareContractWriteConfig,
  usePrepareContractWrite,
  useContractWrite as _useContractWrite,
} from 'wagmi'
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
        gas: gas.result ? (gas.result * 150n) / 100n : undefined, // bump gas limit by 1.5
      },
    }
  }, [gas.result, config])

  const contractWrite = _useContractWrite(writeConfig)

  return useMemo(
    () => ({
      ...contractWrite,
      gas,
      isReady: !!gas.result && !!contractWrite.write,
    }),
    [contractWrite, gas]
  )
}

export default useContractWrite
