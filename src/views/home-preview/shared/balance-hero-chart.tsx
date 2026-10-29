import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { DayPoint, SERIES } from '../mock/ugly-cash-series'
import { countCompact, shortDate, usd } from './format'
import { useReducedMotion } from './use-reduced-motion'

type TooltipProps = {
  active?: boolean
  payload?: { payload: DayPoint }[]
}

const BalanceTooltip = ({ active, payload }: TooltipProps) => {
  if (!active || !payload?.length) return null
  const p = payload[0].payload
  return (
    <div className="hidden md:flex flex-col border-2 border-muted bg-card rounded-xl min-w-[280px]">
      <div className="flex items-center gap-4 justify-between border-b border-border p-4">
        <span className="text-sm">{shortDate(p.date)}</span>
        <span className="text-legend text-sm">(that day)</span>
      </div>
      <div className="flex flex-col gap-1 px-4 py-3">
        <div className="flex justify-between gap-6">
          <span>eUSD moved:</span>
          <span className="font-bold">{usd(p.totalVolume)}</span>
        </div>
        <div className="flex justify-between gap-6">
          <span>Transactions:</span>
          <span className="font-bold">{countCompact(p.totalCount)}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 justify-between border-t border-border p-4">
        <span>eUSD held:</span>
        <span className="text-primary font-bold">{usd(p.balance)}</span>
      </div>
    </div>
  )
}

const BalanceHeroChart = ({
  data = SERIES,
  dataKey = 'balance',
}: {
  data?: DayPoint[]
  dataKey?: 'balance' | 'cumulativeVolume' | 'cumulativeCount'
}) => {
  const reduced = useReducedMotion()
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{ right: 1, bottom: -30, left: 0, top: 0 }}
      >
        <XAxis dataKey="date" hide />
        <YAxis hide domain={[0, 'dataMax']} />
        <Tooltip
          wrapperStyle={{ zIndex: 1000 }}
          content={<BalanceTooltip />}
          cursor={{ stroke: 'hsl(var(--foreground))', strokeOpacity: 0.25 }}
        />
        <Area
          type="step"
          dataKey={dataKey}
          stroke="hsl(var(--tvl))"
          fill="hsl(var(--tvl))"
          fillOpacity={1}
          activeDot={{ r: 0 }}
          isAnimationActive={!reduced}
          animationDuration={1800}
          animationEasing="ease-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export default BalanceHeroChart
