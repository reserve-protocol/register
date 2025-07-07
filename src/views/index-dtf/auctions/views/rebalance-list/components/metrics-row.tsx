import { Skeleton } from '@/components/ui/skeleton'
import { Activity, TrendingUp, BarChart3, Target } from 'lucide-react'
import { useRebalanceMetrics } from '../hooks/use-rebalance-metrics'

export const MetricsRow = ({ proposalId }: { proposalId: string }) => {
  const { metrics } = useRebalanceMetrics(proposalId)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      <div className="flex flex-col justify-center gap-3 p-4 md:p-6 border-r border-secondary">
        <BarChart3 className="h-4 w-4 shrink-0" />
        <div className="min-w-0">
          <p className="text-xs text-legend mb-1">Rebalance accuracy</p>
          {!metrics ? (
            <Skeleton className="h-5 w-20" />
          ) : (
            <p className="text-xs md:text-sm font-medium">
              {metrics.rebalanceAccuracy}%
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col justify-center gap-3 p-4 md:p-6 border-r border-secondary">
        <Activity className="h-4 w-4 shrink-0" />
        <div className="min-w-0">
          <p className="text-xs text-legend mb-1">Auctions run</p>
          {!metrics ? (
            <Skeleton className="h-5 w-20" />
          ) : (
            <p className="text-xs md:text-sm font-medium truncate">
              ${metrics?.auctionsRun}.34k Traded
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col justify-center gap-3 p-4 md:p-6">
        <TrendingUp className="h-4 w-4 shrink-0" />
        <div className="min-w-0">
          <p className="text-xs text-legend mb-1">Total price impact</p>
          {!metrics ? (
            <Skeleton className="h-5 w-20" />
          ) : (
            <p className="text-xs md:text-sm font-medium text-destructive truncate">
              -{metrics?.priceImpact}% ($
              {(metrics?.priceImpact * 5.5).toFixed(2)}k)
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
