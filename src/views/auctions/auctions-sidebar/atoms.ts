import { loadable } from 'jotai/utils'
import { onlyNonNullAtom, simplifyLoadable } from 'utils/atoms/utils'

const accumulatedRevenue = loadable(
  onlyNonNullAtom(async (get) => {
    return {}
  })
)

export const accumulatedRevenueAtom = simplifyLoadable(accumulatedRevenue)
