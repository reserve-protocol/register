import { Skeleton } from '@/components/ui/skeleton'
import { Activity, TrendingUp, BarChart3, Target } from 'lucide-react'
import { useRebalanceMetrics } from '../hooks/use-rebalance-metrics'

export const MetricsRow = ({ proposalId }: { proposalId: string }) => {
  const { loading, metrics } = useRebalanceMetrics(proposalId)

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Auctions run</p>
            <Skeleton className="h-4 md:h-5 w-20 md:w-24 mt-0.5" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Total price impact</p>
            <Skeleton className="h-4 md:h-5 w-24 md:w-32 mt-0.5" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Rebalance accuracy</p>
            <Skeleton className="h-4 md:h-5 w-16 md:w-20 mt-0.5" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Deviation from target</p>
            <Skeleton className="h-4 md:h-5 w-16 md:w-20 mt-0.5" />
          </div>
        </div>
      </div>
    )
  }

  if (!metrics) return null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
      <div className="flex items-center gap-2">
        <Activity className="h-4 w-4 text-muted-foreground shrink-0" />
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">Auctions run</p>
          <p className="text-xs md:text-sm font-medium truncate">${metrics.auctionsRun}.34k Traded</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-muted-foreground shrink-0" />
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">Total price impact</p>
          <p className="text-xs md:text-sm font-medium text-destructive truncate">-{metrics.priceImpact}% (${(metrics.priceImpact * 5.5).toFixed(2)}k)</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-muted-foreground shrink-0" />
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">Rebalance accuracy</p>
          <p className="text-xs md:text-sm font-medium">{metrics.rebalanceAccuracy}%</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Target className="h-4 w-4 text-muted-foreground shrink-0" />
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">Deviation from target</p>
          <p className="text-xs md:text-sm font-medium">-{metrics.deviationFromTarget}%</p>
        </div>
      </div>
    </div>
  )
}