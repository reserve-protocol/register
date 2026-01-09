import { INDEX_DTF_SUBGRAPH_URL } from '@/state/chain/atoms/chainAtoms'
import request, { gql } from 'graphql-request'
import { Address, formatEther } from 'viem'
import { TokenDailySnapshot, DTFMetadata, PriceMap } from './types'

const DAILY_SNAPSHOTS_QUERY = gql`
  query GetDTFDailySnapshots($tokenId: String!, $skip: Int!) {
    tokenDailySnapshots(
      where: { token: $tokenId }
      orderBy: timestamp
      orderDirection: asc
      first: 1000
      skip: $skip
    ) {
      id
      timestamp
      dailyTotalSupply
      dailyMintAmount
      dailyMintCount
      dailyBurnAmount
      dailyRevenue
      dailyProtocolRevenue
      dailyGovernanceRevenue
      dailyExternalRevenue
      currentHolderCount
      blockNumber
    }
  }
`

const DTF_METADATA_QUERY = gql`
  query GetDTFMetadata($id: String!) {
    dtf(id: $id) {
      id
      mintingFee
      tvlFee
      annualizedTvlFee
      timestamp
      stToken {
        id
        token {
          totalSupply
          symbol
        }
        underlying {
          address
          symbol
          decimals
        }
      }
    }
  }
`

interface DailySnapshotsResponse {
  tokenDailySnapshots: TokenDailySnapshot[]
}

interface DTFMetadataResponse {
  dtf: DTFMetadata | null
}

/**
 * Fetches all daily snapshots for a DTF token from the subgraph.
 * Handles pagination to get all records.
 */
export async function fetchDailySnapshots(
  dtfAddress: Address,
  chainId: number
): Promise<TokenDailySnapshot[]> {
  const subgraphUrl =
    INDEX_DTF_SUBGRAPH_URL[chainId as keyof typeof INDEX_DTF_SUBGRAPH_URL]
  if (!subgraphUrl) {
    console.warn(`[DTF Analytics] No subgraph URL for chain ${chainId}`)
    return []
  }

  const allSnapshots: TokenDailySnapshot[] = []
  let skip = 0
  const pageSize = 1000

  // In Index DTFs, the DTF address is also the token address
  const tokenId = dtfAddress.toLowerCase()

  console.log(
    `[DTF Analytics] Fetching daily snapshots for token ${tokenId} on chain ${chainId}`
  )

  while (true) {
    try {
      const response: DailySnapshotsResponse = await request(
        subgraphUrl,
        DAILY_SNAPSHOTS_QUERY,
        {
          tokenId,
          skip,
        }
      )

      const snapshots = response.tokenDailySnapshots
      console.log(
        `[DTF Analytics] Got ${snapshots?.length ?? 0} snapshots (skip=${skip})`
      )

      if (!snapshots || snapshots.length === 0) {
        break
      }

      allSnapshots.push(...snapshots)

      // If we got less than pageSize, we've reached the end
      if (snapshots.length < pageSize) {
        break
      }

      skip += pageSize
    } catch (error) {
      console.error(
        `[DTF Analytics] Error fetching daily snapshots for ${dtfAddress} on chain ${chainId}:`,
        error
      )
      break
    }
  }

  console.log(
    `[DTF Analytics] Total snapshots for ${tokenId}: ${allSnapshots.length}`
  )
  return allSnapshots
}

/**
 * Fetches DTF metadata including fees and stToken info
 */
export async function fetchDTFMetadata(
  dtfAddress: Address,
  chainId: number
): Promise<DTFMetadata | null> {
  const subgraphUrl =
    INDEX_DTF_SUBGRAPH_URL[chainId as keyof typeof INDEX_DTF_SUBGRAPH_URL]
  if (!subgraphUrl) {
    console.warn(`No subgraph URL for chain ${chainId}`)
    return null
  }

  try {
    const response: DTFMetadataResponse = await request(
      subgraphUrl,
      DTF_METADATA_QUERY,
      {
        id: dtfAddress.toLowerCase(),
      }
    )

    return response.dtf
  } catch (error) {
    console.error(
      `Error fetching DTF metadata for ${dtfAddress} on chain ${chainId}:`,
      error
    )
    return null
  }
}

