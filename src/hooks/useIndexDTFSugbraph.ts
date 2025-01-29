import { INDEX_GRAPH_CLIENTS } from '@/state/chain/atoms/chainAtoms'
import { ChainId } from '@/utils/chains'
import { RequestDocument } from 'graphql-request'
import useSWR from 'swr'

type FetcherArgs = [RequestDocument, Record<string, any>]

const useIndexDTFSubgraph = (
  query: RequestDocument | null = null,
  variables: any = {},
  config: any = {}
) => {
  const client = INDEX_GRAPH_CLIENTS[ChainId.Base]

  const fetcher = (props: FetcherArgs) => client.request(...props)

  return useSWR<any>(query ? [query, variables] : null, fetcher, config)
}

export default useIndexDTFSubgraph
