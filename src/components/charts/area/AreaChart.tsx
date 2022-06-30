import { ResponsiveContainer, AreaChart as Chart, Area } from 'recharts'
import { Box, BoxProps } from 'theme-ui'

interface Props extends BoxProps {
  data: { value: number }[]
}

const AreaChart = ({ data, ...props }: Props) => {
  return (
    <Box {...props}>
      <ResponsiveContainer height={200}>
        <Chart data={data}>
          <Area
            type="monotone"
            dataKey="value"
            stroke="#000"
            fill="#rgba(0, 0, 0, 0.05)"
          />
        </Chart>
      </ResponsiveContainer>
    </Box>
  )
}

export default AreaChart
