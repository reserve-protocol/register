import { INDEX_DTF_SUBGRAPH_URL } from '@/state/atoms'
import { useQuery } from '@tanstack/react-query'
import { request } from 'graphql-request'
import { hasUniV4PoolSwaps, UNISWAP_V4_POOL_MANAGER } from './constants'
import { mapPoolSwapEvents, PoolSwapsResponse } from './swap-transactions'

// first: 100 per direction — the swap window can be shorter than the
// unbounded mint/redeem window on deep table pages; fine for a recent feed.
const poolSwapsQuery = `
  query ($dtf: String!, $pm: String!) {
    buys: transferEvents(
      where: { token: $dtf, type: "TRANSFER", from: $pm }
      orderBy: timestamp
      orderDirection: desc
      first: 100
    ) {
      id
      hash
      amount
      timestamp
      from {
        id
      }
      to {
        id
      }
    }
    sells: transferEvents(
      where: { token: $dtf, type: "TRANSFER", to: $pm }
      orderBy: timestamp
      orderDirection: desc
      first: 100
    ) {
      id
      hash
      amount
      timestamp
      from {
        id
      }
      to {
        id
      }
    }
  }
`

// USD pricing is applied downstream (mergeTransactionRows) so the price never
// enters the query key — a fresh price re-prices cached rows without a refetch.
const useUniV4PoolSwaps = (dtf?: string, chainId?: number) => {
  const enabled = hasUniV4PoolSwaps(dtf, chainId)

  return useQuery({
    queryKey: ['uni-v4-pool-swaps', dtf?.toLowerCase(), chainId],
    queryFn: async () =>
      request<PoolSwapsResponse>(
        INDEX_DTF_SUBGRAPH_URL[chainId!],
        poolSwapsQuery,
        {
          dtf: dtf!.toLowerCase(),
          pm: UNISWAP_V4_POOL_MANAGER[chainId!],
        }
      ),
    select: (data) =>
      mapPoolSwapEvents(data, UNISWAP_V4_POOL_MANAGER[chainId!], chainId!),
    enabled,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  })
}

export default useUniV4PoolSwaps
