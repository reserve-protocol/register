import { useQuery } from '@tanstack/react-query'
import { gql, GraphQLClient } from 'graphql-request'
import { ChainId } from '@/utils/chains'
import useIndexDTFList from '@/hooks/use-index-dtf-list'
import { useMemo } from 'react'
import { useAtomValue } from 'jotai'
import { rsrPriceAtom } from '@/state/atoms'
import { formatUnits } from 'viem'

const INDEX_DTF_SUBGRAPH_URL = {
  [ChainId.Mainnet]: 'https://subgraph.satsuma-prod.com/327d6f1d3de6/reserve/dtf-index-mainnet/api',
  [ChainId.Base]: 'https://subgraph.satsuma-prod.com/327d6f1d3de6/reserve/dtf-index-base/api',
  [ChainId.BSC]: 'https://subgraph.satsuma-prod.com/327d6f1d3de6/reserve/dtf-index-bsc/api',
}

// Enhanced query to fetch DTF revenue with fees and stToken data
const indexDTFRevenueQuery = gql`
  query GetIndexDTFRevenue {
    dtfs(first: 100, where: { totalRevenue_gt: "0" }) {
      id
      protocolRevenue
      governanceRevenue
      externalRevenue
      totalRevenue
      mintingFee
      tvlFee
      annualizedTvlFee
      token {
        decimals
        symbol
        totalSupply
      }
      stToken {
        id
        token {
          totalSupply
          decimals
        }
        underlying {
          symbol
          address
          decimals
        }
      }
    }
  }
`

// Query for RSR burn data
const rsrBurnQuery = gql`
  query GetRSRBurns($first: Int!, $orderBy: String!, $orderDirection: String!) {
    rsrburns(first: $first, orderBy: $orderBy, orderDirection: $orderDirection) {
      id
      amount
      burner
      blockNumber
      timestamp
      transactionHash
    }
    rsrburnGlobal(id: "1") {
      id
      totalBurned
      totalBurnCount
      lastUpdateBlock
      lastUpdateTimestamp
    }
  }
`

// Query for RSR burn snapshots
const rsrBurnSnapshotsQuery = gql`
  query GetRSRBurnSnapshots($first: Int!, $orderBy: String!, $orderDirection: String!) {
    rsrburnDailySnapshots(first: $first, orderBy: $orderBy, orderDirection: $orderDirection) {
      id
      dailyBurnAmount
      dailyBurnCount
      cumulativeBurned
      blockNumber
      timestamp
    }
    rsrburnMonthlySnapshots(first: 12, orderBy: timestamp, orderDirection: desc) {
      id
      monthlyBurnAmount
      monthlyBurnCount
      cumulativeBurned
      timestamp
    }
  }
`

// Query for token snapshots to analyze revenue growth
const tokenSnapshotsQuery = gql`
  query GetTokenSnapshots($tokenIds: [String!]!, $first: Int!) {
    tokenDailySnapshots(
      first: $first
      orderBy: timestamp
      orderDirection: desc
      where: { token_in: $tokenIds }
    ) {
      id
      timestamp
      token {
        id
        symbol
      }
      dailyRevenue
      dailyProtocolRevenue
      dailyGovernanceRevenue
      dailyExternalRevenue
      dailyTotalSupply
      dailyMintAmount
      dailyBurnAmount
    }
    tokenMonthlySnapshots(
      first: 12
      orderBy: timestamp
      orderDirection: desc
      where: { token_in: $tokenIds }
    ) {
      id
      timestamp
      token {
        id
        symbol
      }
      monthlyRevenue
      monthlyProtocolRevenue
      monthlyGovernanceRevenue
      monthlyExternalRevenue
      cumulativeRevenue
      cumulativeProtocolRevenue
      monthlyMintAmount
      monthlyBurnAmount
    }
  }
`

interface DTFData {
  id: string
  protocolRevenue: string
  governanceRevenue: string
  externalRevenue: string
  totalRevenue: string
  mintingFee: string
  tvlFee: string
  annualizedTvlFee: string
  token: {
    decimals: number
    symbol: string
    totalSupply: string
  }
  stToken?: {
    id: string
    token: {
      totalSupply: string
      decimals: number
    }
    underlying: {
      symbol: string
      address: string
      decimals: number
    }
  }
}

interface RSRBurnData {
  id: string
  amount: string
  burner: string
  blockNumber: string
  timestamp: string
  transactionHash: string
}

interface RSRBurnGlobalData {
  id: string
  totalBurned: string
  totalBurnCount: string
  lastUpdateBlock: string
  lastUpdateTimestamp: string
}

interface RSRBurnSnapshot {
  id: string
  dailyBurnAmount?: string
  monthlyBurnAmount?: string
  dailyBurnCount?: number
  monthlyBurnCount?: number
  cumulativeBurned: string
  timestamp: string
  blockNumber?: string
}

interface TokenSnapshot {
  id: string
  timestamp: string
  token: {
    id: string
    symbol: string
  }
  // Daily fields
  dailyRevenue?: string
  dailyProtocolRevenue?: string
  dailyGovernanceRevenue?: string
  dailyExternalRevenue?: string
  dailyTotalSupply?: string
  dailyMintAmount?: string
  dailyBurnAmount?: string
  // Monthly fields
  monthlyRevenue?: string
  monthlyProtocolRevenue?: string
  monthlyGovernanceRevenue?: string
  monthlyExternalRevenue?: string
  cumulativeRevenue?: string
  cumulativeProtocolRevenue?: string
  monthlyMintAmount?: string
  monthlyBurnAmount?: string
}

interface IndexRevenueMetrics {
  // Core revenue metrics
  totalRevenue: number
  governanceRevenue: number
  deployerRevenue: number
  externalRevenue: number
  governancePercentage: number
  deployerPercentage: number
  externalPercentage: number
  dtfCount: number
  totalTVL: number

  // Fee metrics
  averageMintingFee: number
  averageTvlFee: number
  weightedMintingFee: number
  weightedTvlFee: number

