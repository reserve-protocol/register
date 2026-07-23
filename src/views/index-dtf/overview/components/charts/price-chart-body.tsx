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
import { useId } from 'react'
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

type ChartPoint = {
  timestamp: number
  [key: string]: number | undefined
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
  xDomain,
  className,
}: {
  chartData: ChartPoint[]
  range: TimeRange
  dtfStart?: number
  launchTimestamp?: number
  useLaunchLabel?: boolean
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

  return (
    <ChartContainer config={chartConfig} className={cn('w-full', className)}>
      <AreaChart
        data={segmentedChartData}
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
        />
        <YAxis
          dataKey={chartKey}
          orientation="right"
          tick={
            isMobile
              ? false
              : { fontSize: 13, opacity: 0.7, textAnchor: 'end', dx: 44 }
          }
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
          width={isMobile ? 0 : 55}
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
        })}
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
              visible={showLaunchLine}
            />
          )}
        />
      </AreaChart>
    </ChartContainer>
  )
}

export default PriceChartBody
