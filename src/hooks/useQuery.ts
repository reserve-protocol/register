import useSWR from 'swr'
import { request, GraphQLClient, RequestDocument } from 'graphql-request'

const client = new GraphQLClient(process.env.REACT_APP_SUBGRAPH_URL ?? '')

const fetcher = (query: RequestDocument, variables: any) =>
  client.request(query, variables)

const useQuery = (query: RequestDocument, variables: any) =>
  useSWR([query, variables], fetcher)

export default useQuery
