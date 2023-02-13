import { atomWithReset } from 'jotai/utils'
import { atom } from 'jotai'

export const isNewBasketProposedAtom = atom(false)

export const proposedRolesAtom = atomWithReset({
  owners: [] as string[],
  pausers: [] as string[],
  freezers: [] as string[],
  longFreezers: [] as string[],
})
