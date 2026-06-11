import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import { ChartConfig, ChartContainer } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { isInactiveDTF } from '@/hooks/use-dtf-status'
import { useIsDesktop } from '@/hooks/use-media-query'
import useIndexDTFList, { type IndexDTFItem } from '@/hooks/useIndexDTFList'
import { cn } from '@/lib/utils'
import { formatCurrency, getFolioRoute } from '@/utils'
import { RESERVE_API, ROUTES } from '@/utils/constants'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight } from 'lucide-react'
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import { Link } from 'react-router-dom'
import { Area, AreaChart, Tooltip, XAxis, YAxis } from 'recharts'
import { calculatePercentageChange } from './discover-index-dtf/utils'

const HIGHLIGHTED_LIMIT = 5
const BACKING_LIMIT = 7
const SEVEN_DAYS_SECONDS = 7 * 24 * 60 * 60
const COLLATERAL_GAP = 8
const REFRESH_INTERVAL = 1000 * 60 * 30
const TRANSCRIPT_PREVIEW =
  'A short walkthrough of this portfolio, the assets it tracks, how the basket is weighted, and why investors may use it for broad tokenized market exposure. The explainer will cover the core thesis, recent performance drivers, liquidity considerations, and the role each major component plays inside the DTF.'
const TRANSCRIPT_WORDS = TRANSCRIPT_PREVIEW.split(' ')
const TRANSCRIPT_WORD_DELAY_MS = 280
const TRANSCRIPT_LINE_HEIGHT = 18
const END_FADE_DISTANCE = 160

const chartConfig = {
  performance: {
    label: 'Performance',
    color: 'currentColor',
  },
} satisfies ChartConfig

const getSevenDayPerformance = (performance: IndexDTFItem['performance']) => {
  if (performance.length === 0) return performance

  const lastTimestamp = performance[performance.length - 1].timestamp
  const timestampDivisor = lastTimestamp > 1_000_000_000_000 ? 1000 : 1
  const sevenDayStart = lastTimestamp / timestampDivisor - SEVEN_DAYS_SECONDS

  return performance.filter(
    ({ timestamp }) => timestamp / timestampDivisor >= sevenDayStart
  )
}

const getPaddedValueDomain = ([dataMin, dataMax]: [number, number]): [
  number,
  number,
] => {
  if (!Number.isFinite(dataMin) || !Number.isFinite(dataMax)) {
    return [dataMin, dataMax]
  }

  if (dataMin === dataMax) {
    const padding = Math.max(Math.abs(dataMin) * 0.05, 0.01)
    return [dataMin - padding, dataMax + padding]
  }

  const padding = (dataMax - dataMin) * 0.12
  return [dataMin - padding, dataMax + padding]
}

const getPerformanceDirection = (
  performance: IndexDTFItem['performance']
): 'positive' | 'negative' | 'neutral' => {
  if (performance.length < 2) return 'neutral'

  const firstValue = performance[0].value
  const lastValue = performance[performance.length - 1].value

  if (lastValue > firstValue) return 'positive'
  if (lastValue < firstValue) return 'negative'
  return 'neutral'
}

const useDetailedSevenDayPerformance = (dtf: IndexDTFItem) => {
  return useQuery({
    queryKey: ['highlighted-dtf-7d-performance', dtf.chainId, dtf.address],
    queryFn: async (): Promise<IndexDTFItem['performance']> => {
      const to = Math.floor(Date.now() / 3_600_000) * 3_600
      const from = to - SEVEN_DAYS_SECONDS
      const sp = new URLSearchParams()
      sp.set('chainId', dtf.chainId.toString())
      sp.set('address', dtf.address.toLowerCase())
      sp.set('from', from.toString())
      sp.set('to', to.toString())
      sp.set('interval', '1h')

      const response = await fetch(`${RESERVE_API}historical/dtf?${sp}`)

      if (!response.ok) {
        throw new Error('Failed to fetch highlighted DTF performance')
      }

      const data = (await response.json()) as {
        timeseries?: { timestamp: number; price: number }[]
      }

      return (data.timeseries ?? [])
        .filter(({ price }) => Boolean(price))
        .map(({ timestamp, price }) => ({ timestamp, value: price }))
    },
    staleTime: REFRESH_INTERVAL,
    refetchInterval: REFRESH_INTERVAL,
  })
}

