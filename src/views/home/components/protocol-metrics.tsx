import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/utils";
import { useHomeMetrics } from "../hooks/use-home-metrics";
import { useMarquee } from "../hooks/use-marquee";

const MetricBox = ({
  label,
  value,
  ariaHidden,
}: {
  label: string
  value: number | undefined
  ariaHidden?: boolean
}) => (
  <div
    aria-hidden={ariaHidden || undefined}
    className="flex flex-col flex-shrink-0 gap-1 border h-[74px] w-36 lg:h-auto lg:w-auto justify-center items-center lg:justify-normal lg:items-start lg:border-none rounded-lg"
  >
    <span className="whitespace-nowrap dark:text-legend">
      {label}
    </span>
    {value !== undefined ? (
      <span className="flex items-center font-semibold text-primary dark:text-foreground">
        <span className="opacity-70">$</span>
        {formatCurrency(value, 0, {
          notation: 'compact',
          compactDisplay: 'short',
        })}
      </span>
    ) : (
      <Skeleton className="h-5 w-12 bg-primary opacity-70 dark:bg-primary-foreground inline-block" />
    )}

  </div>
)

const ProtocolMetrics = () => {
  const { data } = useHomeMetrics()
  const metrics: { label: string; value: number | undefined }[] = [
    { label: 'TVL', value: data?.tvl },
    { label: 'Partner Revenue', value: data?.partnerRevenue },
    { label: 'RSR Accrual', value: data?.rsrAccrual },
    { label: 'Yield Distributed', value: data?.yieldDistributed },
    { label: 'Mint Volume', value: data?.mintVolume },
  ]
  const { ref, disabled } = useMarquee<HTMLDivElement>(metrics.length)

  const renderBoxes = (copy: number) =>
    metrics.map((m) => (
      <MetricBox
        key={`${copy}-${m.label}`}
        label={m.label}
        value={m.value}
        ariaHidden={copy > 0}
      />
    ))

  return (
    <div className="w-full min-w-0 lg:w-auto overflow-hidden lg:overflow-visible pl-2 lg:pl-0">
      <div
        ref={ref}
        className="flex items-center gap-2 lg:gap-6 will-change-transform touch-pan-y lg:touch-auto select-none"
      >
        {renderBoxes(0)}
        {!disabled && renderBoxes(1)}
        {!disabled && renderBoxes(2)}
      </div>
    </div>
  )
}

export default ProtocolMetrics
