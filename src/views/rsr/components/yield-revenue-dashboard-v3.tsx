import { useMemo, useEffect } from 'react'
import { useAtomValue } from 'jotai'
import { rsrPriceAtom } from '@/state/atoms'
import { PROTOCOL_SLUG } from '@/utils/constants'
import { gql } from 'graphql-request'
import { useMultichainQuery } from '@/hooks/useQuery'
import { format, startOfMonth, subMonths } from 'date-fns'

// Components
import YieldRevenueMetrics from './yield-revenue-metrics'
import YieldRevenueOverview from './yield-revenue-overview'
import YieldTopTokens from './yield-top-tokens'
import YieldChainDistribution from './yield-chain-distribution'

// Main protocol revenue query - using correct field names
const protocolRevenueQuery = gql`
  query GetProtocolRevenue($id: String!) {
    protocol(id: $id) {
      cumulativeRTokenRevenueUSD
      cumulativeRSRRevenueUSD
      rsrRevenue
      totalRsrStaked
      totalRsrStakedUSD
      rsrStaked
      rsrStakedUSD
      totalRTokenUSD
      rTokenCount
    }
  }
`

// Top yield DTFs query - get all rtokens with revenue
const topRTokensQuery = gql`
  query GetTopRTokens {
    rtokens(
      first: 20
      where: {
        cumulativeRTokenRevenue_gt: "0"
      }
      orderBy: cumulativeRTokenRevenue
      orderDirection: desc
    ) {
      id
      token {
        id
        symbol
        name
        totalSupply
        lastPriceUSD
      }
      cumulativeRTokenRevenue
      cumulativeStakerRevenue
      holdersRewardShare
      stakersRewardShare
      rsrStaked
      rsrStakedUSD
      targetUnits
      dailySnapshots(first: 30, orderBy: timestamp, orderDirection: desc) {
        id
        timestamp
        dailyRTokenRevenueUSD
        dailyRSRRevenueUSD
        cumulativeRTokenRevenueUSD
        cumulativeRSRRevenueUSD
      }
    }
  }
`

// Monthly snapshots for cumulative trend
const monthlySnapshotsQuery = gql`
  query GetMonthlySnapshots {
    financialsDailySnapshots(
      first: 365
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      timestamp
      cumulativeRTokenRevenueUSD
      cumulativeRSRRevenueUSD
      totalValueLockedUSD
    }
  }
`

