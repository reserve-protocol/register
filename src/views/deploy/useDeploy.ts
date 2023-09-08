import FacadeWrite from 'abis/FacadeWrite'
import useContractWrite from 'hooks/useContractWrite'
import useDebounce from 'hooks/useDebounce'
import { useAtomValue } from 'jotai'
import { atomWithReset } from 'jotai/utils'
import { useMemo } from 'react'
import { useFormContext, useFormState, useWatch } from 'react-hook-form'
import { chainIdAtom } from 'state/atoms'
import { FACADE_WRITE_ADDRESS } from 'utils/addresses'
import {
  backupCollateralAtom,
  basketAtom,
  isBasketValidAtom,
  isRevenueValidAtom,
  revenueSplitAtom,
} from '../../components/rtoken-setup/atoms'
import { isValidExternalMapAtom } from './../../components/rtoken-setup/atoms'
import { getDeployParameters } from './utils'

export const deployIdAtom = atomWithReset('')

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
    isBasketValid && isRevenueSplitValid && isValidExternalMap
  // TODO: Uncomment to enable validation
  // &&
  // isValid &&
  // !isValidating

  return useMemo(() => {
    if (!isDeployValid) return undefined

    return getDeployParameters(
      getValues(),
      primaryBasket,
      backupBasket,
      revenueSplit
    )
  }, [primaryBasket, isDeployValid, backupBasket, revenueSplit, formFields])
}

export const useDeploy = () => {
  const txData = useDeployParams()
  const chainId = useAtomValue(chainIdAtom)

  return useContractWrite({
    address: FACADE_WRITE_ADDRESS[chainId],
    abi: FacadeWrite,
    functionName: 'deployRToken',
    args: txData,
    enabled: !!txData,
  })
}

export default useDeploy
