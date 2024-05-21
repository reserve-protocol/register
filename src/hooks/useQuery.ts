import { RequestDocument } from 'graphql-request'
import { useAtomValue } from 'jotai'
import { GRAPH_CLIENTS, contentfulClientAtom, gqlClientAtom } from 'state/atoms'
import useSWR from 'swr'
import useSWRImmutable from 'swr/immutable'
import { supportedChainList } from 'utils/constants'

type FetcherArgs = [RequestDocument, Record<string, any>]

const multichainFetcher = async (
  props: FetcherArgs
): Promise<{ [x: number]: any }> => {
  const [query, variables] = props
  // Filter out chain if _chain exists
  const chains: Set<number> = new Set(
    variables._chain ? variables._chain : supportedChainList
  )
  const calls: any[] = []

  for (const chain of supportedChainList) {
    if (chains.has(chain)) {
      calls.push(
        GRAPH_CLIENTS[chain].request(query, variables[chain] || variables)
      )
    } else {
      calls.push(null)
    }
  }

  const results = await Promise.all(calls)

  return supportedChainList.reduce((acc, current, index) => {
    acc[current] = results[index]
    return acc
  }, {} as { [x: number]: any })
}

const useQuery = (
  query: RequestDocument | null = null,
  variables: any = {},
  config: any = {}
) => {
  const client = useAtomValue(gqlClientAtom)

  const fetcher = (props: FetcherArgs) => client.request(...props)

  return useSWR<any>(query ? [query, variables] : null, fetcher, config)
}

export const useMultichainQuery = (
  query: RequestDocument | null = null,
  variables: any = {},
  config: any = {}
) => useSWR(query ? [query, variables] : null, multichainFetcher, config)

export const useCMSQuery = (
  query: RequestDocument | null = null,
  variables: any = {},
  config: any = {}
) => {
  const client = useAtomValue(contentfulClientAtom)
  const fetcher = (props: FetcherArgs) => client.request(...props)

  return useSWRImmutable(query ? [query, variables] : null, fetcher, config)
}

export default useQuery
