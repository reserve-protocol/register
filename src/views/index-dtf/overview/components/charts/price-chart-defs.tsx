import { getPerformanceColorSet } from '@/utils/chart-performance-colors'

type PriceChartColorSet = ReturnType<typeof getPerformanceColorSet>

export const renderPriceChartDefs = ({
  dotFillColor,
  dotsFadeGradientId,
  dotsMaskId,
  dotsPatternId,
  isYieldMode,
  preLaunchDotsPatternId,
  priceColors,
}: {
  dotFillColor: string
  dotsFadeGradientId: string
  dotsMaskId: string
  dotsPatternId: string
  isYieldMode: boolean
  preLaunchDotsPatternId: string
  priceColors: PriceChartColorSet
}) => (
  <defs>
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
