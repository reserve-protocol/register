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
  mockData.push({ hour: `${i < 10 ? `0${i}` : i}:00`, price: i % 2 ? 1 : 1.01 })
}

// TODO: Responsive
const PriceChart = (props: any) => (
  <Box {...props}>
    <Flex mb={2}>
      <Text sx={{ fontSize: 4 }}>Price</Text>
      <Text sx={{ fontSize: 4, marginLeft: 'auto' }}>$ 1.01</Text>
    </Flex>
    <Card p={4}>
      <ResponsiveContainer height={360}>
        <LineChart data={mockData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="hour" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="price" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  </Box>
)

export default PriceChart