const CollateralAssetItem = ({
  token,
}: {
  token: IndexDTFItem['basket'][number]
}) => (
  <div className="flex shrink-0 items-center gap-1 rounded-full px-1.5 py-1">
    <span className="text-sm text-foreground ml-1">${token.symbol}</span>
    <span className="text-sm text-legend">{token.weight || '0'}%</span>
  </div>
)

const HighlightedDTFCard = ({ dtf }: { dtf: IndexDTFItem }) => {
  const backing = dtf.basket.slice(0, BACKING_LIMIT)
  const fallbackSevenDayPerformance = getSevenDayPerformance(dtf.performance)
  const { data: detailedSevenDayPerformance } =
    useDetailedSevenDayPerformance(dtf)
  const sevenDayPerformance = detailedSevenDayPerformance?.length
    ? detailedSevenDayPerformance
    : fallbackSevenDayPerformance
  const percentageChange = calculatePercentageChange(sevenDayPerformance)
  const performanceDirection = getPerformanceDirection(sevenDayPerformance)
  const dotsPatternId = useId().replace(/:/g, '')
  const strokeGradientId = `${dotsPatternId}-stroke`
  const dotsFadeGradientId = `${dotsPatternId}-fade`
  const dotsMaskId = `${dotsPatternId}-mask`
  const performanceColor =
    performanceDirection === 'positive'
      ? '#2563EB'
      : performanceDirection === 'negative'
        ? `url(#${strokeGradientId})`
        : 'hsl(var(--primary))'
  const performanceDotColor =
    performanceDirection === 'positive'
      ? '#60A5FA'
      : performanceDirection === 'negative'
        ? '#F87171'
        : '#6F6456'
  const transcriptWordRefs = useRef<(HTMLSpanElement | null)[]>([])
  const [isTranscriptActive, setIsTranscriptActive] = useState(false)
  const [highlightedWords, setHighlightedWords] = useState(0)
  const [transcriptScrollOffset, setTranscriptScrollOffset] = useState(0)
  const isDesktop = useIsDesktop()
  const isActive = !isDesktop || isTranscriptActive

  useEffect(() => {
    if (!isActive) {
      setHighlightedWords(0)
      setTranscriptScrollOffset(0)
      return
    }

    setHighlightedWords(0)
    const interval = window.setInterval(() => {
      setHighlightedWords((count) =>
        Math.min(count + 1, TRANSCRIPT_WORDS.length)
      )
    }, TRANSCRIPT_WORD_DELAY_MS)

    return () => window.clearInterval(interval)
  }, [isActive])

  useEffect(() => {
    if (!isActive || highlightedWords === 0) {
      setTranscriptScrollOffset(0)
      return
    }

    const activeWord =
      transcriptWordRefs.current[
        Math.min(highlightedWords - 1, TRANSCRIPT_WORDS.length - 1)
      ]

    if (!activeWord) return

    const rowTops = Array.from(
      new Set(
        transcriptWordRefs.current
          .filter(Boolean)
          .map((node) => Math.round(node!.offsetTop))
      )
    ).sort((a, b) => a - b)
    const activeTop = Math.round(activeWord.offsetTop)
    const activeRowIndex = rowTops.findIndex((top) => top === activeTop)

    if (activeRowIndex < 2) {
      setTranscriptScrollOffset(0)
      return
    }

    setTranscriptScrollOffset(rowTops[activeRowIndex - 1] ?? 0)
  }, [highlightedWords, isActive])

  return (
    <Link
      to={getFolioRoute(dtf.address, dtf.chainId)}
      onMouseEnter={() => isDesktop && setIsTranscriptActive(true)}
      onMouseLeave={() => isDesktop && setIsTranscriptActive(false)}
      onFocus={() => setIsTranscriptActive(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsTranscriptActive(false)
        }
      }}
      className={cn(
        'group flex w-full shrink-0 flex-col gap-1 rounded-3xl bg-card p-1 transition-colors lg:bg-background lg:hover:bg-card',
        isInactiveDTF(dtf.status) && 'opacity-60'
      )}
    >
      <div className="flex flex-col overflow-hidden rounded-t-2xl bg-gradient-to-b from-secondary to-card transition-colors duration-200 lg:from-secondary/80 lg:group-hover:from-secondary lg:group-focus-within:from-muted">
        <div className="flex min-w-0 items-start justify-between p-5 pb-2">
          <div className="flex min-w-0 flex-col items-start gap-3">
            <div className="relative w-fit flex-shrink-0">
              <TokenLogo src={dtf.brand?.icon || undefined} size="xl" />
              {/* <ChainLogo
                chain={dtf.chainId}
                className="absolute -bottom-1 -right-1"
              /> */}
            </div>
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <h3 className="truncate text-lg leading-tight text-primary transition-colors lg:text-foreground lg:group-hover:text-primary">
                  {dtf.name}
                </h3>
                {isInactiveDTF(dtf.status) && (
                  <span className="hidden rounded-full bg-yellow-500/15 px-2 py-0.5 text-xs font-medium text-yellow-600 dark:text-yellow-400 sm:inline">
                    Inactive
                  </span>
                )}
              </div>
              <div className="truncate text-lg leading-tight text-primary tabular-nums transition-colors lg:text-foreground lg:group-hover:text-primary">
                <span className="text-primary/60 transition-colors lg:text-legend lg:group-hover:text-primary/60">
                  $
                </span>
                {formatCurrency(dtf.price, dtf.price >= 1 ? 2 : 5)}
              </div>
              <div className="mt-1.5 flex min-w-0 items-center gap-1 text-sm text-legend">
                <span className="truncate">${dtf.symbol}</span>
                <span
                  className={cn(
                    'shrink-0 tabular-nums',
                    performanceDirection === 'positive' && 'text-blue-600',
                    performanceDirection === 'negative' && 'text-red-600'
                  )}
                >
                  {percentageChange ? `${percentageChange} (7d)` : 'No data'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center">
            <span className="inline-flex h-8 items-center rounded-full bg-primary px-3.5 text-sm font-medium text-primary-foreground opacity-100 transition-opacity duration-150 ease-out lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100">
              Buy
            </span>
          </div>
        </div>

        {sevenDayPerformance.length > 0 && (
          <div className="relative">
            <ChartContainer
              config={chartConfig}
              className="pointer-events-none h-52 w-full"
            >
              <AreaChart
                data={sevenDayPerformance}
                margin={{ left: 0, right: 0, top: 6, bottom: 0 }}
                {...{ overflow: 'visible' }}
              >
                <defs>
                  {performanceDirection === 'negative' && (
                    <linearGradient
                      id={strokeGradientId}
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="0"
                    >
                      <stop offset="0%" stopColor="#78716C" />
                      <stop offset="55%" stopColor="#B45309" />
                      <stop offset="100%" stopColor="#DC2626" />
                    </linearGradient>
                  )}
                  <pattern
                    id={dotsPatternId}
                    x="0"
                    y="0"
                    width="3"
                    height="3"
                    patternUnits="userSpaceOnUse"
                  >
                    <circle
                      cx="1"
                      cy="1"
                      r="0.45"
                      fill={performanceDotColor}
                      opacity="1"
                    />
                  </pattern>
                  <linearGradient
                    id={dotsFadeGradientId}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="white" stopOpacity="1" />
                    <stop offset="72%" stopColor="white" stopOpacity="0.75" />
                    <stop offset="100%" stopColor="white" stopOpacity="0" />
                  </linearGradient>
                  <mask
                    id={dotsMaskId}
                    maskUnits="objectBoundingBox"
                    maskContentUnits="objectBoundingBox"
                  >
                    <rect
                      x="0"
                      y="0"
                      width="1"
                      height="1"
                      fill={`url(#${dotsFadeGradientId})`}
                    />
                  </mask>
                </defs>
                <XAxis
                  dataKey="timestamp"
                  hide
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  dataKey="value"
                  hide
                  axisLine={false}
                  tickLine={false}
                  domain={getPaddedValueDomain}
                />
                <Tooltip content={() => null} cursor={false} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="none"
                  fill={`url(#${dotsPatternId})`}
                  mask={`url(#${dotsMaskId})`}
                  isAnimationActive={true}
                  animationDuration={500}
                  animationEasing="ease-in-out"
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={performanceColor}
                  strokeWidth={2}
                  fill="transparent"
                  isAnimationActive={true}
                  animationDuration={500}
                  animationEasing="ease-in-out"
                />
              </AreaChart>
            </ChartContainer>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-b from-card/0 to-card transition-colors duration-200 lg:from-background/0 lg:to-background lg:group-hover:from-card/0 lg:group-hover:to-card lg:group-focus-within:from-card/0 lg:group-focus-within:to-card" />
          </div>
        )}
      </div>
      <div className="relative overflow-hidden rounded-full bg-card border border-card p-2 pr-0.5 pl-0 lg:border-secondary lg:group-hover:border-card">
        <div className="pointer-events-none absolute inset-y-0 -right-px z-10 w-20 bg-gradient-to-l from-card via-card to-transparent opacity-100 transition-opacity duration-150 lg:opacity-65 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100" />
        <div className="flex pr-12 pl-2 overflow-hidden">
          <div className="flex w-max gap-0 [animation:collateral-assets-scroll_18s_linear_infinite] motion-reduce:animate-none lg:[animation:none] lg:group-hover:[animation:collateral-assets-scroll_18s_linear_infinite] lg:group-focus-within:[animation:collateral-assets-scroll_18s_linear_infinite]">
            {[...backing, ...backing].map((token, index) => (
              <CollateralAssetItem
                key={`${token.address}-${index}`}
                token={token}
              />
            ))}
          </div>
        </div>
        <Button
          variant="none"
          size="icon-rounded"
          className="absolute right-2 top-1/2 z-20 h-8 w-8 -translate-y-1/2 shrink-0 bg-muted text-foreground opacity-100 transition-colors duration-150 lg:bg-card lg:opacity-0 lg:group-hover:bg-muted lg:group-hover:opacity-100 lg:group-focus-within:opacity-100 hover:!bg-primary hover:!text-primary-foreground"
          aria-label={`Open ${dtf.name}`}
        >
          <ArrowRight size={16} />
        </Button>
      </div>
      <div className="flex flex-col items-start gap-2 px-5 py-4 pt-3 transition-colors">
        <div
          className="w-full min-w-0 shrink-0 overflow-hidden"
          style={{ height: TRANSCRIPT_LINE_HEIGHT * 2 }}
        >
          <div
            className="min-w-full transition-transform duration-500 ease-out"
            style={{
              transform: `translate3d(0, -${transcriptScrollOffset}px, 0)`,
            }}
          >
            <p className="text-xs leading-[18px] text-legend">
              <span>&ldquo;</span>
              {TRANSCRIPT_WORDS.map((word, index) => (
                <span
                  key={`${word}-${index}`}
                  ref={(node) => {
                    transcriptWordRefs.current[index] = node
                  }}
                  className={cn(
                    'transition-colors',
                    index < highlightedWords && 'text-foreground'
                  )}
                >
                  {word}
                  {index === TRANSCRIPT_WORDS.length - 1 ? '' : ' '}
                </span>
              ))}
              <span>&rdquo;</span>
            </p>
          </div>
        </div>
        <Button
          variant="none"
          size="inline"
          className="shrink-0 bg-transparent p-0 text-xs text-primary hover:bg-transparent hover:text-primary/80"
          aria-label={`Watch ${dtf.name} explainer`}
          onClick={(event) => event.preventDefault()}
        >
          Watch Video
        </Button>
      </div>
    </Link>
  )
}

