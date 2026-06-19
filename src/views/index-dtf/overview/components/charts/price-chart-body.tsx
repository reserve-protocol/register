import { ChartContainer } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { useIsMobile } from '@/hooks/use-media-query'
import { cn } from '@/lib/utils'
import {
  formatCurrency,
  formatPercentage,
  formatToSignificantDigits,
} from '@/utils'
import { getLaunchSegmentData } from '@/utils/chart-launch-segments'
import {
  getPerformanceColorSet,
  getPerformanceDirection,
  getPerformanceStroke,
} from '@/utils/chart-performance-colors'
import {
  formatXAxisTick as formatTick,
  TimeRange,
} from '@/utils/chart-formatters'
import { useAtomValue } from 'jotai'
import { useId } from 'react'
import {
  Area,
  AreaChart,
  Customized,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { avgApyAtom, dataTypeAtom } from './price-chart-atoms'
import { chartConfig, DataType } from './price-chart-constants'
import { PriceTooltip, YieldTooltip } from './price-chart-tooltips'
import { useXAxisTicks } from './use-price-chart-data'

type ChartPoint = {
  timestamp: number
  [key: string]: number | undefined
}

type LaunchMarkerProps = {
  launchTimestamp?: number
  symbol?: string
  visible: boolean
}

const buildYAxisFormatter =
  (dataType: DataType, isBTCMode: boolean, isYieldMode: boolean) =>
  (value: number) => {
    if (isYieldMode) return formatPercentage(value)
    if (dataType === 'totalSupply') return formatCurrency(value, 0)
    if (isBTCMode) return '₿' + formatToSignificantDigits(value)
    return '$' + formatCurrency(value, value >= 1000 ? 0 : value < 1 ? 4 : 2)
  }

const LaunchMarker = ({
  launchTimestamp,
  symbol,
  visible,
  xAxisMap,
  offset,
  width,
}: LaunchMarkerProps & {
  xAxisMap?: Record<string, { scale?: (value: number) => number }>
  offset?: { top: number; height: number; width?: number }
  width?: number
}) => {
  const xScale = xAxisMap?.[0]?.scale

  if (!visible || launchTimestamp === undefined || !xScale || !offset) {
    return null
  }

  const x = xScale(launchTimestamp)
  const markerX = Math.round(x) + 0.5
  const lineTop = offset.top + 6
  const labelHeight = 18
  const labelY = offset.top + offset.height - labelHeight - 10
  const lineBottom = labelY
  const lineColor = 'rgba(255, 255, 255, 0.65)'
  const chartWidth = width ?? offset.width ?? markerX * 2
  const launchedLabel = 'DTF Created'
  const launchedLabelWidth = 74
  const segmentLabelWidth = 112
  const segmentLabelGap = 10
  const labelPaddingX = 8
  const launchedLabelX = Math.min(
    Math.max(markerX - launchedLabelWidth / 2, labelPaddingX),
    chartWidth - launchedLabelWidth - labelPaddingX
  )
  const leftLabelX = Math.min(
    Math.max(
      markerX - launchedLabelWidth / 2 - segmentLabelGap - segmentLabelWidth,
      labelPaddingX
    ),
    chartWidth - segmentLabelWidth - labelPaddingX
  )
  const launchedLabelLeft = launchedLabelX
  const showLeftLabel =
    leftLabelX + segmentLabelWidth + segmentLabelGap <= launchedLabelLeft

  return (
    <g aria-hidden="true" pointerEvents="none">
      <line
        x1={markerX}
        x2={markerX}
        y1={lineTop}
        y2={lineBottom}
        stroke={lineColor}
        strokeDasharray="3 4"
        strokeWidth={1}
        style={{
          filter: 'drop-shadow(0 0 3px rgba(0, 0, 0, 0.22))',
        }}
      />
      {showLeftLabel && (
        <text
          x={leftLabelX + segmentLabelWidth}
          y={labelY + 11}
          fill="rgba(255, 255, 255, 0.58)"
          fontSize={10}
          textAnchor="end"
        >
          Backtracked basket price
        </text>
      )}
      <foreignObject
        x={launchedLabelX}
        y={labelY}
        width={launchedLabelWidth}
        height={labelHeight}
      >
        <div
          style={{
            alignItems: 'center',
            background: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: 9999,
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.16)',
            boxSizing: 'border-box',
            color: 'hsl(var(--card-foreground))',
            display: 'flex',
            fontSize: 10,
            fontWeight: 500,
            height: labelHeight,
            justifyContent: 'center',
            lineHeight: 1,
            padding: '1px 7px',
            whiteSpace: 'nowrap',
            width: launchedLabelWidth,
          }}
        >
          {launchedLabel}
        </div>
      </foreignObject>
    </g>
  )
}

