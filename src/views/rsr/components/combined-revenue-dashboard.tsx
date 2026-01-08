import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/utils'
import { gql, GraphQLClient } from 'graphql-request'
import { useMultichainQuery } from '@/hooks/useQuery'
import { useAtomValue } from 'jotai'
import { rsrPriceAtom } from '@/state/atoms'
import { PROTOCOL_SLUG } from '@/utils/constants'
import { useMemo, useEffect, useState } from 'react'
import { ChainId } from '@/utils/chains'
import { INDEX_DTF_SUBGRAPH_URL } from '@/state/chain/atoms/chainAtoms'
import useIndexDTFList from '@/hooks/use-index-dtf-list'
import {
  DollarSign,
  TrendingUp,
  Users,
  Wallet,
  Building,
  Globe,
  BarChart3,
  Layers3,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Shield,
  Sparkles,
  Activity
} from 'lucide-react'
import RevenueMetricsCard from './revenue-metrics-card'

const yieldRevenueQuery = gql`
  query GetProtocolRevenue($id: String!) {
    protocol(id: $id) {
      cumulativeRTokenRevenueUSD
      cumulativeRSRRevenueUSD
      rsrRevenue
      totalRTokenUSD
      rsrStakedUSD
    }
  }
`

const indexDTFRevenueQuery = gql`
  query GetIndexDTFRevenue {
    dtfs(first: 1000) {
      id
      totalRevenue
      protocolRevenue
      governanceRevenue
      externalRevenue
      token {
        symbol
        totalSupply
        decimals
      }
    }
  }
`

