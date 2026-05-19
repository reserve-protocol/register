import { cn } from "@/lib/utils";
import ProtocolMetrics from "./protocol-metrics";
import useIsDarkMode from "@/hooks/use-is-dark-mode";
import DTFExplainerButton from "./dtf-explainer-button";
import { useEffect } from "react";

const SPLASH_LIGHT_1X = '/imgs/home-splash@1x.webp'
const SPLASH_LIGHT_2X = '/imgs/home-splash.webp'
const SPLASH_DARK_1X = '/imgs/home-splash-dark@1x.webp'
const SPLASH_DARK_2X = '/imgs/home-splash-dark.webp'

const Header = ({ className }: { className?: string }) => (
  <h1 className={cn("text-5xl leading-[1.10] text-primary dark:text-foreground", className)}>Reserve lets you buy entire portfolios<br /> as a single token</h1>
)

const SubHeader = ({ className }: { className?: string }) => (
  <h4 className={cn("text-xl dark:text-legend", className)}>
    These tokenized portfolios are called DTFs: <br />
    <strong className="dark:text-foreground">Decentralized Token Folios</strong>
  </h4>
)

const MetricsContainer = () => {
  return (
    <div
      className={cn(
        "flex gap-1 min-w-0 overflow-hidden",
        "lg:overflow-visible",
        "lg:rounded-full lg:px-10 lg:py-6",
        "lg:border lg:border-[#f9eddd] dark:lg:border-white/10",
        "lg:backdrop-blur-[7px]"
      )}
    >
      <ProtocolMetrics />
    </div>
  )
}

const SplashImage = () => {
  const isDark = useIsDarkMode()
  const splash1x = isDark ? SPLASH_DARK_1X : SPLASH_LIGHT_1X
  const splash2x = isDark ? SPLASH_DARK_2X : SPLASH_LIGHT_2X

  // Warm the opposite-theme variant so toggling dark mode is an instant swap.
  // Deferred so the preload doesn't count toward window.onload.
  useEffect(() => {
    const other1x = isDark ? SPLASH_LIGHT_1X : SPLASH_DARK_1X
    const other2x = isDark ? SPLASH_LIGHT_2X : SPLASH_DARK_2X
    const id = setTimeout(() => {
      new Image().src = other1x
      new Image().src = other2x
    }, 1500)
    return () => clearTimeout(id)
  }, [isDark])

  return (
    <div className="relative">
      <img
        className="lg:mb-6 lg:mt-10 w-full h-auto min-h-48 px-2 2xl:px-0 object-cover"
        src={splash1x}
        srcSet={`${splash1x} 1x, ${splash2x} 2x`}
        width={2800}
        height={950}
        alt="Decentralized Token Folios illustration"
        fetchPriority="high"
        decoding="async"
      />
      <DTFExplainerButton className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 dark:border-legend dark:border-[1px] dark:hover:text-primary dark:hover:border-primary dark:text-legend dark:bg-muted text-primary bg-[#DBE5F2] rounded-full border-background border-4 py-5" />
    </div>
  )
}

const MobileHeading = () => (
  <div className="flex flex-col items-center text-center gap-4 lg:hidden mt-5 mb-6">
    <Header className="text-2xl sm:text-4xl font-semibold mx-6" />
    <SubHeader className="text-base" />
  </div>
)

const DesktopSubHeader = () => (
  <SubHeader className="hidden lg:block text-center mx-auto mt-24" />
)

const Hero = () => (
  <div className="lg:mt-10 mb-12">
    <div className="hidden lg:block mx-6 text-center">
      <Header className="mx-auto" />
    </div>
    <div className="relative">
      <SplashImage />
      <MobileHeading />
      <div className="lg:absolute lg:inset-x-0 lg:bottom-0 lg:translate-y-1/2 lg:flex lg:justify-center lg:px-10">
        <MetricsContainer />
      </div>
    </div>
    <DesktopSubHeader />
  </div>
)

export default Hero