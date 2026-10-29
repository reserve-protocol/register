import { useState, type ComponentProps, type RefObject } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { useIsDesktop } from '@/hooks/use-media-query'
import {
  plotAxis,
  stackExtent,
  toPlotRows,
  type CategoryBucket,
  type ChartCategory,
} from './category-bar-chart-data'
import { chartSeriesFill, type ChartSeriesSlot } from './chart-panel'

const MAX_BAR_WIDTH = 24
const SEGMENT_GAP = 2
const AXIS_WIDTH = 44
const DIMMED_OPACITY = 0.5
const MIN_SEPARATED_WIDTH = 6
const DENSE_SLOT_WIDTH = 8
const PARTIAL_OPACITY = 0.5

export interface CategoryBarChartProps {
  buckets: CategoryBucket[]
  categories: readonly (ChartCategory & { slot: ChartSeriesSlot })[]
  below?: readonly string[]
  selectedIndex?: number
  isTouchInput: RefObject<boolean>
  onInspect: (index?: number) => void
  formatAxisValue: (value: number) => string
  formatTick: (start: number) => string
}

export function CategoryBarChart({
  buckets,
  categories,
  below = [],
  selectedIndex,
  isTouchInput,
  onInspect,
  formatAxisValue,
  formatTick,
}: CategoryBarChartProps) {
  const inset = useIsDesktop() ? 24 : 20
  const [width, setWidth] = useState(0)
  const slotWidth =
    (width - inset * 2 - AXIS_WIDTH) / Math.max(buckets.length, 1)
  const rows = toPlotRows(buckets, categories, below)
  const extent = stackExtent(
    rows,
    categories.map((category) => category.key)
  )
  const axis = plotAxis(extent.min, extent.max)
  const ticks = edgeAndMiddleTicks(rows.map((row) => row.start))
  const inspect =
    (input: 'pointer' | 'touch'): ChartHandler =>
    (state) => {
      if ((input === 'pointer') === Boolean(isTouchInput.current)) return
      const index = state?.activeTooltipIndex
      if (typeof index === 'number' && index >= 0) onInspect(index)
    }

  return (
    <ResponsiveContainer width="100%" height="100%" onResize={setWidth}>
      <BarChart
        data={rows}
        stackOffset={below.length ? 'sign' : 'none'}
        barCategoryGap={slotWidth < DENSE_SLOT_WIDTH ? 0 : '24%'}
        maxBarSize={MAX_BAR_WIDTH}
        margin={{ top: 12, right: inset, bottom: 8, left: inset }}
        onMouseMove={inspect('pointer')}
        onClick={inspect('touch')}
      >
        <CartesianGrid
          vertical={false}
          syncWithTicks
          stroke="hsl(var(--border))"
        />
        <XAxis
          dataKey="start"
          ticks={ticks}
          interval={0}
          axisLine={false}
          tickLine={false}
          tickMargin={12}
          tick={({ x, y, payload }) => (
            <text
              x={x}
              y={y}
              dy={10}
              textAnchor={
                payload.value === ticks[0]
                  ? 'start'
                  : payload.value === ticks.at(-1)
                    ? 'end'
                    : 'middle'
              }
              fontSize={12}
              fill="hsl(var(--muted-foreground))"
            >
              {formatTick(payload.value)}
            </text>
          )}
        />
        <YAxis
          orientation="right"
          width={AXIS_WIDTH}
          domain={axis.domain}
          ticks={axis.ticks}
          interval={0}
          axisLine={false}
          tickLine={false}
          tickSize={0}
          tickMargin={0}
          tick={({ x, y, payload }) => (
            <text
              x={x + AXIS_WIDTH}
              y={y}
              dy={4}
              textAnchor="end"
              fontSize={12}
              fill="hsl(var(--muted-foreground))"
            >
              {formatAxisValue(payload.value)}
            </text>
          )}
        />
        <Tooltip content={() => null} cursor={false} />
        {categories.map((category) => (
          <Bar
            key={category.key}
            dataKey={category.key}
            stackId="categories"
            fill={chartSeriesFill[category.slot]}
            isAnimationActive={false}
            shape={<SeparatedSegment />}
          >
            {rows.map((row, index) => (
              <Cell
                key={row.start}
                data-partial={row.partial || undefined}
                fillOpacity={segmentOpacity(
                  row.partial,
                  selectedIndex === undefined
                    ? undefined
                    : selectedIndex === index
                )}
              />
            ))}
          </Bar>
        ))}
        <ReferenceLine
          y={0}
          stroke="hsl(var(--muted-foreground))"
          strokeOpacity={0.5}
          ifOverflow="extendDomain"
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

type ChartHandler = NonNullable<ComponentProps<typeof BarChart>['onMouseMove']>

function SeparatedSegment(props: {
  x?: number
  y?: number
  width?: number
  height?: number
  fill?: string
  fillOpacity?: number
  'data-partial'?: boolean
}) {
  const { x = 0, y = 0, width = 0, height = 0, fill, fillOpacity } = props
  const top = Math.min(y, y + height)
  const size = Math.abs(height)
  if (!size) return null
  const inset =
    width >= MIN_SEPARATED_WIDTH && size > SEGMENT_GAP * 2 ? SEGMENT_GAP / 2 : 0
  return (
    <rect
      x={x}
      y={top + inset}
      width={width}
      height={size - inset * 2}
      fill={fill}
      fillOpacity={fillOpacity}
      data-partial={props['data-partial']}
    />
  )
}

function segmentOpacity(partial: boolean, isSelected?: boolean) {
  if (isSelected) return 1
  const base = partial ? PARTIAL_OPACITY : 1
  return isSelected === false ? base * DIMMED_OPACITY : base
}

function edgeAndMiddleTicks(starts: number[]) {
  if (starts.length < 3) return starts
  return [
    starts[0],
    starts[Math.floor((starts.length - 1) / 2)],
    starts.at(-1)!,
  ]
}
