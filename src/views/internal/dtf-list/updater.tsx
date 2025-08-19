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
import { useDTFBalances } from './hooks/use-dtf-balances'
import { walletAtom } from '@/state/atoms'

const Updater = () => {
  const setDtfList = useSetAtom(dtfListAtom)
  const setIsLoading = useSetAtom(isLoadingAtom)
  const setTotalCount = useSetAtom(totalCountAtom)
  const setMarketCaps = useSetAtom(marketCapsAtom)
  
  const currentPage = useAtomValue(currentPageAtom)
  const pageSize = useAtomValue(pageSizeAtom)
  const wallet = useAtomValue(walletAtom)
  
  // Fetch DTF list
  const { data: dtfList, isLoading } = useInternalDTFList(currentPage, pageSize)
  
  // Fetch total count
  const { data: totalCount } = useInternalDTFCount()
  
  // Fetch market caps
  const { data: marketCaps } = useDTFMarketCaps(dtfList || [])
  
  // Fetch balances if wallet is connected
  const { balances } = useDTFBalances(dtfList || [])
  
  useEffect(() => {
    if (dtfList) {
      // Add balance information to DTFs
      const dtfsWithBalance = dtfList.map(dtf => {
        const key = `${dtf.chainId}-${dtf.id.toLowerCase()}`
        const balance = balances[key]
        return {
          ...dtf,
          hasBalance: balance ? balance > 0n : false
        }
      })
      setDtfList(dtfsWithBalance)
    }
  }, [dtfList, balances, setDtfList])
  
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