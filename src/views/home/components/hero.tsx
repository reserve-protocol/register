import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/utils";
import { useEffect, useState } from "react";

const MetricBox = ({ label, value }: { label: string; value: number | undefined }) => (
  <div className="flex flex-col gap-1">
    <span className="whitespace-nowrap dark:text-legend">
      {label}
    </span>
    {value ? (
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

const Metrics = () => {

  return (
    <div className="flex gap-6">
      <h4 className="text-xl max-w-md mr-auto ml-6 dark:text-legend">
        These tokenized portfolios are called DTFs: <strong className="dark:text-foreground">Decentralized Token Folios</strong>
      </h4>
      <MetricBox label="TVL" value={undefined} />
      <MetricBox label="Partner Revenue" value={123000000} />
      <MetricBox label="RSR Accrual" value={123000000} />
      <MetricBox label="Yield Distributed" value={123000000} />
      <MetricBox label="Mint Volume" value={123000000} />
    </div>
  )
}

const useIsDarkMode = () => {
  const [isDark, setIsDark] = useState(
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('dark')
  )

  useEffect(() => {
    const update = () =>
      setIsDark(document.documentElement.classList.contains('dark'))
    update()
    const observer = new MutationObserver(update)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
    return () => observer.disconnect()
  }, [])

  return isDark
}

const Hero = () => {
  const isDark = useIsDarkMode()
  const splash1x = isDark
    ? '/imgs/home-splash-dark@1x.webp'
    : '/imgs/home-splash@1x.webp'
  const splash2x = isDark
    ? '/imgs/home-splash-dark.webp'
    : '/imgs/home-splash.webp'

  return (
    <div className="mt-10 mb-12 pb-10 px-4 sm:px-6 border-b">
      <h1 className="text-4xl text-primary max-w-[600px] ml-6 dark:text-foreground">Reserve lets you buy entire portfolios as a single token</h1>
      <img
        className="my-6 w-full h-auto"
        src={splash1x}
        srcSet={`${splash1x} 1x, ${splash2x} 2x`}
        width={2800}
        height={950}
        alt="Decentralized Token Folios illustration"
        fetchPriority="high"
        decoding="async"
      />
      <Metrics />
    </div>
  )
}

export default Hero