import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { trackClick } from '@/hooks/useTrackPage'
import { ArrowRight, Clapperboard, Play } from 'lucide-react'
import { lazy, Suspense, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatCurrency } from 'utils'
import { DTF_VIDEO, DUNE_DASHBOARD } from 'utils/constants'
import tvlDark from '../assets/tvl-dark.png'
import tvlLight from '../assets/tvl-light.png'
import useAPIProtocolMetrics, {
  Metrics,
} from '../hooks/use-api-protocol-metrics'

// Lazy load the chart component to defer recharts bundle
const HistoricalTVLChart = lazy(() => import('./historical-tvl-chart'))

// SVG skeleton that mimics an upward-trending stacked area chart
const ChartSkeleton = () => (
  <div className="w-full h-full animate-pulse">
    <svg
      viewBox="0 0 100 40"
      preserveAspectRatio="none"
      className="w-full h-full"
    >
      <defs>
        <linearGradient id="skeleton-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--muted))" stopOpacity="0.8" />
          <stop offset="100%" stopColor="hsl(var(--muted))" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      {/* Upward trending area shape - mimics TVL growth */}
      <path
        d="M0,40 L0,35 L5,34 L10,33 L15,32 L20,30 L25,28 L30,26 L35,24 L40,22 L45,20 L50,18 L55,16 L60,14 L65,13 L70,12 L75,11 L80,10 L85,9 L90,8 L95,7 L100,6 L100,40 Z"
        fill="url(#skeleton-gradient)"
      />
    </svg>
  </div>
)

const RoundedImageWithSkeleton = ({
  src,
  alt,
  visibilityClass,
}: {
  src: string
  alt: string
  visibilityClass: string
}) => {
  const [loaded, setLoaded] = useState(false)

  return (
    <>
      {!loaded && (
        <Skeleton className={`${visibilityClass} w-10 h-10 rounded-full`} />
      )}
      <img
        src={src}
        alt={alt}
        className={`${loaded ? visibilityClass + ' block' : 'hidden'} w-10 h-10 rounded-full object-cover`}
        onLoad={() => setLoaded(true)}
      />
    </>
  )
}

// TODO: Improve loading revenue state, currently have a hardcoded if
const Heading = ({
  data,
  isLoading,
}: {
  data?: Metrics
  isLoading: boolean
}) => {
  const revenue =
    isLoading || !data
      ? 0
      : data.rsrStakerAnnualizedRevenue + data.rTokenAnnualizedRevenue + data.indexDTFAnnualizedRevenue
  return (
    <div className="absolute top-3 sm:top-8 left-0 sm:left-0 right-3 text-tvl px-4 sm:px-6 md:px-0 w-auto sm:w-[560px]">
      {/* Light/Dark images with 40x40 rounded skeletons */}
      <div className="relative">
        <RoundedImageWithSkeleton
          src={tvlLight}
          alt="TVL Light"
          visibilityClass="dark:hidden"
        />
        <RoundedImageWithSkeleton
          src={tvlDark}
          alt="TVL Dark"
          visibilityClass="hidden dark:block"
        />
      </div>
      <h2 className="sm:text-xl text-base mt-6 mb-4 font-light leading-none">
        TVL in Reserve
      </h2>
      {isLoading ? (
        <Skeleton className="w-[280px] sm:w-[440px] h-[40px] sm:h-[60px]" />
      ) : (
        <div className="flex items-center ">
          <h3 className="text-4xl sm:text-5xl sm:text-[60px] font-semibold leading-none">
            ${formatCurrency(data?.tvl ?? 0, 0)}
          </h3>
          <Link target="_blank" to={DUNE_DASHBOARD}>
            <Button
              variant="none"
              className="ml-3  w-10 h-10 sm:w-[44px] sm:h-[44px] p-0 bg-tvl/10 text-tvl hover:bg-primary/20"
              size="icon-rounded"
            >
              <ArrowRight className="-rotate-45" size={24} />
            </Button>
          </Link>
        </div>
      )}

      <div className="flex gap-2 mt-5 text-base sm:text-xl leading-none">
        <span className="font-light">Annualized protocol revenue:</span>
        {isLoading || revenue < 1000000 ? (
          <Skeleton className="h-6 w-14" />
        ) : (
          <span className="font-bold">
            $
            {formatCurrency(revenue, 1, {
              notation: 'compact',
              compactDisplay: 'short',
            })}
          </span>
        )}
      </div>
      <Button
        variant="outline-primary"
        className="flex items-center gap-[6px] rounded-[50px] mt-6 p-1 h-8 border border-primary dark:border-tvl/20 hover:bg-primary"
        onClick={() => {
          trackClick('discover', 'video')
          window.open(DTF_VIDEO, '_blank')
        }}
      >
        <span className="ml-2">
          <Clapperboard size={16} />
        </span>
        <span className="text-base dark:text-tvl">What are DTFs?</span>
        <span className="rounded-full w-6 h-6 bg-primary text-primary flex items-center justify-center">
          <Play size={16} className="text-white" fill="#fff" />
        </span>
      </Button>
    </div>
  )
}

const HistoricalTVL = () => {
  const data = useAPIProtocolMetrics()
  return (
    <div className="container px-0 md:px-6 2xl:px-6 h-80 sm:h-[580px]">
      <div className="relative h-full flex flex-col justify-end ">
        <div className="h-[160px] sm:h-[420px]">
          <Suspense fallback={<ChartSkeleton />}>
            <HistoricalTVLChart tvlTimeseries={data.data?.tvlTimeseries} />
          </Suspense>
        </div>
        <Heading {...data} />
      </div>
    </div>
  )
}

export default HistoricalTVL