  // RSR burn metrics
  rsrBurnRevenue: number // Expected burn revenue (5% of total cumulative)
  rsrBurnAmount: number // Expected burn amount in RSR tokens (cumulative)
  actualRsrBurned: number // Actual RSR burned from blockchain (cumulative)
  burnAccuracy: number // Accuracy percentage (actual/expected * 100)
  monthlyRsrBurnProjection: number // Projected monthly burn in USD
  monthlyRsrBurnAmountProjection: number // Projected monthly burn in RSR
  actualMonthlyBurnRate: number // Actual monthly burn rate from snapshots
  monthlyActualBurned: number // Actual monthly burn amount
  monthlyExpectedBurned: number // Expected monthly burn amount
  actualMonthsRunning: number // Actual months of operation from data
  rsrLockedInDTFs: number // Total RSR locked in Index DTF governance

  // Top performing DTFs
  topDTFs: Array<{
    symbol: string
    total: number
    governance: number
    deployer: number
    external: number
    mintingFee: number
    tvlFee: number
  }>

  // Historical burns (filtered for table)
  historicalBurns: Array<{
    date: Date
    amountRSR: number
    amountUSD: number
    txHash: string
    chainId?: number
  }>

  // All historical burns (unfiltered for chart)
  allHistoricalBurns: Array<{
    date: Date
    amountRSR: number
    amountUSD: number
    txHash: string
    chainId?: number
  }>

  // Growth metrics
  revenueGrowthRate: number // Monthly growth rate
  tvlGrowthRate: number // Monthly TVL growth rate
}

