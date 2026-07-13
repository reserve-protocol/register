import { ChainId } from '@/utils/chains'
import { isHiddenDtfSymbol } from '@/utils/constants'
import { atom } from 'jotai'
import { VoteLockPosition } from './hooks/use-vote-lock-positions'
import { IndexDTFItem } from '@/hooks/useIndexDTFList'
import { deprecatedDTFAddressesAtom } from '@/views/earn/atoms'

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
  const deprecated = get(deprecatedDTFAddressesAtom)

  if (!positions) return undefined

  return positions.reduce<VoteLockPosition[]>((acc, position) => {
    const visibleDtfs = position.dtfs.filter(
      (dtf) => !isHiddenDtfSymbol(dtf.symbol)
    )

    // Chain filter
    if (!chains.includes(position.chainId.toString())) {
      return acc
    }

    // Hide positions that only govern hidden DTFs
    if (position.dtfs.length > 0 && visibleDtfs.length === 0) {
      return acc
    }

    // Deprecated filter: hide positions that only govern deprecated DTFs
    if (
      visibleDtfs.length > 0 &&
      visibleDtfs.every((dtf) => deprecated.has(dtf.address.toLowerCase()))
    ) {
      return acc
    }

    // Search filter (by gov token symbol/name or DTF symbol/name)
    if (search) {
      const matchesGovToken =
        position.underlying.token.symbol.toLowerCase().includes(search) ||
        position.underlying.token.name.toLowerCase().includes(search) ||
        position.token.symbol.toLowerCase().includes(search)

      const matchesDTF = visibleDtfs.some(
        (dtf) =>
          dtf.symbol.toLowerCase().includes(search) ||
          dtf.name.toLowerCase().includes(search)
      )

      if (!matchesGovToken && !matchesDTF) return acc
    }

    // DTF filter
    if (selectedDtfs.length > 0) {
      const positionDtfs = visibleDtfs.map((dtf) => dtf.symbol)
      const hasSelectedDtf = selectedDtfs.some((dtf) =>
        positionDtfs.includes(dtf)
      )
      if (!hasSelectedDtf) return acc
    }

    acc.push({ ...position, dtfs: visibleDtfs })
    return acc
  }, [])
})

// Get unique DTFs from all positions for the dropdown options
export const availableDtfsAtom = atom((get) => {
  const positions = get(voteLockPositionsAtom)
  const deprecated = get(deprecatedDTFAddressesAtom)
  if (!positions) return []

  const dtfSet = new Set<string>()
  positions.forEach((position) => {
    position.dtfs.forEach((dtf) => {
      if (
        !isHiddenDtfSymbol(dtf.symbol) &&
        !deprecated.has(dtf.address.toLowerCase())
      ) {
        dtfSet.add(dtf.symbol)
      }
    })
  })

  return Array.from(dtfSet).sort()
})
