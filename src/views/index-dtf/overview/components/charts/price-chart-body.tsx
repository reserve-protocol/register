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
  formatXAxisTick as formatTick,
  TimeRange,
} from '@/utils/chart-formatters'
import {
  getPerformanceColorSet,
  getPerformanceDirection,
  PERFORMANCE_COLORS,
} from '@/utils/chart-performance-colors'
import { useAtomValue } from 'jotai'
import { useEffect, useId, useRef, useState, type ComponentProps } from 'react'
import {
  AreaChart,
  Customized,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { avgApyAtom, dataTypeAtom } from './price-chart-atoms'
import { chartConfig, DataType } from './price-chart-constants'
import { renderPriceChartDefs } from './price-chart-defs'
import { PriceChartLaunchMarker } from './price-chart-launch-marker'
import { renderPriceChartSeries } from './price-chart-series'
import { PriceTooltip, YieldTooltip } from './price-chart-tooltips'
import { useXAxisTicks } from './use-price-chart-data'
import { inspectionFromPayload, type ChartInspection } from './chart-inspection'
import {
  ChartLatestPointMarker,
  getYAxisPresentation,
  type ChartCustomizedProps,
  useDisplayedYAxisLabelWidth,
} from './chart-presentation'

type ChartPoint = {
  timestamp: number
  [key: string]: number | undefined
}

type PriceChartBodyProps = {
  chartData: ChartPoint[]
  range: TimeRange
  dtfStart?: number
  launchTimestamp?: number
  useLaunchLabel?: boolean
  launchMarkerVariant?: 'annotation'
  xDomain?: readonly [number, number]
  className?: string
  onInspect?: (point: ChartInspection) => void
  latestPointMarker?: { ringColor: string }
  tooltipContent?: React.ReactElement
  yAxisPresentation?: 'compact'
}

const buildYAxisFormatter =
  (dataType: DataType, isBTCMode: boolean, isYieldMode: boolean) =>
  (value: number) => {
    if (isYieldMode) return formatPercentage(value)
    if (dataType === 'totalSupply') return formatCurrency(value, 0)
    if (isBTCMode) return '₿' + formatToSignificantDigits(value)
    return '$' + formatCurrency(value, value >= 1000 ? 0 : value < 1 ? 4 : 2)
  }

export const ChartSkeleton = ({ className }: { className?: string }) => (
  <div className="sm:ml-6" data-testid="overview-chart-skeleton">
    <Skeleton
      className={cn('w-full rounded-xl bg-muted-foreground/10', className)}
    />
  </div>
)

const PriceChartBody = ({
  chartData,
  range,
  dtfStart,
  launchTimestamp,
  useLaunchLabel = false,
  launchMarkerVariant,
  xDomain,
  className,
  onInspect,
  latestPointMarker,
  tooltipContent,
  yAxisPresentation,
}: PriceChartBodyProps) => {
  const dataType = useAtomValue(dataTypeAtom)
  const avgApy = useAtomValue(avgApyAtom)
  const isMobile = useIsMobile()
  const isYieldMode = dataType === 'yield'
  const isBTCMode = dataType === 'priceBTC'
  const xAxisTicks = useXAxisTicks(chartData, isMobile, xDomain)
  const chartKey: DataType | 'totalAPY' = isYieldMode ? 'totalAPY' : dataType
  const chartId = useId().replace(/:/g, '')
  const chartRef = useRef<HTMLDivElement>(null)
  const [chartHeight, setChartHeight] = useState(0)
  const [inspectedMarkerPoint, setInspectedMarkerPoint] =
    useState<ChartInspection>()

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
  const usePerformanceColors = dataType === 'price'
  const performanceDirection = getPerformanceDirection(
    chartData
      .map((point) => point.price)
      .filter((value): value is number => value !== undefined)
      .map((value) => ({ value }))
  )
  const overviewPriceColors = getPerformanceColorSet()
  const priceStrokeGradientId = `${chartId}-overview-price-stroke`
  const priceLineShadowFilterId = `${chartId}-overview-price-line-shadow`
  const dotsPatternId = `${chartId}-overview-dots`
  const preLaunchDotsPatternId = `${chartId}-overview-pre-launch-dots`
  const fillGradientId = `${chartId}-overview-fill`
  const dotsFadeGradientId = `${chartId}-overview-dots-fade`
  const dotsMaskId = `${chartId}-overview-dots-mask`
  const strokeColor = usePerformanceColors
    ? performanceDirection === 'positive' || performanceDirection === 'negative'
      ? `url(#${priceStrokeGradientId})`
      : overviewPriceColors.neutral.stroke
    : isYieldMode
      ? PERFORMANCE_COLORS.positive.dot
      : '#E5EEFA'
  const performanceDotColor =
    performanceDirection === 'positive' || performanceDirection === 'negative'
      ? overviewPriceColors[performanceDirection].dot
      : overviewPriceColors.neutral.dot
  const dotFillColor = usePerformanceColors ? performanceDotColor : '#E5EEFA'
  const fill = isYieldMode ? 'url(#yieldGradient)' : `url(#${dotsPatternId})`
  const postLaunchFill =
    usePerformanceColors && performanceDirection !== 'neutral'
      ? `url(#${fillGradientId})`
      : fill
  const preLaunchFill = fill
  const latestPoint = latestPointMarker
    ? [...chartData].reverse().find((point) => {
        const value = point[chartKey]
        return Number.isFinite(point.timestamp) && Number.isFinite(value)
      })
    : undefined
  const latestMarkerPoint =
    latestPoint && latestPoint[chartKey] !== undefined
      ? { timestamp: latestPoint.timestamp, value: latestPoint[chartKey] }
      : undefined
  const finiteYAxisValues = chartData.flatMap((point) => {
    const value = point[chartKey]
    return Number.isFinite(value) ? [value as number] : []
  })
  const yAxisMeasurementKey = `${range}:${chartHeight}:${chartKey}:${finiteYAxisValues.length}:${Math.min(...finiteYAxisValues)}:${Math.max(...finiteYAxisValues)}`
  const yAxisLabelWidth = useDisplayedYAxisLabelWidth({
    enabled: yAxisPresentation === 'compact' && !isMobile,
    measurementKey: yAxisMeasurementKey,
    rootRef: chartRef,
  })
  const yAxis = getYAxisPresentation({
    isCompact: yAxisPresentation === 'compact',
    isMobile,
    labelWidth: yAxisLabelWidth,
    plotEdgeInset: latestPointMarker ? 3 : 0,
  })
  const inspectSample: ComponentProps<typeof AreaChart>['onMouseMove'] =
    onInspect || latestPointMarker
      ? (state) => {
          const point = inspectionFromPayload(state?.activePayload, chartKey)
          if (point) {
            onInspect?.(point)
            if (latestPointMarker) setInspectedMarkerPoint(point)
          }
        }
      : undefined
  const resetMarker = latestPointMarker
    ? () => setInspectedMarkerPoint(undefined)
    : undefined

  useEffect(() => {
    if (!latestPointMarker || !chartRef.current) return
    const element = chartRef.current
    const updateHeight = () => setChartHeight(element.clientHeight)
    updateHeight()
    const observer = new ResizeObserver(updateHeight)
    observer.observe(element)
    return () => observer.disconnect()
  }, [latestPointMarker])

  return (
    <ChartContainer
      ref={chartRef}
      config={chartConfig}
      className={cn('w-full', className)}
      onBlur={resetMarker}
      onPointerLeave={
        resetMarker
          ? (event) => {
              if (event.pointerType === 'mouse') resetMarker()
            }
          : undefined
      }
    >
      <AreaChart
        data={segmentedChartData}
        accessibilityLayer={onInspect ? true : undefined}
        onMouseDown={inspectSample}
        onMouseMove={inspectSample}
        margin={{ left: 0, right: 0, top: 5, bottom: 5 }}
        {...{ overflow: 'visible' }}
      >
        {renderPriceChartDefs({
          dotFillColor,
          dotsFadeGradientId,
          dotsMaskId,
          dotsPatternId,
          fillGradientId,
          isYieldMode,
          performanceDirection,
          preLaunchDotsPatternId,
          priceColors: overviewPriceColors,
          priceLineShadowFilterId,
          priceStrokeGradientId,
          strokeGradientCoordinates:
            latestPointMarker && chartHeight > 0
              ? {
                  top: 10,
                  bottom: chartHeight - (isMobile ? 10 : 40),
                }
              : undefined,
          usePerformanceColors,
        })}
        <XAxis
          dataKey="timestamp"
          type="number"
          domain={xDomain ? [...xDomain] : ['dataMin', 'dataMax']}
          tick={isMobile ? false : { fontSize: 13, opacity: 0.7 }}
          height={isMobile ? 0 : undefined}
          tickFormatter={formatXAxisTick}
          className="[&_.recharts-cartesian-axis-tick_text]:!fill-muted-foreground"
          axisLine={false}
          tickLine={false}
          interval="preserveStart"
          ticks={xAxisTicks}
          tickMargin={10}
          padding={latestPointMarker ? { left: 4, right: 4 } : undefined}
        />
        <YAxis
          dataKey={chartKey}
          orientation="right"
          tick={yAxis.tick}
          tickFormatter={formatYAxisTick}
          className="[&_.recharts-cartesian-axis-tick_text]:!fill-muted-foreground"
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
          width={yAxis.width}
          tickCount={5}
          tickMargin={yAxis.tickMargin}
          tickSize={yAxis.tickSize}
          padding={latestPointMarker ? { top: 4, bottom: 4 } : undefined}
        />
        <Tooltip
          content={
            onInspect ? (
              () => null
            ) : isYieldMode ? (
              <YieldTooltip />
            ) : (
              (tooltipContent ?? <PriceTooltip dataType={dataType} />)
            )
          }
        />
        {isYieldMode && avgApy > 0 && (
          <ReferenceLine
            y={avgApy}
            stroke="hsl(var(--foreground))"
            strokeDasharray="4 4"
            strokeOpacity={0.4}
            label={{
              value: `Avg ${formatPercentage(avgApy)}`,
              position: 'insideBottomRight',
              fill: 'hsl(var(--foreground))',
              fontSize: 12,
              opacity: 0.8,
            }}
          />
        )}
        {renderPriceChartSeries({
          chartKey,
          dotsMaskId,
          fill: postLaunchFill,
          isYieldMode,
          preLaunchFill,
          priceLineShadowFilterId,
          shouldSplit,
          strokeColor,
          activeDot: latestPointMarker ? false : undefined,
        })}
        {latestPointMarker && chartHeight > 0 && (
          <Customized
            component={(props: ChartCustomizedProps) => (
              <ChartLatestPointMarker
                {...props}
                fill={strokeColor}
                isInspecting={Boolean(inspectedMarkerPoint)}
                point={inspectedMarkerPoint ?? latestMarkerPoint}
                ringColor={latestPointMarker.ringColor}
              />
            )}
          />
        )}
        <Customized
          component={(props: {
            offset?: { top: number; height: number; width?: number }
            width?: number
            xAxisMap?: Record<
              string | number,
              { scale?: (value: number) => number }
            >
          }) => (
            <PriceChartLaunchMarker
              {...props}
              launchTimestamp={launchTimestamp}
              useLaunchLabel={useLaunchLabel}
              variant={launchMarkerVariant}
              visible={showLaunchLine}
            />
          )}
        />
      </AreaChart>
    </ChartContainer>
  )
}

export default PriceChartBody
