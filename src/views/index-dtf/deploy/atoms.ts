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

export const basketAtom = atomWithReset<Token[]>([])

export const daoTokenAddressAtom = atom<Address | undefined>(undefined)

export const selectedGovernanceOptionAtom = atom<GovernanceTypes>(
  'governanceERC20address'
)

export const validatedSectionsAtom = atomWithReset<
  Record<DeployStepId, boolean>
>({
  metadata: false,
  basket: false,
  governance: false,
  'revenue-distribution': false,
  auctions: false,
  roles: false,
  voting: false,
})

export const formReadyForSubmitAtom = atom((get) => {
  const validatedSections = get(validatedSectionsAtom)
  return Object.values(validatedSections).every(Boolean)
})
