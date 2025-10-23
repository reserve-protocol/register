import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/utils'
import { gql, GraphQLClient } from 'graphql-request'
import { useMemo, useEffect, useState } from 'react'
import { ChainId } from '@/utils/chains'
import useIndexDTFList from '@/hooks/useIndexDTFList'
import {
  Building,
  Users2,
  Globe,
  TrendingUp,
  DollarSign,
  Layers,
  Activity,
  PieChart,
  Sparkles
} from 'lucide-react'
import RevenueMetricsCard from './revenue-metrics-card'
import RevenuePieChart from './revenue-pie-chart'

// Subgraph URLs for Index DTF
const INDEX_DTF_SUBGRAPH_URL = {
  [ChainId.Mainnet]: 'https://subgraph.satsuma-prod.com/327d6f1d3de6/reserve/dtf-index-mainnet/api',
  [ChainId.Base]: 'https://subgraph.satsuma-prod.com/327d6f1d3de6/reserve/dtf-index-base/api',
  [ChainId.BSC]: 'https://subgraph.satsuma-prod.com/327d6f1d3de6/reserve/dtf-index-bsc/api',
}

const indexDTFRevenueQuery = gql`
  query GetIndexDTFRevenue {
    dtfs(first: 1000) {
      id
      totalRevenue
      protocolRevenue
      governanceRevenue
      externalRevenue
      feeRecipients
      token {
        symbol
        totalSupply
        decimals
      }
    }
  }
`

const IndexRevenueDashboard = () => {
  const { data: indexDTFs, isLoading: loadingDTFs } = useIndexDTFList()
  const [revenueData, setRevenueData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        const chains = [ChainId.Mainnet, ChainId.Base, ChainId.BSC]
        const results = await Promise.all(
          chains.map(async (chainId) => {
            const client = new GraphQLClient(INDEX_DTF_SUBGRAPH_URL[chainId])
            const data: any = await client.request(indexDTFRevenueQuery)
            return { chainId, data }
          })
        )
        setRevenueData(results)
      } catch (error) {
        console.error('Error fetching Index DTF revenue:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRevenueData()
  }, [])

  const revenueMetrics = useMemo(() => {
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
        topDTFs: [],
        totalTVL: 0,
      }
    }

    // Create price map and calculate TVL from indexDTFs
    const priceMap: { [key: string]: number } = {}
    let totalTVL = 0

    indexDTFs.forEach((dtf) => {
      const address = dtf.address.toLowerCase()
      priceMap[address] = dtf.price || 0
      // Use marketCap as TVL for Index DTFs
      totalTVL += dtf.marketCap || 0
    })

    let totalGovernanceRevenue = 0
    let totalDeployerRevenue = 0
    let totalExternalRevenue = 0
    const dtfRevenueList: any[] = []

    revenueData.forEach(({ data }: any) => {
      if (data?.dtfs) {
        data.dtfs.forEach((dtf: any) => {
          const price = priceMap[dtf.id.toLowerCase()] || 0
          const decimals = dtf.token?.decimals || 18

          const governanceUSD = (Number(dtf.governanceRevenue || 0) / Math.pow(10, decimals)) * price
          const deployerUSD = (Number(dtf.protocolRevenue || 0) / Math.pow(10, decimals)) * price
          const externalUSD = (Number(dtf.externalRevenue || 0) / Math.pow(10, decimals)) * price
          const totalUSD = governanceUSD + deployerUSD + externalUSD

          totalGovernanceRevenue += governanceUSD
          totalDeployerRevenue += deployerUSD
          totalExternalRevenue += externalUSD

          if (totalUSD > 0) {
            dtfRevenueList.push({
              symbol: dtf.token?.symbol || 'Unknown',
              total: totalUSD,
              governance: governanceUSD,
              deployer: deployerUSD,
              external: externalUSD,
            })
          }
        })
      }
    })

    const totalRevenue = totalGovernanceRevenue + totalDeployerRevenue + totalExternalRevenue

    // Sort DTFs by total revenue
    dtfRevenueList.sort((a, b) => b.total - a.total)

    return {
      totalRevenue,
      governanceRevenue: totalGovernanceRevenue,
      deployerRevenue: totalDeployerRevenue,
      externalRevenue: totalExternalRevenue,
      governancePercentage: totalRevenue > 0 ? (totalGovernanceRevenue / totalRevenue) * 100 : 0,
      deployerPercentage: totalRevenue > 0 ? (totalDeployerRevenue / totalRevenue) * 100 : 0,
      externalPercentage: totalRevenue > 0 ? (totalExternalRevenue / totalRevenue) * 100 : 0,
      dtfCount: dtfRevenueList.length,
      topDTFs: dtfRevenueList.slice(0, 5),
      totalTVL,
    }
  }, [revenueData, indexDTFs])

  const isLoading = loading || loadingDTFs

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <RevenueMetricsCard
          title="Total Revenue"
          value={`$${formatCurrency(revenueMetrics.totalRevenue, 2)}`}
          icon={<DollarSign className="h-4 w-4" />}
          loading={isLoading}
          className="border-l-4 border-l-primary"
        />

        <RevenueMetricsCard
          title="Governance Revenue"
          value={`$${formatCurrency(revenueMetrics.governanceRevenue, 2)}`}
          subtitle={`${revenueMetrics.governancePercentage.toFixed(1)}% of total`}
          icon={<Users2 className="h-4 w-4" />}
          loading={isLoading}
          className="border-l-4 border-l-indigo-500"
        />

        <RevenueMetricsCard
          title="Deployer Revenue"
          value={`$${formatCurrency(revenueMetrics.deployerRevenue, 2)}`}
          subtitle={`${revenueMetrics.deployerPercentage.toFixed(1)}% of total`}
          icon={<Building className="h-4 w-4" />}
          loading={isLoading}
          className="border-l-4 border-l-amber-500"
        />

        <RevenueMetricsCard
          title="Total TVL"
          value={`$${formatCurrency(revenueMetrics.totalTVL, 0)}`}
          subtitle="Index DTFs"
          icon={<TrendingUp className="h-4 w-4" />}
          loading={isLoading}
          className="border-l-4 border-l-purple-500"
        />

        <RevenueMetricsCard
          title="Active DTFs"
          value={revenueMetrics.dtfCount.toString()}
          subtitle="Generating revenue"
          icon={<Layers className="h-4 w-4" />}
          loading={isLoading}
          className="border-l-4 border-l-cyan-500"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Distribution */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary" />
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
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
    </div>
  )
}

export default IndexRevenueDashboard