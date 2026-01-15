import { useQuery as useReactQuery } from '@tanstack/react-query'
import { RequestDocument } from 'graphql-request'
import { useAtomValue } from 'jotai'
import { GRAPH_CLIENTS, gqlClientAtom } from 'state/atoms'
import { supportedChainList } from 'utils/constants'

type FetcherArgs = [RequestDocument, Record<string, any>]

/**
 * SWR-compatible return interface for easy migration.
 * Consumers can destructure { data, error, isLoading, isValidating, mutate }
 */
interface UseQueryReturn<T> {
  data: T | undefined
  error: Error | null
  isLoading: boolean
  isValidating: boolean
  mutate: () => void
}

/**
 * GraphQL query hook - React Query implementation with SWR-compatible interface.
 *
 * @param query - GraphQL query document, or null to skip
 * @param variables - Query variables
 * @param config - React Query config options (staleTime, refetchInterval, etc.)
 */
const useQuery = <T = any>(
  query: RequestDocument | null = null,
  variables: Record<string, any> = {},
  config: {
    staleTime?: number
    refetchInterval?: number | false
    enabled?: boolean
    refetchOnWindowFocus?: boolean
  } = {}
): UseQueryReturn<T> => {
  const client = useAtomValue(gqlClientAtom)

  const result = useReactQuery({
    queryKey: query ? ['graphql', query, variables] : ['graphql-disabled'],
    queryFn: () => client.request<T>(query as RequestDocument, variables),
    enabled: !!query && (config.enabled !== false),
    ...config,
  })

  return {
    data: result.data,
    error: result.error,
    isLoading: result.isLoading,
    isValidating: result.isFetching && !result.isLoading,
    mutate: () => result.refetch(),
  }
}

/**
 * Multichain GraphQL query hook - fetches from all supported chains in parallel.
 */
export const useMultichainQuery = <T = any>(
  query: RequestDocument | null = null,
  variables: Record<string, any> = {},
  config: {
    staleTime?: number
    refetchInterval?: number | false
    enabled?: boolean
  } = {}
): UseQueryReturn<{ [chainId: number]: T }> => {
  const result = useReactQuery({
    queryKey: query ? ['graphql-multichain', query, variables] : ['graphql-multichain-disabled'],
    queryFn: async () => {
      const chains: Set<number> = new Set(
        variables._chain ? variables._chain : supportedChainList
      )

      const calls = supportedChainList.map((chain) =>
        chains.has(chain)
          ? GRAPH_CLIENTS[chain].request<T>(query as RequestDocument, variables[chain] || variables)
          : Promise.resolve(null)
      )

      const results = await Promise.all(calls)

      return supportedChainList.reduce(
        (acc, chainId, index) => {
          acc[chainId] = results[index]
          return acc
        },
        {} as { [chainId: number]: T | null }
      )
    },
    enabled: !!query && (config.enabled !== false),
    ...config,
  })

  return {
    data: result.data as { [chainId: number]: T } | undefined,
    error: result.error,
    isLoading: result.isLoading,
    isValidating: result.isFetching && !result.isLoading,
    mutate: () => result.refetch(),
  }
}

/**
 * Fetch multiple URLs in parallel.
 */
export const useMultiFetch = <T = any>(
  urls: string[] | null,
  config: {
    staleTime?: number
    enabled?: boolean
  } = {}
): UseQueryReturn<T[]> => {
  const result = useReactQuery({
    queryKey: urls ? ['multi-fetch', ...urls] : ['multi-fetch-disabled'],
    queryFn: async () => {
      if (!urls) return []
      const responses = await Promise.all(urls.map((url) => fetch(url)))
      return Promise.all(responses.map((res) => res.json())) as Promise<T[]>
    },
    enabled: !!urls && (config.enabled !== false),
    staleTime: config.staleTime ?? 1000 * 60 * 60, // 1 hour default (mimics useSWRImmutable)
    ...config,
  })

  return {
    data: result.data,
    error: result.error,
    isLoading: result.isLoading,
    isValidating: result.isFetching && !result.isLoading,
    mutate: () => result.refetch(),
  }
}

export default useQuery
