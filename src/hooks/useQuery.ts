import useSWR from 'swr'
import { request } from 'graphql-request'

const fetcher = (query: [string, any?]) =>
  request('http://localhost:8000/subgraphs/name/lcamargof/reserve', query)

const useQuery = (query: [string, any?]) => useSWR(query, fetcher)

export default useQuery
