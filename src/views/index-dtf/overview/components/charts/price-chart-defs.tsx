import {
  getPerformanceColorSet,
  PERFORMANCE_COLORS,
  type PerformanceDirection,
} from '@/utils/chart-performance-colors'

type PriceChartColorSet = ReturnType<typeof getPerformanceColorSet>

export const renderPriceChartDefs = ({
  dotFillColor,
  dotsFadeGradientId,
  dotsMaskId,
  dotsPatternId,
  fillGradientId,
  isYieldMode,
  performanceDirection,
  preLaunchDotsPatternId,
  priceColors,
  priceLineShadowFilterId,
  priceStrokeGradientId,
  usePerformanceColors,
}: {
  dotFillColor: string
  dotsFadeGradientId: string
  dotsMaskId: string
  dotsPatternId: string
  fillGradientId: string
  isYieldMode: boolean
  performanceDirection: PerformanceDirection
  preLaunchDotsPatternId: string
  priceColors: PriceChartColorSet
  priceLineShadowFilterId: string
  priceStrokeGradientId: string
  usePerformanceColors: boolean
}) => (
  <defs>
    <filter
      id={priceLineShadowFilterId}
      x="-20%"
      y="-20%"
      width="140%"
      height="140%"
    >
      <feDropShadow
        dx="0"
        dy="1"
        stdDeviation="2.5"
        floodColor="hsl(var(--foreground))"
        floodOpacity="0.09"
      />
    </filter>
    {usePerformanceColors && performanceDirection !== 'neutral' && (
      <linearGradient id={priceStrokeGradientId} x1="0" y1="1" x2="0" y2="0">
        {performanceDirection === 'positive' ? (
          <>
            <stop offset="0%" stopColor={priceColors.positive.end} />
            <stop offset="100%" stopColor={priceColors.positive.start} />
          </>
        ) : (
          <>
            <stop offset="0%" stopColor={priceColors.negative.end} />
            <stop offset="100%" stopColor={priceColors.negative.start} />
          </>
        )}
      </linearGradient>
    )}
    {isYieldMode ? (
      <linearGradient id="yieldGradient" x1="0" y1="0" x2="0" y2="1">
        <stop
          offset="0%"
          stopColor={PERFORMANCE_COLORS.positive.dot}
          stopOpacity={0.3}
        />
        <stop
          offset="100%"
          stopColor={PERFORMANCE_COLORS.positive.dot}
          stopOpacity={0}
        />
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
        {usePerformanceColors && performanceDirection !== 'neutral' && (
          <linearGradient id={fillGradientId} x1="0" y1="0" x2="0" y2="1">
            {performanceDirection === 'positive' ? (
              <>
                <stop
                  offset="0%"
                  stopColor={priceColors.positive.dot}
                  stopOpacity="0.48"
                />
                <stop
                  offset="100%"
                  stopColor={priceColors.positive.dot}
                  stopOpacity="0"
                />
              </>
            ) : (
              <>
                <stop
                  offset="0%"
                  stopColor={priceColors.negative.dot}
                  stopOpacity="0.48"
                />
                <stop
                  offset="100%"
                  stopColor={priceColors.negative.dot}
                  stopOpacity="0"
                />
              </>
            )}
          </linearGradient>
        )}
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
      </>
    )}
  </defs>
)
