import { useLayoutEffect, useState, type RefObject } from 'react'

type AxisScale = (value: number) => number

const COMPACT_AXIS_LABEL_GAP = 16
const COMPACT_AXIS_TICK_MARGIN = 8
const COMPACT_AXIS_MIN_LABEL_WIDTH = 28
const COMPACT_AXIS_INITIAL_LABEL_WIDTH = 39

export type ChartCustomizedProps = {
  xAxisMap?: Record<string | number, { scale?: AxisScale }>
  yAxisMap?: Record<string | number, { scale?: AxisScale }>
}

export function getYAxisPresentation({
  isCompact,
  isMobile,
  labelWidth = COMPACT_AXIS_MIN_LABEL_WIDTH,
  plotEdgeInset = 0,
}: {
  isCompact: boolean
  isMobile: boolean
  labelWidth?: number
  plotEdgeInset?: number
}) {
  if (isMobile) return { tick: false as const, width: 0 }

  if (!isCompact) {
    return {
      tick: { fontSize: 13, opacity: 0.7, textAnchor: 'end' as const, dx: 44 },
      tickMargin: 5,
      tickSize: undefined,
      width: 55,
    }
  }

  const width =
    Math.ceil(Math.max(COMPACT_AXIS_MIN_LABEL_WIDTH, labelWidth)) +
    COMPACT_AXIS_LABEL_GAP -
    plotEdgeInset

  return {
    tick: {
      fontSize: 13,
      opacity: 0.7,
      textAnchor: 'end' as const,
      dx: width - COMPACT_AXIS_TICK_MARGIN,
    },
    tickMargin: COMPACT_AXIS_TICK_MARGIN,
    tickSize: 0,
    width,
  }
}

export function measureDisplayedYAxisLabelWidth(root: ParentNode) {
  return Math.max(
    0,
    ...Array.from(
      root.querySelectorAll<SVGTextElement>('.recharts-yAxis text'),
      (label) => label.getBBox().width
    )
  )
}

export function useDisplayedYAxisLabelWidth({
  enabled,
  measurementKey,
  rootRef,
}: {
  enabled: boolean
  measurementKey: string
  rootRef: RefObject<HTMLElement | null>
}) {
  const [labelWidth, setLabelWidth] = useState(COMPACT_AXIS_INITIAL_LABEL_WIDTH)

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!enabled || !root) return
    let isCurrent = true
    let frame = 0
    const measure = () => {
      if (!isCurrent || !root.querySelector('.recharts-yAxis text')) return
      const nextWidth = measureDisplayedYAxisLabelWidth(root)
      setLabelWidth((currentWidth) =>
        currentWidth === nextWidth ? currentWidth : nextWidth
      )
    }
    const scheduleMeasure = () => {
      if (!isCurrent) return
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(measure)
    }
    measure()
    const observer = new ResizeObserver(scheduleMeasure)
    observer.observe(root)
    scheduleMeasure()
    void document.fonts.ready.then(scheduleMeasure)
    return () => {
      isCurrent = false
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [enabled, measurementKey, rootRef])

  return labelWidth
}

export function ChartLatestPointMarker({
  fill,
  isInspecting,
  point,
  ringColor,
  xAxisMap,
  yAxisMap,
}: ChartCustomizedProps & {
  fill: string
  isInspecting: boolean
  point?: { timestamp: number; value: number }
  ringColor: string
}) {
  const xScale = firstScale(xAxisMap)
  const yScale = firstScale(yAxisMap)
  if (!point || !xScale || !yScale) return null

  const x = xScale(point.timestamp)
  const y = yScale(point.value)
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null

  return (
    <circle
      aria-hidden="true"
      cx={x}
      cy={y}
      r="3"
      fill={fill}
      stroke={ringColor}
      strokeWidth="2"
      data-testid="chart-latest-point-marker"
      data-state={isInspecting ? 'inspection' : 'latest'}
      data-timestamp={point.timestamp}
    />
  )
}

function firstScale(axisMap?: ChartCustomizedProps['xAxisMap']) {
  return Object.values(axisMap ?? {}).find(
    (axis): axis is { scale: AxisScale } => typeof axis.scale === 'function'
  )?.scale
}
