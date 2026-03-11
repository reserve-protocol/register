import { SUBGRAPH_URL } from '@/state/chain/atoms/chainAtoms'
import request, { gql } from 'graphql-request'
import { Address } from 'viem'
import { YieldTokenDailySnapshot, YieldRTokenDailySnapshot } from './types'

const TOKEN_DAILY_SNAPSHOTS_QUERY = gql`
  query GetTokenDailySnapshots($tokenId: String!, $lastTimestamp: BigInt!) {
    tokenDailySnapshots(
      where: { token: $tokenId, timestamp_gt: $lastTimestamp }
      orderBy: timestamp
      orderDirection: asc
      first: 1000
    ) {
      timestamp
      dailyTotalSupply
      dailyMintAmount
      dailyBurnAmount
      cumulativeUniqueUsers
      priceUSD
      basketRate
    }
  }
`

const RTOKEN_DAILY_SNAPSHOTS_QUERY = gql`
  query GetRTokenDailySnapshots($rTokenId: String!, $lastTimestamp: BigInt!) {
    rtokenDailySnapshots(
      where: { rToken: $rTokenId, timestamp_gt: $lastTimestamp }
      orderBy: timestamp
      orderDirection: asc
      first: 1000
    ) {
      timestamp
      rsrStaked
      rsrExchangeRate
      rsrPrice
    }
  }
`

interface TokenSnapshotsResponse {
  tokenDailySnapshots: YieldTokenDailySnapshot[]
}

interface RTokenSnapshotsResponse {
  rtokenDailySnapshots: YieldRTokenDailySnapshot[]
}

/**
 * Cursor-based pagination using timestamp_gt to avoid the skip=5000 limit.
 */
async function paginatedQuery<T extends { timestamp: string }>(
  url: string,
  query: string,
  baseVariables: Record<string, string | number>,
  extractFn: (response: unknown) => T[]
): Promise<T[]> {
  const all: T[] = []
  let lastTimestamp = 0

  while (true) {
    try {
      const response = await request(url, query, {
        ...baseVariables,
        lastTimestamp,
      })
      const items = extractFn(response)

      if (!items || items.length === 0) break
      all.push(...items)

      // Move cursor to last item's timestamp
      lastTimestamp = Number(items[items.length - 1].timestamp)

      if (items.length < 1000) break
    } catch (error) {
      console.error('[Yield DTF Analytics] Query error:', error)
      break
    }
  }

  return all
}

export async function fetchTokenDailySnapshots(
  address: Address,
  chainId: number
): Promise<YieldTokenDailySnapshot[]> {
  const url = SUBGRAPH_URL[chainId as keyof typeof SUBGRAPH_URL]
  if (!url) return []

  return paginatedQuery(
    url,
    TOKEN_DAILY_SNAPSHOTS_QUERY,
    { tokenId: address.toLowerCase() },
    (r) => (r as TokenSnapshotsResponse).tokenDailySnapshots
  )
}

export async function fetchRTokenDailySnapshots(
  address: Address,
  chainId: number
): Promise<YieldRTokenDailySnapshot[]> {
  const url = SUBGRAPH_URL[chainId as keyof typeof SUBGRAPH_URL]
  if (!url) return []

  return paginatedQuery(
    url,
    RTOKEN_DAILY_SNAPSHOTS_QUERY,
    { rTokenId: address.toLowerCase() },
    (r) => (r as RTokenSnapshotsResponse).rtokenDailySnapshots
  )
}