const CombinedRevenueDashboard = () => {
  const rsrPrice = useAtomValue(rsrPriceAtom) || 0
  const { data: indexDTFs } = useIndexDTFList()
  const [indexRevenueData, setIndexRevenueData] = useState<any>(null)
  const [loadingIndex, setLoadingIndex] = useState(true)

  // Fetch Yield DTF data
  const { data: yieldData, isLoading: loadingYield } = useMultichainQuery(
    yieldRevenueQuery,
    { id: PROTOCOL_SLUG },
    { keepPreviousData: true }
  )

  // Fetch Index DTF data
  useEffect(() => {
    const fetchIndexRevenue = async () => {
      try {
        const chains = [ChainId.Mainnet, ChainId.Base, ChainId.BSC]
        const results = await Promise.all(
          chains.map(async (chainId) => {
            const client = new GraphQLClient(INDEX_DTF_SUBGRAPH_URL[chainId])
            const data: any = await client.request(indexDTFRevenueQuery)
            return { chainId, data }
          })
        )
        setIndexRevenueData(results)
      } catch (error) {
        console.error('Error fetching Index DTF revenue:', error)
      } finally {
        setLoadingIndex(false)
      }
    }

    fetchIndexRevenue()
  }, [])

  // Calculate combined metrics
  const combinedMetrics = useMemo(() => {

    // Process Yield data
    let yieldMetrics = {
      holdersRevenue: 0,
      stakersRevenue: 0,
      stakersRevenueRSR: 0,
      yieldRevenue: 0,
      yieldTVL: 0
    }

    if (yieldData) {
      const aggregated = Object.entries(yieldData).reduce(
        (acc, [chainId, chainData]: [string, any]) => {
          // Only process if we have valid protocol data
          if (chainData && chainData.protocol) {
            const protocol = chainData.protocol
            acc.holdersRevenue += Number(protocol.cumulativeRTokenRevenueUSD || 0)
            acc.stakersRevenue += Number(protocol.cumulativeRSRRevenueUSD || 0)
            acc.stakersRevenueRSR += Number(protocol.rsrRevenue || 0)
            acc.yieldTVL += Number(protocol.totalRTokenUSD || 0) + Number(protocol.rsrStakedUSD || 0)
          }
          return acc
        },
        { holdersRevenue: 0, stakersRevenue: 0, stakersRevenueRSR: 0, yieldTVL: 0 }
      )

      yieldMetrics.holdersRevenue = aggregated.holdersRevenue
      yieldMetrics.stakersRevenue = aggregated.stakersRevenue
      yieldMetrics.stakersRevenueRSR = aggregated.stakersRevenueRSR
      yieldMetrics.yieldRevenue = aggregated.holdersRevenue + aggregated.stakersRevenue
      yieldMetrics.yieldTVL = aggregated.yieldTVL
    }

    // Process Index data
    let indexMetrics = {
      governanceRevenue: 0,
      deployerRevenue: 0,
      externalRevenue: 0,
      indexRevenue: 0,
      activeProtocols: 0,
      indexTVL: 0
    }

    if (indexRevenueData && indexDTFs) {
      const priceMap: { [key: string]: number } = {}

      // Calculate Index DTF TVL from marketCap
      indexDTFs.forEach((dtf) => {
        const address = dtf.address.toLowerCase()
        priceMap[address] = dtf.price || 0
        // Use marketCap as TVL for Index DTFs
        indexMetrics.indexTVL += dtf.marketCap || 0
      })

      indexRevenueData.forEach(({ data }: any) => {
        if (data?.dtfs) {
          data.dtfs.forEach((dtf: any) => {
            const price = priceMap[dtf.id.toLowerCase()] || 0
            const decimals = dtf.token?.decimals || 18

            indexMetrics.governanceRevenue += (Number(dtf.governanceRevenue || 0) / Math.pow(10, decimals)) * price
            indexMetrics.deployerRevenue += (Number(dtf.protocolRevenue || 0) / Math.pow(10, decimals)) * price
            indexMetrics.externalRevenue += (Number(dtf.externalRevenue || 0) / Math.pow(10, decimals)) * price
            indexMetrics.activeProtocols++
          })
        }
      })
      indexMetrics.indexRevenue = indexMetrics.governanceRevenue + indexMetrics.deployerRevenue + indexMetrics.externalRevenue
    }

    // Combine metrics
    const totalRevenue = yieldMetrics.yieldRevenue + indexMetrics.indexRevenue
    const totalTVL = yieldMetrics.yieldTVL + indexMetrics.indexTVL

    return {
      totalRevenue,
      yieldRevenue: yieldMetrics.yieldRevenue,
      indexRevenue: indexMetrics.indexRevenue,
      yieldPercentage: totalRevenue > 0 ? (yieldMetrics.yieldRevenue / totalRevenue) * 100 : 0,
      indexPercentage: totalRevenue > 0 ? (indexMetrics.indexRevenue / totalRevenue) * 100 : 0,
      // Yield breakdown
      holdersRevenue: yieldMetrics.holdersRevenue,
      stakersRevenue: yieldMetrics.stakersRevenue,
      stakersRevenueRSR: yieldMetrics.stakersRevenueRSR,
      // Index breakdown
      governanceRevenue: indexMetrics.governanceRevenue,
      deployerRevenue: indexMetrics.deployerRevenue,
      externalRevenue: indexMetrics.externalRevenue,
      // TVL stats
      totalTVL,
      yieldTVL: yieldMetrics.yieldTVL,
      indexTVL: indexMetrics.indexTVL,
      activeProtocols: indexMetrics.activeProtocols,
    }
  }, [yieldData, indexRevenueData, indexDTFs])

  const isLoading = loadingYield || loadingIndex

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <RevenueMetricsCard
          title="Total Revenue"
          value={`$${formatCurrency(combinedMetrics.totalRevenue, 2)}`}
          icon={<DollarSign className="h-4 w-4" />}
          loading={isLoading}
          className="border-l-4 border-l-primary lg:col-span-1"
        />

        <RevenueMetricsCard
          title="Yield DTF Revenue"
          value={`$${formatCurrency(combinedMetrics.yieldRevenue, 2)}`}
          subtitle={`${combinedMetrics.yieldPercentage.toFixed(1)}% of total`}
          icon={<Wallet className="h-4 w-4" />}
          loading={isLoading}
          className="border-l-4 border-l-blue-500"
        />

        <RevenueMetricsCard
          title="Index DTF Revenue"
          value={`$${formatCurrency(combinedMetrics.indexRevenue, 2)}`}
          subtitle={`${combinedMetrics.indexPercentage.toFixed(1)}% of total`}
          icon={<Layers3 className="h-4 w-4" />}
          loading={isLoading}
          className="border-l-4 border-l-purple-500"
        />

        <RevenueMetricsCard
          title="RSR Stakers (RSR)"
          value={formatCurrency(combinedMetrics.stakersRevenueRSR, 0)}
          subtitle={`@ $${rsrPrice.toFixed(4)}`}
          icon={<Shield className="h-4 w-4" />}
          loading={isLoading}
          className="border-l-4 border-l-green-500"
        />

        <RevenueMetricsCard
          title="Combined TVL"
          value={`$${formatCurrency(combinedMetrics.totalTVL, 0)}`}
          subtitle={`Y: $${formatCurrency(combinedMetrics.yieldTVL / 1000000, 1)}M | I: $${formatCurrency(combinedMetrics.indexTVL / 1000000, 1)}M`}
          icon={<Zap className="h-4 w-4" />}
          loading={isLoading}
          className="border-l-4 border-l-amber-500"
        />
      </div>

      {/* Main Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Yield DTF Card */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <span className="px-2 py-1 text-xs bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded">
              Yield DTF
            </span>
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              Yield DTF Protocol
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px]" />
            ) : (
              <div className="space-y-6">
                {/* Total */}
                <div className="text-center py-4">
                  <p className="text-3xl font-bold">
                    ${formatCurrency(combinedMetrics.yieldRevenue, 0)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Total Revenue Generated
                  </p>
                </div>

                <Separator />

                {/* Breakdown */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-blue-500" />
                      <span>DTF Holders</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        ${formatCurrency(combinedMetrics.holdersRevenue, 0)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {combinedMetrics.yieldRevenue > 0
                          ? ((combinedMetrics.holdersRevenue / combinedMetrics.yieldRevenue) * 100).toFixed(1)
                          : 0}%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-500" />
                      <span>RSR Stakers</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        ${formatCurrency(combinedMetrics.stakersRevenue, 0)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(combinedMetrics.stakersRevenueRSR, 0)} RSR
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-2xl font-bold">3</p>
                    <p className="text-xs text-muted-foreground">Active Chains</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      ${formatCurrency(combinedMetrics.yieldTVL / 1000000, 1)}M
                    </p>
                    <p className="text-xs text-muted-foreground">Total TVL</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Index DTF Card */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <span className="px-2 py-1 text-xs bg-purple-500/10 text-purple-500 border border-purple-500/20 rounded">
              Index DTF
            </span>
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Index DTF Protocol
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px]" />
            ) : (
              <div className="space-y-6">
                {/* Total */}
                <div className="text-center py-4">
                  <p className="text-3xl font-bold">
                    ${formatCurrency(combinedMetrics.indexRevenue, 0)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Total Revenue Generated
                  </p>
                </div>

                <Separator />

                {/* Breakdown */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-indigo-500" />
                      <span>Governance</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        ${formatCurrency(combinedMetrics.governanceRevenue, 0)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {combinedMetrics.indexRevenue > 0
                          ? ((combinedMetrics.governanceRevenue / combinedMetrics.indexRevenue) * 100).toFixed(1)
                          : 0}%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-amber-500" />
                      <span>Deployer</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        ${formatCurrency(combinedMetrics.deployerRevenue, 0)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {combinedMetrics.indexRevenue > 0
                          ? ((combinedMetrics.deployerRevenue / combinedMetrics.indexRevenue) * 100).toFixed(1)
                          : 0}%
                      </p>
                    </div>
                  </div>

                  {combinedMetrics.externalRevenue > 0 && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-green-500" />
                        <span>External</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          ${formatCurrency(combinedMetrics.externalRevenue, 0)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {combinedMetrics.indexRevenue > 0
                            ? ((combinedMetrics.externalRevenue / combinedMetrics.indexRevenue) * 100).toFixed(1)
                            : 0}%
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      ${formatCurrency(combinedMetrics.indexTVL / 1000000, 1)}M
                    </p>
                    <p className="text-xs text-muted-foreground">Total TVL</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {combinedMetrics.activeProtocols}
                    </p>
                    <p className="text-xs text-muted-foreground">Active DTFs</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Protocol Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Protocol Comparison
            </span>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 text-xs border border-border rounded">All Chains</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[200px]" />
          ) : (
            <div className="space-y-6">
              {/* Visual Comparison Bar */}
              <div className="relative h-16 bg-secondary/30 rounded-lg overflow-hidden flex">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-400 flex items-center justify-center transition-all duration-500"
                  style={{ width: `${combinedMetrics.yieldPercentage}%` }}
                >
                  {combinedMetrics.yieldPercentage > 20 && (
                    <span className="text-white font-semibold">
                      {combinedMetrics.yieldPercentage.toFixed(1)}%
                    </span>
                  )}
                </div>
                <div
                  className="bg-gradient-to-r from-purple-500 to-purple-400 flex items-center justify-center transition-all duration-500"
                  style={{ width: `${combinedMetrics.indexPercentage}%` }}
                >
                  {combinedMetrics.indexPercentage > 20 && (
                    <span className="text-white font-semibold">
                      {combinedMetrics.indexPercentage.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>

              {/* Legend */}
              <div className="flex justify-around">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gradient-to-r from-blue-500 to-blue-400" />
                  <span>Yield DTF: ${formatCurrency(combinedMetrics.yieldRevenue, 0)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gradient-to-r from-purple-500 to-purple-400" />
                  <span>Index DTF: ${formatCurrency(combinedMetrics.indexRevenue, 0)}</span>
                </div>
              </div>

              {/* Insights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Leading Protocol</p>
                  <p className="font-semibold">
                    {combinedMetrics.yieldRevenue > combinedMetrics.indexRevenue ? 'Yield DTF' : 'Index DTF'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Revenue Difference</p>
                  <p className="font-semibold flex items-center justify-center gap-1">
                    {combinedMetrics.yieldRevenue > combinedMetrics.indexRevenue ? (
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-500" />
                    )}
                    ${formatCurrency(Math.abs(combinedMetrics.yieldRevenue - combinedMetrics.indexRevenue), 0)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">RSR Price</p>
                  <p className="font-semibold">${rsrPrice.toFixed(4)}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default CombinedRevenueDashboard