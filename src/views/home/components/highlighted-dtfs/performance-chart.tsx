import { ChartConfig, ChartContainer } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useId } from 'react'
import { Area, AreaChart, Tooltip, XAxis, YAxis } from 'recharts'
import type { FeaturedDTFItem } from '../../hooks/use-featured-dtfs'
import { getPaddedValueDomain } from './utils'

export const PERFORMANCE_CHART_FADE_CLASSNAME =
  'pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-b from-card/0 to-card lg:from-background/0 lg:to-background lg:group-hover:from-card/0 lg:group-hover:to-card lg:group-focus-within:from-card/0 lg:group-focus-within:to-card'

const chartConfig = {
  performance: {
    label: 'Performance',
    color: 'currentColor',
  },
} satisfies ChartConfig

export const PerformanceChart = ({
  chartKey,
  className,
  direction,
  fadeClassName = PERFORMANCE_CHART_FADE_CLASSNAME,
  performance,
  showPattern = true,
}: {
  chartKey: string
  className: string
  direction: 'positive' | 'negative' | 'neutral'
  fadeClassName?: string
  performance: FeaturedDTFItem['performance']
  showPattern?: boolean
}) => {
  const dotsPatternId = useId().replace(/:/g, '')
  const strokeGradientId = `${dotsPatternId}-stroke`
  const dotsFadeGradientId = `${dotsPatternId}-fade`
  const dotsMaskId = `${dotsPatternId}-mask`
  const performanceColor =
    direction === 'positive' || direction === 'negative'
      ? `url(#${strokeGradientId})`
      : 'hsl(var(--primary))'
  const performanceDotColor =
    direction === 'positive'
      ? '#819D44'
      : direction === 'negative'
        ? '#B85F50'
        : '#6F6456'

  return (
    <div className="relative">
      <ChartContainer
        key={chartKey}
        config={chartConfig}
        className={cn('pointer-events-none w-full', className)}
      >
        <AreaChart
          data={performance}
          margin={{ left: 0, right: 0, top: 6, bottom: 0 }}
          {...{ overflow: 'visible' }}
        >
          <defs>
            {direction !== 'neutral' && (
              <linearGradient id={strokeGradientId} x1="0" y1="0" x2="1" y2="0">
                {direction === 'positive' ? (
                  <>
                    <stop offset="0%" stopColor="#A2BB6E" />
                    <stop offset="100%" stopColor="#657D32" />
                  </>
                ) : (
                  <>
                    <stop offset="0%" stopColor="#D69A8F" />
                    <stop offset="100%" stopColor="#9F4A3D" />
                  </>
                )}
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
          <XAxis dataKey="timestamp" hide axisLine={false} tickLine={false} />
          <YAxis
            dataKey="value"
            hide
            axisLine={false}
            tickLine={false}
            domain={getPaddedValueDomain}
          />
          <Tooltip content={() => null} cursor={false} />
          {showPattern && (
            <Area
              type="monotone"
              dataKey="value"
              stroke="none"
              fill={`url(#${dotsPatternId})`}
              mask={`url(#${dotsMaskId})`}
              isAnimationActive
              animationDuration={500}
              animationEasing="ease-in-out"
            />
          )}
          <Area
            type="monotone"
            dataKey="value"
            stroke={performanceColor}
            strokeWidth={2}
            fill="transparent"
            isAnimationActive
            animationDuration={500}
            animationEasing="ease-in-out"
          />
        </AreaChart>
      </ChartContainer>
      {fadeClassName && <div className={cn(fadeClassName)} />}
    </div>
  )
}

export const PerformanceChartSkeleton = ({
  className,
  fadeClassName = PERFORMANCE_CHART_FADE_CLASSNAME,
}: {
  className: string
  fadeClassName?: string
}) => (
  <div className="relative">
    <div className={cn('pointer-events-none w-full', className)}>
      <Skeleton className="h-full w-full rounded-none bg-primary/10" />
    </div>
    {fadeClassName && <div className={cn(fadeClassName)} />}
  </div>
)
