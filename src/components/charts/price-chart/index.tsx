import { Box, Text, BoxProps } from '@theme-ui/components'
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
import { Token } from 'types'

const mockData: any[] = []

for (let i = 0; i < 24; i++) {
  mockData.push({ hour: `${i < 10 ? `0${i}` : i}:00`, price: i % 2 ? 1 : 1.01 })
}

interface Props extends BoxProps {
  token?: Token
}

// TODO: Responsive
const PriceChart = ({ token, ...props }: Props) => {
  console.log('token', token)
  return (
    <Box {...props}>
      <Text variant="sectionTitle">Price</Text>
      <Card p={3} pl={1}>
        <ResponsiveContainer height={240}>
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
}
export default PriceChart
