import { INDEX_GRAPH_CLIENTS } from '@/state/chain/atoms/chainAtoms'
import { ChainId } from '@/utils/chains'
import { RequestDocument } from 'graphql-request'
import { useQuery } from '@tanstack/react-query'

const useIndexDTFSubgraph = (
  query: RequestDocument | null = null,
  variables: any = {},
  config: any = {},
  chainId: number = ChainId.Base
) => {
  const client = INDEX_GRAPH_CLIENTS[chainId]

  return useQuery({
    queryKey: query ? ['indexDTFSubgraph', chainId, variables] : null,
    queryFn: async () => {
      if (!query) return null
      return client.request(query, variables)
    },
    enabled: !!query,
    ...config,
  })
}

export default useIndexDTFSubgraph
