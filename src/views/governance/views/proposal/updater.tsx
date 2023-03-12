import {
  backupCollateralAtom,
  Basket,
  basketAtom,
  isBasketValidAtom,
  isRevenueValidAtom,
  isValidExternalMapAtom,
  revenueSplitAtom,
} from 'components/rtoken-setup/atoms'
import { useAtomValue, useSetAtom } from 'jotai'
import { useResetAtom } from 'jotai/utils'
import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import {
  rTokenBackupAtom,
  rTokenBasketAtom,
  rTokenParamsAtom,
  rTokenRevenueSplitAtom,
} from 'state/atoms'
import { truncateDecimals } from 'utils'
import {
  backupChangesAtom,
  basketChangesAtom,
  isNewBackupProposedAtom,
  isNewBasketProposedAtom,
  isProposalValidAtom,
  parametersChangesAtom,
  revenueSplitChangesAtom,
  roleChangesAtom,
} from './atoms'
import useBackupChanges from './hooks/useBackupChanges'
import useBasketChanges from './hooks/useBasketChanges'
import useParametersChanges from './hooks/useParametersChanges'
import useRevenueSplitChanges from './hooks/useRevenueSplitChanges'
import useRoleChanges from './hooks/useRoleChanges'

export const RTokenDataUpdater = () => {
  const { reset } = useFormContext()
  // Setup atoms
  const setSetupBasket = useSetAtom(basketAtom)
  const resetBasket = useResetAtom(basketAtom)
  const setSetupBackupBasket = useSetAtom(backupCollateralAtom)
  const resetBackup = useResetAtom(backupCollateralAtom)
  const setSetupRevenueSplit = useSetAtom(revenueSplitAtom)
  const resetRevenueSplit = useResetAtom(revenueSplitAtom)
  // RToken state data
  const basket = useAtomValue(rTokenBasketAtom)
  const backup = useAtomValue(rTokenBackupAtom)
  const revenueSplit = useAtomValue(rTokenRevenueSplitAtom)
  const tokenParameters = useAtomValue(rTokenParamsAtom)

  useEffect(() => {
    return () => {
      resetBackup()
      resetBasket()
      resetRevenueSplit()
    }
  }, [])

  useEffect(() => {
    const setupBasket: Basket = {}

    for (const targetUnit of Object.keys(basket)) {
      const basketLength = basket[targetUnit].collaterals.length

      const distribution = new Array(basketLength - 1).fill(
        truncateDecimals(100 / basketLength)
      )
      const sum = distribution.reduce((a, b) => a + b, 0)
      distribution.push(100 - sum)

      setupBasket[targetUnit] = {
        collaterals: basket[targetUnit].collaterals,
        distribution,
        scale: '1',
      }
    }

    setSetupBasket(setupBasket)
  }, [JSON.stringify(basket)])

  useEffect(() => {
    setSetupBackupBasket(backup)
  }, [JSON.stringify(backup)])

  useEffect(() => {
    setTimeout(() => setSetupRevenueSplit(revenueSplit), 10)
    setSetupRevenueSplit(revenueSplit)
  }, [JSON.stringify(revenueSplit)])

  useEffect(() => {
    // Delay reset to end of render
    setTimeout(() => reset(tokenParameters), 10)
  }, [tokenParameters])

  return null
}

// TODO: validation, etc
export const ChangesUpdater = () => {
  // Changes hooks
  const backupChanges = useBackupChanges()
  const basketChanges = useBasketChanges()
  const revenueChanges = useRevenueSplitChanges()
  const parameterChanges = useParametersChanges()
  const roleChanges = useRoleChanges()
  const isNewBasket = useAtomValue(isNewBasketProposedAtom)
  const isNewBackup = useAtomValue(isNewBackupProposedAtom)
  // Valid listeners
  const isBasketValid = useAtomValue(isBasketValidAtom)
  const isRevenueSplitValid = useAtomValue(isRevenueValidAtom)
  const isValidExternalMap = useAtomValue(isValidExternalMapAtom)
  const {
    formState: { isValid },
  } = useFormContext()
  // Setters
  const setBackupChanges = useSetAtom(backupChangesAtom)
  const setRevenueChanges = useSetAtom(revenueSplitChangesAtom)
  const setParameterChanges = useSetAtom(parametersChangesAtom)
  const setRoleChanges = useSetAtom(roleChangesAtom)
  const setValidState = useSetAtom(isProposalValidAtom)
  const setBasketChanges = useSetAtom(basketChangesAtom)

  useEffect(() => {
    setBasketChanges(basketChanges)
  }, [basketChanges])

  useEffect(() => {
    setBackupChanges(backupChanges)
  }, [backupChanges])

  useEffect(() => {
    setRevenueChanges(revenueChanges)
  }, [revenueChanges])

  useEffect(() => {
    setParameterChanges(parameterChanges)
  }, [parameterChanges])

  useEffect(() => {
    setRoleChanges(roleChanges)
  }, [roleChanges])

  useEffect(() => {
    // Check if there is any change to be proposed to mark it as valid
    if (
      !isNewBackup &&
      !revenueChanges.count &&
      !parameterChanges.length &&
      !roleChanges.length &&
      !isNewBasket
    ) {
      setValidState(false)
    } else {
      setValidState(
        (!isNewBasket || isBasketValid) &&
          isRevenueSplitValid &&
          isValidExternalMap &&
          isValid
      )
    }
  }, [
    isNewBasket,
    backupChanges,
    revenueChanges,
    parameterChanges,
    roleChanges,
    isValid,
  ])

  return null
}

export default () => (
  <>
    <RTokenDataUpdater />
    <ChangesUpdater />
  </>
)
