import {
  PERFORMANCE_COLORS,
  type PerformanceDirection,
} from '@/utils/chart-performance-colors'
import { Area } from 'recharts'

const areaAnimation = {
  isAnimationActive: true,
  animationDuration: 500,
  animationEasing: 'ease-in-out' as const,
}

export const renderPerformancePatternDefs = ({
  direction,
  dotsFadeGradientId,
  dotsMaskId,
  dotsPatternId,
  fillGradientId,
  performanceDotColor,
  preLaunchDotsPatternId,
}: {
  direction: PerformanceDirection
  dotsFadeGradientId: string
  dotsMaskId: string
  dotsPatternId: string
  fillGradientId: string
  performanceDotColor: string
  preLaunchDotsPatternId: string
}) => (
  <defs>
    {direction !== 'neutral' && (
      <linearGradient id={fillGradientId} x1="0" y1="0" x2="0" y2="1">
        <stop
          offset="0%"
          stopColor={PERFORMANCE_COLORS[direction].dot}
          stopOpacity="0.5"
        />
        <stop
          offset="100%"
          stopColor={PERFORMANCE_COLORS[direction].dot}
          stopOpacity="0"
        />
      </linearGradient>
    )}
    <pattern
      id={dotsPatternId}
      x="0"
      y="0"
      width="3"
      height="3"
      patternUnits="userSpaceOnUse"
    >
      <circle cx="1" cy="1" r="0.45" fill={performanceDotColor} />
    </pattern>
    <pattern
      id={preLaunchDotsPatternId}
      x="0"
      y="0"
      width="3"
      height="3"
      patternUnits="userSpaceOnUse"
    >
      <circle cx="1" cy="1" r="0.45" fill={performanceDotColor} />
    </pattern>
    <linearGradient id={dotsFadeGradientId} x1="0" y1="0" x2="0" y2="1">
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
  </defs>
)

export const renderPerformancePatternSeries = ({
  direction,
  dotsMaskId,
  dotsPatternId,
  fillGradientId,
  preLaunchDotsPatternId,
  shouldSplit,
  showPattern,
}: {
  direction: PerformanceDirection
  dotsMaskId: string
  dotsPatternId: string
  fillGradientId: string
  preLaunchDotsPatternId: string
  shouldSplit: boolean
  showPattern: boolean
}) => {
  if (!showPattern) return null

  if (shouldSplit) {
    const postLaunchFill =
      direction === 'neutral'
        ? `url(#${dotsPatternId})`
        : `url(#${fillGradientId})`

    return (
      <>
        <Area
          type="monotone"
          dataKey="preLaunchValue"
          stroke="none"
          fill={`url(#${preLaunchDotsPatternId})`}
          mask={`url(#${dotsMaskId})`}
          {...areaAnimation}
        />
        <Area
          type="monotone"
          dataKey="postLaunchValue"
          stroke="none"
          fill={postLaunchFill}
          mask={`url(#${dotsMaskId})`}
          {...areaAnimation}
        />
      </>
    )
  }

  return (
    <Area
      type="monotone"
      dataKey="value"
      stroke="none"
      fill={`url(#${dotsPatternId})`}
      mask={`url(#${dotsMaskId})`}
      {...areaAnimation}
    />
  )
}

export const renderPerformanceStrokeDefs = ({
  direction,
  strokeGradientId,
}: {
  direction: PerformanceDirection
  strokeGradientId: string
}) => (
  <defs>
    {direction !== 'neutral' && (
      <linearGradient id={strokeGradientId} x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stopColor={PERFORMANCE_COLORS[direction].end} />
        <stop offset="100%" stopColor={PERFORMANCE_COLORS[direction].start} />
      </linearGradient>
    )}
  </defs>
)

export const renderPerformanceStrokeSeries = ({
  performanceColor,
  shouldSplit,
}: {
  performanceColor: string
  shouldSplit: boolean
}) => {
  if (shouldSplit) {
    return (
      <>
        <Area
          type="monotone"
          dataKey="preLaunchValue"
          stroke={performanceColor}
          strokeWidth={2}
          fill="transparent"
          {...areaAnimation}
        />
        <Area
          type="monotone"
          dataKey="postLaunchValue"
          stroke={performanceColor}
          strokeWidth={2}
          fill="transparent"
          {...areaAnimation}
        />
      </>
    )
  }

  return (
    <Area
      type="monotone"
      dataKey="value"
      stroke={performanceColor}
      strokeWidth={2}
      fill="transparent"
      {...areaAnimation}
    />
  )
}
