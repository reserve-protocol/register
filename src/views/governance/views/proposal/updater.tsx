import {
  isBasketValidAtom,
  isRevenueValidAtom,
  isValidExternalMapAtom,
} from 'components/rtoken-setup/atoms'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import {
  backupChangesAtom,
  isProposalValidAtom,
  parametersChangesAtom,
  revenueSplitChangesAtom,
  roleChangesAtom,
} from './atoms'
import useBackupChanges from './hooks/useBackupChanges'
import useParametersChanges from './hooks/useParametersChanges'
import useRevenueSplitChanges from './hooks/useRevenueSplitChanges'
import useRoleChanges from './hooks/useRoleChanges'

// TODO: validation, etc
const ChangesUpdater = () => {
  // Changes hooks
  const backupChanges = useBackupChanges()
  const revenueChanges = useRevenueSplitChanges()
  const parameterChanges = useParametersChanges()
  const roleChanges = useRoleChanges()
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
      !backupChanges.count &&
      !revenueChanges.count &&
      !parameterChanges.length &&
      !roleChanges.length
    ) {
      setValidState(false)
    } else {
      setValidState(
        isBasketValid && isRevenueSplitValid && isValidExternalMap && isValid
      )
    }
  }, [backupChanges, revenueChanges, parameterChanges, roleChanges, isValid])

  return null
}

export default ChangesUpdater
