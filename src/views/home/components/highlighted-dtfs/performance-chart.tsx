import { ChartConfig, ChartContainer } from '@/components/ui/chart'
import { useIsDesktop } from '@/hooks/use-media-query'
import { cn } from '@/lib/utils'
import { getLaunchSegmentData } from '@/utils/chart-launch-segments'
import {
  PERFORMANCE_COLORS,
  type PerformanceDirection,
} from '@/utils/chart-performance-colors'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Area, AreaChart, Tooltip, XAxis, YAxis } from 'recharts'
import type { FeaturedDTFItem } from '../../hooks/use-featured-dtfs'
import {
  PerformanceChartLaunchMarker,
  type LaunchMarkerToken,
} from './performance-chart-launch-marker'
import { PERFORMANCE_CHART_FADE_CLASSNAME } from './constants'
import { getPaddedValueDomain } from './utils'

export { PerformanceChartSkeleton } from './performance-chart-skeleton'
export { PERFORMANCE_CHART_FADE_CLASSNAME } from './constants'

const chartConfig = {
  performance: {
    label: 'Performance',
    color: 'currentColor',
  },
} satisfies ChartConfig

export const PerformanceChart = ({
  chartKey,
  className,
  direction,
  fadeClassName = PERFORMANCE_CHART_FADE_CLASSNAME,
  launchMarkerToken,
  launchTimestamp,
  performance,
  showPattern = true,
}: {
  chartKey: string
  className: string
  direction: PerformanceDirection
  fadeClassName?: string
  launchMarkerToken?: LaunchMarkerToken
  launchTimestamp?: number
  performance: FeaturedDTFItem['performance']
  showPattern?: boolean
}) => {
  const [isLaunchMarkerActive, setIsLaunchMarkerActive] = useState(false)
  const [chartWidth, setChartWidth] = useState(0)
  const isDesktop = useIsDesktop()
  const isLaunchMarkerVisible = !isDesktop || isLaunchMarkerActive
  const isLaunchMarkerLineActive = isDesktop && isLaunchMarkerActive
  const chartRef = useRef<HTMLDivElement>(null)
  const dotsPatternId = useId().replace(/:/g, '')
  const preLaunchDotsPatternId = `${dotsPatternId}-pre-launch`
  const dotsFadeGradientId = `${dotsPatternId}-fade`
  const dotsMaskId = `${dotsPatternId}-mask`
  const { data: segmentedPerformance, shouldSplit } = useMemo(
    () => getLaunchSegmentData(performance, 'value', launchTimestamp),
    [launchTimestamp, performance]
  )
  const launchMarkerLeftPercent = useMemo(() => {
    if (launchTimestamp === undefined || performance.length < 2)
      return undefined

    const firstTimestamp = performance[0].timestamp
    const lastTimestamp = performance[performance.length - 1].timestamp
    const rangeSeconds = lastTimestamp - firstTimestamp

    if (
      rangeSeconds <= 0 ||
      launchTimestamp < firstTimestamp ||
      launchTimestamp > lastTimestamp
    ) {
      return undefined
    }

    return Math.min(
      100,
      Math.max(0, ((launchTimestamp - firstTimestamp) / rangeSeconds) * 100)
    )
  }, [launchTimestamp, performance])
  const performanceColor =
    direction === 'positive'
      ? PERFORMANCE_COLORS.positive.end
      : direction === 'negative'
        ? PERFORMANCE_COLORS.negative.end
        : PERFORMANCE_COLORS.neutral.stroke
  const performanceDotColor =
    direction === 'positive'
      ? PERFORMANCE_COLORS.positive.dot
      : direction === 'negative'
        ? PERFORMANCE_COLORS.negative.dot
        : PERFORMANCE_COLORS.neutral.dot

  useEffect(() => {
    const element = chartRef.current
    if (!element) return

    const updateChartWidth = () => setChartWidth(element.offsetWidth)
    updateChartWidth()

    const observer = new ResizeObserver(updateChartWidth)
    observer.observe(element)

    return () => observer.disconnect()
  }, [])

  return (
    <div ref={chartRef} className="relative">
      <ChartContainer
        key={chartKey}
        config={chartConfig}
        className={cn('pointer-events-none w-full', className)}
      >
        <AreaChart
          data={segmentedPerformance}
          margin={{ left: 0, right: 0, top: 6, bottom: 0 }}
          {...{ overflow: 'visible' }}
        >
          <defs>
            <pattern
              id={dotsPatternId}
              x="0"
              y="0"
              width="3"
              height="3"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="1" cy="1" r="0.45" fill={performanceDotColor} />
            </pattern>
            <pattern
              id={preLaunchDotsPatternId}
              x="0"
              y="0"
              width="3"
              height="3"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="1" cy="1" r="0.45" fill={performanceDotColor} />
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
          <XAxis
            dataKey="timestamp"
            type="number"
            domain={['dataMin', 'dataMax']}
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
          {showPattern && shouldSplit ? (
            <>
              <Area
                type="monotone"
                dataKey="preLaunchValue"
                stroke="none"
                fill={`url(#${preLaunchDotsPatternId})`}
                mask={`url(#${dotsMaskId})`}
                isAnimationActive
                animationDuration={500}
                animationEasing="ease-in-out"
              />
              <Area
                type="monotone"
                dataKey="postLaunchValue"
                stroke="none"
                fill={`url(#${dotsPatternId})`}
                mask={`url(#${dotsMaskId})`}
                isAnimationActive
                animationDuration={500}
                animationEasing="ease-in-out"
              />
            </>
          ) : showPattern ? (
            <Area
              type="monotone"
              dataKey="value"
              stroke="none"
              fill={`url(#${dotsPatternId})`}
              mask={`url(#${dotsMaskId})`}
              isAnimationActive
              animationDuration={500}
              animationEasing="ease-in-out"
            />
          ) : null}
          {shouldSplit ? (
            <>
              <Area
                type="monotone"
                dataKey="preLaunchValue"
                stroke={performanceColor}
                strokeDasharray="2 3"
                strokeLinecap="round"
                strokeWidth={2}
                fill="transparent"
                isAnimationActive
                animationDuration={500}
                animationEasing="ease-in-out"
              />
              <Area
                type="monotone"
                dataKey="postLaunchValue"
                stroke={performanceColor}
                strokeWidth={2}
                fill="transparent"
                isAnimationActive
                animationDuration={500}
                animationEasing="ease-in-out"
              />
            </>
          ) : (
            <Area
              type="monotone"
              dataKey="value"
              stroke={performanceColor}
              strokeWidth={2}
              fill="transparent"
              isAnimationActive
              animationDuration={500}
              animationEasing="ease-in-out"
            />
          )}
        </AreaChart>
      </ChartContainer>
      {fadeClassName && <div className={cn(fadeClassName)} />}
      {launchMarkerLeftPercent !== undefined && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute z-20 w-px opacity-65"
          style={{
            backgroundColor: isLaunchMarkerLineActive
              ? 'currentColor'
              : 'transparent',
            backgroundImage: isLaunchMarkerLineActive
              ? 'none'
              : 'repeating-linear-gradient(to bottom, currentColor 0 3px, transparent 3px 7px)',
            bottom: 26,
            color: isLaunchMarkerLineActive
              ? 'hsl(var(--primary))'
              : 'currentColor',
            filter: 'drop-shadow(0 0 3px rgba(0, 0, 0, 0.18))',
            left: `${launchMarkerLeftPercent}%`,
            top: 6,
            transform: 'translateX(-0.5px)',
          }}
        />
      )}
      {launchMarkerLeftPercent !== undefined && launchMarkerToken && (
        <PerformanceChartLaunchMarker
          chartWidth={chartWidth}
          isActive={isLaunchMarkerVisible}
          leftPercent={launchMarkerLeftPercent}
          onActiveChange={setIsLaunchMarkerActive}
          performanceDirection={direction}
          token={launchMarkerToken}
        />
      )}
    </div>
  )
}
