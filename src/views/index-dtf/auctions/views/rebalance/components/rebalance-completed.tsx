import { Button } from '@/components/ui/button'
import Help from '@/components/ui/help'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { formatCurrency, formatPercentage } from '@/utils'
import { useAtomValue } from 'jotai'
import {
  AlignVerticalSpaceAround,
  ArrowLeft,
  ArrowLeftRight,
  ChartCandlestick,
  Check,
  Scale,
} from 'lucide-react'
import { ReactNode, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { isCompletedAtom } from '../../../atoms'
import { useRebalanceCompletedMetrics } from '../hooks/use-rebalance-completed-metrics'

const MIN_ACCURACY = 99.7

const IncompleteProgressBar = ({ accuracy }: { accuracy?: number }) => {
  return (
    <div className="flex items-center gap-0.5">
      {/* Accuracy bar */}
      <div
        className="bg-foreground h-3"
        style={{
          width: `${accuracy !== undefined ? accuracy : 100}%`,
        }}
      />
      {/* Incomplete bar */}
      <div
        style={{
          width: `${accuracy !== undefined ? 100 - accuracy : 0}%`,
        }}
      >
        <div
          className={cn(
            'flex items-center justify-center w-full h-3 border-[#D05A67]',
            accuracy === undefined || accuracy === 100
              ? 'border-l-none border-r-none'
              : 'border-l-2 border-r-2'
          )}
        >
          <div className="w-full bg-[#D05A67] h-0.5" />
        </div>
      </div>
    </div>
  )
}

const RebalanceCompleted = () => {
  const metrics = useRebalanceCompletedMetrics()
  const isCompleted = useAtomValue(isCompletedAtom)

  const hasMinAccuracy = useMemo(() => {
    if (metrics?.rebalanceAccuracy === undefined) return true
    return metrics.rebalanceAccuracy >= MIN_ACCURACY
  }, [metrics?.rebalanceAccuracy])

  const title = useMemo(() => {
    const msg = 'Rebalance'
    if (!metrics?.timestamp) {
      return msg
    }

    const date = new Date(metrics?.timestamp * 1000)
    return `${msg} - ${date.toLocaleString('default', {
      month: 'long',
      year: 'numeric',
    })}`
  }, [metrics?.timestamp])

  return (
    <div className="bg-secondary rounded-3xl min-w-[350px] sm:min-w-[420px]">
      {/* Blue header section with gradient - stays in background */}
      <div className="h-56 bg-gradient-to-b from-primary to-primary/70 rounded-3xl relative w-full">
        {/* Back button and title */}
        <div className="absolute top-0 left-0 right-0 py-6 px-7 z-20">
          <div className="flex items-center gap-4 text-background">
            <Link to={`../`}>
              <Button
                variant="ghost"
                size="icon-rounded"
                className="bg-background text-foreground hover:bg-background/90"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-base text-white font-semibold underline">
              {title}
            </h1>
          </div>
        </div>
      </div>

      {/* Metrics section - overlaps with higher z-index */}
      <div className="-mt-36 px-1 rounded-b-3xl w-full">
        <div className="bg-background backdrop-blur-sm rounded-b-3xl">
          {/* Success card */}
          <div>
            <div className="flex flex-col justify-between p-6 min-h-[210px]">
              <div className="flex items-center justify-center rounded-full p-2 w-max bg-primary">
                <Check className="h-4 w-4 text-white" strokeWidth={1.5} />
              </div>

              <div className="flex flex-col gap-5">
                {/* Success message */}
                <div className="flex flex-col gap-1">
                  <div className="text-base font-light text-muted-foreground">
                    Rebalance progress
                  </div>
                  <h2 className="text-2xl text-[26px] font-light text-primary">
                    Rebalance Finished
                  </h2>
                </div>

                {/* Progress bar */}
                {hasMinAccuracy ? (
                  <div className="w-full bg-primary h-3" />
                ) : (
                  <IncompleteProgressBar
                    accuracy={metrics?.rebalanceAccuracy}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="mt-2 border-t border-secondary">
            <div className="grid grid-cols-2">
              {/* Total value traded */}
              <div className="bg-background border-r border-secondary">
                <MetricCard
                  icon={
                    <ArrowLeftRight className="h-5 w-5" strokeWidth={1.2} />
                  }
                  label="Total value traded"
                  value={
                    metrics?.totalRebalancedUsd !== undefined
                      ? `$${formatCurrency(metrics?.totalRebalancedUsd)}`
                      : undefined
                  }
                />
              </div>

              {/* Total price impact */}
              <div className="bg-background border-secondary">
                <MetricCard
                  icon={
                    <AlignVerticalSpaceAround
                      className="h-5 w-5"
                      strokeWidth={1.2}
                    />
                  }
                  label="Total price impact"
                  tooltip={
                    !isCompleted
                      ? 'Available after rebalance completion'
                      : undefined
                  }
                  value={
                    metrics?.priceImpact !== undefined ? (
                      <div className="flex items-center gap-1">
                        <span
                          className={cn(
                            metrics?.priceImpact < 0 && 'text-green-500',
                            metrics?.priceImpact > 0 && 'text-red-500'
                          )}
                        >
                          {`${metrics.priceImpact > 0 ? '-' : metrics.priceImpact < 0 ? '+' : ''}${formatPercentage(Math.abs(metrics.priceImpact))}`}
                        </span>
                        <span className="text-muted-foreground">
                          {metrics.priceImpact !== 0
                            ? ` ($${formatCurrency(
                                metrics?.totalPriceImpactUsd
                              )})`
                            : ''}
                        </span>
                      </div>
                    ) : undefined
                  }
                />
              </div>

              {/* Rebalance accuracy */}
              <div className="bg-background border-r border-t border-secondary rounded-bl-3xl">
                <MetricCard
                  icon={<Scale className="h-5 w-5" strokeWidth={1.2} />}
                  label="Rebalance accuracy"
                  tooltip="A measure of how closely the new basket rebalanced compared to the proposed basket"
                  value={
                    metrics?.rebalanceAccuracy !== undefined
                      ? `${formatPercentage(metrics?.rebalanceAccuracy)}`
                      : undefined
                  }
                />
              </div>

              {/* Tracking error  */}
              <div className="bg-background border-t border-secondary rounded-br-3xl">
                <MetricCard
                  icon={
                    <ChartCandlestick className="h-5 w-5" strokeWidth={1.2} />
                  }
                  label="NAV Change"
                  tooltip={
                    !isCompleted
                      ? 'Available after rebalance completion'
                      : 'How much the value of the DTF basket changed due to the latest rebalance'
                  }
                  value={
                    metrics?.marketCapRebalanceImpact !== undefined ? (
                      <span
                        className={cn(
                          metrics.marketCapRebalanceImpact < 0 &&
                            'text-red-500',
                          metrics.marketCapRebalanceImpact > 0 &&
                            'text-green-500'
                        )}
                      >
                        {`${metrics.marketCapRebalanceImpact > 0 ? '+' : ''}${formatPercentage(metrics.marketCapRebalanceImpact)}`}
                      </span>
                    ) : undefined
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface MetricCardProps {
  icon: ReactNode
  label: string
  value?: ReactNode
  tooltip?: string
}

const MetricCard = ({ icon, label, value, tooltip }: MetricCardProps) => {
  return (
    <div className="p-4">
      <div className="flex flex-col gap-4">
        {icon}
        <div className="flex flex-col flex-1">
          <div className="flex items-center gap-1 mb-1 text-sm text-muted-foreground">
            {label}
            {tooltip && <Help content={tooltip} />}
          </div>
          {value ? (
            <div className="text-lg font-semibold">{value}</div>
          ) : (
            <Skeleton className="h-5 w-24 mt-1" />
          )}
        </div>
      </div>
    </div>
  )
}

export default RebalanceCompleted
