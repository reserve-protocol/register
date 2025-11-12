import { useMemo } from 'react'
import { useAtomValue } from 'jotai'
import { rsrPriceAtom } from '@/state/atoms'
import { formatCurrency } from '@/utils'
import {
  DollarSign,
  TrendingUp,
  Wallet,
  Shield,
  Zap,
  Activity,
  Sparkles,
  Users,
  Building,
  Globe
} from 'lucide-react'

// Hooks
import { useYieldRevenue } from '../hooks/use-yield-revenue'
import { useIndexRevenueEnhanced } from '../hooks/use-index-revenue-enhanced'

// Components
import RevenueMetricsCard from './revenue-metrics-card'
import ProtocolCard from './protocol-card'
import ProtocolComparison from './protocol-comparison'
import { Skeleton } from '@/components/ui/skeleton'

const CombinedRevenueDashboardV2 = () => {
  const rsrPrice = useAtomValue(rsrPriceAtom) || 0

  // Use optimized hooks
  const { data: yieldMetrics, isLoading: loadingYield } = useYieldRevenue()
  const { data: indexMetrics, isLoading: loadingIndex } = useIndexRevenueEnhanced()

  // Calculate combined metrics with null safety
  const combinedMetrics = useMemo(() => {
    const yieldTotal = yieldMetrics?.totalRevenueUSD || 0
    const indexTotal = indexMetrics?.totalRevenue || 0
    const totalRevenue = yieldTotal + indexTotal
    const totalTVL = (yieldMetrics?.yieldTVL || 0) + (indexMetrics?.totalTVL || 0)

    return {
      totalRevenue,
      totalTVL,
      yieldRevenue: yieldTotal,
      indexRevenue: indexTotal,
      yieldPercentage: totalRevenue > 0 ? (yieldTotal / totalRevenue) * 100 : 0,
      indexPercentage: totalRevenue > 0 ? (indexTotal / totalRevenue) * 100 : 0,
    }
  }, [yieldMetrics, indexMetrics])

  const isLoading = loadingYield || loadingIndex

  // Early return with loading skeleton
  if (isLoading && !yieldMetrics?.totalRevenueUSD && !indexMetrics?.totalRevenue) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-[120px]" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
        </div>
        <Skeleton className="h-[250px]" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards - Reduced to 4 key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
        <RevenueMetricsCard
          title="Total Revenue"
          value={`$${formatCurrency(combinedMetrics.totalRevenue, 2)}`}
          subtitle="All protocols combined"
          icon={<DollarSign className="h-4 w-4" />}
          loading={false}
        />

        <RevenueMetricsCard
          title="Total TVL"
          value={`$${formatCurrency(combinedMetrics.totalTVL, 0)}`}
          subtitle={`Y: $${formatCurrency((yieldMetrics?.yieldTVL || 0) / 1000000, 1)}M | I: $${formatCurrency((indexMetrics?.totalTVL || 0) / 1000000, 1)}M`}
          icon={<TrendingUp className="h-4 w-4" />}
          loading={false}
        />

        <RevenueMetricsCard
          title="RSR Staked"
          value={`$${formatCurrency(yieldMetrics?.rsrStakedUSD || 0, 0)}`}
          subtitle="In Yield DTFs"
          icon={<Users className="h-4 w-4" />}
          loading={false}
        />

        <RevenueMetricsCard
          title="Total RSR Burned"
          value={formatCurrency(indexMetrics?.actualRsrBurned || 0, 0)}
          subtitle="All-time cumulative"
          icon={<Activity className="h-4 w-4" />}
          loading={false}
        />
      </div>

      {/* Protocol Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {/* Yield DTF Card */}
        <ProtocolCard
          title="Yield DTF Protocol"
          icon={<Activity className="h-5 w-5" />}
          iconColor="text-blue-500"
          badge="Yield DTF"
          badgeColor="bg-blue-500/10 text-blue-500 border border-blue-500/20"
          totalRevenue={yieldMetrics?.totalRevenueUSD || 0}
          breakdownItems={[
            {
              icon: <Wallet className="h-4 w-4" />,
              iconColor: "text-blue-500",
              label: "DTF Holders",
              value: yieldMetrics?.holdersRevenueUSD || 0,
              percentage: yieldMetrics?.holdersPercentage
            },
            {
              icon: <Shield className="h-4 w-4" />,
              iconColor: "text-green-500",
              label: "RSR Stakers",
              value: yieldMetrics?.stakersRevenueUSD || 0,
              subValue: `${formatCurrency(yieldMetrics?.stakersRevenueRSR || 0, 0)} RSR`
            }
          ]}
          stats={[
            {
              label: "Active Chains",
              value: "3"
            },
            {
              label: "Total TVL",
              value: `$${formatCurrency((yieldMetrics?.yieldTVL || 0) / 1000000, 1)}M`
            }
          ]}
          isLoading={false}
        />

        {/* Index DTF Card */}
        <ProtocolCard
          title="Index DTF Protocol"
          icon={<Sparkles className="h-5 w-5" />}
          iconColor="text-purple-500"
          badge="Index DTF"
          badgeColor="bg-purple-500/10 text-purple-500 border border-purple-500/20"
          totalRevenue={indexMetrics?.totalRevenue || 0}
          breakdownItems={[
            {
              icon: <Users className="h-4 w-4" />,
              iconColor: "text-indigo-500",
              label: "Governance",
              value: indexMetrics?.governanceRevenue || 0,
              percentage: indexMetrics?.governancePercentage
            },
            {
              icon: <Building className="h-4 w-4" />,
              iconColor: "text-amber-500",
              label: "Deployer",
              value: indexMetrics?.deployerRevenue || 0,
              percentage: indexMetrics?.deployerPercentage
            },
            ...((indexMetrics?.externalRevenue || 0) > 0 ? [{
              icon: <Globe className="h-4 w-4" />,
              iconColor: "text-green-500",
              label: "External",
              value: indexMetrics?.externalRevenue || 0,
              percentage: indexMetrics?.externalPercentage
            }] : [])
          ]}
          stats={[
            {
              label: "Total TVL",
              value: `$${formatCurrency((indexMetrics?.totalTVL || 0) / 1000000, 1)}M`
            },
            {
              label: "Active DTFs",
              value: indexMetrics?.dtfCount || 0
            }
          ]}
          isLoading={false}
        />
      </div>

      {/* Protocol Comparison */}
      <ProtocolComparison
        yieldRevenue={combinedMetrics.yieldRevenue}
        indexRevenue={combinedMetrics.indexRevenue}
        yieldPercentage={combinedMetrics.yieldPercentage}
        indexPercentage={combinedMetrics.indexPercentage}
        rsrPrice={rsrPrice}
        isLoading={false}
      />
    </div>
  )
}

export default CombinedRevenueDashboardV2