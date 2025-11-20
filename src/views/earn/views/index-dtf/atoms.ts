import { supportedChainList } from '@/utils/constants'
import { atom } from 'jotai'
import { VoteLockPosition } from './hooks/use-vote-lock-positions'

export const voteLockPositionsAtom = atom<VoteLockPosition[] | undefined>(
  undefined
)

export const searchFilterAtom = atom('')
export const chainsFilterAtom = atom(
  supportedChainList.map((chain) => chain.toString())
)
export const dtfsFilterAtom = atom<string[]>([])

// Derived atom that applies all filters to vote lock positions
export const filteredVoteLockPositionsAtom = atom((get) => {
  const positions = get(voteLockPositionsAtom)
  const search = get(searchFilterAtom).toLowerCase()
  const chains = get(chainsFilterAtom)
  const selectedDtfs = get(dtfsFilterAtom)

  if (!positions) return undefined

  return positions.filter((position) => {
    // Chain filter
    if (!chains.includes(position.chainId.toString())) {
      return false
    }

    // Search filter (by gov token symbol or name)
    if (search) {
      const matchesSearch =
        position.underlying.token.symbol.toLowerCase().includes(search) ||
        position.underlying.token.name.toLowerCase().includes(search) ||
        position.token.symbol.toLowerCase().includes(search)

      if (!matchesSearch) return false
    }

    // DTF filter
    if (selectedDtfs.length > 0) {
      const positionDtfs = position.dtfs.map(dtf => dtf.symbol)
      const hasSelectedDtf = selectedDtfs.some(dtf => positionDtfs.includes(dtf))
      if (!hasSelectedDtf) return false
    }

    return true
  })
})

// Get unique DTFs from all positions for the dropdown options
export const availableDtfsAtom = atom((get) => {
  const positions = get(voteLockPositionsAtom)
  if (!positions) return []

  const dtfSet = new Set<string>()
  positions.forEach(position => {
    position.dtfs.forEach(dtf => {
      dtfSet.add(dtf.symbol)
    })
  })

  return Array.from(dtfSet).sort()
})
