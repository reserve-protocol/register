import TokenLogo from '@/components/token-logo'
import AudioEqualizerIcon from '@/components/icons/AudioEqualizerIcon'
import ChainLogo from '@/components/icons/ChainLogo'
import { Button } from '@/components/ui/button'
import { ChartConfig, ChartContainer } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { isInactiveDTF } from '@/hooks/use-dtf-status'
import { useIsDesktop } from '@/hooks/use-media-query'
import useIndexDTFList, { type IndexDTFItem } from '@/hooks/useIndexDTFList'
import { cn } from '@/lib/utils'
import { formatCurrency, getFolioRoute } from '@/utils'
import { RESERVE_API, ROUTES } from '@/utils/constants'
import { Trans, useLingui } from '@lingui/react/macro'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight } from 'lucide-react'
import {
  useId,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { Link } from 'react-router-dom'
import { Area, AreaChart, Tooltip, XAxis, YAxis } from 'recharts'
import {
  useAssetTickerTransition,
  useHighlightedCardVisibility,
  useHighlightedScrollMetrics,
  useTranscriptPlayback,
} from '../hooks/use-highlighted-dtf-animation'
import { calculatePercentageChange } from './discover-index-dtf/utils'

const HIGHLIGHTED_LIMIT = 5
const BACKING_LIMIT = 7
const SEVEN_DAYS_SECONDS = 7 * 24 * 60 * 60
const COLLATERAL_GAP = 8
const COLLATERAL_SCROLL_RAMP_PERCENT = 12
const COLLATERAL_SCROLL_RAMP_DISTANCE_PERCENT = 4
const COLLATERAL_SCROLL_RAMP_GAP_OFFSET =
  (COLLATERAL_GAP / 2) * (COLLATERAL_SCROLL_RAMP_DISTANCE_PERCENT / 50)
const REFRESH_INTERVAL = 1000 * 60 * 30
const ASSET_CHAIN_EXIT_MS = 180
const ASSET_CHAIN_ENTER_MS = 220
const TRANSCRIPT_PREVIEW =
  'A short walkthrough of this portfolio, the assets it tracks, how the basket is weighted, and why investors may use it for broad tokenized market exposure. The explainer will cover the core thesis, recent performance drivers, liquidity considerations, and the role each major component plays inside the DTF.'
const TRANSCRIPT_WORDS = TRANSCRIPT_PREVIEW.split(' ')
const TRANSCRIPT_WORD_DELAY_MS = 280
const TRANSCRIPT_LINE_HEIGHT = 18
const END_FADE_DISTANCE = 160
const BSC_CHAIN_ID = 56
const ETHEREUM_CHAIN_ID = 1
const FEATURE_CARD_CLASS_NAME =
  'group flex w-full shrink-0 flex-col gap-1 rounded-3xl bg-card p-1 lg:bg-background lg:hover:bg-card'
const FEATURE_CARD_MEDIA_CLASS_NAME =
  'flex flex-col overflow-hidden rounded-t-2xl bg-gradient-to-b from-secondary to-card lg:from-secondary/80 lg:group-hover:from-card'
const FEATURE_CARD_HEADER_CLASS_NAME = 'flex min-w-0 flex-col gap-3 p-5 pb-2'
const FEATURE_CARD_ASSET_TICKER_CLASS_NAME =
  'relative overflow-hidden rounded-full border border-card bg-card p-2 pl-0 pr-0.5 lg:border-secondary lg:group-hover:border-card'
const FEATURE_CARD_GRID_CLASS_NAME =
  'grid grid-cols-1 gap-1 pb-0 will-change-transform md:auto-rows-fr md:grid-cols-2'

type ChainVersion = IndexDTFItem & {
  versionLabel: string
  performanceSource?: Pick<IndexDTFItem, 'chainId' | 'address'>
}

type HighlightedDTFItem = IndexDTFItem & {
  performanceSource?: Pick<IndexDTFItem, 'chainId' | 'address'>
  chainVersions?: ChainVersion[]
}

const chartConfig = {
  performance: {
    label: 'Performance',
    color: 'currentColor',
  },
} satisfies ChartConfig

const createDummyEthereumVersion = (
  dtf: IndexDTFItem,
  performanceSource = dtf
): ChainVersion => ({
  ...dtf,
  chainId: ETHEREUM_CHAIN_ID,
  // TODO: Replace this dummy address with the real deployed DTF address when
  // chain versions are sourced from actual product data.
  address: '0x000000000000000000000000000000000000c020',
  name: `${dtf.name} (ETH)`,
  versionLabel: 'ETH L1',
  performanceSource: {
    chainId: performanceSource.chainId,
    address: performanceSource.address,
  },
  price: dtf.price * 1.018,
  marketCap: dtf.marketCap * 0.42,
  symbol: dtf.symbol,
  basket: dtf.basket.slice(0, BACKING_LIMIT).map((token, index) => ({
    ...token,
    weight:
      index === 0
        ? '48.50'
        : index === 1
          ? '24.25'
          : token.weight
            ? (Number(token.weight) * 0.92).toFixed(2)
            : token.weight,
  })),
  performance: dtf.performance.map((point, index) => ({
    ...point,
    value: point.value * (1 + 0.006 + index * 0.0004),
  })),
})

const withHighlightedChainVersions = (
  dtf: IndexDTFItem,
  alternatePerformanceSource?: IndexDTFItem
): HighlightedDTFItem[] => {
  const isCmc20Fixture =
    dtf.chainId === BSC_CHAIN_ID && dtf.symbol.toUpperCase() === 'CMC20'

  if (!isCmc20Fixture) return [dtf]

  const chainVersionFixture = {
    ...dtf,
    chainVersions: [
      {
        ...dtf,
        name: `${dtf.name} (BSC)`,
        versionLabel: 'BSC',
      },
      createDummyEthereumVersion(dtf, alternatePerformanceSource),
    ],
  }

  return [
    {
      ...chainVersionFixture,
    },
  ]
}

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

const useDetailedSevenDayPerformance = (
  dtf: Pick<IndexDTFItem, 'chainId' | 'address'>,
  enabled = true
) => {
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
    enabled,
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

export const CollateralAssetAnimationStyles = () => (
  <style>
    {`
      @keyframes collateral-assets-scroll {
        0% {
          animation-timing-function: cubic-bezier(0.5, 0, 1, 1);
          transform: translate3d(0, 0, 0);
        }
        ${COLLATERAL_SCROLL_RAMP_PERCENT}% {
          animation-timing-function: linear;
          transform: translate3d(calc(-${COLLATERAL_SCROLL_RAMP_DISTANCE_PERCENT}% - ${COLLATERAL_SCROLL_RAMP_GAP_OFFSET}px), 0, 0);
        }
        100% {
          transform: translate3d(calc(-50% - ${COLLATERAL_GAP / 2}px), 0, 0);
        }
      }
      @keyframes collateral-assets-chain-exit {
        from { opacity: 1; transform: translate3d(0, 0, 0); }
        to { opacity: 0; transform: translate3d(-48px, 0, 0); }
      }
      @keyframes collateral-assets-chain-enter {
        from { opacity: 0; transform: translate3d(18px, 0, 0); }
        to { opacity: 1; transform: translate3d(0, 0, 0); }
      }
    `}
  </style>
)

export const IndexDTFFeatureCard = ({
  dtf,
  bottomSlot,
  chartPlacement = 'body',
  enableDetailedPerformance = true,
  showTranscript = true,
}: {
  dtf: HighlightedDTFItem
  bottomSlot?: ReactNode
  chartPlacement?: 'body' | 'header'
  enableDetailedPerformance?: boolean
  showTranscript?: boolean
}) => {
  const { t } = useLingui()
  const chainVersions = dtf.chainVersions
  const [selectedVersionIndex, setSelectedVersionIndex] = useState(0)
  const selectedVersion = chainVersions?.[selectedVersionIndex] ?? dtf
  const assetVersionKey = `${selectedVersion.chainId}-${selectedVersion.address}`
  const performanceSource = selectedVersion.performanceSource ?? selectedVersion
  const chartKey = `${selectedVersion.chainId}-${selectedVersion.address}-${performanceSource.chainId}-${performanceSource.address}`
  const backing = useMemo(
    () => selectedVersion.basket.slice(0, BACKING_LIMIT),
    [selectedVersion]
  )
  const fallbackSevenDayPerformance = getSevenDayPerformance(
    selectedVersion.performance
  )
  const { data: detailedSevenDayPerformance } = useDetailedSevenDayPerformance(
    performanceSource,
    enableDetailedPerformance
  )
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
      ? `url(#${strokeGradientId})`
      : performanceDirection === 'negative'
        ? `url(#${strokeGradientId})`
        : 'hsl(var(--primary))'
  const performanceDotColor =
    performanceDirection === 'positive'
      ? '#819D44'
      : performanceDirection === 'negative'
        ? '#B85F50'
        : '#6F6456'
  const [isTranscriptActive, setIsTranscriptActive] = useState(false)
  const isDesktop = useIsDesktop()
  const { cardRef, isAssetTickerVisible, isCardInView } =
    useHighlightedCardVisibility<HTMLAnchorElement>(isDesktop)
  const isActive =
    showTranscript && (isDesktop ? isTranscriptActive : isCardInView)
  const {
    displayedValue: displayedBacking,
    displayedVersionKey: displayedAssetVersionKey,
    transitionState: assetTransitionState,
  } = useAssetTickerTransition({
    enterMs: ASSET_CHAIN_ENTER_MS,
    exitMs: ASSET_CHAIN_EXIT_MS,
    value: backing,
    versionKey: assetVersionKey,
  })
  const { highlightedWords, transcriptScrollOffset, transcriptWordRefs } =
    useTranscriptPlayback({
      active: isActive,
      enabled: showTranscript,
      wordCount: TRANSCRIPT_WORDS.length,
      wordDelayMs: TRANSCRIPT_WORD_DELAY_MS,
    })
  const hasChainTabs = (chainVersions?.length ?? 0) > 1
  const chainTabs = chainVersions ?? []
  const hasPerformanceChart = sevenDayPerformance.length > 0

  const performanceChart = ({
    className,
    fadeClassName = 'pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-b from-card/0 to-card lg:from-background/0 lg:to-background lg:group-hover:from-card/0 lg:group-hover:to-card lg:group-focus-within:from-card/0 lg:group-focus-within:to-card',
    showPattern = true,
  }: {
    className: string
    fadeClassName?: string
    showPattern?: boolean
  }) => (
    <div className="relative">
      <ChartContainer
        key={chartKey}
        config={chartConfig}
        className={cn('pointer-events-none w-full', className)}
      >
        <AreaChart
          data={sevenDayPerformance}
          margin={{ left: 0, right: 0, top: 6, bottom: 0 }}
          {...{ overflow: 'visible' }}
        >
          <defs>
            {performanceDirection !== 'neutral' && (
              <linearGradient id={strokeGradientId} x1="0" y1="0" x2="1" y2="0">
                {performanceDirection === 'positive' ? (
                  <>
                    <stop offset="0%" stopColor="#A2BB6E" />
                    <stop offset="100%" stopColor="#657D32" />
                  </>
                ) : (
                  <>
                    <stop offset="0%" stopColor="#D69A8F" />
                    <stop offset="100%" stopColor="#9F4A3D" />
                  </>
                )}
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
            <linearGradient id={dotsFadeGradientId} x1="0" y1="0" x2="0" y2="1">
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
          <XAxis dataKey="timestamp" hide axisLine={false} tickLine={false} />
          <YAxis
            dataKey="value"
            hide
            axisLine={false}
            tickLine={false}
            domain={getPaddedValueDomain}
          />
          <Tooltip content={() => null} cursor={false} />
          {showPattern && (
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
          )}
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
      {fadeClassName && <div className={cn(fadeClassName)} />}
    </div>
  )

  return (
    <Link
      ref={cardRef}
      to={getFolioRoute(selectedVersion.address, selectedVersion.chainId)}
      onMouseEnter={() =>
        showTranscript && isDesktop && setIsTranscriptActive(true)
      }
      onMouseLeave={() =>
        showTranscript && isDesktop && setIsTranscriptActive(false)
      }
      onFocus={() => showTranscript && setIsTranscriptActive(true)}
      onBlur={(event) => {
        if (
          showTranscript &&
          !event.currentTarget.contains(event.relatedTarget as Node | null)
        ) {
          setIsTranscriptActive(false)
        }
      }}
      className={cn(
        FEATURE_CARD_CLASS_NAME,
        isInactiveDTF(selectedVersion.status) && 'opacity-60'
      )}
    >
      <div className={FEATURE_CARD_MEDIA_CLASS_NAME}>
        <div className={FEATURE_CARD_HEADER_CLASS_NAME}>
          <div className="flex min-w-0 items-start justify-between">
            <div className="relative w-fit flex-shrink-0">
              <TokenLogo src={dtf.brand?.icon || undefined} size="xl" />
              <ChainLogo
                chain={selectedVersion.chainId}
                width={16}
                height={16}
                className="absolute -bottom-0.5 -right-1 rounded-md border-2 border-secondary bg-card group-hover:border-card"
              />
            </div>

            <div
              className={cn(
                'relative flex h-8 shrink-0 items-center justify-end',
                hasChainTabs && 'w-[154px]',
                chartPlacement === 'header' && !hasChainTabs && 'h-12 w-28'
              )}
            >
              {hasChainTabs && (
                <div
                  className="absolute right-0 top-0 z-20"
                  onClick={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                  }}
                >
                  <div className="inline-flex items-center gap-2">
                    <div
                      role="tablist"
                      aria-label={t`Highlighted card chain`}
                      className={cn(
                        'inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-[2px] py-0.5 transition-colors',
                        'dark:border dark:border-foreground dark:bg-secondary dark:group-hover:border-secondary',
                        'lg:group-hover lg:group-hover:bg-muted'
                      )}
                    >
                      {chainTabs.map((version, index) => (
                        <button
                          key={`${version.chainId}-${version.address}-tab`}
                          type="button"
                          role="tab"
                          aria-selected={index === selectedVersionIndex}
                          className={cn(
                            'inline-flex h-7 items-center justify-center gap-0 whitespace-nowrap rounded-full px-3 text-xs font-medium text-legend transition-[background-color,color,gap,padding]',
                            'hover:text-foreground',
                            'lg:group-hover:gap-1 lg:group-hover:px-2 lg:group-hover:pr-3',
                            index === selectedVersionIndex &&
                              'bg-background text-foreground dark:bg-foreground lg:group-hover:bg-card dark:group-hover:bg-foreground dark:group-hover:text-background',
                            index !== selectedVersionIndex &&
                              'hover:bg-background'
                          )}
                          onClick={() => {
                            setSelectedVersionIndex(index)
                          }}
                        >
                          <ChainLogo
                            chain={version.chainId}
                            width={16}
                            height={16}
                            className="shrink-0 rounded-md border-2 border-card dark:border-none"
                          />
                          <span className="max-w-0 overflow-hidden opacity-0 transition-[max-width,opacity] duration-150 ease-out lg:group-hover:max-w-12 lg:group-hover:opacity-100">
                            {version.versionLabel}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {!hasChainTabs &&
                chartPlacement === 'header' &&
                hasPerformanceChart && (
                  <div className="w-28">
                    {performanceChart({
                      className: 'h-12',
                      fadeClassName: '',
                      showPattern: false,
                    })}
                  </div>
                )}
              {!hasChainTabs && chartPlacement === 'body' && (
                <span className="inline-flex h-8 items-center rounded-full bg-primary px-3.5 text-sm font-medium text-primary-foreground opacity-100 transition-opacity duration-150 ease-out lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100">
                  <Trans>Buy</Trans>
                </span>
              )}
            </div>
          </div>

          <div className="w-full min-w-0">
            <div className="flex min-h-[48px] min-w-0 items-end">
              <div className="flex min-w-0 items-end gap-2">
                <h3 className="min-w-0 text-xl font-normal leading-tight text-foreground [text-wrap:pretty] transition-colors lg:group-hover:text-primary dark:lg:group-hover:text-foreground">
                  {selectedVersion.name}
                </h3>
                {isInactiveDTF(selectedVersion.status) && (
                  <span className="hidden shrink-0 rounded-full bg-yellow-500/15 px-2 py-0.5 text-xs font-medium text-yellow-600 dark:text-yellow-400 sm:inline">
                    <Trans>Inactive</Trans>
                  </span>
                )}
              </div>
            </div>
            <div className="mt-1.5 flex w-full min-w-0 items-center justify-between gap-3 text-base text-legend">
              <span className="truncate">
                <span className="text-primary tabular-nums transition-colors lg:text-foreground lg:group-hover:text-primary">
                  <span className="text-primary/60 transition-colors lg:text-legend lg:group-hover:text-primary/60">
                    $
                  </span>
                  {formatCurrency(
                    selectedVersion.price,
                    selectedVersion.price >= 1 ? 2 : 5
                  )}
                </span>
                <span> · ${selectedVersion.symbol}</span>
              </span>
              <span
                className={cn(
                  'shrink-0 tabular-nums',
                  performanceDirection === 'positive' && 'text-[#657D32]',
                  performanceDirection === 'negative' && 'text-[#9F4A3D]'
                )}
              >
                {percentageChange ? (
                  `${percentageChange} (7d)`
                ) : (
                  <Trans>No data</Trans>
                )}
              </span>
            </div>
          </div>
        </div>

        {chartPlacement === 'body' &&
          hasPerformanceChart &&
          performanceChart({ className: 'h-52' })}
      </div>
      <div className={FEATURE_CARD_ASSET_TICKER_CLASS_NAME}>
        <div
          className={cn(
            'pointer-events-none absolute inset-y-0 -right-px z-10 w-20 bg-gradient-to-l from-card via-card to-transparent opacity-100 transition-opacity duration-150',
            'lg:opacity-65 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100'
          )}
        />
        <div className="flex overflow-hidden pl-2 pr-12">
          <div
            className={cn(
              'will-change-transform',
              assetTransitionState === 'exiting' &&
                '[animation:collateral-assets-chain-exit_180ms_ease-in_forwards]',
              assetTransitionState === 'entering' &&
                '[animation:collateral-assets-chain-enter_220ms_ease-out_forwards]'
            )}
          >
            <div
              key={displayedAssetVersionKey}
              className={cn(
                'flex w-max gap-0 motion-reduce:animate-none',
                isAssetTickerVisible &&
                  '[animation:collateral-assets-scroll_18s_linear_infinite]',
                'lg:[animation:none] lg:group-hover:[animation:collateral-assets-scroll_18s_linear_infinite]'
              )}
            >
              {[...displayedBacking, ...displayedBacking].map(
                (token, index) => (
                  <CollateralAssetItem
                    key={`${token.address}-${index}`}
                    token={token}
                  />
                )
              )}
            </div>
          </div>
        </div>
        <Button
          variant="none"
          size="icon-rounded"
          className={cn(
            'absolute right-2 top-1/2 z-20 h-8 w-8 -translate-y-1/2 shrink-0 bg-muted text-foreground opacity-100 transition-colors duration-150',
            'hover:!bg-primary hover:!text-primary-foreground',
            'lg:bg-card lg:opacity-0 lg:group-hover:bg-muted lg:group-hover:opacity-100 lg:group-focus-within:opacity-100'
          )}
          aria-label={t`Open ${selectedVersion.name}`}
        >
          <ArrowRight size={16} />
        </Button>
      </div>
      {showTranscript ? (
        <div className="flex flex-col items-start gap-2 px-5 py-4 pt-3">
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
                      index < highlightedWords &&
                        'text-primary dark:text-foreground'
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
            className="inline-flex shrink-0 items-center gap-1 bg-transparent p-0 text-xs text-primary hover:bg-transparent hover:text-primary/80"
            aria-label={t`Watch ${dtf.name} explainer`}
            onClick={(event) => event.preventDefault()}
          >
            <span>
              <Trans>Watch Video</Trans>
            </span>
            <AudioEqualizerIcon className="h-3 w-0 shrink-0 opacity-0 transition-[width,opacity] duration-150 lg:group-hover:w-3 lg:group-hover:opacity-100" />
          </Button>
        </div>
      ) : (
        bottomSlot
      )}
    </Link>
  )
}

const PerformanceChartSkeleton = ({
  className,
  fadeClassName = 'pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-b from-card/0 to-card lg:from-background/0 lg:to-background lg:group-hover:from-card/0 lg:group-hover:to-card lg:group-focus-within:from-card/0 lg:group-focus-within:to-card',
}: {
  className: string
  fadeClassName?: string
}) => (
  <div className="relative">
    <div className={cn('pointer-events-none w-full', className)}>
      <Skeleton className="h-full w-full rounded-none bg-primary/10" />
    </div>
    {fadeClassName && <div className={cn(fadeClassName)} />}
  </div>
)

const FeatureCardAssetTickerSkeleton = () => (
  <div className={FEATURE_CARD_ASSET_TICKER_CLASS_NAME}>
    <div
      className={cn(
        'pointer-events-none absolute inset-y-0 -right-px z-10 w-20 bg-gradient-to-l from-card via-card to-transparent opacity-100 transition-opacity duration-150',
        'lg:opacity-65 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100'
      )}
    />
    <div className="flex overflow-hidden pl-2 pr-12">
      <div className="flex w-max gap-0">
        {Array.from({ length: BACKING_LIMIT }).map((_, index) => (
          <div
            key={index}
            className="flex shrink-0 items-center gap-1 rounded-full px-1.5 py-1"
          >
            <Skeleton className="ml-1 h-5 w-12 rounded-full" />
            <Skeleton className="h-5 w-9 rounded-full" />
          </div>
        ))}
      </div>
    </div>
    <Skeleton className="absolute right-2 top-1/2 z-20 h-8 w-8 -translate-y-1/2 rounded-full bg-muted" />
  </div>
)

const FeatureCardTranscriptSkeleton = () => (
  <div className="flex flex-col items-start gap-2 px-5 py-4 pt-3">
    <div
      className="w-full min-w-0 shrink-0 overflow-hidden"
      style={{ height: TRANSCRIPT_LINE_HEIGHT * 2 }}
    >
      <div className="space-y-1.5">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
    </div>
    <Skeleton className="h-4 w-24" />
  </div>
)

const FeatureCardMarketCapSkeleton = () => (
  <div className="flex w-full items-center justify-between px-5 py-4 pt-3 text-sm">
    <Skeleton className="h-5 w-24" />
    <Skeleton className="h-5 w-16" />
  </div>
)

const IndexDTFFeatureCardSkeleton = ({
  chartPlacement = 'body',
  showTranscript = true,
}: {
  chartPlacement?: 'body' | 'header'
  showTranscript?: boolean
}) => (
  <div className={FEATURE_CARD_CLASS_NAME} aria-hidden="true">
    <div className={FEATURE_CARD_MEDIA_CLASS_NAME}>
      <div className={FEATURE_CARD_HEADER_CLASS_NAME}>
        <div className="flex min-w-0 items-start justify-between">
          <div className="relative w-fit flex-shrink-0">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="absolute -bottom-0.5 -right-1 h-4 w-4 rounded-md border-2 border-secondary bg-card" />
          </div>

          <div
            className={cn(
              'relative flex h-8 shrink-0 items-center justify-end',
              chartPlacement === 'header' && 'h-12 w-28'
            )}
          >
            {chartPlacement === 'header' ? (
              <div className="w-28">
                <PerformanceChartSkeleton className="h-12" fadeClassName="" />
              </div>
            ) : (
              <Skeleton className="inline-flex h-8 w-[67px] rounded-full opacity-100 lg:opacity-0" />
            )}
          </div>
        </div>

        <div className="w-full min-w-0">
          <div className="flex min-h-[48px] min-w-0 items-end">
            <div className="flex min-w-0 items-end gap-2">
              <Skeleton className="h-6 w-48 max-w-[70%]" />
            </div>
          </div>
          <div className="mt-1.5 flex w-full min-w-0 items-center justify-between gap-3 text-base text-legend">
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-6 w-20 shrink-0" />
          </div>
        </div>
      </div>

      {chartPlacement === 'body' && (
        <PerformanceChartSkeleton className="h-52" />
      )}
    </div>
    <FeatureCardAssetTickerSkeleton />
    {showTranscript ? (
      <FeatureCardTranscriptSkeleton />
    ) : (
      <FeatureCardMarketCapSkeleton />
    )}
  </div>
)

export const IndexDTFFeatureCardPlaceholder = ({
  chartPlacement = 'body',
  count = HIGHLIGHTED_LIMIT,
  showTranscript = true,
}: {
  chartPlacement?: 'body' | 'header'
  count?: number
  showTranscript?: boolean
}) => (
  <>
    {Array.from({ length: count }).map((_, index) => (
      <IndexDTFFeatureCardSkeleton
        key={index}
        chartPlacement={chartPlacement}
        showTranscript={showTranscript}
      />
    ))}
  </>
)

const HighlightedDTFEndCard = ({
  dtfs,
  fullWidth,
}: {
  dtfs: HighlightedDTFItem[]
  fullWidth: boolean
}) => (
  <Link
    to={ROUTES.DISCOVER}
    className={cn(
      'group flex h-full w-full rounded-3xl border-[4px] border-card bg-secondary transition-shadow',
      'min-h-[300px] hover:bg-card hover:shadow-sm md:min-h-[460px]',
      fullWidth && 'lg:col-span-2'
    )}
  >
    <div
      className={cn(
        'flex h-full w-full flex-col justify-between rounded-2xl bg-secondary p-5 text-left',
        'group-hover:bg-card dark:bg-card dark:group-hover:bg-secondary'
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div
          className={cn(
            'flex -space-x-2 rounded-full border border-card bg-card p-1.5',
            'group-hover:border-primary dark:bg-secondary'
          )}
        >
          {dtfs.slice(0, 5).map((dtf, index) => (
            <TokenLogo
              key={`${dtf.chainId}-${dtf.address}`}
              src={dtf.brand?.icon || undefined}
              size="md"
              className="rounded-full border-2 border-card bg-card dark:border-secondary"
              style={{ zIndex: 5 - index }}
            />
          ))}
        </div>
        <span
          className={cn(
            'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-card bg-card text-primary',
            'transition-[background-color,color] group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground',
            'dark:bg-secondary dark:text-foreground'
          )}
        >
          <ArrowRight size={18} />
        </span>
      </div>
      <div className="max-w-64">
        <span className="block text-xl font-normal leading-tight text-primary transition-colors dark:text-foreground dark:group-hover:text-primary">
          <Trans>Discover all our products</Trans>
        </span>
        <span className="mt-2 block text-sm leading-5 text-legend">
          <Trans>
            Explore DTFs across broad crypto, ecosystems, yield strategies and
            more.
          </Trans>
        </span>
      </div>
    </div>
  </Link>
)

const HighlightedDTFEndCardPlaceholder = ({
  fullWidth,
}: {
  fullWidth: boolean
}) => (
  <div
    className={cn(
      'group flex h-full w-full rounded-3xl border-[4px] border-card bg-secondary transition-shadow',
      'min-h-[300px] md:min-h-[460px]',
      fullWidth && 'lg:col-span-2'
    )}
    aria-hidden="true"
  >
    <div className="flex h-full w-full flex-col justify-between rounded-2xl bg-secondary p-5 text-left dark:bg-card">
      <div className="flex items-start justify-between gap-4">
        <div className="flex -space-x-2 rounded-full border border-card bg-card p-1.5 dark:bg-secondary">
          {Array.from({ length: HIGHLIGHTED_LIMIT }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-5 w-5 rounded-full border-2 border-card bg-card dark:border-secondary"
              style={{ zIndex: HIGHLIGHTED_LIMIT - index }}
            />
          ))}
        </div>
        <Skeleton className="h-9 w-9 shrink-0 rounded-full border border-card bg-card" />
      </div>
      <div className="max-w-64">
        <Skeleton className="h-6 w-52 max-w-full" />
        <div className="mt-2 space-y-1.5">
          <Skeleton className="h-4 w-64 max-w-full" />
          <Skeleton className="h-4 w-48 max-w-full" />
        </div>
      </div>
    </div>
  </div>
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

  const highlighted = useMemo(() => {
    if (!data) return []

    const highlightedDtfs = data
      .filter((dtf) => !isInactiveDTF(dtf.status))
      .sort((a, b) => b.marketCap - a.marketCap)
      .slice(0, HIGHLIGHTED_LIMIT)
    const alternatePerformanceSource = highlightedDtfs.find(
      (dtf) => dtf.symbol.toUpperCase() !== 'CMC20'
    )

    return highlightedDtfs.flatMap((dtf) =>
      withHighlightedChainVersions(dtf, alternatePerformanceSource)
    )
  }, [data])

  const { scrollDistance, trackRef, viewportRef } = useHighlightedScrollMetrics<
    HTMLElement,
    HTMLDivElement
  >({
    isLoading,
    itemCount: highlighted.length,
    onScrollDistanceChange,
  })

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
        <div className="h-full">
          <div
            ref={trackRef}
            style={trackStyle}
            className={FEATURE_CARD_GRID_CLASS_NAME}
          >
            <IndexDTFFeatureCardPlaceholder count={HIGHLIGHTED_LIMIT} />
            <HighlightedDTFEndCardPlaceholder
              fullWidth={HIGHLIGHTED_LIMIT % 2 === 0}
            />
          </div>
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-secondary/0 to-secondary transition-opacity duration-200"
            style={fadeStyle}
          />
        </div>
      ) : (
        <div className="h-full">
          <CollateralAssetAnimationStyles />
          <div
            ref={trackRef}
            style={trackStyle}
            className={FEATURE_CARD_GRID_CLASS_NAME}
          >
            {highlighted.map((dtf) => (
              <IndexDTFFeatureCard
                key={`${dtf.chainId}-${dtf.address}`}
                dtf={dtf}
              />
            ))}
            <HighlightedDTFEndCard
              dtfs={highlighted}
              fullWidth={highlighted.length % 2 === 0}
            />
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
