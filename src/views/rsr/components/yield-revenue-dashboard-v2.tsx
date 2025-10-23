import { useAtomValue } from 'jotai'
import { rsrPriceAtom } from '@/state/atoms'
import { formatCurrency } from '@/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DollarSign,
  Wallet,
  Shield,
  TrendingUp,
  Coins
} from 'lucide-react'

// Hooks
import { useYieldRevenue } from '../hooks/use-yield-revenue'

// Components
import RevenueMetricsCard from './revenue-metrics-card'
import RevenueSplitChart from './revenue-split-chart'
import ChainMetricsCard from './chain-metrics-card'

const YieldRevenueDashboardV2 = () => {
  const rsrPrice = useAtomValue(rsrPriceAtom) || 0
  const { data: metrics, isLoading, error } = useYieldRevenue()

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-destructive">Failed to load revenue data</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <RevenueMetricsCard
          title="Total Revenue"
          value={`$${formatCurrency(metrics.totalRevenueUSD, 2)}`}
          icon={<DollarSign className="h-4 w-4" />}
          loading={isLoading}
          className="border-l-4 border-l-primary"
        />

        <RevenueMetricsCard
          title="DTF Holders Revenue"
          value={`$${formatCurrency(metrics.holdersRevenueUSD, 2)}`}
          subtitle={`${metrics.holdersPercentage.toFixed(1)}% of total`}
          icon={<Wallet className="h-4 w-4" />}
          loading={isLoading}
          className="border-l-4 border-l-blue-500"
        />

        <RevenueMetricsCard
          title="RSR Stakers Revenue"
          value={`$${formatCurrency(metrics.stakersRevenueUSD, 2)}`}
          subtitle={`${metrics.stakersPercentage.toFixed(1)}% of total`}
          icon={<Shield className="h-4 w-4" />}
          loading={isLoading}
          className="border-l-4 border-l-green-500"
        />

        <RevenueMetricsCard
          title="RSR Stakers (RSR)"
          value={formatCurrency(metrics.stakersRevenueRSR, 0)}
          subtitle={`@ $${rsrPrice.toFixed(4)}`}
          icon={<Shield className="h-4 w-4" />}
          loading={isLoading}
          className="border-l-4 border-l-emerald-500"
        />
      </div>

      {/* Revenue Split and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Revenue Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px]" />
            ) : (
              <RevenueSplitChart
                holdersRevenue={metrics.holdersRevenueUSD}
                stakersRevenue={metrics.stakersRevenueUSD}
              />
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
            {isLoading ? (
              <Skeleton className="h-[300px]" />
            ) : (
              <>
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
                        ${formatCurrency(metrics.holdersRevenueUSD, 0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Share</span>
                      <span className="font-mono font-medium">
                        {metrics.holdersPercentage.toFixed(1)}%
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
                        ${formatCurrency(metrics.stakersRevenueUSD, 0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">RSR Amount</span>
                      <span className="font-mono font-medium">
                        {formatCurrency(metrics.stakersRevenueRSR, 0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Share</span>
                      <span className="font-mono font-medium">
                        {metrics.stakersPercentage.toFixed(1)}%
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
                      ${formatCurrency(metrics.rsrStakedUSD, 0)}
                    </span>
                  </div>
                </div>
              </>
            )}
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
          {isLoading ? (
            <Skeleton className="h-[300px]" />
          ) : (
            <div className="space-y-4">
              {/* Ethereum Mainnet */}
              {metrics.perChain['1'] && (
                <ChainMetricsCard
                  chainName="Ethereum"
                  chainType="Mainnet"
                  badgeColor="bg-primary/10 text-primary border border-primary/20"
                  badgeText="L1"
                  revenue={metrics.perChain['1'].revenue}
                  tvl={metrics.perChain['1'].tvl}
                />
              )}

              {/* Base */}
              {metrics.perChain['8453'] && (
                <ChainMetricsCard
                  chainName="Base"
                  chainType="Optimism L2"
                  badgeColor="bg-blue-500/10 text-blue-500 border border-blue-500/20"
                  badgeText="L2"
                  revenue={metrics.perChain['8453']?.revenue || 0}
                  tvl={metrics.perChain['8453']?.tvl || 0}
                />
              )}

              {/* Arbitrum */}
              {metrics.perChain['42161'] && (
                <ChainMetricsCard
                  chainName="Arbitrum"
                  chainType="Arbitrum L2"
                  badgeColor="bg-orange-500/10 text-orange-500 border border-orange-500/20"
                  badgeText="L2"
                  revenue={metrics.perChain['42161']?.revenue || 0}
                  tvl={metrics.perChain['42161']?.tvl || 0}
                />
              )}

              {/* Total Summary */}
              <div className="pt-4 border-t">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                    <p className="text-2xl font-bold">
                      ${formatCurrency(metrics.totalRevenueUSD, 0)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Total TVL</p>
                    <p className="text-2xl font-bold">
                      ${formatCurrency(metrics.yieldTVL, 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default YieldRevenueDashboardV2