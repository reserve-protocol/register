import { atom } from 'jotai'
import { atomWithReset } from 'jotai/utils'
import type { Address } from 'viem'
import { DeployInputs } from '../../form-fields'

export const indexDeployFormDataAtom = atomWithReset<DeployInputs | undefined>(
  undefined
)

// The governance fee share goes to the vault's token jar (which swaps fees into the vault's asset), not the vault.
export type GovernanceRecipient = {
  stToken: Address
  tokenJar?: Address
  error?: string
}
export const governanceRecipientAtom = atomWithReset<
  GovernanceRecipient | undefined
>(undefined)
