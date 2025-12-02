import { ChainId } from '@/utils/chains'
import { atom } from 'jotai'
import { VoteLockPosition } from './hooks/use-vote-lock-positions'
import { IndexDTFItem } from '@/hooks/useIndexDTFList'

export const voteLockPositionsAtom = atom<VoteLockPosition[] | undefined>(
  undefined
)

// Store the fetched Index DTF list
export const indexDTFListAtom = atom<IndexDTFItem[]>([])

// Create a map of DTF symbol to DTF data for quick lookups
export const dtfDataMapAtom = atom((get) => {
  const dtfList = get(indexDTFListAtom)
  const map = new Map<string, IndexDTFItem>()

  dtfList.forEach((dtf) => {
    map.set(dtf.symbol, dtf)
  })

  return map
})

export const searchFilterAtom = atom('')

// Simple atom that works with ChainFilter - includes all Index DTF supported chains
// Note: Arbitrum is deprecated for Index DTFs, BSC is supported
export const chainsFilterAtom = atom([
  ChainId.Mainnet.toString(),
  ChainId.Base.toString(),
  ChainId.BSC.toString(),
])

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

    // Search filter (by gov token symbol/name or DTF symbol/name)
    if (search) {
      // Check gov token matches
      const matchesGovToken =
        position.underlying.token.symbol.toLowerCase().includes(search) ||
        position.underlying.token.name.toLowerCase().includes(search) ||
        position.token.symbol.toLowerCase().includes(search)

      // Check if any DTF matches
      const matchesDTF = position.dtfs.some(dtf =>
        dtf.symbol.toLowerCase().includes(search) ||
        dtf.name.toLowerCase().includes(search)
      )

      if (!matchesGovToken && !matchesDTF) return false
    }

    // DTF filter
    if (selectedDtfs.length > 0) {
      const positionDtfs = position.dtfs.map((dtf) => dtf.symbol)
      const hasSelectedDtf = selectedDtfs.some((dtf) =>
        positionDtfs.includes(dtf)
      )
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
  positions.forEach((position) => {
    position.dtfs.forEach((dtf) => {
      dtfSet.add(dtf.symbol)
    })
  })

  return Array.from(dtfSet).sort()
})
