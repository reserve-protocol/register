import useIndexDTFList from '@/hooks/useIndexDTFList'
import { chainFilterAtom, searchFilterAtom } from '../atoms'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

const useFilteredDTFIndex = () => {
  const { data, isLoading } = useIndexDTFList()
  const search = useAtomValue(searchFilterAtom)
  const chains = useAtomValue(chainFilterAtom)

  return useMemo(() => {
    if (!data) {
      return { data: [], isLoading }
    }

    const filtered = data.filter((dtf) => {
      if (!chains.length || !chains.includes(dtf.chainId)) {
        return false
      }

      if (search) {
        const searchLower = search.toLowerCase()
        const nameMatch = dtf.name.toLowerCase().includes(searchLower)
        const symbolMatch = dtf.symbol.toLowerCase().includes(searchLower)
        const tagMatch = dtf.brand?.tags?.some((tag) =>
          tag.toLowerCase().includes(searchLower)
        )
        const collateralMatch = dtf.basket?.some((collateral) =>
          collateral.symbol.toLowerCase().includes(searchLower)
        )

        if (!nameMatch && !symbolMatch && !collateralMatch && !tagMatch) {
          return false
        }
      }

      return true
    })

    return { data: filtered, isLoading }
  }, [data, search, chains, isLoading])
}

export default useFilteredDTFIndex
