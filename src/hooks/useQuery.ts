import { GraphQLClient, RequestDocument } from 'graphql-request'
import { useAtomValue } from 'jotai'
import { GRAPH_CLIENTS, gqlClientAtom } from 'state/atoms'
import useSWR from 'swr'
import useSWRImmutable from 'swr/immutable'
import { supportedChainList } from 'utils/constants'

// TODO: Need to figure out a way to refactor this to work with mutligraphs
// TODO: For now index-dtf will be separate and will use react-query

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

  return supportedChainList.reduce(
    (acc, current, index) => {
      acc[current] = results[index]
      return acc
    },
    {} as { [x: number]: any }
  )
}

const useQuery = (
  query: RequestDocument | null = null,
  variables: any = {},
  config: any = {}
) => {
  const _client = useAtomValue(gqlClientAtom)

  const fetcher = ([client, query, variables]: [
    GraphQLClient,
    RequestDocument,
    any,
  ]) => client.request(query, variables)

  return useSWR<any>(
    query ? [_client, query, variables] : null,
    fetcher,
    config
  )
}

export const useMultichainQuery = (
  query: RequestDocument | null = null,
  variables: any = {},
  config: any = {}
) => useSWR(query ? [query, variables] : null, multichainFetcher, config)

export default useQuery

const fetchMultiple = async (urls: string[]): Promise<any[]> => {
  const responses = await Promise.all(urls.map((url) => fetch(url)))
  const data = await Promise.all(responses.map((res) => res.json()))
  return data
}

export const useMultiFetch = (urls: string[] | null, config?: any) => {
  const fetcher = (): Promise<any[]> => fetchMultiple(urls ?? [])
  return useSWRImmutable(urls ? urls.join() : null, fetcher, config)
}
