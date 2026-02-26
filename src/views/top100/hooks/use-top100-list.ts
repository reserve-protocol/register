import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import {
  enrichDTFs,
  fetchBrands,
  fetchPerformance,
  fetchPricesAndBaskets,
  fetchSubgraphDTFs,
} from '../api'

export const useTop100List = () => {
  const subgraphQuery = useQuery({
    queryKey: ['top100-subgraph'],
    queryFn: fetchSubgraphDTFs,
    staleTime: 60_000,
  })

  const addressKey = subgraphQuery.data?.map((d) => d.address).join(',')

  const priceQuery = useQuery({
    queryKey: ['top100-prices', addressKey],
    queryFn: () => fetchPricesAndBaskets(subgraphQuery.data!),
    enabled: !!subgraphQuery.data?.length,
    staleTime: 60_000,
    refetchInterval: 300_000,
  })

  const performanceQuery = useQuery({
    queryKey: ['top100-performance', addressKey],
    queryFn: () => fetchPerformance(subgraphQuery.data!),
    enabled: !!subgraphQuery.data?.length,
    staleTime: 300_000,
  })

  const brandQuery = useQuery({
    queryKey: ['top100-brands', addressKey],
    queryFn: () => fetchBrands(subgraphQuery.data!),
    enabled: !!subgraphQuery.data?.length,
    staleTime: 300_000,
  })

  const dtfs = useMemo(() => {
    if (!subgraphQuery.data) return []
    return enrichDTFs(
      subgraphQuery.data,
      priceQuery.data ?? {},
      brandQuery.data ?? {},
      performanceQuery.data ?? {}
    )
  }, [
    subgraphQuery.data,
    priceQuery.data,
    brandQuery.data,
    performanceQuery.data,
  ])

  return { dtfs, isLoading: subgraphQuery.isLoading }
}
