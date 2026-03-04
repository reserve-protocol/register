import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { chainFilterAtom, searchFilterAtom } from '../atoms'
import { Top100DTF } from '../types'

const useTop100Filtered = (dtfs: Top100DTF[]) => {
  const search = useAtomValue(searchFilterAtom)
  const chains = useAtomValue(chainFilterAtom)

  return useMemo(() => {
    if (!dtfs.length) return []

    const filtered = dtfs.filter((dtf) => {
      if (chains.length && !chains.includes(dtf.chainId)) {
        return false
      }

      if (search) {
        const searchLower = search.toLowerCase()
        const nameMatch = dtf.name.toLowerCase().includes(searchLower)
        const symbolMatch = dtf.symbol.toLowerCase().includes(searchLower)
        const basketMatch = dtf.basket?.some((token) =>
          token.symbol.toLowerCase().includes(searchLower)
        )

        if (!nameMatch && !symbolMatch && !basketMatch) {
          return false
        }
      }

      return true
    })

    // Sort by created time desc (newest first)
    filtered.sort((a, b) => b.timestamp - a.timestamp)

    return filtered
  }, [dtfs, search, chains])
}

export default useTop100Filtered
