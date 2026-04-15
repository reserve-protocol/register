import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/utils";

const MetricBox = ({ label, value }: { label: string; value: number | undefined }) => (
  <div className="flex flex-col gap-1">
    <span className="whitespace-nowrap">
      {label}
    </span>
    {value ? (
      <span className="flex items-center font-semibold text-primary">
        <span className="opacity-70">$</span>
        {formatCurrency(value, 0, {
          notation: 'compact',
          compactDisplay: 'short',
        })}
      </span>
    ) : (
      <Skeleton className="h-5 w-12 bg-primary opacity-70 inline-block" />
    )}

  </div>
)

const Metrics = () => {

  return (
    <div className="flex gap-6">
      <h4 className="text-xl max-w-md mr-auto">
        Index and yield products that package diversified onchain exposure into a single token.
      </h4>
      <MetricBox label="TVL" value={undefined} />
      <MetricBox label="Partner Revenue" value={123000000} />
      <MetricBox label="RSR Accrual" value={123000000} />
      <MetricBox label="Yield Distributed" value={123000000} />
      <MetricBox label="Mint Volume" value={123000000} />
    </div>
  )
}

const Hero = () => (
  <div className="mt-10 mb-12 px-4 sm:px-6">
    <h1 className="text-4xl text-primary max-w-[600px]">Reserve lets you buy entire portfolios as a single token</h1>
    <img className="my-6 w-full h-[305px]" src="/imgs/home-splash.png" alt="reserve-home-splash" />
    <Metrics />
  </div>
)

export default Hero