const HighlightedDTFPlaceholder = () => (
  <div className="flex flex-col gap-2">
    {Array.from({ length: HIGHLIGHTED_LIMIT }).map((_, index) => (
      <div
        key={index}
        className="flex w-full shrink-0 flex-col gap-5 rounded-xl bg-card px-5 py-5"
      >
        <div className="flex flex-col rounded-xl bg-secondary p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-6 w-32 rounded-full" />
          </div>
          <Skeleton className="mt-5 h-64 w-full" />
        </div>
        <div className="relative overflow-hidden rounded-full bg-card p-2">
          <div className="flex gap-2 pr-12">
            <Skeleton className="h-9 w-28 rounded-full" />
            <Skeleton className="h-9 w-28 rounded-full" />
          </div>
          <Skeleton className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full" />
        </div>
        <div className="flex items-center gap-4 rounded-2xl bg-card p-4">
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
      </div>
    ))}
  </div>
)

const HighlightedDTFEndCard = ({ fullWidth }: { fullWidth: boolean }) => (
  <Link
    to={ROUTES.DISCOVER}
    className={cn(
      'group flex h-full min-h-[460px] w-full flex-col items-center justify-center gap-4 rounded-3xl bg-background p-6 text-center transition-colors hover:bg-card',
      fullWidth && 'lg:col-span-2'
    )}
  >
    <span className="max-w-56 text-xl leading-tight text-foreground transition-colors group-hover:text-primary">
      Discover all our products
    </span>
    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground transition-colors group-hover:bg-primary">
      <ArrowRight
        size={18}
        className="text-foreground group-hover:text-white"
      />
    </span>
  </Link>
)

