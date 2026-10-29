import { useId, useMemo } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { DayPoint, SERIES } from '../mock/ugly-cash-series'
import { monthYear, usdCompact } from './format'
import { BalanceGlassTooltip } from './modern-bits'
import { useReducedMotion } from './use-reduced-motion'

export type HeroChartStyle = 'step' | 'line' | 'bars'

const MILESTONES = [1_000_000, 5_000_000, 10_000_000]

// First day the balance closed above each round number: real data points, not invented events.
export const findMilestones = (data: DayPoint[]) =>
  MILESTONES.map((m) => data.find((p) => p.texturedBalance >= m))
    .filter((p): p is DayPoint => !!p)
    .map((p, i) => ({
      point: p,
      label: `${usdCompact(MILESTONES[i], 0)} · ${monthYear(p.date)}`,
    }))

const MilestoneLabel = ({
  viewBox,
  value,
  alignEnd,
}: {
  viewBox?: { x: number; y: number }
  value?: string
  alignEnd?: boolean
}) => {
  if (!viewBox) return null
  const width = value!.length * 6.6 + 16
  const left = alignEnd ? viewBox.x - width + 2 : viewBox.x - 2
  return (
    <g>
      <line
        x1={viewBox.x}
        x2={viewBox.x}
        y1={viewBox.y - 10}
        y2={viewBox.y - 4}
        stroke="hsl(var(--primary))"
        strokeOpacity={0.4}
      />
      <rect
        x={left}
        y={viewBox.y - 34}
        width={value!.length * 6.6 + 16}
        height={24}
        rx={12}
        fill="hsl(var(--card))"
        stroke="hsl(var(--primary))"
        strokeOpacity={0.25}
      />
      <text
        x={left + 8}
        y={viewBox.y - 18}
        fontSize={12}
        fill="hsl(var(--primary))"
      >
        {value}
      </text>
    </g>
  )
}

const SharpHeroChart = ({
  style = 'step',
  milestones = false,
  data = SERIES,
}: {
  style?: HeroChartStyle
  milestones?: boolean
  data?: DayPoint[]
}) => {
  const reduced = useReducedMotion()
  const id = useId().replace(/:/g, '')
  const marks = useMemo(
    () => (milestones ? findMilestones(data) : []),
    [milestones, data]
  )
  const margin = { top: milestones ? 40 : 8, right: 1, bottom: 0, left: 0 }
  const common = (
    <>
      <XAxis dataKey="date" hide />
      <YAxis hide domain={[0, 'dataMax']} />
      <Tooltip
        content={<BalanceGlassTooltip field="texturedBalance" />}
        wrapperStyle={{ zIndex: 1000 }}
        cursor={
          style === 'bars'
            ? { fill: 'hsl(var(--primary))', fillOpacity: 0.08 }
            : { stroke: 'hsl(var(--foreground))', strokeOpacity: 0.3 }
        }
      />
      {marks.map((m, i) => (
        <ReferenceDot
          key={m.point.date}
          x={m.point.date}
          y={m.point.texturedBalance}
          r={4}
          fill="hsl(var(--card))"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          label={<MilestoneLabel value={m.label} alignEnd={i > 0} />}
        />
      ))}
    </>
  )

  return (
    <ResponsiveContainer width="100%" height="100%">
      {style === 'bars' ? (
        <BarChart data={data} margin={margin} barCategoryGap={0}>
          {common}
          <Bar
            dataKey="texturedBalance"
            fill="hsl(var(--tvl))"
            isAnimationActive={!reduced}
            animationDuration={1400}
          />
        </BarChart>
      ) : (
        <AreaChart data={data} margin={margin}>
          <defs>
            <pattern
              id={`${id}-dots`}
              width="3"
              height="3"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="1" cy="1" r="0.6" fill="hsl(var(--primary))" />
            </pattern>
          </defs>
          {common}
          <Area
            type={style === 'step' ? 'step' : 'linear'}
            dataKey="texturedBalance"
            stroke="hsl(var(--tvl))"
            strokeWidth={style === 'line' ? 2 : 1}
            fill={style === 'step' ? 'hsl(var(--tvl))' : `url(#${id}-dots)`}
            fillOpacity={1}
            activeDot={{
              r: 5,
              fill: 'hsl(var(--primary))',
              stroke: 'hsl(var(--card))',
              strokeWidth: 2,
            }}
            isAnimationActive={!reduced}
            animationDuration={1600}
          />
        </AreaChart>
      )}
    </ResponsiveContainer>
  )
}

export default SharpHeroChart
