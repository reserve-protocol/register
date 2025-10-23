import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/utils'
import { gql } from 'graphql-request'
import { useMultichainQuery } from '@/hooks/useQuery'
import { useAtomValue } from 'jotai'
import { rsrPriceAtom } from '@/state/atoms'
import { PROTOCOL_SLUG } from '@/utils/constants'
import { useMemo } from 'react'
import {
  Users,
  Coins,
  Wallet,
  TrendingUp,
  DollarSign,
  Shield,
  Activity,
  Zap
} from 'lucide-react'
import RevenueMetricsCard from './revenue-metrics-card'
import RevenueSplitChart from './revenue-split-chart'

const protocolRevenueQuery = gql`
  query GetProtocolRevenue($id: String!) {
    protocol(id: $id) {
      cumulativeRTokenRevenueUSD
      cumulativeRSRRevenueUSD
      rsrRevenue
      rsrStaked
      rsrStakedUSD
      totalRTokenUSD
    }
  }
`

const YieldRevenueDashboard = () => {
  const rsrPrice = useAtomValue(rsrPriceAtom) || 0

  const { data, isLoading } = useMultichainQuery(
    protocolRevenueQuery,
    { id: PROTOCOL_SLUG },
    { keepPreviousData: true }
  )

  const revenueMetrics = useMemo(() => {
    if (!data) {
      return {
        holdersRevenueUSD: 0,
        stakersRevenueUSD: 0,
        stakersRevenueRSR: 0,
        totalRevenueUSD: 0,
        holdersPercentage: 0,
        stakersPercentage: 0,
        totalRTokenUSD: 0,
        rsrStakedUSD: 0,
        perChain: {}
      }
    }

    const perChain: Record<string, any> = {}

    const aggregated = Object.entries(data).reduce(
      (acc, [chainId, chainData]: [string, any]) => {
        if (chainData?.protocol) {
          const holdersRevenue = Number(chainData.protocol.cumulativeRTokenRevenueUSD || 0)
          const stakersRevenue = Number(chainData.protocol.cumulativeRSRRevenueUSD || 0)
          const totalRTokenUSD = Number(chainData.protocol.totalRTokenUSD || 0)
          const rsrStakedUSD = Number(chainData.protocol.rsrStakedUSD || 0)

          acc.holdersRevenueUSD += holdersRevenue
          acc.stakersRevenueUSD += stakersRevenue
          acc.stakersRevenueRSR += Number(chainData.protocol.rsrRevenue || 0)
          acc.totalRTokenUSD += totalRTokenUSD
          acc.rsrStakedUSD += rsrStakedUSD

          // Store per-chain metrics
          perChain[chainId] = {
            revenue: holdersRevenue + stakersRevenue,
            tvl: totalRTokenUSD + rsrStakedUSD,
            holdersRevenue,
            stakersRevenue
          }
        }
        return acc
      },
      {
        holdersRevenueUSD: 0,
        stakersRevenueUSD: 0,
        stakersRevenueRSR: 0,
        totalRTokenUSD: 0,
        rsrStakedUSD: 0
      }
    )

    const totalRevenueUSD = aggregated.holdersRevenueUSD + aggregated.stakersRevenueUSD

    return {
      ...aggregated,
      totalRevenueUSD,
      holdersPercentage: totalRevenueUSD > 0 ? (aggregated.holdersRevenueUSD / totalRevenueUSD) * 100 : 0,
      stakersPercentage: totalRevenueUSD > 0 ? (aggregated.stakersRevenueUSD / totalRevenueUSD) * 100 : 0,
      perChain
    }
  }, [data])

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <RevenueMetricsCard
          title="Total Revenue"
          value={`$${formatCurrency(revenueMetrics.totalRevenueUSD, 2)}`}
          icon={<DollarSign className="h-4 w-4" />}
          loading={isLoading}
          className="border-l-4 border-l-primary"
        />

        <RevenueMetricsCard
          title="DTF Holders Revenue"
          value={`$${formatCurrency(revenueMetrics.holdersRevenueUSD, 2)}`}
          subtitle={`${revenueMetrics.holdersPercentage.toFixed(1)}% of total`}
          icon={<Wallet className="h-4 w-4" />}
          loading={isLoading}
          className="border-l-4 border-l-blue-500"
        />

        <RevenueMetricsCard
          title="RSR Stakers Revenue"
          value={`$${formatCurrency(revenueMetrics.stakersRevenueUSD, 2)}`}
          subtitle={`${formatCurrency(revenueMetrics.stakersRevenueRSR, 0)} RSR`}
          icon={<Shield className="h-4 w-4" />}
          loading={isLoading}
          className="border-l-4 border-l-green-500"
        />

        <RevenueMetricsCard
          title="Total Value Locked"
          value={`$${formatCurrency(revenueMetrics.totalRTokenUSD + revenueMetrics.rsrStakedUSD, 0)}`}
          subtitle="RTokens + Staked RSR"
          icon={<Zap className="h-4 w-4" />}
          loading={isLoading}
          className="border-l-4 border-l-purple-500"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Distribution Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Revenue Distribution
              </span>
              <span className="text-sm font-normal text-muted-foreground">
                All-time cumulative
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px]" />
            ) : (
              <div>
                <RevenueSplitChart
                  holdersRevenue={revenueMetrics.holdersRevenueUSD}
                  stakersRevenue={revenueMetrics.stakersRevenueUSD}
                />

                {/* Revenue Bars */}
                <div className="mt-6 space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <Wallet className="h-4 w-4" />
                        DTF Holders
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {revenueMetrics.holdersPercentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${revenueMetrics.holdersPercentage}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        RSR Stakers
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {revenueMetrics.stakersPercentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 transition-all duration-300"
                        style={{ width: `${revenueMetrics.stakersPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detailed Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* DTF Holders */}
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-blue-500/20">
                    <Wallet className="h-4 w-4 text-blue-500" />
                  </div>
                  <span className="font-medium">DTF Holders</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Revenue</span>
                  <span className="font-mono font-medium">
                    ${formatCurrency(revenueMetrics.holdersRevenueUSD, 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Share</span>
                  <span className="font-mono font-medium">
                    {revenueMetrics.holdersPercentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* RSR Stakers */}
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-green-500/20">
                    <Shield className="h-4 w-4 text-green-500" />
                  </div>
                  <span className="font-medium">RSR Stakers</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">USD Value</span>
                  <span className="font-mono font-medium">
                    ${formatCurrency(revenueMetrics.stakersRevenueUSD, 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">RSR Amount</span>
                  <span className="font-mono font-medium">
                    {formatCurrency(revenueMetrics.stakersRevenueRSR, 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Share</span>
                  <span className="font-mono font-medium">
                    {revenueMetrics.stakersPercentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* RSR Price Info */}
            <div className="pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current RSR Price</span>
                <span className="font-mono font-medium">${rsrPrice.toFixed(4)}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-muted-foreground">RSR Staked (USD)</span>
                <span className="font-mono font-medium">
                  ${formatCurrency(revenueMetrics.rsrStakedUSD, 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chain Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            Revenue & TVL by Chain
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Ethereum Mainnet */}
            {revenueMetrics.perChain['1'] && (
              <div className="p-4 rounded-lg bg-secondary/50 border">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold">Ethereum</p>
                    <p className="text-sm text-muted-foreground">Mainnet</p>
                  </div>
                  <span className="px-2 py-1 text-xs bg-primary/10 text-primary border border-primary/20 rounded">
                    L1
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Revenue</p>
                    <p className="text-lg font-bold">
                      ${formatCurrency(revenueMetrics.perChain['1'].revenue, 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">TVL</p>
                    <p className="text-lg font-bold">
                      ${formatCurrency(revenueMetrics.perChain['1'].tvl, 0)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Base */}
            {revenueMetrics.perChain['8453'] && (
              <div className="p-4 rounded-lg bg-secondary/50 border">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold">Base</p>
                    <p className="text-sm text-muted-foreground">Optimism L2</p>
                  </div>
                  <span className="px-2 py-1 text-xs bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded">
                    L2
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Revenue</p>
                    <p className="text-lg font-bold">
                      ${formatCurrency(revenueMetrics.perChain['8453']?.revenue || 0, 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">TVL</p>
                    <p className="text-lg font-bold">
                      ${formatCurrency(revenueMetrics.perChain['8453']?.tvl || 0, 0)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Arbitrum */}
            {revenueMetrics.perChain['42161'] && (
              <div className="p-4 rounded-lg bg-secondary/50 border">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold">Arbitrum</p>
                    <p className="text-sm text-muted-foreground">Arbitrum L2</p>
                  </div>
                  <span className="px-2 py-1 text-xs bg-orange-500/10 text-orange-500 border border-orange-500/20 rounded">
                    L2
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Revenue</p>
                    <p className="text-lg font-bold">
                      ${formatCurrency(revenueMetrics.perChain['42161']?.revenue || 0, 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">TVL</p>
                    <p className="text-lg font-bold">
                      ${formatCurrency(revenueMetrics.perChain['42161']?.tvl || 0, 0)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Total Summary */}
            <div className="pt-4 border-t">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold">
                    ${formatCurrency(revenueMetrics.totalRevenueUSD, 0)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Total TVL</p>
                  <p className="text-2xl font-bold">
                    ${formatCurrency(revenueMetrics.totalRTokenUSD + revenueMetrics.rsrStakedUSD, 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default YieldRevenueDashboard