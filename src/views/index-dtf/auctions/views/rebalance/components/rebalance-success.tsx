import { Button } from '@/components/ui/button'
import Help from '@/components/ui/help'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency, formatPercentage } from '@/utils'
import { useAtomValue } from 'jotai'
import {
  AlignVerticalSpaceAround,
  ArrowLeft,
  ArrowLeftRight,
  Check,
  Scale,
  Target,
} from 'lucide-react'
import { ReactNode, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { apiRebalanceMetricsAtom } from '../../../atoms'

const RebalanceSuccess = () => {
  const apiRebalanceMetrics = useAtomValue(apiRebalanceMetricsAtom)

  const title = useMemo(() => {
    const msg = 'Rebalance'
    if (!apiRebalanceMetrics?.timestamp) {
      return msg
    }

    const date = new Date(apiRebalanceMetrics?.timestamp * 1000)
    return `${msg} - ${date.toLocaleString('default', {
      month: 'long',
      year: 'numeric',
    })}`
  }, [apiRebalanceMetrics?.timestamp])

  return (
    <div className="bg-secondary rounded-3xl min-w-[350px] sm:min-w-[420px]">
      {/* Blue header section with gradient - stays in background */}
      <div className="h-56 bg-gradient-to-b from-primary to-primary/70 rounded-3xl relative w-full">
        {/* Back button and title */}
        <div className="absolute top-0 left-0 right-0 py-6 px-7 z-20">
          <div className="flex items-center gap-4 text-white">
            <Link to={`../`}>
              <Button
                variant="ghost"
                size="icon-rounded"
                className="bg-white text-black hover:bg-white/90"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-base font-semibold underline">{title}</h1>
          </div>
        </div>
      </div>

      {/* Metrics section - overlaps with higher z-index */}
      <div className="-mt-36 px-1 rounded-b-3xl w-full">
        <div className="bg-white backdrop-blur-sm rounded-b-3xl">
          {/* Success card */}
          <div>
            <div className="flex flex-col justify-between p-6 min-h-[210px]">
              <div className="flex items-center justify-center bg-primary rounded-full p-2 w-max">
                <Check className="h-4 w-4 text-white" strokeWidth={1.5} />
              </div>

              <div className="flex flex-col gap-5">
                {/* Success message */}
                <div className="flex flex-col gap-1">
                  <p className="text-base font-light text-muted-foreground">
                    Rebalance progress
                  </p>
                  <h2 className="text-2xl text-[26px] font-light text-primary">
                    Rebalanced Successfully
                  </h2>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-primary h-3 rounded-full" />
              </div>
            </div>
          </div>

          <div className="mt-2 border-t border-secondary">
            <div className="grid grid-cols-2">
              {/* Rebalance accuracy - top left */}
              <div className="bg-white">
                <MetricCard
                  icon={<Scale className="h-5 w-5" strokeWidth={1.2} />}
                  label="Rebalance accuracy"
                  tooltip="Rebalance accuracy is the percentage of the total value traded that was rebalanced."
                  value={
                    apiRebalanceMetrics?.rebalanceAccuracy
                      ? `${formatPercentage(
                          apiRebalanceMetrics?.rebalanceAccuracy
                        )}`
                      : undefined
                  }
                />
              </div>

              {/* Total price impact - top right */}
              <div className="bg-white border-l border-secondary">
                <MetricCard
                  icon={
                    <AlignVerticalSpaceAround
                      className="h-5 w-5"
                      strokeWidth={1.2}
                    />
                  }
                  label="Total price impact"
                  value={
                    <div className="flex items-center gap-1">
                      <span className="text-red-500">
                        {apiRebalanceMetrics?.priceImpact
                          ? `${formatPercentage(apiRebalanceMetrics?.priceImpact)}`
                          : undefined}
                      </span>
                      <span className="text-muted-foreground">
                        {apiRebalanceMetrics?.totalPriceImpactUsd &&
                          ` ($${formatCurrency(
                            apiRebalanceMetrics?.totalPriceImpactUsd
                          )})`}
                      </span>
                    </div>
                  }
                />
              </div>

              {/* Tracking error - bottom left */}
              <div className="bg-white border-t border-secondary rounded-bl-3xl">
                <MetricCard
                  icon={<Target className="h-5 w-5" strokeWidth={1.2} />}
                  label="Tracking error"
                  tooltip="Tracking error is the difference between the actual price and the expected price."
                  value={
                    apiRebalanceMetrics?.deviationFromTarget
                      ? `${formatPercentage(
                          apiRebalanceMetrics?.deviationFromTarget
                        )}`
                      : undefined
                  }
                />
              </div>

              {/* Total value traded - bottom right */}
              <div className="bg-white border-t border-l border-secondary rounded-br-3xl">
                <MetricCard
                  icon={
                    <ArrowLeftRight className="h-5 w-5" strokeWidth={1.2} />
                  }
                  label="Total value traded"
                  value={
                    apiRebalanceMetrics?.totalRebalancedUsd
                      ? `$${formatCurrency(
                          apiRebalanceMetrics?.totalRebalancedUsd
                        )}K`
                      : undefined
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
            <p className="text-lg font-semibold">{value}</p>
          ) : (
            <Skeleton className="h-5 w-24 mt-1" />
          )}
        </div>
      </div>
    </div>
  )
}

export default RebalanceSuccess
