import { isInactiveDTF } from '@/hooks/use-dtf-status'
import useIndexDTFList, { IndexDTFItem } from '@/hooks/useIndexDTFList'
import { chainFilterAtom, searchFilterAtom } from '../atoms'
import { getExposureTickerAssets } from '../components/highlighted-dtfs/utils'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

const useFilteredDTFIndex = () => {
  const { data, isLoading } = useIndexDTFList({ withExposure: true })
  const search = useAtomValue(searchFilterAtom)
  const chains = useAtomValue(chainFilterAtom)

  return useMemo(() => {
    if (!data) {
      return { data: [] as IndexDTFItem[], isLoading }
    }

    const filtered = data.filter((dtf) => {
      if (!search && isInactiveDTF(dtf.status)) {
        return false
      }

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
        const exposureMatch = getExposureTickerAssets(
          dtf,
          Number.MAX_SAFE_INTEGER
        ).some((asset) => asset.symbol.toLowerCase().includes(searchLower))

        if (!nameMatch && !symbolMatch && !exposureMatch && !tagMatch) {
          return false
        }
      }

      return true
    })

    return { data: filtered, isLoading }
  }, [data, search, chains, isLoading])
}

export default useFilteredDTFIndex
