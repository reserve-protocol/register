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
  rtokenBackupAtom,
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
  const backup = useAtomValue(rtokenBackupAtom)
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
  }, [basket])

  useEffect(() => {
    setSetupBackupBasket(backup)
  }, [backup])

  useEffect(() => {
    setSetupRevenueSplit(revenueSplit)
  }, [revenueSplit])

  useEffect(() => {
    reset(tokenParameters)
  }, [tokenParameters])

  return null
}

export default RTokenDataUpdater
