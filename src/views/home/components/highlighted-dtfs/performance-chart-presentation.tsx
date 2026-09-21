import {
  PERFORMANCE_COLORS,
  type PerformanceDirection,
} from '@/utils/chart-performance-colors'

type Point = { timestamp: number; value: number }

export type PerformancePlotGeometry = {
  endpoint?: { x: number; y: number }
  launchLeftPercent?: number
  strokeGradientCoordinates?: { top: number; bottom: number }
}

export function getLaunchMarkerLeftPercent(
  points: Point[],
  launchTimestamp?: number
) {
  const first = points[0]
  const latest = points[points.length - 1]
  if (!first || !latest || launchTimestamp === undefined) return undefined
  const timestampSpan = latest.timestamp - first.timestamp
  if (
    timestampSpan <= 0 ||
    launchTimestamp < first.timestamp ||
    launchTimestamp > latest.timestamp
  ) {
    return undefined
  }

  return ((launchTimestamp - first.timestamp) / timestampSpan) * 100
}

export function getPerformancePlotGeometry({
  height,
  horizontalPadding,
  launchTimestamp,
  points,
  width,
  yDomain,
}: {
  height: number
  horizontalPadding: number
  launchTimestamp?: number
  points: Point[]
  width: number
  yDomain: [number, number]
}): PerformancePlotGeometry {
  const first = points[0]
  const latest = points[points.length - 1]
  if (!first || !latest || width <= 0 || height <= 0) return {}

  const timestampSpan = latest.timestamp - first.timestamp
  const valueSpan = yDomain[1] - yDomain[0]
  if (timestampSpan <= 0 || valueSpan <= 0) return {}

  const plotTop = 6
  const plotHeight = height - plotTop
  const plotWidth = width - horizontalPadding * 2
  const x = (timestamp: number) =>
    horizontalPadding +
    ((timestamp - first.timestamp) / timestampSpan) * plotWidth
  const y = (value: number) =>
    plotTop + ((yDomain[1] - value) / valueSpan) * plotHeight
  const values = points.map((point) => point.value)

  return {
    endpoint: { x: x(latest.timestamp), y: y(latest.value) },
    launchLeftPercent:
      launchTimestamp !== undefined &&
      launchTimestamp >= first.timestamp &&
      launchTimestamp <= latest.timestamp
        ? (x(launchTimestamp) / width) * 100
        : undefined,
    strokeGradientCoordinates: {
      top: y(Math.max(...values)),
      bottom: y(Math.min(...values)),
    },
  }
}

export function PerformanceLatestPointMarker({
  direction,
  endpoint,
  height,
  ringGradient,
  strokeGradientCoordinates,
  width,
}: {
  direction: PerformanceDirection
  endpoint: { x: number; y: number }
  height: number
  ringGradient: {
    id: string
    from: string
    to: string
    top: number
    bottom: number
  }
  strokeGradientCoordinates: { top: number; bottom: number }
  width: number
}) {
  const lineGradientId = `${ringGradient.id}-line`
  const fill =
    direction === 'neutral'
      ? PERFORMANCE_COLORS.neutral.stroke
      : `url(#${lineGradientId})`

  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-30 h-full w-full overflow-visible"
      data-testid="chart-latest-point-overlay"
      viewBox={`0 0 ${width} ${height}`}
    >
      <defs>
        {direction !== 'neutral' && (
          <linearGradient
            id={lineGradientId}
            x1="0"
            y1={strokeGradientCoordinates.bottom}
            x2="0"
            y2={strokeGradientCoordinates.top}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor={PERFORMANCE_COLORS[direction].end} />
            <stop
              offset="100%"
              stopColor={PERFORMANCE_COLORS[direction].start}
            />
          </linearGradient>
        )}
        <linearGradient
          id={ringGradient.id}
          x1="0"
          y1={ringGradient.top}
          x2="0"
          y2={ringGradient.bottom}
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor={ringGradient.from} />
          <stop offset="100%" stopColor={ringGradient.to} />
        </linearGradient>
      </defs>
      <circle
        cx={endpoint.x}
        cy={endpoint.y}
        r="3"
        fill={fill}
        stroke={`url(#${ringGradient.id})`}
        strokeWidth="2"
        data-testid="chart-latest-point-marker"
      />
    </svg>
  )
}
