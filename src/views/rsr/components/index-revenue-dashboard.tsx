import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/utils'
import { Suspense, lazy } from 'react'
import {
  Building,
  Users2,
  Globe,
  TrendingUp,
  DollarSign,
  Layers,
  Activity,
  PieChart,
  Sparkles,
  Flame
} from 'lucide-react'
import RevenueMetricsCard from './revenue-metrics-card'
import RevenuePieChart from './revenue-pie-chart'
import { useIndexRevenueEnhanced } from '../hooks/use-index-revenue-enhanced'

// Lazy load the RSR Burn component
const RSRBurnEstimation = lazy(() => import('./rsr-burn-estimation'))

const IndexRevenueDashboard = () => {
  // Use the enhanced hook for all revenue calculations
  const { data: revenueMetrics, isLoading, rsrPrice } = useIndexRevenueEnhanced()

  return (
    <div className="space-y-6">
      {/* Key Metrics - Reduced to 4 cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
        <RevenueMetricsCard
          title="Total Revenue"
          value={`$${formatCurrency(revenueMetrics.totalRevenue, 2)}`}
          subtitle="Index DTFs"
          icon={<DollarSign className="h-4 w-4" />}
          loading={isLoading}
        />

        <RevenueMetricsCard
          title="Total TVL"
          value={`$${formatCurrency(revenueMetrics.totalTVL, 0)}`}
          subtitle={`${revenueMetrics.dtfCount} Active DTFs`}
          icon={<TrendingUp className="h-4 w-4" />}
          loading={isLoading}
        />

        <RevenueMetricsCard
          title="Locked RSR"
          value={formatCurrency(revenueMetrics.lockedRSRInIndexDTFs, 0)}
          subtitle="Index DTF Governance"
          icon={<Users2 className="h-4 w-4" />}
          loading={isLoading}
        />

        <RevenueMetricsCard
          title="Total RSR Burned"
          value={formatCurrency(revenueMetrics.totalRsrBurned || 0, 0)}
          subtitle="All-time cumulative"
          icon={<Flame className="h-4 w-4" />}
          loading={isLoading}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        {/* Revenue Distribution */}
        <Card className="lg:col-span-2 border-2 border-secondary">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <div className="border rounded-full border-foreground p-2">
                  <PieChart className="h-4 w-4" />
                </div>
                Revenue Distribution
              </span>
              <span className="px-2 py-1 text-xs bg-secondary rounded-md">Index DTFs</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[400px]" />
            ) : (
              <div className="space-y-6">
                {/* Pie Chart Visualization */}
                <RevenuePieChart
                  data={[
                    {
                      name: 'Governance',
                      value: revenueMetrics.governanceRevenue,
                      color: 'rgb(99, 102, 241)',
                    },
                    {
                      name: 'Deployer',
                      value: revenueMetrics.deployerRevenue,
                      color: 'rgb(245, 158, 11)',
                    },
                    {
                      name: 'External',
                      value: revenueMetrics.externalRevenue,
                      color: 'rgb(34, 197, 94)',
                    },
                  ]}
                  height={250}
                />

                {/* Legend */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <div className="w-3 h-3 rounded-full bg-indigo-500 mr-2" />
                      <span className="text-sm">Governance</span>
                    </div>
                    <p className="text-lg font-semibold">
                      ${formatCurrency(revenueMetrics.governanceRevenue, 0)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {revenueMetrics.governancePercentage.toFixed(1)}%
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <div className="w-3 h-3 rounded-full bg-amber-500 mr-2" />
                      <span className="text-sm">Deployer</span>
                    </div>
                    <p className="text-lg font-semibold">
                      ${formatCurrency(revenueMetrics.deployerRevenue, 0)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {revenueMetrics.deployerPercentage.toFixed(1)}%
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2" />
                      <span className="text-sm">External</span>
                    </div>
                    <p className="text-lg font-semibold">
                      ${formatCurrency(revenueMetrics.externalRevenue, 0)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {revenueMetrics.externalPercentage.toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Progress Bars */}
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm flex items-center gap-2">
                        <Users2 className="h-4 w-4" />
                        Governance
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {revenueMetrics.governancePercentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 transition-all duration-300"
                        style={{ width: `${revenueMetrics.governancePercentage}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        Deployer
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {revenueMetrics.deployerPercentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 transition-all duration-300"
                        style={{ width: `${revenueMetrics.deployerPercentage}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        External
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {revenueMetrics.externalPercentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 transition-all duration-300"
                        style={{ width: `${revenueMetrics.externalPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Revenue DTFs */}
        <Card className="border-2 border-secondary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="border rounded-full border-foreground p-2">
                <Sparkles className="h-4 w-4" />
              </div>
              Top DTFs by Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[400px]" />
            ) : (
              <div className="space-y-3">
                {revenueMetrics.topDTFs.length > 0 ? (
                  revenueMetrics.topDTFs.map((dtf, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium flex items-center gap-2">
                          <span className="px-1.5 py-0.5 text-xs border border-border rounded">
                            #{index + 1}
                          </span>
                          {dtf.symbol}
                        </span>
                        <span className="text-sm font-mono font-semibold">
                          ${formatCurrency(dtf.total, 0)}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div className="flex justify-between">
                          <span>Governance</span>
                          <span>${formatCurrency(dtf.governance, 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Deployer</span>
                          <span>${formatCurrency(dtf.deployer, 0)}</span>
                        </div>
                        {dtf.external > 0 && (
                          <div className="flex justify-between">
                            <span>External</span>
                            <span>${formatCurrency(dtf.external, 0)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No revenue data available
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Chain Distribution */}
      <Card className="border-2 border-secondary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="border rounded-full border-foreground p-2">
              <Activity className="h-4 w-4" />
            </div>
            Chain Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-secondary/30">
              <p className="text-2xl font-bold mb-1">Mainnet</p>
              <p className="text-sm text-muted-foreground">Ethereum L1</p>
              <span className="inline-block mt-2 px-2 py-0.5 text-xs border border-border rounded">
                Premium
              </span>
            </div>
            <div className="text-center p-4 rounded-lg bg-secondary/30">
              <p className="text-2xl font-bold mb-1">Base</p>
              <p className="text-sm text-muted-foreground">Ethereum L2</p>
              <span className="inline-block mt-2 px-2 py-0.5 text-xs border border-border rounded">
                High Volume
              </span>
            </div>
            <div className="text-center p-4 rounded-lg bg-secondary/30">
              <p className="text-2xl font-bold mb-1">BSC</p>
              <p className="text-sm text-muted-foreground">BNB Chain</p>
              <span className="inline-block mt-2 px-2 py-0.5 text-xs border border-border rounded">
                Emerging
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* RSR Burn Section */}
      <Suspense fallback={<Skeleton className="h-[800px]" />}>
        <RSRBurnEstimation
          metrics={revenueMetrics}
          rsrPrice={rsrPrice}
          loading={isLoading}
        />
      </Suspense>
    </div>
  )
}

export default IndexRevenueDashboard