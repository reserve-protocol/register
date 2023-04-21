import useSWR from 'swr'
import { GraphQLClient, RequestDocument } from 'graphql-request'

const client = new GraphQLClient(process.env.REACT_APP_SUBGRAPH_URL ?? '')

const fetcher = (query: RequestDocument, variables: any) =>
  client.request(query, variables)

const useQuery = (
  query: RequestDocument | null = null,
  variables: any = {},
  config: any = {}
) => useSWR<any>(query ? [query, variables] : null, fetcher, config)

export default useQuery
