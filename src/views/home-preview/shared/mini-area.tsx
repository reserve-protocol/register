import { Area, AreaChart, ResponsiveContainer, YAxis } from 'recharts'
import { useReducedMotion } from './use-reduced-motion'

const MiniArea = ({
  data,
  dataKey,
}: {
  data: Record<string, number | string>[]
  dataKey: string
}) => {
  const reduced = useReducedMotion()
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
        <YAxis hide domain={[0, 'dataMax']} />
        <Area
          type="step"
          dataKey={dataKey}
          stroke="hsl(var(--tvl))"
          fill="hsl(var(--tvl))"
          fillOpacity={1}
          isAnimationActive={!reduced}
          animationDuration={1200}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export default MiniArea
