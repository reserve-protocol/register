import {
  backupCollateralAtom,
  basketAtom,
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

const RTokenDataUpdater = () => {
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
    setSetupBasket(basket)
  }, [JSON.stringify(basket)])

  useEffect(() => {
    setSetupBackupBasket(backup)
  }, [JSON.stringify(backup)])

  useEffect(() => {
    setSetupRevenueSplit(revenueSplit)
  }, [JSON.stringify(revenueSplit)])

  useEffect(() => {
    // Delay reset to end of render
    setTimeout(() => reset(tokenParameters), 10)
  }, [tokenParameters])

  return null
}

export default RTokenDataUpdater