export const useIndexRevenueEnhanced = () => {
  const { data: indexDTFs, isLoading: loadingDTFs } = useIndexDTFList()
  const rsrPrice = useAtomValue(rsrPriceAtom) || 0

  // Fetch revenue data
  const { data: revenueData, isLoading: loadingRevenue } = useQuery({
    queryKey: ['index-dtf-revenue-enhanced'],
    queryFn: async () => {
      const chains = [ChainId.Mainnet, ChainId.Base, ChainId.BSC]

      const results = await Promise.allSettled(
        chains.map(async (chainId) => {
          const client = new GraphQLClient(INDEX_DTF_SUBGRAPH_URL[chainId])
          const data = await client.request(indexDTFRevenueQuery)
          return { ...data, chainId } // Add chainId to the result
        })
      )

      return results
        .filter((r): r is PromiseFulfilledResult<{ dtfs: DTFData[], chainId: number }> => r.status === 'fulfilled')
        .map(r => r.value)
    },
    enabled: !!indexDTFs,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  // Fetch RSR burn data from all chains where Index DTFs exist
  const { data: burnQueryData, isLoading: loadingBurns } = useQuery({
    queryKey: ['rsr-burns'],
    queryFn: async () => {
      try {
        // Fetch burns from all chains with Index DTFs
        const chains = [ChainId.Mainnet, ChainId.Base, ChainId.BSC]
        const allBurnsPromises = chains.map(async (chainId) => {
          try {
            const client = new GraphQLClient(INDEX_DTF_SUBGRAPH_URL[chainId])
            const data = await client.request(rsrBurnQuery, {
              first: 1000,
              orderBy: 'timestamp',
              orderDirection: 'desc',
            })
            console.log(`RSR burn data fetched from chain ${chainId}:`, data)
            return data
          } catch (error) {
            console.error(`Failed to fetch RSR burn data from chain ${chainId}:`, error)
            return { rsrburns: [], rsrburnGlobal: null }
          }
        })

        const results = await Promise.all(allBurnsPromises)

        // Aggregate burns from all chains
        const allBurns = results.flatMap(r => r.rsrburns || [])

        // Aggregate global stats (sum cumulative burns)
        const aggregatedGlobal = results.reduce((acc, r) => {
          if (r.rsrburnGlobal) {
            return {
              totalBurned: (BigInt(acc.totalBurned || 0) + BigInt(r.rsrburnGlobal.totalBurned || 0)).toString(),
              burnCount: (Number(acc.burnCount || 0) + Number(r.rsrburnGlobal.burnCount || 0)).toString(),
            }
          }
          return acc
        }, { totalBurned: '0', burnCount: '0' })

        console.log(`Total burns aggregated: ${allBurns.length} burns across ${chains.length} chains`)
        return { rsrburns: allBurns, rsrburnGlobal: aggregatedGlobal }
      } catch (error) {
        console.error('Failed to fetch RSR burn data:', error)
        return { rsrburns: [], rsrburnGlobal: null }
      }
    },
    enabled: true, // Enable RSR burn tracking
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  // Fetch RSR burn snapshots for historical analysis from all chains
  const { data: burnSnapshotData, isLoading: loadingBurnSnapshots } = useQuery({
    queryKey: ['rsr-burn-snapshots'],
    queryFn: async () => {
      try {
        // Fetch snapshots from all chains with Index DTFs
        const chains = [ChainId.Mainnet, ChainId.Base, ChainId.BSC]
        const allSnapshotsPromises = chains.map(async (chainId) => {
          try {
            const client = new GraphQLClient(INDEX_DTF_SUBGRAPH_URL[chainId])
            const data = await client.request(rsrBurnSnapshotsQuery, {
              first: 365, // Get 1 year of daily data
              orderBy: 'timestamp',
              orderDirection: 'desc',
            })
            console.log(`RSR burn snapshots fetched from chain ${chainId}:`, data)
            return data
          } catch (error) {
            console.error(`Failed to fetch RSR burn snapshots from chain ${chainId}:`, error)
            return { rsrburnDailySnapshots: [], rsrburnMonthlySnapshots: [] }
          }
        })

        const results = await Promise.all(allSnapshotsPromises)

        // Aggregate snapshots by timestamp
        const dailyMap = new Map()
        const monthlyMap = new Map()

        results.forEach(r => {
          // Aggregate daily snapshots
          (r.rsrburnDailySnapshots || []).forEach((snapshot: any) => {
            const key = snapshot.timestamp
            if (dailyMap.has(key)) {
              const existing = dailyMap.get(key)
              dailyMap.set(key, {
                ...snapshot,
                dailyBurnAmount: (BigInt(existing.dailyBurnAmount || 0) + BigInt(snapshot.dailyBurnAmount || 0)).toString(),
                dailyBurnCount: (Number(existing.dailyBurnCount || 0) + Number(snapshot.dailyBurnCount || 0)).toString(),
                cumulativeBurned: (BigInt(existing.cumulativeBurned || 0) + BigInt(snapshot.cumulativeBurned || 0)).toString(),
              })
            } else {
              dailyMap.set(key, snapshot)
            }
          })

          // Aggregate monthly snapshots
          (r.rsrburnMonthlySnapshots || []).forEach((snapshot: any) => {
            const key = snapshot.timestamp
            if (monthlyMap.has(key)) {
              const existing = monthlyMap.get(key)
              monthlyMap.set(key, {
                ...snapshot,
                monthlyBurnAmount: (BigInt(existing.monthlyBurnAmount || 0) + BigInt(snapshot.monthlyBurnAmount || 0)).toString(),
                monthlyBurnCount: (Number(existing.monthlyBurnCount || 0) + Number(snapshot.monthlyBurnCount || 0)).toString(),
                cumulativeBurned: (BigInt(existing.cumulativeBurned || 0) + BigInt(snapshot.cumulativeBurned || 0)).toString(),
              })
            } else {
              monthlyMap.set(key, snapshot)
            }
          })
        })

        const aggregatedDaily = Array.from(dailyMap.values()).sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
        const aggregatedMonthly = Array.from(monthlyMap.values()).sort((a, b) => Number(b.timestamp) - Number(a.timestamp))

        console.log(`Aggregated snapshots: ${aggregatedDaily.length} daily, ${aggregatedMonthly.length} monthly`)
        return { rsrburnDailySnapshots: aggregatedDaily, rsrburnMonthlySnapshots: aggregatedMonthly }
      } catch (error) {
        console.error('Failed to fetch RSR burn snapshots:', error)
        return { rsrburnDailySnapshots: [], rsrburnMonthlySnapshots: [] }
      }
    },
    enabled: true,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  // Extract burn data
  const burnData = burnQueryData?.rsrburns || []
  const burnGlobal = burnQueryData?.rsrburnGlobal || null
  const dailyBurnSnapshots = burnSnapshotData?.rsrburnDailySnapshots || []
  const monthlyBurnSnapshots = burnSnapshotData?.rsrburnMonthlySnapshots || []

  // Fetch revenue snapshots for all DTF tokens
  const { data: revenueSnapshotData, isLoading: loadingSnapshots } = useQuery({
    queryKey: ['dtf-revenue-snapshots', revenueData?.map(d => d.dtfs?.map(dtf => dtf.id)).flat()],
    queryFn: async () => {
      if (!revenueData) return { tokenDailySnapshots: [], tokenMonthlySnapshots: [] }

      try {
        // Collect all DTF token IDs across all chains
        const tokenIds = new Set<string>()
        revenueData.forEach(({ dtfs, chainId }) => {
          dtfs?.forEach(dtf => {
            if (dtf.id) {
              tokenIds.add(dtf.id.toLowerCase())
            }
          })
        })

        if (tokenIds.size === 0) {
          return { tokenDailySnapshots: [], tokenMonthlySnapshots: [] }
        }

        // Fetch snapshots from all chains
        const chains = [ChainId.Mainnet, ChainId.Base, ChainId.BSC]
        const snapshotResults = await Promise.allSettled(
          chains.map(async (chainId) => {
            const client = new GraphQLClient(INDEX_DTF_SUBGRAPH_URL[chainId])
            return client.request(tokenSnapshotsQuery, {
              tokenIds: Array.from(tokenIds),
              first: 365, // Get 1 year of daily data
            })
          })
        )

        // Combine results from all chains
        const combinedDaily: TokenSnapshot[] = []
        const combinedMonthly: TokenSnapshot[] = []

        snapshotResults.forEach((result) => {
          if (result.status === 'fulfilled' && result.value) {
            if (result.value.tokenDailySnapshots) {
              combinedDaily.push(...result.value.tokenDailySnapshots)
            }
            if (result.value.tokenMonthlySnapshots) {
              combinedMonthly.push(...result.value.tokenMonthlySnapshots)
            }
          }
        })

        console.log('Revenue snapshots fetched:', {
          dailyCount: combinedDaily.length,
          monthlyCount: combinedMonthly.length,
          tokenIds: Array.from(tokenIds)
        })

        return {
          tokenDailySnapshots: combinedDaily,
          tokenMonthlySnapshots: combinedMonthly,
        }
      } catch (error) {
        console.error('Failed to fetch revenue snapshots:', error)
        return { tokenDailySnapshots: [], tokenMonthlySnapshots: [] }
      }
    },
    enabled: !!revenueData && revenueData.length > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  const dailyRevenueSnapshots = revenueSnapshotData?.tokenDailySnapshots || []
  const monthlyRevenueSnapshots = revenueSnapshotData?.tokenMonthlySnapshots || []

  // Process all metrics
  const metrics = useMemo((): IndexRevenueMetrics => {
    if (!revenueData || !indexDTFs) {
      return {
        totalRevenue: 0,
        governanceRevenue: 0,
        deployerRevenue: 0,
        externalRevenue: 0,
        governancePercentage: 0,
        deployerPercentage: 0,
        externalPercentage: 0,
        dtfCount: 0,
        totalTVL: 0,
        averageMintingFee: 0,
        averageTvlFee: 0,
        weightedMintingFee: 0,
        weightedTvlFee: 0,
        rsrBurnRevenue: 0,
        rsrBurnAmount: 0,
        actualRsrBurned: 0,
        burnAccuracy: 0,
        monthlyRsrBurnProjection: 0,
        monthlyRsrBurnAmountProjection: 0,
        actualMonthlyBurnRate: 0,
        monthlyActualBurned: 0,
        monthlyExpectedBurned: 0,
        actualMonthsRunning: 6,
        rsrLockedInDTFs: 0,
        topDTFs: [],
        historicalBurns: [],
        allHistoricalBurns: [],
        revenueGrowthRate: 0,
        tvlGrowthRate: 0,
      }
    }

    // Create price and TVL maps
    const priceMap: Record<string, number> = {}
    const tvlMap: Record<string, number> = {}
    let totalTVL = 0

    indexDTFs.forEach((dtf) => {
      const address = dtf.address.toLowerCase()
      priceMap[address] = dtf.price || 0
      const marketCap = dtf.marketCap || 0
      tvlMap[address] = marketCap
      totalTVL += marketCap
    })

    // Aggregate revenue and fee data
    let totalGovernanceRevenue = 0
    let totalDeployerRevenue = 0
    let totalExternalRevenue = 0
    let totalMintingFeeWeighted = 0
    let totalTvlFeeWeighted = 0
    let totalMintingFee = 0
    let totalTvlFee = 0
    let dtfCount = 0
    const dtfRevenueList: any[] = []

    revenueData.forEach(({ dtfs, chainId }) => {
      if (dtfs) {
        dtfs.forEach((dtf) => {
          const price = priceMap[dtf.id.toLowerCase()] || 0
          const tvl = tvlMap[dtf.id.toLowerCase()] || 0
          const decimals = dtf.token?.decimals || 18
          const divisor = Math.pow(10, decimals)

          const governanceUSD = (Number(dtf.governanceRevenue || 0) / divisor) * price
          const deployerUSD = (Number(dtf.protocolRevenue || 0) / divisor) * price
          const externalUSD = (Number(dtf.externalRevenue || 0) / divisor) * price
          const totalUSD = governanceUSD + deployerUSD + externalUSD

          // Debug logging to understand the data
          if (totalUSD > 0) {
            console.log('DTF Revenue Data:', {
              symbol: dtf.token?.symbol,
              id: dtf.id,
              governanceRevenue: dtf.governanceRevenue,
              protocolRevenue: dtf.protocolRevenue,
              externalRevenue: dtf.externalRevenue,
              totalRevenue: dtf.totalRevenue,
              governanceUSD,
              deployerUSD,
              externalUSD,
              totalUSD,
              price,
              tvl,
              mintingFee: Number(dtf.mintingFee || 0) / 1e18,
              tvlFee: Number(dtf.annualizedTvlFee || 0) / 1e18
            })
          }

          // Fee calculations (D18 format)
          const mintingFee = Number(dtf.mintingFee || 0) / 1e18
          const tvlFee = Number(dtf.annualizedTvlFee || 0) / 1e18

          totalGovernanceRevenue += governanceUSD
          totalDeployerRevenue += deployerUSD
          totalExternalRevenue += externalUSD

          // Calculate weighted fees based on TVL
          if (tvl > 0) {
            totalMintingFeeWeighted += mintingFee * (tvl / totalTVL)
            totalTvlFeeWeighted += tvlFee * (tvl / totalTVL)
          }

          totalMintingFee += mintingFee
          totalTvlFee += tvlFee
          dtfCount++

          if (totalUSD > 0) {
            dtfRevenueList.push({
              symbol: dtf.token?.symbol || 'Unknown',
              total: totalUSD,
              governance: governanceUSD,
              deployer: deployerUSD,
              external: externalUSD,
              mintingFee: mintingFee * 100, // Convert to percentage
              tvlFee: tvlFee * 100, // Convert to percentage
              tvl: tvl, // Add TVL
              chainName: chainId === ChainId.Mainnet ? 'Mainnet' :
                        chainId === ChainId.Base ? 'Base' :
                        chainId === ChainId.BSC ? 'BSC' : 'Unknown', // Add chain name
            })
          }
        })
      }
    })

    const totalRevenue = totalGovernanceRevenue + totalDeployerRevenue + totalExternalRevenue

    // Based on user clarification: RSR burn is 5 cents per dollar of TOTAL revenue
    // This is approximately 5% of total revenue (not platform revenue)

    // Determine platform keep percentage based on TVL tiers (for display only)
    const getPlatformKeepPercentage = (tvl: number): number => {
      if (tvl < 100_000_000) return 0.50 // < $100M: 50%
      if (tvl < 1_000_000_000) return 0.40 // $100M - $1B: 40%
      if (tvl < 10_000_000_000) return 0.30 // $1B - $10B: 30%
      if (tvl < 100_000_000_000) return 0.20 // $10B - $100B: 20%
      if (tvl < 1_000_000_000_000) return 0.10 // $100B - $1T: 10%
      return 0.05 // > $1T: 5%
    }

    const platformKeepPercentage = getPlatformKeepPercentage(totalTVL)
    const platformRevenue = totalRevenue * platformKeepPercentage

    // ============ VALIDATION: Compare actual burns with 5% formula ============
    // Calculate actual RSR burned from blockchain data
    const actualTotalRSRBurned = burnGlobal
      ? Number(formatUnits(BigInt(burnGlobal.totalBurned || 0), 18))
      : burnData.reduce((sum: number, burn: RSRBurnData) => sum + Number(formatUnits(BigInt(burn.amount), 18)), 0)

    // IMPORTANT: The discrepancy might be because:
    // 1. Burns include ALL protocol revenue (Index + Yield DTFs)
    // 2. We're only looking at Index DTF revenue here
    // 3. Timing differences - burns might have started before/after revenue tracking
    // 4. Price changes over time affect USD calculations

    // For a fair comparison, we should look at burn rate over a specific period
    // Let's calculate based on recent burns vs recent revenue
    const getRecentBurnRate = () => {
      if (monthlyBurnSnapshots.length > 0 && monthlyRevenueSnapshots.length > 0) {
        // Use the last complete month with both burns and revenue
        const latestBurn = monthlyBurnSnapshots[0]
        const burnAmount = Number(formatUnits(BigInt(latestBurn.monthlyBurnAmount || 0), 18))

        // Get revenue for the same period
        const burnTimestamp = Number(latestBurn.timestamp)
        const relevantRevenueSnapshots = monthlyRevenueSnapshots.filter(s =>
          Math.abs(Number(s.timestamp) - burnTimestamp) < 2592000 // Within 30 days
        )

        let periodRevenue = 0
        relevantRevenueSnapshots.forEach(snapshot => {
          const monthlyRev = Number(snapshot.monthlyRevenue || 0)
          const tokenId = snapshot.token?.id?.toLowerCase()
          const tokenPrice = tokenId ? priceMap[tokenId] : 0
          if (tokenPrice > 0) {
            periodRevenue += (monthlyRev / 1e18) * tokenPrice
          }
        })

        if (periodRevenue > 0) {
          const expectedBurn = (periodRevenue * 0.05) / rsrPrice
          const accuracy = burnAmount > 0 && expectedBurn > 0
            ? (burnAmount / expectedBurn) * 100
            : 0

          console.log(`Recent period comparison: Burn=${burnAmount.toFixed(0)} RSR, Expected=${expectedBurn.toFixed(0)} RSR, Accuracy=${accuracy.toFixed(1)}%`)
          return { burnAmount, expectedBurn, accuracy, periodRevenue }
        }
      }
      return null
    }

    const recentBurnAnalysis = getRecentBurnRate()

    // Use recent analysis if available, otherwise fall back to cumulative
    const burnAccuracy = recentBurnAnalysis?.accuracy ||
      (actualTotalRSRBurned > 0 && totalRevenue > 0
        ? (actualTotalRSRBurned / ((totalRevenue * 0.05) / rsrPrice)) * 100
        : 0)

    // Expected burns based on 5% formula (keep for display)
    const expectedRsrBurnRevenue = totalRevenue * 0.05 // $0.05 per $1 of total revenue
    const expectedRsrBurnAmount = rsrPrice > 0 ? expectedRsrBurnRevenue / rsrPrice : 0

    // ============ MONTHLY CALCULATIONS FROM SNAPSHOTS ============
    // Calculate actual months of operation from snapshots or burns
    const getActualMonthsRunning = () => {
      // Try to get from revenue snapshots first
      if (dailyRevenueSnapshots.length > 0) {
        const oldestSnapshot = dailyRevenueSnapshots[dailyRevenueSnapshots.length - 1]
        const newestSnapshot = dailyRevenueSnapshots[0]
        const daysDiff = (Number(newestSnapshot.timestamp) - Number(oldestSnapshot.timestamp)) / 86400
        return Math.max(1, daysDiff / 30)
      }

      // Fallback to burn data if available
      if (burnData.length > 0) {
        const sortedBurns = [...burnData].sort((a, b) => Number(a.timestamp) - Number(b.timestamp))
        const oldestBurn = sortedBurns[0]
        const now = Math.floor(Date.now() / 1000)
        const daysDiff = (now - Number(oldestBurn.timestamp)) / 86400
        return Math.max(1, daysDiff / 30)
      }

      // Last resort: use hardcoded estimate
      return 6
    }

    const actualMonthsRunning = getActualMonthsRunning()

    // Calculate monthly revenue from snapshots or estimate from total
    const calculateMonthlyRevenue = () => {
      // Try using monthly snapshots - aggregate all tokens for the latest month
      if (monthlyRevenueSnapshots.length > 0) {
        // Group snapshots by timestamp to get the most recent month
        const latestTimestamp = Math.max(...monthlyRevenueSnapshots.map(s => Number(s.timestamp)))
        const latestMonthSnapshots = monthlyRevenueSnapshots.filter(s => Number(s.timestamp) === latestTimestamp)

        let totalMonthlyRevenue = 0
        latestMonthSnapshots.forEach(snapshot => {
          const monthlyRevenue = Number(snapshot.monthlyRevenue || 0)
          const tokenId = snapshot.token?.id?.toLowerCase()
          const tokenPrice = tokenId ? priceMap[tokenId] : 0

          if (tokenPrice > 0 && monthlyRevenue > 0) {
            const decimals = 18 // Revenue is in token decimals
            const revenueUSD = (monthlyRevenue / Math.pow(10, decimals)) * tokenPrice
            totalMonthlyRevenue += revenueUSD

            console.log(`Monthly revenue for token ${tokenId}: ${revenueUSD.toFixed(2)} USD`)
          }
        })

        if (totalMonthlyRevenue > 0) {
          console.log(`Total monthly revenue from snapshots: $${totalMonthlyRevenue.toFixed(2)}`)
          return totalMonthlyRevenue
        }
      }

      // Try using last 30 days of daily snapshots
      if (dailyRevenueSnapshots.length >= 30) {
        // Get the last 30 days worth of unique dates
        const thirtyDaysAgo = Math.floor(Date.now() / 1000) - (30 * 86400)
        const recentSnapshots = dailyRevenueSnapshots.filter(s => Number(s.timestamp) >= thirtyDaysAgo)

        let totalLast30Days = 0
        recentSnapshots.forEach(snapshot => {
          const dailyRevenue = Number(snapshot.dailyRevenue || 0)
          const tokenId = snapshot.token?.id?.toLowerCase()
          const tokenPrice = tokenId ? priceMap[tokenId] : 0

          if (tokenPrice > 0 && dailyRevenue > 0) {
            const decimals = 18
            totalLast30Days += (dailyRevenue / Math.pow(10, decimals)) * tokenPrice
          }
        })

        console.log(`Last 30 days revenue from daily snapshots: $${totalLast30Days.toFixed(2)}`)
        return totalLast30Days
      }

      // Fallback: estimate from total revenue
      console.log(`Fallback: estimated monthly from total/months: $${(totalRevenue / actualMonthsRunning).toFixed(2)}`)
      return totalRevenue / actualMonthsRunning
    }

    const estimatedMonthlyRevenue = calculateMonthlyRevenue()
    const estimatedMonthlyPlatformRevenue = estimatedMonthlyRevenue * platformKeepPercentage

    // ============ CORRECT RSR BURN CALCULATION (Based on Documentation) ============
    // ALL platform fees go to buying and burning RSR
    // Platform fees come from:
    // 1. Platform's share of TVL fees (management fees)
    // 2. Platform's share of minting fees

    // Platform share is PROGRESSIVE based on TVL tranches:
    // < $100M: 50%, $100M-$1B: 40%, $1B-$10B: 30%, $10B-$100B: 20%, $100B-$1T: 10%, > $1T: 5%
    // With a MINIMUM of 15 basis points (0.15%) of TVL or minted amount

    const calculatePlatformSharePercentage = (tvl: number): number => {
      if (tvl < 100_000_000) return 0.50 // < $100M: 50%
      if (tvl < 1_000_000_000) return 0.40 // $100M - $1B: 40%
      if (tvl < 10_000_000_000) return 0.30 // $1B - $10B: 30%
      if (tvl < 100_000_000_000) return 0.20 // $10B - $100B: 20%
      if (tvl < 1_000_000_000_000) return 0.10 // $100B - $1T: 10%
      return 0.05 // > $1T: 5%
    }

    // For accurate calculation, we should calculate weighted average across tranches
    // But for simplicity, using the current TVL's bracket
    const platformSharePercentage = calculatePlatformSharePercentage(totalTVL)

    // Calculate expected RSR burns based on TVL (not revenue)
    const calculateExpectedRsrBurn = () => {
      // RSR burn is 5 cents per dollar of TVL, NOT revenue
      // This means for every $1 of TVL, $0.05 worth of RSR is burned annually
      const BURN_RATE_PER_TVL = 0.05 // $0.05 per $1 of TVL per year

      // Calculate annual burn amount in USD
      const annualBurnUSD = totalTVL * BURN_RATE_PER_TVL

      // Convert to monthly
      const monthlyBurnUSD = annualBurnUSD / 12

      console.log(`RSR Burn Calculation (5 cents per dollar of TVL):`)
      console.log(`  TVL: $${totalTVL.toLocaleString()}`)
      console.log(`  Burn rate: $0.05 per $1 TVL annually`)
      console.log(`  Annual burn: $${annualBurnUSD.toLocaleString()}`)
      console.log(`  Monthly burn: $${monthlyBurnUSD.toLocaleString()}`)
      console.log(`  Monthly burn in RSR: ${rsrPrice > 0 ? (monthlyBurnUSD / rsrPrice).toLocaleString() : 0} RSR`)

      return monthlyBurnUSD
    }

    // Calculate expected monthly RSR burn
    const monthlyRsrBurnProjection = calculateExpectedRsrBurn()
    const monthlyRsrBurnAmountProjection = rsrPrice > 0 ? monthlyRsrBurnProjection / rsrPrice : 0

    console.log(`Monthly RSR burn projection: $${monthlyRsrBurnProjection.toFixed(2)} = ${monthlyRsrBurnAmountProjection.toFixed(0)} RSR @ $${rsrPrice.toFixed(6)}/RSR`)

    // Calculate actual monthly burn rate from snapshots (most recent month)
    const actualMonthlyBurnRate = monthlyBurnSnapshots.length > 0
      ? Number(formatUnits(BigInt(monthlyBurnSnapshots[0].monthlyBurnAmount || 0), 18))
      : burnData.length > 0
        ? Number(formatUnits(BigInt(burnData[0].amount), 18)) // Use most recent burn if no monthly snapshot
        : 0

    // For the validation card, we want to compare monthly amounts
    const monthlyActualBurned = actualMonthlyBurnRate
    const monthlyExpectedBurned = monthlyRsrBurnAmountProjection

    // ============= COMPREHENSIVE DATA OUTPUT FOR ANALYSIS =============
    console.log('🔥🔥🔥 RSR BURN COMPREHENSIVE DATA ANALYSIS 🔥🔥🔥')
    console.log('==================================================')

    console.log('\n📊 1. INDEX DTF METRICS:')
    console.log('------------------------')
    console.log(`Total DTFs: ${dtfCount}`)
    console.log(`Total TVL: $${totalTVL.toLocaleString()}`)
    console.log(`Average Minting Fee (weighted): ${(totalMintingFeeWeighted * 100).toFixed(3)}%`)
    console.log(`Average TVL Fee (weighted): ${(totalTvlFeeWeighted * 100).toFixed(3)}%`)

    console.log('\n📈 2. REVENUE BREAKDOWN (ALL-TIME):')
    console.log('------------------------------------')
    console.log(`Total Revenue: $${totalRevenue.toLocaleString()}`)
    console.log(`├─ Governance: $${totalGovernanceRevenue.toLocaleString()} (${((totalGovernanceRevenue / totalRevenue) * 100).toFixed(1)}%)`)
    console.log(`├─ Deployer: $${totalDeployerRevenue.toLocaleString()} (${((totalDeployerRevenue / totalRevenue) * 100).toFixed(1)}%)`)
    console.log(`└─ External: $${totalExternalRevenue.toLocaleString()} (${((totalExternalRevenue / totalRevenue) * 100).toFixed(1)}%)`)

    console.log('\n🏢 3. PLATFORM FEE STRUCTURE:')
    console.log('------------------------------')
    console.log('Based on documentation:')
    console.log('TVL < $100M: Platform keeps 50% of fees')
    console.log('TVL $100M-$1B: Platform keeps 40% of fees')
    console.log('TVL $1B-$10B: Platform keeps 30% of fees')
    console.log('TVL $10B-$100B: Platform keeps 20% of fees')
    console.log('TVL $100B-$1T: Platform keeps 10% of fees')
    console.log('TVL > $1T: Platform keeps 5% of fees')
    console.log('Minimum platform fee: 15 basis points (0.15% of TVL)')

    console.log(`\nCurrent TVL tier: $${totalTVL.toLocaleString()}`)
    console.log(`Platform share percentage: ${(platformSharePercentage * 100).toFixed(0)}%`)

    console.log('\n💰 4. EXPECTED RSR BURN CALCULATION:')
    console.log('-------------------------------------')
    console.log('METHOD: 5 cents per dollar of TVL annually')
    console.log(`TVL: $${totalTVL.toLocaleString()}`)
    console.log(`Annual burn rate: $0.05 per $1 TVL`)
    console.log(`Expected annual burn: $${(totalTVL * 0.05).toLocaleString()}`)
    console.log(`Expected monthly burn (USD): $${monthlyRsrBurnProjection.toLocaleString()}`)
    console.log(`RSR Price: $${rsrPrice.toFixed(6)}`)
    console.log(`Expected monthly burn (RSR): ${monthlyRsrBurnAmountProjection.toLocaleString()} RSR`)

    console.log('\n🔥 5. ACTUAL RSR BURNS (FROM BLOCKCHAIN):')
    console.log('------------------------------------------')
    console.log(`Total burns found: ${burnData?.length || 0}`)
    console.log(`Total RSR burned (all-time): ${actualTotalRSRBurned.toLocaleString()} RSR`)
    console.log(`Total USD value (current price): $${(actualTotalRSRBurned * rsrPrice).toLocaleString()}`)

    if (monthlyBurnSnapshots.length > 0) {
      console.log('\nMonthly burn snapshots:')
      monthlyBurnSnapshots.slice(0, 3).forEach((snapshot: any, i: number) => {
        const monthlyAmount = Number(formatUnits(BigInt(snapshot.monthlyBurnAmount || 0), 18))
        const date = new Date(Number(snapshot.timestamp) * 1000)
        console.log(`  ${i + 1}. ${date.toISOString().split('T')[0]}: ${monthlyAmount.toLocaleString()} RSR`)
      })
    }

    console.log('\n⚖️ 6. COMPARISON & VALIDATION:')
    console.log('-------------------------------')
    console.log(`Expected monthly: ${monthlyRsrBurnAmountProjection.toLocaleString()} RSR`)
    console.log(`Actual monthly rate: ${actualMonthlyBurnRate.toLocaleString()} RSR`)
    const monthlyAccuracy = monthlyRsrBurnAmountProjection > 0 ? ((actualMonthlyBurnRate / monthlyRsrBurnAmountProjection) * 100) : 0
    console.log(`Accuracy: ${monthlyAccuracy.toFixed(1)}%`)

    console.log('\n📅 7. TIME ANALYSIS:')
    console.log('--------------------')
    console.log(`Actual months running: ${actualMonthsRunning.toFixed(1)}`)
    console.log(`Daily burn snapshots: ${dailyBurnSnapshots.length}`)
    console.log(`Monthly burn snapshots: ${monthlyBurnSnapshots.length}`)

    console.log('\n🔍 8. TOP DTFs BY TVL:')
    console.log('----------------------')
    dtfRevenueList.slice(0, 5).forEach((dtf: any, i: number) => {
      console.log(`${i + 1}. ${dtf.symbol}: $${dtf.tvl.toLocaleString()} (${dtf.chainName})`)
      console.log(`   Minting fee: ${(dtf.mintingFee * 100).toFixed(2)}%`)
      console.log(`   TVL fee: ${(dtf.tvlFee * 100).toFixed(2)}%`)
    })

    console.log('\n🌐 9. CHAIN DISTRIBUTION:')
    console.log('-------------------------')
    const chainTVLs: Record<string, number> = {}
    dtfRevenueList.forEach((dtf: any) => {
      chainTVLs[dtf.chainName] = (chainTVLs[dtf.chainName] || 0) + dtf.tvl
    })
    Object.entries(chainTVLs).forEach(([chain, tvl]) => {
      console.log(`${chain}: $${tvl.toLocaleString()} (${((tvl / totalTVL) * 100).toFixed(1)}%)`)
    })

    if (recentBurnAnalysis) {
      console.log('\n📆 10. RECENT PERIOD ANALYSIS:')
      console.log('------------------------------')
      console.log(`Period Revenue: $${recentBurnAnalysis.periodRevenue.toFixed(2)}`)
      console.log(`Period Burns: ${recentBurnAnalysis.burnAmount.toFixed(0)} RSR`)
      console.log(`Expected Burns: ${recentBurnAnalysis.expectedBurn.toFixed(0)} RSR`)
      console.log(`Accuracy: ${recentBurnAnalysis.accuracy.toFixed(1)}%`)
    }

    console.log('\n==================================================')
    console.log('END OF RSR BURN DATA ANALYSIS')
    console.log('==================================================\n')

    // Process all historical burns
    const MIN_RSR_THRESHOLD = 1000 // Filter threshold for table display
    const allHistoricalBurns = (burnData || []).map((burn: RSRBurnData) => ({
      date: new Date(Number(burn.timestamp) * 1000),
      amountRSR: Number(formatUnits(BigInt(burn.amount), 18)),
      amountUSD: Number(formatUnits(BigInt(burn.amount), 18)) * rsrPrice,
      txHash: burn.transactionHash,
      chainId: burn.chainId || ChainId.Mainnet, // Track which chain the burn came from
    }))

    // Filter burns >= 1000 RSR for table display, but keep all burns for chart
    const historicalBurns = allHistoricalBurns
      .filter((burn: any) => burn.amountRSR >= MIN_RSR_THRESHOLD)
      .sort((a: any, b: any) => b.date.getTime() - a.date.getTime())

    // Log burn data
    if (burnData && burnData.length > 0) {
      const totalBurnAmount = allHistoricalBurns.reduce((sum: number, burn: any) => sum + burn.amountRSR, 0)

      console.log('6. Historical Burn Data:')
      console.log(`   - Total Burns in Subgraph: ${burnData.length}`)
      console.log(`   - Total RSR Burned: ${totalBurnAmount.toLocaleString()} RSR`)
      console.log(`   - Total USD Burned (at current price): $${(totalBurnAmount * rsrPrice).toLocaleString()}`)

      if (historicalBurns.length > 0) {
        console.log('   - Recent Significant Burns:')
        historicalBurns.slice(0, 5).forEach((burn: any, i: number) => {
          console.log(`     ${i + 1}. ${burn.date.toISOString().split('T')[0]}: ${burn.amountRSR.toLocaleString()} RSR ($${burn.amountUSD.toFixed(2)}) - ${burn.txHash.substring(0, 10)}...`)
        })
      }
      console.log('===========================================')
    } else {
      console.log('6. Historical Burn Data: No burns found in subgraph')
      console.log('===========================================')
    }

    // Calculate total RSR burned (cumulative)
    // Using estimated value based on 5% of total revenue until subgraph tracks actual burns
    const totalRsrBurned = allHistoricalBurns.length > 0
      ? allHistoricalBurns.reduce((sum: number, burn: any) => sum + burn.amountRSR, 0)
      : rsrPrice > 0 ? (totalRevenue * 0.05) / rsrPrice : 0 // Estimated based on 5% of revenue

    console.log(`Total RSR Burned: ${totalRsrBurned.toLocaleString()} RSR ${allHistoricalBurns.length === 0 ? '(estimated)' : '(actual)'}`)

    // Calculate growth rates and projections to reach $1B TVL target
    const calculateGrowthToTarget = () => {
      const TARGET_TVL = 1_000_000_000 // $1B target
      const currentTVL = totalTVL || 100_000_000 // Current TVL or default

      // Calculate months to reach target assuming different growth rates
      // We'll use a moderate growth rate that gets us to $1B in 12 months
      const monthsToTarget = 12
      const requiredMonthlyGrowth = Math.pow(TARGET_TVL / currentTVL, 1 / monthsToTarget) - 1

      // Cap at reasonable growth rate
      const monthlyGrowthRate = Math.min(requiredMonthlyGrowth, 0.25) // Cap at 25% monthly

      return {
        monthlyGrowthRate,
        targetTVL: TARGET_TVL,
        monthsToTarget,
        currentTVL
      }
    }

    const growthProjection = calculateGrowthToTarget()

    // For backward compatibility
    const revenueGrowthRate = growthProjection.monthlyGrowthRate
    const tvlGrowthRate = growthProjection.monthlyGrowthRate

    // Sort DTFs by total revenue
    dtfRevenueList.sort((a, b) => b.total - a.total)

    // Calculate averages
    const averageMintingFee = dtfCount > 0 ? (totalMintingFee / dtfCount) * 100 : 0
    const averageTvlFee = dtfCount > 0 ? (totalTvlFee / dtfCount) * 100 : 0

    // Calculate locked RSR (Index DTFs using RSR as governance token)
    // Check each DTF's stToken to see if it uses RSR as the underlying token
    let lockedRSRInIndexDTFs = 0
    const RSR_ADDRESSES = [
      '0x320623b8e4ff03373931769a31fc52a4e78b5d70'.toLowerCase(), // Mainnet
      '0xab36452dbac151be02b16ca17d8919826072f64a'.toLowerCase(), // Base
      '0x4076cc26efee47825917d0fec3a79d0bb9a6bb5c'.toLowerCase(), // BSC
    ]

    revenueData.forEach(({ dtfs, chainId }) => {
      if (dtfs) {
        dtfs.forEach((dtf) => {
          // Check if this DTF uses RSR as the staking token
          if (dtf.stToken && dtf.stToken.underlying) {
            const underlyingAddress = dtf.stToken.underlying.address.toLowerCase()
            const underlyingSymbol = dtf.stToken.underlying.symbol

            if (RSR_ADDRESSES.includes(underlyingAddress) || underlyingSymbol === 'RSR') {
              // Calculate the amount of RSR locked in this DTF
              const stTokenSupply = Number(dtf.stToken.token.totalSupply || 0)
              const stTokenDecimals = dtf.stToken.token.decimals || 18
              const rsrLocked = stTokenSupply / Math.pow(10, stTokenDecimals)
              lockedRSRInIndexDTFs += rsrLocked

              console.log(`DTF ${dtf.token?.symbol} has ${rsrLocked.toLocaleString()} RSR locked (stToken supply: ${stTokenSupply}, decimals: ${stTokenDecimals})`)
            }
          } else if (dtf.token?.symbol) {
            console.log(`DTF ${dtf.token.symbol} has no stToken or underlying data`)
          }
        })
      }
    })

    // If no locked RSR found from stToken data, use placeholder based on DTF count
    // Assuming average 100k RSR locked per DTF as a reasonable estimate
    if (lockedRSRInIndexDTFs === 0 && dtfCount > 0) {
      lockedRSRInIndexDTFs = dtfCount * 100000 // Placeholder: 100k RSR per DTF
      console.log(`7. Estimated Locked RSR in Index DTFs: ${lockedRSRInIndexDTFs.toLocaleString()} RSR (placeholder: ${dtfCount} DTFs * 100k RSR)`)
    } else {
      console.log(`7. Total Locked RSR in Index DTFs: ${lockedRSRInIndexDTFs.toLocaleString()} RSR`)
    }

    return {
      totalRevenue,
      governanceRevenue: totalGovernanceRevenue,
      deployerRevenue: totalDeployerRevenue,
      externalRevenue: totalExternalRevenue,
      governancePercentage: totalRevenue > 0 ? (totalGovernanceRevenue / totalRevenue) * 100 : 0,
      deployerPercentage: totalRevenue > 0 ? (totalDeployerRevenue / totalRevenue) * 100 : 0,
      externalPercentage: totalRevenue > 0 ? (totalExternalRevenue / totalRevenue) * 100 : 0,
      dtfCount,
      totalTVL,
      averageMintingFee,
      averageTvlFee,
      weightedMintingFee: totalMintingFeeWeighted * 100,
      weightedTvlFee: totalTvlFeeWeighted * 100,
      rsrBurnRevenue: expectedRsrBurnRevenue,
      rsrBurnAmount: expectedRsrBurnAmount,
      actualRsrBurned: actualTotalRSRBurned,
      burnAccuracy,
      monthlyRsrBurnProjection,
      monthlyRsrBurnAmountProjection,
      actualMonthlyBurnRate,
      monthlyActualBurned,
      monthlyExpectedBurned,
      actualMonthsRunning,
      rsrLockedInDTFs: lockedRSRInIndexDTFs,
      topDTFs: dtfRevenueList.slice(0, 5),
      historicalBurns,
      allHistoricalBurns, // Add unfiltered burns for chart
      revenueGrowthRate,
      tvlGrowthRate,
    }
  }, [revenueData, indexDTFs, burnData, rsrPrice])

  return {
    data: metrics,
    isLoading: loadingDTFs || loadingRevenue || loadingBurns,
    rsrPrice,
  }
}

// Calculator hook for interactive projections
export const useRSRBurnCalculator = (baseMetrics: IndexRevenueMetrics) => {
  return useMemo(() => {
    const calculateBurn = (tvl: number, mintingVolume: number, rsrPrice: number) => {
      // Use weighted average fees from actual data or defaults
      const mintingFee = baseMetrics.weightedMintingFee / 100 || 0.003 // Default 0.3%
      const tvlFee = baseMetrics.weightedTvlFee / 100 || 0.02 // Default 2% annual

      // Calculate monthly revenue
      const mintingRevenue = mintingVolume * mintingFee
      const tvlRevenue = (tvl * tvlFee) / 12 // Monthly TVL fee
      const totalMonthlyRevenue = mintingRevenue + tvlRevenue

      // Platform keep percentage (for display only)
      const getPlatformKeepPercentage = (tvl: number): number => {
        if (tvl < 100_000_000) return 0.50 // < $100M: 50%
        if (tvl < 1_000_000_000) return 0.40 // $100M - $1B: 40%
        if (tvl < 10_000_000_000) return 0.30 // $1B - $10B: 30%
        if (tvl < 100_000_000_000) return 0.20 // $10B - $100B: 20%
        if (tvl < 1_000_000_000_000) return 0.10 // $100B - $1T: 10%
        return 0.05 // > $1T: 5%
      }

      const platformKeep = getPlatformKeepPercentage(tvl)
      const platformRevenue = totalMonthlyRevenue * platformKeep

      // IMPORTANT: RSR burn is 5 cents per dollar of TVL annually (not revenue-based)
      // This is the correct calculation as per user requirements
      const BURN_RATE_PER_TVL = 0.05 // $0.05 per $1 of TVL per year
      const annualBurnUSD = tvl * BURN_RATE_PER_TVL
      const rsrBurnUSD = annualBurnUSD / 12 // Monthly burn
      const rsrBurnAmount = rsrPrice > 0 ? rsrBurnUSD / rsrPrice : 0

      return {
        totalMonthlyRevenue,
        mintingRevenue,
        tvlRevenue,
        platformKeep,
        platformRevenue,
        rsrBurnUSD,
        rsrBurnAmount,
        annualizedBurnUSD: rsrBurnUSD * 12,
        annualizedBurnAmount: rsrBurnAmount * 12,
      }
    }

    return calculateBurn
  }, [baseMetrics])
}