import DecimalDisplay from '@/components/decimal-display'
import { Skeleton } from '@/components/ui/skeleton'
import { formatPercentage } from '@/utils'
import { Plural, Trans } from '@lingui/react/macro'
import { Activity, TrendingUp, BarChart3, Target } from 'lucide-react'
import { useRebalanceMetrics } from '../hooks/use-rebalance-metrics'
import { cn } from '@/lib/utils'

export const MetricsRow = ({ proposalId }: { proposalId: string }) => {
  const { metrics } = useRebalanceMetrics(proposalId)

  return (
    <div className="grid grid-cols-3">
      <div className="flex flex-col justify-center gap-3 p-4 md:p-6 border-r border-secondary">
        <BarChart3 className="h-4 w-4 shrink-0" />
        <div className="min-w-0">
          <p className="text-xs text-legend mb-1">
            <Trans>Rebalance accuracy</Trans>
          </p>
          {!metrics ? (
            <Skeleton className="h-5 w-20" />
          ) : (
            <p className="text-xs md:text-sm">
              {formatPercentage(metrics.rebalanceAccuracy)}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col justify-bottom gap-3 p-4 md:p-6 border-r border-secondary">
        <Activity className="h-4 w-4 shrink-0" />
        <div className="min-w-0">
          <p className="text-xs text-legend mb-1">
            {metrics ? (
              <Plural
                value={metrics.auctionsRun}
                one="# Auction run"
                other="# Auctions run"
              />
            ) : (
              <Trans>Auctions run</Trans>
            )}
          </p>
          {!metrics ? (
            <Skeleton className="h-5 w-20" />
          ) : (
            <p className="text-xs md:text-sm truncate">
              <Trans>
                $
                <DecimalDisplay
                  value={metrics.totalRebalancedUsd}
                  decimals={0}
                />{' '}
                Traded
              </Trans>
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col justify-center gap-3 p-4 md:p-6">
        <TrendingUp className="h-4 w-4 shrink-0" />
        <div className="min-w-0">
          <p className="text-xs text-legend mb-1">
            <Trans>Total price impact</Trans>
          </p>
          {!metrics ? (
            <Skeleton className="h-5 w-20" />
          ) : (
            <p
              className={cn(
                'text-xs md:text-sm truncate',
                metrics?.priceImpact < 0 && 'text-green-500',
                metrics?.priceImpact > 0 && 'text-red-500'
              )}
            >
              {metrics.priceImpact > 0
                ? '-'
                : metrics.priceImpact < 0
                  ? '+'
                  : ''}
              {formatPercentage(Math.abs(metrics.priceImpact))}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
