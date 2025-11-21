import { ListedToken } from '@/hooks/useTokenList'
import { ChainId } from '@/utils/chains'
import { atom } from 'jotai'

export const yieldDTFListAtom = atom<ListedToken[] | undefined>(undefined)

export const searchFilterAtom = atom('')
export const chainsFilterAtom = atom([
  ChainId.Mainnet.toString(),
  ChainId.Base.toString(),
  ChainId.Arbitrum.toString(),
])
export const dtfsFilterAtom = atom<string[]>([])

export const filteredYieldDTFListAtom = atom((get) => {
  const positions = get(yieldDTFListAtom)
  const search = get(searchFilterAtom).toLowerCase()
  const chains = get(chainsFilterAtom)
  const selectedDtfs = get(dtfsFilterAtom)

  if (!positions) return undefined

  return positions.filter((position) => {
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
      return selectedDtfs.includes(position.symbol.toLowerCase())
    }

    return true
  })
})
