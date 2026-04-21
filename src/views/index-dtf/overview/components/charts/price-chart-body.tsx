import { ChartContainer } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { useIsMobile } from '@/hooks/use-media-query'
import { cn } from '@/lib/utils'
import {
  formatCurrency,
  formatPercentage,
  formatToSignificantDigits,
} from '@/utils'
import {
  formatXAxisTick as formatTick,
  TimeRange,
} from '@/utils/chart-formatters'
import { useAtomValue } from 'jotai'
import {
  Area,
  AreaChart,
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

const YieldGradient = () => (
  <linearGradient id="yieldGradient" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stopColor="#4ADE80" stopOpacity={0.3} />
    <stop offset="100%" stopColor="#4ADE80" stopOpacity={0} />
  </linearGradient>
)

const DotsPattern = () => (
  <pattern
    id="dots"
    x="0"
    y="0"
    width="3"
    height="3"
    patternUnits="userSpaceOnUse"
  >
    <circle cx="1" cy="1" r="0.4" fill="#E5EEFA" opacity="1" />
  </pattern>
)

const ChartDefs = ({ isYieldMode }: { isYieldMode: boolean }) => (
  <defs>{isYieldMode ? <YieldGradient /> : <DotsPattern />}</defs>
)

const ChartTooltip = ({ dataType }: { dataType: DataType }) => {
  if (dataType === 'yield') return <YieldTooltip />
  return <PriceTooltip dataType={dataType} />
}

const AvgApyReferenceLine = () => {
  const avgApy = useAtomValue(avgApyAtom)
  if (avgApy <= 0) return null

  return (
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
  )
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
  <Skeleton className={cn('w-full rounded-lg', className)} />
)

const PriceChartBody = ({
  chartData,
  range,
  dtfStart,
  className,
}: {
  chartData: ChartPoint[]
  range: TimeRange
  dtfStart?: number
  className?: string
}) => {
  const dataType = useAtomValue(dataTypeAtom)
  const isMobile = useIsMobile()
  const isYieldMode = dataType === 'yield'
  const isBTCMode = dataType === 'priceBTC'
  const xAxisTicks = useXAxisTicks(chartData, isMobile)
  const chartKey: DataType | 'totalAPY' = isYieldMode ? 'totalAPY' : dataType

  const formatYAxisTick = buildYAxisFormatter(dataType, isBTCMode, isYieldMode)
  const formatXAxisTick = (timestamp: number) =>
    formatTick(timestamp, range, dtfStart)

  return (
    <ChartContainer config={chartConfig} className={cn('w-full', className)}>
      <AreaChart
        data={chartData}
        margin={{ left: 0, right: 0, top: 5, bottom: 5 }}
        {...{ overflow: 'visible' }}
      >
        <ChartDefs isYieldMode={isYieldMode} />
        <XAxis
          dataKey="timestamp"
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
        <Tooltip content={<ChartTooltip dataType={dataType} />} />
        {isYieldMode && <AvgApyReferenceLine />}
        <Area
          type="monotone"
          dataKey={chartKey}
          stroke={isYieldMode ? '#4ADE80' : '#E5EEFA'}
          strokeWidth={1.5}
          fill={isYieldMode ? 'url(#yieldGradient)' : 'url(#dots)'}
          isAnimationActive={true}
          animationDuration={500}
          animationEasing="ease-in-out"
        />
      </AreaChart>
    </ChartContainer>
  )
}

export default PriceChartBody
