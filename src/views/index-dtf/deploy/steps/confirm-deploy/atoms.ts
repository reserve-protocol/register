import { atom } from 'jotai'
import { atomWithReset } from 'jotai/utils'
import { DeployInputs } from '../../form-fields'

export const indexDeployFormDataAtom = atomWithReset<DeployInputs | undefined>(
  undefined
)

// Signal to programmatically open the deploy drawer (e.g. from NextButton in permissionless flow)
export const triggerDeployDrawerAtom = atom(false)
