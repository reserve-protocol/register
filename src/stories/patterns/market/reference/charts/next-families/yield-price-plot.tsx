import { useId, useRef, useState, type ComponentProps } from 'react'
import {
  Area,
  AreaChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatMetricAxis, getMetricDomain } from './metric-formatters'
import { AXIS_TICK_MARGIN, useAxisWidth } from './axis-geometry'
import { formatTimelineTick, getTimelineTicks } from './range-control'
import type { HistoricalMetric, HistoricalPoint } from './types'

const CONTENT_INSET = 24
const PLOT_EDGE_CLEARANCE = 4

export function MetricLinePlot({
  metric,
  points,
  domain,
  selected,
  onInspect,
}: {
  metric: HistoricalMetric
  points: HistoricalPoint[]
  domain: [number, number]
  selected?: HistoricalPoint
  onInspect: (index?: number) => void
}) {
  const gradientId = useId().replace(/:/g, '')
  const plotRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const values = points.map((point) => point.value)
  const axisMeasurementKey = `${metric.id}:${width}:${points.length}:${Math.min(...values)}:${Math.max(...values)}`
  const axisWidth = useAxisWidth(plotRef, axisMeasurementKey)
  const [first, last] = domain
  const ticks = getTimelineTicks(domain, width)
  const inspect: ComponentProps<typeof AreaChart>['onMouseMove'] = (state) => {
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
      onResize={setWidth}
    >
      <AreaChart
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
              stopOpacity={0.2}
            />
            <stop
              offset="100%"
              stopColor="hsl(var(--primary))"
              stopOpacity={0}
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
                payload.value === first
                  ? 'start'
                  : payload.value === last
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
          domain={getMetricDomain({ ...metric, points })}
          tick={({ x, y, payload }) => (
            <text
              x={x + axisWidth - AXIS_TICK_MARGIN}
              y={y}
              dy={4}
              textAnchor="end"
              fontSize={12}
              fill="hsl(var(--muted-foreground))"
            >
              {formatMetricAxis(metric.id, payload.value)}
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
        <Area
          type="monotone"
          dataKey="value"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          isAnimationActive={false}
          activeDot={false}
        />
        {selected ? (
          <ReferenceDot
            x={selected.timestamp}
            y={selected.value}
            r={3}
            fill="hsl(var(--primary))"
            stroke="hsl(var(--card))"
            strokeWidth={2}
            className="inspection-point-marker"
            ifOverflow="visible"
            isFront
          />
        ) : (
          <ReferenceDot
            x={points.at(-1)!.timestamp}
            y={points.at(-1)!.value}
            r={3}
            fill="hsl(var(--primary))"
            stroke="hsl(var(--card))"
            strokeWidth={2}
            className="latest-point-marker"
            ifOverflow="visible"
            isFront
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  )
}
