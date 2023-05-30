import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { rTokenConfigurationAtom } from 'state/atoms'
import { StringMap } from 'types'

export interface ParameterChange {
  field: string
  current: string
  proposed: string
}

/**
 * Listen for form differences with respect of current RToken stored parameters
 */
const useParametersChanges = (): ParameterChange[] => {
  const {
    getValues,
    formState: { isDirty },
  } = useFormContext()
  const formFields = useWatch()
  const currentParameters = useAtomValue(rTokenConfigurationAtom)

  return useMemo(() => {
    if (!isDirty || !currentParameters) {
      return []
    }

    const changes: ParameterChange[] = []
    const currentValues = getValues()

    for (const key of Object.keys(currentParameters)) {
      if (currentParameters[key] !== currentValues[key]) {
        changes.push({
          field: key,
          current: currentParameters[key],
          proposed: currentValues[key] || 'Invalid',
        })
      }
    }

    return changes
  }, [JSON.stringify(formFields), isDirty, currentParameters])
}

export default useParametersChanges