const HighlightedDTFs = ({
  className,
  enableScrollAnimation = true,
  onScrollDistanceChange,
  scrollOffset = 0,
}: {
  className?: string
  enableScrollAnimation?: boolean
  onScrollDistanceChange?: (distance: number) => void
  scrollOffset?: number
}) => {
  const { data, isLoading } = useIndexDTFList()
  const viewportRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [scrollDistance, setScrollDistance] = useState(0)

  const highlighted = useMemo(() => {
    if (!data) return []

    return data
      .filter((dtf) => !isInactiveDTF(dtf.status))
      .sort((a, b) => b.marketCap - a.marketCap)
      .slice(0, HIGHLIGHTED_LIMIT)
  }, [data])

  useEffect(() => {
    const viewport = viewportRef.current
    const track = trackRef.current
    if (!viewport || !track || !onScrollDistanceChange) return

    const update = () => {
      const distance = Math.max(0, track.scrollHeight - viewport.clientHeight)
      setScrollDistance(distance)
      onScrollDistanceChange(distance)
    }

    update()

    const ro = new ResizeObserver(update)
    ro.observe(viewport)
    ro.observe(track)

    return () => ro.disconnect()
  }, [highlighted.length, isLoading, onScrollDistanceChange])

  if (!isLoading && highlighted.length === 0) {
    return null
  }

  const trackStyle = {
    transform: enableScrollAnimation
      ? `translate3d(0, -${scrollOffset}px, 0)`
      : undefined,
  } satisfies CSSProperties
  const fadeOpacity =
    enableScrollAnimation && scrollDistance > 0
      ? Math.max(
          0,
          Math.min(1, (scrollDistance - scrollOffset) / END_FADE_DISTANCE)
        )
      : 0
  const fadeStyle = {
    opacity: fadeOpacity,
  } satisfies CSSProperties

  return (
    <section
      ref={viewportRef}
      className={cn(
        'relative mb-1 min-h-0 overflow-visible lg:overflow-hidden',
        className ?? 'mb-16'
      )}
    >
      {isLoading ? (
        <div
          ref={trackRef}
          style={trackStyle}
          className="will-change-transform"
        >
          <HighlightedDTFPlaceholder />
        </div>
      ) : (
        <div className="h-full">
          <style>
            {`
              @keyframes collateral-assets-scroll {
                from { transform: translate3d(0, 0, 0); }
                to { transform: translate3d(calc(-50% - ${COLLATERAL_GAP / 2}px), 0, 0); }
              }
            `}
          </style>
          <div
            ref={trackRef}
            style={trackStyle}
            className="grid auto-rows-fr grid-cols-1 gap-1 pb-0 will-change-transform lg:grid-cols-2"
          >
            {highlighted.map((dtf) => (
              <HighlightedDTFCard
                key={`${dtf.chainId}-${dtf.address}`}
                dtf={dtf}
              />
            ))}
            <HighlightedDTFEndCard fullWidth={highlighted.length % 2 === 0} />
          </div>
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-secondary/0 to-secondary transition-opacity duration-200"
            style={fadeStyle}
          />
        </div>
      )}
    </section>
  )
}

export default HighlightedDTFs