export const ChartSkeleton = ({ className }: { className?: string }) => (
  <Skeleton className={cn('w-full rounded-lg', className)} />
)

const PriceChartBody = ({
  chartData,
  range,
  dtfStart,
  launchTimestamp,
  launchMarkerToken,
  xDomain,
  className,
}: {
  chartData: ChartPoint[]
  range: TimeRange
  dtfStart?: number
  launchTimestamp?: number
  launchMarkerToken?: {
    symbol?: string
  }
  xDomain?: readonly [number, number]
  className?: string
}) => {
  const dataType = useAtomValue(dataTypeAtom)
  const avgApy = useAtomValue(avgApyAtom)
  const isMobile = useIsMobile()
  const isYieldMode = dataType === 'yield'
  const isBTCMode = dataType === 'priceBTC'
  const xAxisTicks = useXAxisTicks(chartData, isMobile, xDomain)
  const chartKey: DataType | 'totalAPY' = isYieldMode ? 'totalAPY' : dataType
  const usePerformanceColors = dataType === 'price'
  const chartId = useId().replace(/:/g, '')

  const formatYAxisTick = buildYAxisFormatter(dataType, isBTCMode, isYieldMode)
  const visibleRangeSeconds = xDomain
    ? xDomain[1] - xDomain[0]
    : chartData.length > 1
      ? chartData[chartData.length - 1].timestamp - chartData[0].timestamp
      : undefined
  const formatXAxisTick = (timestamp: number) =>
    formatTick(timestamp, range, dtfStart, visibleRangeSeconds)
  const { data: segmentedChartData, shouldSplit } = getLaunchSegmentData(
    chartData,
    chartKey,
    launchTimestamp
  )
  const showLaunchLine =
    launchTimestamp !== undefined &&
    (xDomain
      ? launchTimestamp >= xDomain[0] && launchTimestamp <= xDomain[1]
      : chartData.length > 0 &&
        launchTimestamp >= chartData[0].timestamp &&
        launchTimestamp <= chartData[chartData.length - 1].timestamp)
  const performanceDirection = getPerformanceDirection(
    chartData
      .map((point) => point.price)
      .filter((value): value is number => value !== undefined)
      .map((value) => ({ value }))
  )
  const priceStrokeGradientId = 'overview-price-performance-stroke'
  const overviewPriceColors = getPerformanceColorSet('darkSurface')
  const dotsPatternId = `${chartId}-overview-dots`
  const preLaunchDotsPatternId = `${chartId}-overview-pre-launch-dots`
  const dotsFadeGradientId = `${chartId}-overview-dots-fade`
  const dotsMaskId = `${chartId}-overview-dots-mask`
  const strokeColor = usePerformanceColors
    ? getPerformanceStroke(
        performanceDirection,
        priceStrokeGradientId,
        'darkSurface'
      )
    : isYieldMode
      ? '#4ADE80'
      : '#E5EEFA'
  const preLaunchStrokeColor = usePerformanceColors
    ? overviewPriceColors.preLaunch.stroke
    : 'rgba(229, 238, 250, 0.45)'
  const performanceDotColor =
    performanceDirection === 'positive' || performanceDirection === 'negative'
      ? overviewPriceColors[performanceDirection].dot
      : overviewPriceColors.neutral.dot
  const dotFillColor = usePerformanceColors ? performanceDotColor : '#E5EEFA'
  const fill = isYieldMode ? 'url(#yieldGradient)' : `url(#${dotsPatternId})`
  const preLaunchFill = usePerformanceColors
    ? `url(#${preLaunchDotsPatternId})`
    : fill

  return (
    <ChartContainer config={chartConfig} className={cn('w-full', className)}>
      <AreaChart
        data={segmentedChartData}
        margin={{ left: 0, right: 0, top: 5, bottom: 5 }}
        {...{ overflow: 'visible' }}
      >
        <defs>
          {usePerformanceColors && performanceDirection !== 'neutral' && (
            <linearGradient
              id={priceStrokeGradientId}
              x1="0"
              y1="0"
              x2="1"
              y2="0"
            >
              {performanceDirection === 'positive' ? (
                <>
                  <stop
                    offset="0%"
                    stopColor={overviewPriceColors.positive.start}
                  />
                  <stop
                    offset="100%"
                    stopColor={overviewPriceColors.positive.end}
                  />
                </>
              ) : (
                <>
                  <stop
                    offset="0%"
                    stopColor={overviewPriceColors.negative.start}
                  />
                  <stop
                    offset="100%"
                    stopColor={overviewPriceColors.negative.end}
                  />
                </>
              )}
            </linearGradient>
          )}
          {isYieldMode ? (
            <linearGradient id="yieldGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4ADE80" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#4ADE80" stopOpacity={0} />
            </linearGradient>
          ) : (
            <pattern
              id={dotsPatternId}
              x="0"
              y="0"
              width="3"
              height="3"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="1" cy="1" r="0.4" fill={dotFillColor} opacity="1" />
            </pattern>
          )}
          {!isYieldMode && (
            <>
              <pattern
                id={preLaunchDotsPatternId}
                x="0"
                y="0"
                width="3"
                height="3"
                patternUnits="userSpaceOnUse"
              >
                <circle
                  cx="1"
                  cy="1"
                  r="0.4"
                  fill={overviewPriceColors.preLaunch.dot}
                  opacity={overviewPriceColors.preLaunch.dotOpacity}
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
            </>
          )}
        </defs>
        <XAxis
          dataKey="timestamp"
          type="number"
          domain={xDomain ? [...xDomain] : ['dataMin', 'dataMax']}
          tick={{ fontSize: 13, opacity: 0.7 }}
          tickFormatter={formatXAxisTick}
          className="[&_.recharts-cartesian-axis-tick_text]:!fill-white"
          axisLine={false}
          tickLine={false}
          interval="preserveStart"
          ticks={xAxisTicks}
          tickMargin={10}
        />
        <YAxis
          dataKey={chartKey}
          orientation="right"
          tick={{ fontSize: 13, opacity: 0.7 }}
          tickFormatter={formatYAxisTick}
          className="[&_.recharts-cartesian-axis-tick_text]:!fill-white"
          axisLine={false}
          tickLine={false}
          domain={
            isBTCMode
              ? [
                  (dataMin: number) => dataMin * 0.9,
                  (dataMax: number) => dataMax * 1.1,
                ]
              : ['auto', 'auto']
          }
          width={55}
          tickCount={5}
          tickMargin={5}
        />
        <Tooltip
          content={
            isYieldMode ? (
              <YieldTooltip />
            ) : (
              <PriceTooltip dataType={dataType} />
            )
          }
        />
        {isYieldMode && avgApy > 0 && (
          <ReferenceLine
            y={avgApy}
            stroke="#fff"
            strokeDasharray="4 4"
            strokeOpacity={0.4}
            label={{
              value: `Avg ${formatPercentage(avgApy)}`,
              position: 'insideBottomRight',
              fill: '#fff',
              fontSize: 12,
              opacity: 0.8,
            }}
          />
        )}
        {shouldSplit ? (
          <>
            <Area
              type="monotone"
              dataKey="preLaunchValue"
              stroke="none"
              fill={preLaunchFill}
              mask={!isYieldMode ? `url(#${dotsMaskId})` : undefined}
              isAnimationActive={true}
              animationDuration={500}
              animationEasing="ease-in-out"
            />
            <Area
              type="monotone"
              dataKey="postLaunchValue"
              stroke="none"
              fill={fill}
              mask={!isYieldMode ? `url(#${dotsMaskId})` : undefined}
              isAnimationActive={true}
              animationDuration={500}
              animationEasing="ease-in-out"
            />
            <Area
              type="monotone"
              dataKey="preLaunchValue"
              stroke={preLaunchStrokeColor}
              strokeWidth={1.5}
              fill="transparent"
              isAnimationActive={true}
              animationDuration={500}
              animationEasing="ease-in-out"
            />
            <Area
              type="monotone"
              dataKey="postLaunchValue"
              stroke={strokeColor}
              strokeWidth={1.5}
              fill="transparent"
              isAnimationActive={true}
              animationDuration={500}
              animationEasing="ease-in-out"
            />
          </>
        ) : (
          <>
            <Area
              type="monotone"
              dataKey={chartKey}
              stroke="none"
              fill={fill}
              mask={!isYieldMode ? `url(#${dotsMaskId})` : undefined}
              isAnimationActive={true}
              animationDuration={500}
              animationEasing="ease-in-out"
            />
            <Area
              type="monotone"
              dataKey={chartKey}
              stroke={strokeColor}
              strokeWidth={1.5}
              fill="transparent"
              isAnimationActive={true}
              animationDuration={500}
              animationEasing="ease-in-out"
            />
          </>
        )}
        <Customized
          component={(props: any) => (
            <LaunchMarker
              {...props}
              launchTimestamp={launchTimestamp}
              symbol={launchMarkerToken?.symbol}
              visible={showLaunchLine}
            />
          )}
        />
      </AreaChart>
    </ChartContainer>
  )
}

export default PriceChartBody
