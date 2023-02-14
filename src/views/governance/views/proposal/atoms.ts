import { atomWithReset } from 'jotai/utils'
import { atom } from 'jotai'
import { BackupChanges } from './hooks/useBackupChanges'
import { RoleChange } from './hooks/useRoleChanges'
import { ParameterChange } from './hooks/useParametersChanges'
import { RevenueSplitChanges } from './hooks/useRevenueSplitChanges'

export const isNewBasketProposedAtom = atom(false)

export const proposedRolesAtom = atomWithReset({
  owners: [] as string[],
  pausers: [] as string[],
  freezers: [] as string[],
  longFreezers: [] as string[],
})

export const revenueSplitChangesAtom = atomWithReset<RevenueSplitChanges>({
  externals: [],
  distributions: [],
  count: 0,
})

export const parametersChangesAtom = atomWithReset<ParameterChange[]>([])

export const roleChangesAtom = atomWithReset<RoleChange[]>([])

export const backupChangesAtom = atomWithReset<BackupChanges>({
  collateralChanges: [],
  priorityChanges: [],
  diversityFactor: [],
  count: 0,
})

export const isProposalValidAtom = atom(false)
export const isProposalEditingAtom = atom(true)
