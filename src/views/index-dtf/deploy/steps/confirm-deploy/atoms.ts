import { atom } from 'jotai'
import { DeployInputs } from '../../form-fields'

export const indexDeployFormDataAtom = atom<DeployInputs | undefined>(undefined)
