import {
  getPerformanceColorSet,
  type PerformanceDirection,
} from '@/utils/chart-performance-colors'

type PriceChartColorSet = ReturnType<typeof getPerformanceColorSet>

export const renderPriceChartDefs = ({
  dotFillColor,
  dotsFadeGradientId,
  dotsMaskId,
  dotsPatternId,
  isYieldMode,
  performanceDirection,
  preLaunchDotsPatternId,
  priceColors,
  priceStrokeGradientId,
  usePerformanceColors,
}: {
  dotFillColor: string
  dotsFadeGradientId: string
  dotsMaskId: string
  dotsPatternId: string
  isYieldMode: boolean
  performanceDirection: PerformanceDirection
  preLaunchDotsPatternId: string
  priceColors: PriceChartColorSet
  priceStrokeGradientId: string
  usePerformanceColors: boolean
}) => (
  <defs>
    {usePerformanceColors && performanceDirection !== 'neutral' && (
      <linearGradient
        id={priceStrokeGradientId}
        x1="0"
        y1="0"
        x2="1"
        y2="0"
      >
        {performanceDirection === 'positive' ? (
          <>
            <stop offset="0%" stopColor={priceColors.positive.start} />
            <stop offset="100%" stopColor={priceColors.positive.end} />
          </>
        ) : (
          <>
            <stop offset="0%" stopColor={priceColors.negative.start} />
            <stop offset="100%" stopColor={priceColors.negative.end} />
          </>
        )}
      </linearGradient>
    )}
    {isYieldMode ? (
      <linearGradient id="yieldGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#4ADE80" stopOpacity={0.3} />
        <stop offset="100%" stopColor="#4ADE80" stopOpacity={0} />
      </linearGradient>
    ) : (
      <pattern
        id={dotsPatternId}
        x="0"
        y="0"
        width="3"
        height="3"
        patternUnits="userSpaceOnUse"
      >
        <circle cx="1" cy="1" r="0.4" fill={dotFillColor} opacity="1" />
      </pattern>
    )}
    {!isYieldMode && (
      <>
        <pattern
          id={preLaunchDotsPatternId}
          x="0"
          y="0"
          width="3"
          height="3"
          patternUnits="userSpaceOnUse"
        >
          <circle
            cx="1"
            cy="1"
            r="0.4"
            fill={priceColors.preLaunch.dot}
            opacity={priceColors.preLaunch.dotOpacity}
          />
        </pattern>
        <linearGradient
          id={dotsFadeGradientId}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
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
      </>
    )}
  </defs>
)
