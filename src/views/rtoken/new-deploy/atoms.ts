import { atom } from 'jotai'
import { DeployStepId } from './form-fields'

export const deployStepAtom = atom<DeployStepId | undefined>(undefined)
