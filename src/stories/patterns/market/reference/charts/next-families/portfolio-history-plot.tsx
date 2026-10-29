import {
  useId,
  useRef,
  useState,
  type ComponentProps,
  type RefObject,
} from 'react'
import {
  Area,
  ComposedChart,
  Line,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { AXIS_TICK_MARGIN, useAxisWidth } from './axis-geometry'
import { PORTFOLIO_CATEGORIES } from './portfolio-categories'
import { formatCompactUsd } from './portfolio-formatters'
import { formatTimelineTick, getTimelineTicks } from './range-control'
import type { PortfolioPoint, PortfolioSourceState } from './types'

const CONTENT_INSET = 24
const PLOT_EDGE_CLEARANCE = 4

export function PortfolioHistoryPlot({
  points,
  domain,
  selected,
  selectedIndex,
  sourceState,
  isTouchInput,
  onInspect,
}: {
  points: PortfolioPoint[]
  domain: [number, number]
  selected?: PortfolioPoint
  selectedIndex?: number
  sourceState: PortfolioSourceState
  isTouchInput: RefObject<boolean>
  onInspect: (index?: number) => void
}) {
  const [plotWidth, setPlotWidth] = useState(0)
  const plotRef = useRef<HTMLDivElement>(null)
  const gradientId = useId().replace(/:/g, '')
  const axisValues = points.map((point) => point.value)
  const axisMeasurementKey = `${plotWidth}:${points.length}:${Math.min(...axisValues)}:${Math.max(...axisValues)}`
  const axisWidth = useAxisWidth(plotRef, axisMeasurementKey)
  const ticks = getTimelineTicks(domain, plotWidth)
  const [firstTimestamp, lastTimestamp] = domain
  const inspect: ComponentProps<typeof ComposedChart>['onMouseMove'] = (
    state
  ) => {
    if (isTouchInput.current) return
    const timestamp = state?.activePayload?.[0]?.payload?.timestamp
    const index = points.findIndex((point) => point.timestamp === timestamp)
    if (
      index === 0 &&
      state?.chartX !== undefined &&
      state.activeCoordinate?.x !== undefined &&
      state.chartX < state.activeCoordinate.x - 1
    ) {
      onInspect(undefined)
      return
    }
    if (index >= 0) onInspect(index)
  }

  return (
    <ResponsiveContainer
      ref={plotRef}
      width="100%"
      height="100%"
      onResize={setPlotWidth}
    >
      <ComposedChart
        data={points}
        onMouseMove={inspect}
        margin={{
          top: 12,
          right: CONTENT_INSET,
          bottom: 8,
          left: PLOT_EDGE_CLEARANCE,
        }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="hsl(var(--primary))"
              stopOpacity={0.42}
            />
            <stop
              offset="100%"
              stopColor="hsl(var(--primary))"
              stopOpacity={0.08}
            />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="timestamp"
          type="number"
          domain={domain}
          ticks={ticks}
          interval={0}
          tick={({ x, y, payload }) => (
            <text
              x={x}
              y={y}
              dy={10}
              textAnchor={
                payload.value === firstTimestamp
                  ? 'start'
                  : payload.value === lastTimestamp
                    ? 'end'
                    : 'middle'
              }
              fontSize={12}
              fill="hsl(var(--muted-foreground))"
            >
              {formatTimelineTick(payload.value, domain)}
            </text>
          )}
          axisLine={false}
          tickLine={false}
          tickMargin={12}
        />
        <YAxis
          orientation="right"
          tick={({ x, y, payload }) => (
            <text
              x={x + axisWidth - AXIS_TICK_MARGIN}
              y={y}
              dy={4}
              textAnchor="end"
              fontSize={12}
              fill="hsl(var(--muted-foreground))"
            >
              {formatCompactUsd(payload.value)}
            </text>
          )}
          axisLine={false}
          tickLine={false}
          tickSize={0}
          tickMargin={AXIS_TICK_MARGIN}
          width={axisWidth}
          tickCount={4}
        />
        <Tooltip content={() => null} cursor={false} />
        {sourceState === 'composition' ? (
          PORTFOLIO_CATEGORIES.map((category) => (
            <Area
              key={category.key}
              type="monotone"
              dataKey={category.key}
              stackId="portfolio"
              stroke="none"
              fill={category.color}
              fillOpacity={0.78}
              isAnimationActive={false}
              activeDot={false}
            />
          ))
        ) : (
          <Area
            type="monotone"
            dataKey="value"
            stroke="hsl(var(--primary))"
            strokeWidth={1.5}
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
            activeDot={false}
          />
        )}
        {sourceState === 'composition' ? (
          <Line
            type="monotone"
            dataKey="value"
            stroke="hsl(var(--primary))"
            strokeWidth={1.5}
            dot={false}
            activeDot={false}
            isAnimationActive={false}
            className="portfolio-total-contour"
          />
        ) : null}
        {selectedIndex !== undefined && selected ? (
          <ReferenceLine
            x={selected.timestamp}
            stroke="hsl(var(--border))"
            strokeWidth={1}
            className="selected-timestamp-guide"
            ifOverflow="visible"
          />
        ) : null}
        {selected ? (
          <ReferenceDot
            x={selected.timestamp}
            y={selected.value}
            r={3}
            fill="hsl(var(--primary))"
            stroke="hsl(var(--card))"
            strokeWidth={2}
            className={
              selectedIndex === undefined
                ? 'latest-point-marker'
                : 'inspection-point-marker'
            }
            ifOverflow="visible"
            isFront
          />
        ) : null}
      </ComposedChart>
    </ResponsiveContainer>
  )
}
