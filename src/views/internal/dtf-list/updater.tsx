import { useEffect } from 'react'
import { useSetAtom, useAtomValue } from 'jotai'
import { 
  dtfListAtom, 
  isLoadingAtom, 
  totalCountAtom,
  currentPageAtom,
  pageSizeAtom,
  marketCapsAtom 
} from './atoms'
import { useInternalDTFList, useInternalDTFCount } from './hooks/use-internal-dtf-list'
import { useDTFMarketCaps } from './hooks/use-dtf-market-caps'

const Updater = () => {
  const setDtfList = useSetAtom(dtfListAtom)
  const setIsLoading = useSetAtom(isLoadingAtom)
  const setTotalCount = useSetAtom(totalCountAtom)
  const setMarketCaps = useSetAtom(marketCapsAtom)
  
  const currentPage = useAtomValue(currentPageAtom)
  const pageSize = useAtomValue(pageSizeAtom)
  
  // Fetch DTF list
  const { data: dtfList, isLoading } = useInternalDTFList(currentPage, pageSize)
  
  // Fetch total count
  const { data: totalCount } = useInternalDTFCount()
  
  // Fetch market caps
  const { data: marketCaps } = useDTFMarketCaps(dtfList || [])
  
  useEffect(() => {
    if (dtfList) {
      setDtfList(dtfList)
    }
  }, [dtfList, setDtfList])
  
  useEffect(() => {
    setIsLoading(isLoading)
  }, [isLoading, setIsLoading])
  
  useEffect(() => {
    if (totalCount !== undefined) {
      setTotalCount(totalCount)
    }
  }, [totalCount, setTotalCount])
  
  useEffect(() => {
    if (marketCaps) {
      setMarketCaps(marketCaps)
    }
  }, [marketCaps, setMarketCaps])
  
  return null
}

export default Updater