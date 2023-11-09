import { RequestDocument } from 'graphql-request'
import { useAtomValue } from 'jotai'
import { GRAPH_CLIENTS, gqlClientAtom } from 'state/atoms'
import useSWR from 'swr'
import { ChainId } from 'utils/chains'
import { supportedChainList } from 'utils/constants'

const multichainFetcher = async (
  query: RequestDocument,
  variables: any
): Promise<{ [x: number]: any }> => {
  // Filter out chain if _chain exists
  const chains: Set<number> = new Set(
    variables._chain ? [variables._chain] : supportedChainList
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
