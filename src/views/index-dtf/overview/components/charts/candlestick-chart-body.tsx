import { ChartContainer } from '@/components/ui/chart'
import { useIsMobile } from '@/hooks/use-media-query'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/utils'
import { formatXAxisTick as formatTick } from '@/utils/chart-formatters'
import { getPerformanceColorSet } from '@/utils/chart-performance-colors'
import { Bar, ComposedChart, Tooltip, XAxis, YAxis } from 'recharts'
import { CandlestickTooltip } from './candlestick-tooltip'
import { chartConfig, type Range } from './price-chart-constants'
import { ChartCandle, getCandleYDomain } from './use-candlestick-data'

const colors = getPerformanceColorSet('darkSurface')
const UP_COLOR = colors.positive.dot
const DOWN_COLOR = colors.negative.dot

const formatYAxisTick = (value: number) =>
  '$' + formatCurrency(value, value >= 1000 ? 0 : value < 1 ? 4 : 2)

// Show ~4 ticks on mobile / ~6 on desktop on a category axis by skipping
// candles between rendered ticks.
const getCategoryInterval = (length: number, isMobile: boolean) => {
  const desired = isMobile ? 4 : 6
  if (length <= desired) return 0
  return Math.floor(length / desired)
}

// Vertical reference line that follows the hovered candle. recharts passes the
// cursor element either line-style (`points`) or rect-style (`x`/`width`).
type CandleCursorProps = {
  points?: { x: number; y: number }[]
  x?: number
  y?: number
  width?: number
  height?: number
}

const CandleCursor = ({ points, x, y, width, height }: CandleCursorProps) => {
  let centerX: number | undefined
  let y1: number | undefined
  let y2: number | undefined

  if (points && points.length >= 2) {
    centerX = points[0].x
    y1 = points[0].y
    y2 = points[1].y
  } else if (x !== undefined) {
    centerX = x + (width ?? 0) / 2
    y1 = y ?? 0
    y2 = (y ?? 0) + (height ?? 0)
  }

  if (centerX === undefined || y1 === undefined || y2 === undefined) return null

  return (
    <line
      x1={centerX}
      y1={y1}
      x2={centerX}
      y2={y2}
      stroke="#E5EEFA"
      strokeOpacity={0.35}
      strokeWidth={1}
      strokeDasharray="4 4"
    />
  )
}

type CandleShapeProps = {
  x?: number
  y?: number
  width?: number
  height?: number
  payload?: ChartCandle
}

const Candle = ({ x, y, width, height, payload }: CandleShapeProps) => {
  if (
    x === undefined ||
    y === undefined ||
    width === undefined ||
    height === undefined ||
    !payload
  ) {
    return null
  }

  const { open, close, high, low } = payload
  const isUp = close >= open
  const color = isUp ? UP_COLOR : DOWN_COLOR
  const centerX = x + width / 2
  const bodyWidth = Math.max(width * 0.85, 1.5)
  const bodyX = centerX - bodyWidth / 2

  // Degenerate candle (no range) — draw a flat line across the body.
  if (height <= 0 || high <= low) {
    return (
      <line
        x1={bodyX}
        y1={y}
        x2={bodyX + bodyWidth}
        y2={y}
        stroke={color}
        strokeWidth={1}
      />
    )
  }

  // The Bar spans low -> high, so `height` px == (high - low) in price.
  const pixelsPerPrice = height / (high - low)
  const bodyTop = Math.max(open, close)
  const bodyBottom = Math.min(open, close)
  const bodyY = y + (high - bodyTop) * pixelsPerPrice
  const bodyHeight = Math.max((bodyTop - bodyBottom) * pixelsPerPrice, 1)

  return (
    <g>
      <line
        x1={centerX}
        y1={y}
        x2={centerX}
        y2={y + height}
        stroke={color}
        strokeWidth={1}
      />
      <rect
        x={bodyX}
        y={bodyY}
        width={bodyWidth}
        height={bodyHeight}
        fill={color}
        stroke={color}
      />
    </g>
  )
}

const CandlestickChartBody = ({
  candles,
  range,
  dtfStart,
  className,
}: {
  candles: ChartCandle[]
  range: Range
  dtfStart?: number
  className?: string
}) => {
  const isMobile = useIsMobile()

  const visibleRangeSeconds =
    candles.length > 1
      ? candles[candles.length - 1].timestamp - candles[0].timestamp
      : undefined
  const formatXAxisTick = (timestamp: number) =>
    formatTick(timestamp, range, dtfStart, visibleRangeSeconds)

  return (
    <ChartContainer config={chartConfig} className={cn('w-full', className)}>
      <ComposedChart
        data={candles}
        margin={{ left: 0, right: 0, top: 5, bottom: 5 }}
        barCategoryGap="5%"
        {...{ overflow: 'visible' }}
      >
        <XAxis
          dataKey="timestamp"
          tick={{ fontSize: 13, opacity: 0.7 }}
          tickFormatter={formatXAxisTick}
          className="[&_.recharts-cartesian-axis-tick_text]:!fill-white"
          axisLine={false}
          tickLine={false}
          interval={getCategoryInterval(candles.length, isMobile)}
          tickMargin={10}
          minTickGap={20}
        />
        <YAxis
          orientation="right"
          tick={{ fontSize: 13, opacity: 0.7 }}
          tickFormatter={formatYAxisTick}
          className="[&_.recharts-cartesian-axis-tick_text]:!fill-white"
          axisLine={false}
          tickLine={false}
          domain={getCandleYDomain(candles)}
          width={55}
          tickCount={5}
          tickMargin={5}
        />
        <Tooltip content={<CandlestickTooltip />} cursor={<CandleCursor />} />
        <Bar
          dataKey="highLow"
          shape={<Candle />}
          maxBarSize={18}
          isAnimationActive
          animationDuration={500}
          animationEasing="ease-in-out"
        />
      </ComposedChart>
    </ChartContainer>
  )
}

export default CandlestickChartBody
