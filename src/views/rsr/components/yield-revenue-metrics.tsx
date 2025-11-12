import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { DecimalDisplay } from '@/components/decimal-display'
import { formatCurrency } from '@/utils'
import { DollarSign, TrendingUp, Coins, Shield } from 'lucide-react'
import { ReactNode } from 'react'

interface MetricCardProps {
  title: string
  value: string | ReactNode
  subtitle?: string | ReactNode
  icon: ReactNode
  loading?: boolean
}

const MetricCard = ({ title, value, subtitle, icon, loading }: MetricCardProps) => {
  return (
    <Card className="border-2 border-secondary">
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">{title}</span>
          <div className="p-1.5 rounded-full border border-foreground">
            {icon}
          </div>
        </div>
        {loading ? (
          <Skeleton className="h-8 w-24 mb-1" />
        ) : (
          <>
            <div className="text-2xl font-semibold">{value}</div>
            {subtitle && (
              <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>
            )}
          </>
        )}
      </div>
    </Card>
  )
}

interface YieldRevenueMetricsProps {
  metrics: {
    totalRevenueUSD: number
    totalTVL: number
    activeRTokens: number
    holdersPercentage: number
    stakersPercentage: number
    rsrStaked: number
    rsrStakedUSD: number
  }
  monthlyGrowth: number
  rsrPrice: number
  isLoading: boolean
}

const YieldRevenueMetrics = ({
  metrics,
  monthlyGrowth,
  rsrPrice,
  isLoading
}: YieldRevenueMetricsProps) => {
  // Format monthly growth - handle edge cases
  const formatGrowth = (growth: number) => {
    if (!isFinite(growth) || isNaN(growth)) return '—'
    if (growth > 1000) return '>1000%'
    return `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
      <MetricCard
        title="Total Revenue"
        value={
          <div className="flex items-baseline gap-1">
            <span>$</span>
            <DecimalDisplay
              value={metrics.totalRevenueUSD}
              decimals={0}
              compact={true}
            />
          </div>
        }
        subtitle={`Monthly: ${formatGrowth(monthlyGrowth)}`}
        icon={<DollarSign size={16} />}
        loading={isLoading}
      />

      <MetricCard
        title="Total TVL"
        value={
          <div className="flex items-baseline gap-1">
            <span>$</span>
            <DecimalDisplay
              value={metrics.totalTVL}
              decimals={1}
              compact={true}
            />
          </div>
        }
        subtitle="RTokens + Staked RSR"
        icon={<TrendingUp size={16} />}
        loading={isLoading}
      />

      <MetricCard
        title="Active Yield DTFs"
        value={metrics.activeRTokens.toString()}
        subtitle="Generating revenue"
        icon={<Coins size={16} />}
        loading={isLoading}
      />

      <MetricCard
        title="RSR Staked"
        value={
          <DecimalDisplay
            value={metrics.rsrStaked}
            decimals={0}
            compact={true}
            currency={false}
          />
        }
        subtitle={
          <div className="flex items-baseline gap-1">
            <span>$</span>
            <DecimalDisplay
              value={metrics.rsrStakedUSD}
              decimals={0}
              compact={true}
            />
          </div>
        }
        icon={<Shield size={16} />}
        loading={isLoading}
      />
    </div>
  )
}

export default YieldRevenueMetrics