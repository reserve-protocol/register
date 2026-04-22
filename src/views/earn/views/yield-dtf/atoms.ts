import { ListedToken } from '@/hooks/useTokenList'
import { ChainId } from '@/utils/chains'
import { deprecatedDTFAddressesAtom } from '@/views/earn/atoms'
import { atom } from 'jotai'

export const yieldDTFListAtom = atom<ListedToken[] | undefined>(undefined)

export const searchFilterAtom = atom('')
// Only include Ethereum and Base for yield DTFs (Arbitrum excluded)
export const chainsFilterAtom = atom([
  ChainId.Mainnet.toString(),
  ChainId.Base.toString(),
])
export const dtfsFilterAtom = atom<string[]>([])

export const filteredYieldDTFListAtom = atom((get) => {
  const positions = get(yieldDTFListAtom)
  const search = get(searchFilterAtom).toLowerCase()
  const chains = get(chainsFilterAtom)
  const selectedDtfs = get(dtfsFilterAtom)
  const deprecated = get(deprecatedDTFAddressesAtom)

  if (!positions) return undefined

  return positions.filter((position) => {
    // Always filter out Arbitrum DTFs even if not in chain filter
    if (position.chain === ChainId.Arbitrum) {
      return false
    }

    // Deprecated filter
    if (deprecated.has(position.id.toLowerCase())) {
      return false
    }

    // Chain filter
    if (!chains.includes(position.chain.toString())) {
      return false
    }

    // Search filter by DTF name or symbol
    if (search) {
      return (
        position.symbol.toLowerCase().includes(search) ||
        position.name.toLowerCase().includes(search)
      )
    }

    // DTF filter
    if (selectedDtfs.length > 0) {
      return selectedDtfs.includes(position.symbol)
    }

    return true
  })
})

// Get unique DTFs from all positions for the dropdown options
export const availableDtfsAtom = atom((get) => {
  const positions = get(yieldDTFListAtom)
  const deprecated = get(deprecatedDTFAddressesAtom)
  if (!positions) return []

  const dtfSet = new Set<string>()
  positions
    .filter(
      (position) =>
        position.chain !== ChainId.Arbitrum &&
        !deprecated.has(position.id.toLowerCase())
    )
    .forEach((position) => {
      dtfSet.add(position.symbol)
    })

  return Array.from(dtfSet).sort()
})
