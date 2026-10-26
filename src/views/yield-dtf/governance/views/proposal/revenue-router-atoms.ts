import { atom } from 'jotai'
import { atomWithReset } from 'jotai/utils'
import { rTokenAtom } from '@/state/atoms'
import {
  buildRevenueRouterCalls,
  DestinationInput,
  getDestinationChanges,
  isEusdRevenueRouter,
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

export const revenueRouterChangesAtom = atom((get) => {
  const empty = { removed: [], added: [], calls: [], valid: true, stale: false }
  if (!get(revenueRouterEnabledAtom)) return empty
  const draft = get(revenueRouterDraftAtom)
  if (!draft) return empty
  const current = get(revenueRouterCurrentAtom)
  const drift = current && getDestinationChanges(draft.baseline, current)
  const stale = !drift || !!(drift.removed.length || drift.added.length)
  const proposed = parseDestinations(draft.proposed)
  if (!proposed || stale || get(revenueRouterReadErrorAtom)) {
    return { ...empty, valid: false, stale }
  }
  return {
    ...getDestinationChanges(current!, proposed),
    calls: buildRevenueRouterCalls(current!, proposed),
    valid: true,
    stale: false,
  }
})
