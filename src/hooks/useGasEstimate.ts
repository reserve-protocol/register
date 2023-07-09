import { useAtomValue } from 'jotai'
import { useEffect, useState } from 'react'
import { ethPriceAtom, gasFeeAtom } from 'state/atoms'
import { EstimateContractGasParameters, formatEther } from 'viem'
import { usePublicClient } from 'wagmi'

export interface GasEstimation {
  isLoading: boolean
  result: bigint | null
  estimateUsd: number | null
  estimateEth: bigint | null
}

const defaultGas: GasEstimation = {
  isLoading: false,
  result: null,
  estimateUsd: null,
  estimateEth: null,
}

export const useGasEstimate = (
  call: EstimateContractGasParameters | null
): GasEstimation => {
  const client = usePublicClient()
  const fee = useAtomValue(gasFeeAtom)
  const ethPrice = useAtomValue(ethPriceAtom)
  const [state, setState] = useState(defaultGas)

  const estimateGas = async () => {
    // The app only show gas estimation on USD, if price data is not ready -> skip
    if (!client || !call || !fee || !ethPrice) {
      setState(defaultGas)
      return
    }

    setState({ ...defaultGas, isLoading: true })

    try {
      const result = await client.estimateContractGas(call)

      setState({
        isLoading: false,
        result,
        estimateUsd: Number(formatEther(result * fee)) * ethPrice,
        estimateEth: ((result * 150n) / 100n) * fee,
      })
    } catch (e) {
      setState(defaultGas)
    }
  }

  useEffect(() => {
    estimateGas()
  }, [client, fee, ethPrice, call])

  return state
}

export default useGasEstimate
