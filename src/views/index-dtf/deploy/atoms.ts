import { atom } from 'jotai'
import { DeployStepId } from './form-fields'
import { Token } from '@/types'
import { atomWithReset } from 'jotai/utils'
import { Address } from 'viem'
import { GovernanceTypes } from './steps/governance/governance-options'

export const deployStepAtom = atom<DeployStepId | undefined>(undefined)

export const selectedTokensAtom = atomWithReset<Token[]>([])
export const searchTokenAtom = atomWithReset<string>('')
export const daoCreatedAtom = atomWithReset<boolean>(false)

export const basketAtom = atom<Token[]>([])

export const formReadyForSubmitAtom = atom(false)

// TODO: Remove hardcoded value
export const daoTokenAddressAtom = atom<Address | undefined>(
  '0x8c02287d6eb56b7cedd715c399d1bf068c1bac5e'
)

export const selectedGovernanceOptionAtom = atom<GovernanceTypes>(
  'governanceERC20address'
)