const YieldRevenueDashboardV3 = () => {
  const rsrPrice = useAtomValue(rsrPriceAtom) || 0.005 // Default fallback price
  // Note: We're now fetching all rtokens with revenue directly from the subgraph
  // No longer need to filter by specific addresses

  // Fetch protocol data
  const { data: protocolData, isLoading: loadingProtocol } = useMultichainQuery(
    protocolRevenueQuery,
    { id: PROTOCOL_SLUG },
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000
    }
  )

  // Fetch top rTokens
  const { data: topTokensData, isLoading: loadingTopTokens } = useMultichainQuery(
    topRTokensQuery,
    {},
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000
    }
  )

  // Debug logging for top tokens data (only when data changes)
  useEffect(() => {
    if (topTokensData) {
      console.log('🔍 YIELD DTF DEBUG - Data received:', topTokensData)
    }
  }, [topTokensData])

  // Fetch monthly snapshots
  const { data: snapshotsData, isLoading: loadingSnapshots } = useMultichainQuery(
    monthlySnapshotsQuery,
    {},
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000
    }
  )

  // Process protocol metrics with RSR staking info
  const protocolMetrics = useMemo(() => {
    if (!protocolData) {
      return {
        holdersRevenueUSD: 0,
        stakersRevenueUSD: 0,
        stakersRevenueRSR: 0,
        totalRevenueUSD: 0,
        holdersPercentage: 0,
        stakersPercentage: 0,
        totalTVL: 0,
        rsrStaked: 0,
        rsrStakedUSD: 0,
        activeRTokens: 0,
        perChain: {}
      }
    }

    const perChain: Record<string, any> = {}
    let activeRTokens = 0

    const aggregated = Object.entries(protocolData).reduce(
      (acc, [chainId, chainData]: [string, any]) => {
        if (chainData?.protocol) {
          const protocol = chainData.protocol
          const holdersRevenue = Number(protocol.cumulativeRTokenRevenueUSD || 0)
          const stakersRevenue = Number(protocol.cumulativeRSRRevenueUSD || 0)
          const totalRTokenUSD = Number(protocol.totalRTokenUSD || 0)

          // Use totalRsrStaked for cumulative staking across all rTokens
          // Convert from wei (18 decimals) to normal units
          const rsrStakedWei = protocol.totalRsrStaked || protocol.rsrStaked || '0'
          const rsrStaked = Number(rsrStakedWei) / 1e18
          const rsrStakedUSD = Number(protocol.totalRsrStakedUSD || protocol.rsrStakedUSD || 0)

          acc.holdersRevenueUSD += holdersRevenue
          acc.stakersRevenueUSD += stakersRevenue
          acc.stakersRevenueRSR += Number(protocol.rsrRevenue || 0)
          acc.totalRTokenUSD += totalRTokenUSD
          acc.rsrStaked += rsrStaked
          acc.rsrStakedUSD += rsrStakedUSD
          activeRTokens += Number(protocol.rTokenCount || 0)

          // Store per-chain metrics
          perChain[chainId] = {
            revenue: holdersRevenue + stakersRevenue,
            tvl: totalRTokenUSD + rsrStakedUSD,
            holdersRevenue,
            stakersRevenue,
            rTokenCount: Number(protocol.rTokenCount || 0)
          }
        }
        return acc
      },
      {
        holdersRevenueUSD: 0,
        stakersRevenueUSD: 0,
        stakersRevenueRSR: 0,
        totalRTokenUSD: 0,
        rsrStaked: 0,
        rsrStakedUSD: 0
      }
    )

    const totalRevenueUSD = aggregated.holdersRevenueUSD + aggregated.stakersRevenueUSD
    const totalTVL = aggregated.totalRTokenUSD + aggregated.rsrStakedUSD

    return {
      ...aggregated,
      totalRevenueUSD,
      totalTVL,
      activeRTokens,
      holdersPercentage: totalRevenueUSD > 0 ? (aggregated.holdersRevenueUSD / totalRevenueUSD) * 100 : 0,
      stakersPercentage: totalRevenueUSD > 0 ? (aggregated.stakersRevenueUSD / totalRevenueUSD) * 100 : 0,
      perChain
    }
  }, [protocolData])

  // Process top tokens with correct revenue calculations and monthly averages
  const topTokens = useMemo(() => {
    console.log('🔍 YIELD DTF DEBUG - Processing top tokens data')
    console.log('  - Raw data:', JSON.stringify(topTokensData, null, 2))

    if (!topTokensData) {
      console.log('❌ No topTokensData available')
      return []
    }

    const allTokens: any[] = []

    // Process data from each chain
    Object.entries(topTokensData).forEach(([chainId, chainData]: [string, any]) => {
      // Skip null/undefined chains
      if (!chainData) {
        console.log(`⚠️ No data for chain ${chainId}`)
        return
      }

      console.log(`🔍 Chain ${chainId} data:`, chainData)

      // The field name in the subgraph is 'rtokens' (lowercase)
      const rTokensList = chainData?.rtokens || []

      if (Array.isArray(rTokensList) && rTokensList.length > 0) {
        console.log(`✅ Found ${rTokensList.length} rTokens on chain ${chainId}`)

        rTokensList.forEach((rToken: any) => {
          try {
            // Revenue values are ALREADY in USD (not token units)
            const holdersRevenue = parseFloat(rToken.cumulativeRTokenRevenue || '0')
            const stakersRevenue = parseFloat(rToken.cumulativeStakerRevenue || '0')
            const totalRevenue = holdersRevenue + stakersRevenue

            if (totalRevenue > 0) {
              // Get token price for TVL calculation
              const tokenPrice = parseFloat(rToken.token?.lastPriceUSD || '1')
              const totalSupply = parseFloat(rToken.token?.totalSupply || '0') / 1e18 // Convert from wei
              const tvl = totalSupply * tokenPrice

              // Calculate monthly averages from daily snapshots
              let monthlyAvgHolders = 0
              let monthlyAvgStakers = 0

              if (rToken.dailySnapshots && rToken.dailySnapshots.length > 0) {
                // Get last 30 days of daily revenue (already in USD)
                const dailyRevenues = rToken.dailySnapshots.map((snapshot: any) => ({
                  holders: parseFloat(snapshot.dailyRTokenRevenueUSD || '0'),
                  stakers: parseFloat(snapshot.dailyRSRRevenueUSD || '0')
                }))

                const totalDailyHolders = dailyRevenues.reduce((sum: number, d: any) => sum + d.holders, 0)
                const totalDailyStakers = dailyRevenues.reduce((sum: number, d: any) => sum + d.stakers, 0)

                // Monthly total (sum of last 30 days)
                monthlyAvgHolders = totalDailyHolders
                monthlyAvgStakers = totalDailyStakers
              }

              allTokens.push({
                ...rToken,
                chainId: Number(chainId),
                totalRevenue,
                tvl,
                monthlyAvgHolders,
                monthlyAvgStakers,
                monthlyAvgTotal: monthlyAvgHolders + monthlyAvgStakers,
                holdersRewardShare: parseFloat(rToken.holdersRewardShare || '0'),
                stakersRewardShare: parseFloat(rToken.stakersRewardShare || '0'),
                rsrStakedAmount: parseFloat(rToken.rsrStaked || '0') / 1e18, // Convert from wei
                rsrStakedValue: parseFloat(rToken.rsrStakedUSD || '0')
              })
            }
          } catch (error) {
            console.error(`Error processing rToken on chain ${chainId}:`, error)
          }
        })
      } else {
        console.log(`⚠️ No rTokens found on chain ${chainId}`)
      }
    })

    // Sort by total revenue and take top 5
    const sortedTokens = allTokens
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5)

    console.log(`📊 YIELD DTF DEBUG - Final top tokens:`, {
      totalFound: allTokens.length,
      topTokens: sortedTokens,
    })

    return sortedTokens
  }, [topTokensData])

  // Generate monthly cumulative data from snapshots (last 12 months only)
  const monthlyData = useMemo(() => {
    if (!snapshotsData) return []

    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
    const oneYearAgoTimestamp = oneYearAgo.getTime() / 1000

    // Group snapshots by month and chain
    const monthlyByChain: Record<string, Record<string, any>> = {}

    Object.entries(snapshotsData).forEach(([chainId, chainData]: [string, any]) => {
      if (chainData?.financialsDailySnapshots) {
        chainData.financialsDailySnapshots.forEach((snapshot: any) => {
          const timestamp = Number(snapshot.timestamp)

          // Skip data older than one year
          if (timestamp < oneYearAgoTimestamp) return

          const date = new Date(timestamp * 1000)
          const monthKey = format(startOfMonth(date), 'yyyy-MM')

          if (!monthlyByChain[monthKey]) {
            monthlyByChain[monthKey] = {
              1: { revenue: 0 },     // Ethereum
              8453: { revenue: 0 },  // Base
              42161: { revenue: 0 }  // Arbitrum
            }
          }

          const revenue =
            parseFloat(snapshot.cumulativeRTokenRevenueUSD || '0') +
            parseFloat(snapshot.cumulativeRSRRevenueUSD || '0')

          // Store the latest (highest) cumulative value for the month
          if (revenue > (monthlyByChain[monthKey][chainId]?.revenue || 0)) {
            monthlyByChain[monthKey][chainId] = { revenue }
          }
        })
      }
    })

    // Convert to array format for chart
    const sortedMonths = Object.keys(monthlyByChain).sort()

    return sortedMonths.map(monthKey => {
      const monthData = monthlyByChain[monthKey]
      const ethereumRevenue = monthData['1']?.revenue || 0
      const baseRevenue = monthData['8453']?.revenue || 0
      const arbitrumRevenue = monthData['42161']?.revenue || 0

      return {
        month: format(new Date(monthKey), 'MMM yy'),
        totalRevenue: ethereumRevenue + baseRevenue + arbitrumRevenue,
        ethereumRevenue,
        baseRevenue,
        arbitrumRevenue
      }
    })
  }, [snapshotsData])

  // Calculate monthly growth
  const monthlyGrowth = useMemo(() => {
    if (monthlyData.length < 2) return 0

    const current = monthlyData[monthlyData.length - 1]
    const monthAgo = monthlyData[monthlyData.length - 2]

    if (!current || !monthAgo || monthAgo.totalRevenue === 0) return 0

    const growth = current.totalRevenue - monthAgo.totalRevenue
    return (growth / monthAgo.totalRevenue) * 100
  }, [monthlyData])

  const isLoading = loadingProtocol || loadingTopTokens || loadingSnapshots

  return (
    <div className="space-y-4">
      {/* Key Protocol Metrics with RSR Staking */}
      <YieldRevenueMetrics
        metrics={protocolMetrics}
        monthlyGrowth={monthlyGrowth}
        rsrPrice={rsrPrice}
        isLoading={isLoading}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue Overview - Left */}
        <YieldRevenueOverview
          monthlyData={monthlyData}
          totalRevenue={protocolMetrics.totalRevenueUSD}
          holdersRevenue={protocolMetrics.holdersRevenueUSD}
          stakersRevenue={protocolMetrics.stakersRevenueUSD}
          rsrPrice={rsrPrice}
          isLoading={isLoading}
        />

        {/* Top Yield DTFs - Right */}
        <YieldTopTokens
          tokens={topTokens}
          isLoading={isLoading}
        />
      </div>

      {/* Chain Distribution - Bottom */}
      <YieldChainDistribution
        perChain={protocolMetrics.perChain}
        totalRevenue={protocolMetrics.totalRevenueUSD}
        isLoading={isLoading}
      />
    </div>
  )
}

export default YieldRevenueDashboardV3