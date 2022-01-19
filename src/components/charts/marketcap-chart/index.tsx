import { Box, Flex, Text } from '@theme-ui/components'
import Card from 'components/card'
import {
  LineChart,
  Line,
  Legend,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'

const mockData: any[] = []

for (let i = 0; i < 24; i++) {
  mockData.push({ hour: `${i < 10 ? `0${i}` : i}:00`, total: 0 })
}

const MarketCapChart = (props: any) => (
  <Box {...props}>
    <Text variant="sectionTitle">Market Cap</Text>
    <Card p={3} pl={1}>
      <ResponsiveContainer height={360}>
        <LineChart data={mockData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="hour" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="total" stroke="#509155" />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  </Box>
)

export default MarketCapChart
