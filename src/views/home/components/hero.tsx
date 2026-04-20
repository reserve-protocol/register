import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils";
import { useEffect, useState } from "react";

const MetricBox = ({ label, value }: { label: string; value: number | undefined }) => (
  <div className="flex flex-col flex-shrink-0 gap-1 border h-[74px] w-36 lg:h-auto lg:w-auto justify-center items-center lg:justify-normal lg:items-start lg:border-none rounded-lg">
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
    <div className="flex items-center gap-2 lg:gap-6 mx-2 lg:mx-0 overflow-hidden">
      <MetricBox label="TVL" value={undefined} />
      <MetricBox label="Partner Revenue" value={123000000} />
      <MetricBox label="RSR Accrual" value={123000000} />
      <MetricBox label="Yield Distributed" value={123000000} />
      <MetricBox label="Mint Volume" value={123000000} />
    </div>
  )
}

const Header = ({ className }: { className?: string }) => (
  <h1 className={cn("text-4xl text-primary max-w-[600px]  dark:text-foreground", className)}>Reserve lets you buy entire portfolios as a single token</h1>
)

const SubHeader = ({ className }: { className?: string }) => (
  <h4 className={cn("text-xl dark:text-legend", className)}>
    These tokenized portfolios are called DTFs: <br /><strong className="dark:text-foreground">Decentralized Token Folios</strong>
  </h4>
)

const MetricsContainer = () => {
  return (
    <div className="flex gap-6 mr-6">
      <SubHeader className="hidden lg:block mr-auto ml-6" />
      <Metrics />
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

const SplashImage = () => {
  const isDark = useIsDarkMode()
  const splash1x = isDark
    ? '/imgs/home-splash-dark@1x.webp'
    : '/imgs/home-splash@1x.webp'
  const splash2x = isDark
    ? '/imgs/home-splash-dark.webp'
    : '/imgs/home-splash.webp'

  return (
    <img
      className="lg:my-6 w-full h-auto px-2 lg:px:0"
      src={splash1x}
      srcSet={`${splash1x} 1x, ${splash2x} 2x`}
      width={2800}
      height={950}
      alt="Decentralized Token Folios illustration"
      fetchPriority="high"
      decoding="async"
    />
  )
}

const MobileHeading = () => (
  <div className="flex flex-col items-center text-center gap-4 lg:hidden mt-5 mb-6">
    <Header className="text-2xl sm:text-4xl font-semibold mx-6" />
    <SubHeader className="text-base" />
  </div>
)

const Hero = () => (
  <div className="lg:mt-10 mb-8 lg:mb-12 lg:pb-10 lg:border-b">
    <Header className="ml-6 hidden lg:block " />
    <SplashImage />
    <MobileHeading />
    <MetricsContainer />
  </div>
)

export default Hero