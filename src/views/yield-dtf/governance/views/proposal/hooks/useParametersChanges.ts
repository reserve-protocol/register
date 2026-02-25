import { atom, useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { rTokenConfigurationAtom, rTokenGovernanceAtom } from 'state/atoms'
import { StringMap } from 'types'
import { isTimeunitGovernance } from '../../../utils'

export interface ParameterChange {
  field: string
  current: string
  proposed: string
}

const currentParamsAtom = atom((get) => {
  const config = get(rTokenConfigurationAtom)
  const governance = get(rTokenGovernanceAtom)
  const isTimeunit = isTimeunitGovernance(governance.name)

  if (!config || !governance.executionDelay) {
    return {} as StringMap
  }

  return {
    ...config,
    votingDelay: Number(governance.votingDelay || 0) / (isTimeunit ? 3600 : 1),
    votingPeriod: Number(governance.votingPeriod || 0) / (isTimeunit ? 3600 : 1),
    minDelay: +governance.executionDelay / 60 / 60,
    proposalThresholdAsMicroPercent: governance.proposalThreshold,
    quorumPercent: governance.quorumNumerator,
  }
})

/**
 * Listen for form differences with respect of current RToken stored parameters
 */
const useParametersChanges = (): ParameterChange[] => {
  const {
    getValues,
    formState: { isDirty },
  } = useFormContext()
  const formFields = useWatch()
  const currentParameters = useAtomValue(currentParamsAtom)

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
