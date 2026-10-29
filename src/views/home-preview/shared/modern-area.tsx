import { useId } from 'react'
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useReducedMotion } from './use-reduced-motion'

// Mirrors the current home's DTF cards: gradient stroke over a faded dot-pattern fill.
const ModernArea = ({
  data,
  dataKey,
  tooltip,
  strokeWidth = 2.5,
  dotColor = 'hsl(var(--primary))',
  from = 'hsl(212 90% 62%)',
  to = 'hsl(212 99% 35%)',
  animationDuration = 1600,
}: {
  data: Record<string, unknown>[]
  dataKey: string
  tooltip?: React.ReactElement
  strokeWidth?: number
  dotColor?: string
  from?: string
  to?: string
  animationDuration?: number
}) => {
  const reduced = useReducedMotion()
  const id = useId().replace(/:/g, '')
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={`${id}-stroke`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
          <pattern
            id={`${id}-dots`}
            width="3"
            height="3"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1" cy="1" r="0.5" fill={dotColor} />
          </pattern>
          <linearGradient id={`${id}-fade`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="75%" stopColor="white" stopOpacity="0.6" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <mask
            id={`${id}-mask`}
            maskUnits="objectBoundingBox"
            maskContentUnits="objectBoundingBox"
          >
            <rect x="0" y="0" width="1" height="1" fill={`url(#${id}-fade)`} />
          </mask>
        </defs>
        <XAxis dataKey="date" hide />
        <YAxis hide domain={[0, 'dataMax']} />
        {tooltip && (
          <Tooltip
            content={tooltip}
            wrapperStyle={{ zIndex: 1000 }}
            cursor={{
              stroke: 'hsl(var(--foreground))',
              strokeOpacity: 0.3,
              strokeDasharray: '3 4',
            }}
          />
        )}
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke="none"
          fill={`url(#${id}-dots)`}
          mask={`url(#${id}-mask)`}
          isAnimationActive={!reduced}
          animationDuration={animationDuration}
        />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={`url(#${id}-stroke)`}
          strokeWidth={strokeWidth}
          fill="none"
          activeDot={{
            r: 5,
            fill: 'hsl(var(--primary))',
            stroke: 'hsl(var(--card))',
            strokeWidth: 2,
          }}
          isAnimationActive={!reduced}
          animationDuration={animationDuration}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export default ModernArea
