import {
  ResponsiveContainer,
  AreaChart as Chart,
  Area,
  Tooltip,
} from 'recharts'
import { Box, BoxProps, Flex, Text } from 'theme-ui'

interface Props extends BoxProps {
  data: { value: number }[]
}

// TODO: Dark mode colors
// TODO: Use dataset to calculate +- value between range
const AreaChart = ({ data, ...props }: Props) => {
  return (
    <Box {...props}>
      <Flex sx={{ fontSize: 3 }} mb={4}>
        <Text>4%</Text>
        <Text ml="auto" sx={{ color: '#11BB8D' }}>
          10%
        </Text>
      </Flex>
      <ResponsiveContainer height={100}>
        <Chart data={data}>
          <Tooltip />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#000"
            fill="rgba(0, 0, 0, 0.05)"
          />
        </Chart>
      </ResponsiveContainer>
    </Box>
  )
}

export default AreaChart
