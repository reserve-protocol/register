import useSWR from 'swr'
import { request, RequestDocument } from 'graphql-request'

const fetcher = (query: [RequestDocument, any?]) =>
  request('http://localhost:8000/subgraphs/name/lcamargof/reserve', ...query)

const useQuery = (query: [RequestDocument, any?]) => useSWR(query, fetcher)

export default useQuery
