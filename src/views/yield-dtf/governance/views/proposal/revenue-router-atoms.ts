import { atom } from 'jotai'
import { atomWithReset } from 'jotai/utils'
import { rTokenAtom } from '@/state/atoms'
import { isEusdRevenueRouter } from '../../utils'
import {
  buildRevenueRouterCalls,
  DestinationInput,
  getDestinationChanges,
  parseDestinations,
  RevenueDestination,
} from './utils/revenue-router'

export const revenueRouterEnabledAtom = atom((get) =>
  isEusdRevenueRouter(get(rTokenAtom))
)
export const revenueRouterCurrentAtom = atomWithReset<
  readonly RevenueDestination[] | undefined
>(undefined)
export const revenueRouterReadErrorAtom = atomWithReset(false)
export const revenueRouterDraftAtom = atomWithReset<{
  baseline: readonly RevenueDestination[]
  proposed: DestinationInput[]
} | null>(null)

// Diff against the list the user started from; if it changed onchain since, execution reverts.
export const revenueRouterChangesAtom = atom((get) => {
  const empty = { removed: [], added: [], calls: [], valid: true }
  const draft = get(revenueRouterDraftAtom)
  if (!get(revenueRouterEnabledAtom) || !draft) return empty
  const proposed = parseDestinations(draft.proposed)
  if (!proposed) return { ...empty, valid: false }
  return {
    ...getDestinationChanges(draft.baseline, proposed),
    calls: buildRevenueRouterCalls(draft.baseline, proposed),
    valid: true,
  }
})
