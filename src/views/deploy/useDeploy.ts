import FacadeWrite from 'abis/FacadeWrite'
import { useAtomValue } from 'jotai'
import { atomWithReset } from 'jotai/utils'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useFormContext, useFormState, useWatch } from 'react-hook-form'
import { chainIdAtom, ethPriceAtom, gasFeeAtom } from 'state/atoms'
import { FACADE_WRITE_ADDRESS } from 'utils/addresses'
import { EstimateContractGasParameters, formatEther } from 'viem'
import {
  useContractWrite,
  usePrepareContractWrite,
  usePublicClient,
} from 'wagmi'
import {
  backupCollateralAtom,
  basketAtom,
  isBasketValidAtom,
  isRevenueValidAtom,
  revenueSplitAtom,
} from '../../components/rtoken-setup/atoms'
import { isValidExternalMapAtom } from './../../components/rtoken-setup/atoms'
import { getDeployParameters } from './utils'
import useDebounce from 'hooks/useDebounce'

export const deployIdAtom = atomWithReset('')

interface GasEstimation {
  isLoading: boolean
  result: bigint | null
  estimateUsd: number | null
}

const defaultGas: GasEstimation = {
  isLoading: false,
  result: null,
  estimateUsd: null,
}

export const useTxGas = (
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

export const useDeployParams = () => {
  const { getValues } = useFormContext()
  const isBasketValid = useAtomValue(isBasketValidAtom)
  const isRevenueSplitValid = useAtomValue(isRevenueValidAtom)
  const isValidExternalMap = useAtomValue(isValidExternalMapAtom)
  const primaryBasket = useAtomValue(basketAtom)
  const backupBasket = useAtomValue(backupCollateralAtom)
  const revenueSplit = useAtomValue(revenueSplitAtom)
  const formFields = useDebounce(useWatch(), 500)
  const { isValid, isValidating } = useFormState()

  const isDeployValid =
    isBasketValid &&
    isRevenueSplitValid &&
    isValidExternalMap &&
    isValid &&
    !isValidating

  return useMemo(() => {
    if (!isDeployValid) return undefined

    return (
      getDeployParameters(
        getValues(),
        primaryBasket,
        backupBasket,
        revenueSplit
      ) || undefined
    )
  }, [primaryBasket, isDeployValid, backupBasket, revenueSplit, formFields])
}

export const useDeploy = () => {
  const txData = useDeployParams()
  const chainId = useAtomValue(chainIdAtom)

  const { config, error, isSuccess } = usePrepareContractWrite({
    address: FACADE_WRITE_ADDRESS[chainId],
    abi: FacadeWrite,
    functionName: 'deployRToken',
    args: txData,
    enabled: !!txData,
  })

  const gas = useTxGas(isSuccess ? config.request : null)

  const writeConfig = useMemo(() => {
    return {
      ...config,
      request: {
        ...config.request,
        gas: gas.result ? (gas.result * 150n) / 100n : undefined, // bump gas limit by 1.5
      },
    }
  }, [gas.result, config])

  const { write } = useContractWrite(writeConfig)

  const handleDeploy = useCallback(() => {
    if (write && gas.result) {
    }
  }, [write, gas.result])

  return useMemo(
    () => ({
      error,
      isValid: gas.result && !!write,
      deploy: handleDeploy,
      gas,
    }),
    [gas, error, handleDeploy]
  )
}

export default useDeploy
