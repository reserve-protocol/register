import { useEffect, useMemo } from 'react'
import { useSetAtom, useAtomValue } from 'jotai'
import {
  dtfListAtom,
  isLoadingAtom,
  totalCountAtom,
  currentPageAtom,
  pageSizeAtom,
  marketCapsAtom,
  searchFilterAtom,
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
  const search = useAtomValue(searchFilterAtom)

  // Build search filter for subgraph query
  const whereFilter = useMemo(() => {
    if (!search) return undefined
    return {
      or: [
        { token_: { name_contains_nocase: search } },
        { token_: { symbol_contains_nocase: search } },
      ],
    }
  }, [search])

  // Fetch DTF list
  const { data: dtfList, isLoading } = useInternalDTFList(
    currentPage,
    pageSize,
    whereFilter
  )
  
  // Fetch total count (with same filter as list)
  const { data: totalCount } = useInternalDTFCount(whereFilter)
  
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