/**
 * Parses BigInt string from subgraph to number (dividing by 1e18)
 */
export function parseBigIntToNumber(value: string | undefined): number {
  if (!value || value === '0') return 0
  try {
    return +formatEther(BigInt(value))
  } catch {
    return 0
  }
}

/**
 * Gets the deployment timestamp for a DTF
 */
export async function getDTFDeploymentTimestamp(
  dtfAddress: Address,
  chainId: number
): Promise<number | null> {
  const metadata = await fetchDTFMetadata(dtfAddress, chainId)
  return metadata?.timestamp ?? null
}

// Query for stToken supply snapshots (to get tokens locked history)
const STTOKEN_SUPPLY_QUERY = gql`
  query GetStTokenSnapshots($tokenId: String!, $skip: Int!) {
    tokenDailySnapshots(
      where: { token: $tokenId }
      orderBy: timestamp
      orderDirection: asc
      first: 1000
      skip: $skip
    ) {
      timestamp
      dailyTotalSupply
    }
  }
`

interface StTokenSnapshotResponse {
  tokenDailySnapshots: {
    timestamp: number
    dailyTotalSupply: string
  }[]
}

/**
 * Converts a timestamp to YYYY-MM-DD date key
 */
function timestampToDateKey(timestamp: number): string {
  const date = new Date(timestamp * 1000)
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Fetches historical tokens locked in governance (stToken supply) for a DTF.
 * The stToken's totalSupply equals the amount of DTF tokens locked.
 * Falls back to interpolation from DTF snapshots if stToken snapshots aren't available.
 */
export async function fetchTokensLockedHistory(
  stTokenAddress: Address,
  chainId: number,
  dtfSnapshots: TokenDailySnapshot[]
): Promise<PriceMap> {
  const subgraphUrl =
    INDEX_DTF_SUBGRAPH_URL[chainId as keyof typeof INDEX_DTF_SUBGRAPH_URL]
  if (!subgraphUrl) {
    return {}
  }

  const tokensLockedMap: PriceMap = {}
  const tokenId = stTokenAddress.toLowerCase()

  // Try to fetch stToken daily snapshots
  let skip = 0
  const pageSize = 1000
  let hasStTokenSnapshots = false

  while (true) {
    try {
      const response: StTokenSnapshotResponse = await request(
        subgraphUrl,
        STTOKEN_SUPPLY_QUERY,
        { tokenId, skip }
      )

      const snapshots = response.tokenDailySnapshots
      if (!snapshots || snapshots.length === 0) {
        break
      }

      hasStTokenSnapshots = true

      for (const snapshot of snapshots) {
        const dateKey = timestampToDateKey(snapshot.timestamp)
        const supply = parseBigIntToNumber(snapshot.dailyTotalSupply)
        tokensLockedMap[dateKey] = supply
      }

      if (snapshots.length < pageSize) {
        break
      }
      skip += pageSize
    } catch (error) {
      console.warn(
        `[DTF Analytics] No stToken snapshots available for ${stTokenAddress}:`,
        error
      )
      break
    }
  }

  // If we found stToken snapshots, return them
  if (hasStTokenSnapshots && Object.keys(tokensLockedMap).length > 0) {
    console.log(
      `[DTF Analytics] Found ${Object.keys(tokensLockedMap).length} stToken snapshots`
    )
    return tokensLockedMap
  }

  // Fallback: No stToken snapshots available
  // This could happen if the stToken was deployed but has no activity
  console.log(
    `[DTF Analytics] No stToken snapshots found for ${stTokenAddress}, tokens locked will be 0`
  )
  return {}
}
