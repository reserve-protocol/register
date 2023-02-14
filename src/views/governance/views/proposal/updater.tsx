import { useSetAtom } from 'jotai'
import { useEffect } from 'react'
import {
  backupChangesAtom,
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
  const backupChanges = useBackupChanges()
  const revenueChanges = useRevenueSplitChanges()
  const parameterChanges = useParametersChanges()
  const roleChanges = useRoleChanges()
  const setBackupChanges = useSetAtom(backupChangesAtom)
  const setRevenueChanges = useSetAtom(revenueSplitChangesAtom)
  const setParameterChanges = useSetAtom(parametersChangesAtom)
  const setRoleChanges = useSetAtom(roleChangesAtom)

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

  return null
}

export default ChangesUpdater
