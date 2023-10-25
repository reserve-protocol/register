import { RequestDocument } from 'graphql-request'
import { useAtomValue } from 'jotai'
import { GRAPH_CLIENTS, gqlClientAtom } from 'state/atoms'
import useSWR from 'swr'
import { ChainId } from 'utils/chains'

const multichainFetcher = async (query: RequestDocument, variables: any) => ({
  [ChainId.Mainnet]: await GRAPH_CLIENTS[ChainId.Mainnet].request(
    query,
    variables
  ),
  [ChainId.Base]: await GRAPH_CLIENTS[ChainId.Base].request(query, variables),
})

const useQuery = (
  query: RequestDocument | null = null,
  variables: any = {},
  config: any = {}
) => {
  const client = useAtomValue(gqlClientAtom)

  const fetcher = (query: RequestDocument, variables: any) =>
    client.request(query, variables)

  return useSWR<any>(query ? [query, variables] : null, fetcher, config)
}

export const useMultichainQuery = (
  query: RequestDocument | null = null,
  variables: any = {},
  config: any = {}
) => useSWR(query ? [query, variables] : null, multichainFetcher, config)

export default useQuery
