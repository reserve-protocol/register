import { RequestDocument } from 'graphql-request'
import { useAtomValue } from 'jotai'
import { gqlClientAtom } from 'state/atoms'
import useSWR from 'swr'

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

export default useQuery
