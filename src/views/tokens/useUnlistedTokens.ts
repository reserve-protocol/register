import { gql } from 'graphql-request'
import { useAtomValue } from 'jotai'
import { tokenFilterAtom } from './atoms'
import { useMultichainQuery } from 'hooks/use-query'
import { useEffect, useState } from 'react'
import { supportedChainList } from 'utils/constants'
import { Address, formatEther, getAddress } from 'viem'
import { rsrPriceAtom } from 'state/atoms'

const query = gql`
  query GetTokenListOverview(
    $listed: [String]!
    $limit: Int!
    $search: String!
    $by: String!
    $direction: OrderDirection!
  ) {
    rtokens(
      orderBy: $by
      orderDirection: $direction
      first: $limit
      where: {
        id_not_in: $listed
        token_: {
          or: [
            { name_contains_nocase: $search }
            { symbol_contains_nocase: $search }
          ]
        }
      }
    ) {
      id
      cumulativeUniqueUsers
      targetUnits
      rsrStaked
      token {
        name
        symbol
        lastPriceUSD
        holderCount
        transferCount
        totalSupply
        cumulativeVolume
      }
    }
  }
`

export interface RTokenRow {
  id: Address
  targetUnits: string
  name: string
  symbol: string
  price: number
  transactionCount: number
  cumulativeVolume: number
  staked: number
  marketCap: number
  chain: number
}

// Shape of a single `rtokens` row as selected by `query` above — the fields the
// mapper actually reads. Kept narrow so the trust boundary is typed, not `any`.
interface UnlistedRTokenResult {
  id: string
  targetUnits: string
  rsrStaked: string
  token: {
    name: string
    symbol: string
    lastPriceUSD: string
    transferCount: number
    totalSupply: string
    cumulativeVolume: string
  }
}

type UnlistedTokensData = Record<
  number,
  { rtokens?: UnlistedRTokenResult[] } | undefined
>

export const buildUnlistedTokenRows = (
  data: UnlistedTokensData | undefined,
  chains: readonly number[],
  currentRsrPrice: number
): RTokenRow[] => {
  if (!data) return []

  const rows: RTokenRow[] = []
  for (const chain of chains) {
    // A per-chain subgraph error/partial response can return the bucket without
    // `rtokens` — guard the array, not just the bucket (GH0 twin, Z2).
    for (const rtoken of data[chain]?.rtokens ?? []) {
      rows.push({
        id: getAddress(rtoken.id),
        targetUnits: rtoken.targetUnits,
        chain,
        name: rtoken.token.name,
        symbol: rtoken.token.symbol,
        price: +rtoken.token.lastPriceUSD,
        transactionCount: rtoken.token.transferCount,
        cumulativeVolume:
          +formatEther(BigInt(rtoken.token.cumulativeVolume)) *
          +rtoken.token.lastPriceUSD,
        staked: +formatEther(BigInt(rtoken.rsrStaked)) * currentRsrPrice,
        marketCap:
          +formatEther(BigInt(rtoken.token.totalSupply)) *
          +rtoken.token.lastPriceUSD,
      })
    }
  }
  return rows
}

const useUnlistedTokens = () => {
  const filters = useAtomValue(tokenFilterAtom)
  const { data } = useMultichainQuery(query, filters)
  const currentRsrPrice = useAtomValue(rsrPriceAtom)

  const [tokens, setTokens] = useState<RTokenRow[]>([])

  useEffect(() => {
    if (data) {
      setTokens(buildUnlistedTokenRows(data, supportedChainList, currentRsrPrice))
    }
  }, [data, currentRsrPrice])

  return tokens
}

export default useUnlistedTokens
