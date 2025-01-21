import { atomWithReset } from 'jotai/utils'
import { DeployInputs } from '../../form-fields'

export const indexDeployFormDataAtom = atomWithReset<DeployInputs | undefined>(
  undefined
)
