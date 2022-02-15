import { Box, Text, BoxProps } from '@theme-ui/components'
import Card from 'components/card'
import useSWR from 'swr'
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
import useTokenMarket from 'hooks/useTokenMarket'

const mockData: any[] = []

const fetcher = (url: string) => fetch(url).then((res) => res.json())

for (let i = 0; i < 24; i++) {
  mockData.push({ hour: `${i < 10 ? `0${i}` : i}:00`, price: i % 2 ? 1 : 1.01 })
}

interface Props extends BoxProps {
  token?: Token
}

// TODO: Responsive
const PriceChart = ({ token, ...props }: Props) => {
  const { data } = useTokenMarket(token?.address)

  console.log('data', data)

  return (
    <Box {...props}>
      <Text variant="sectionTitle">Price</Text>
      <Card p={3} pl={1}>
        <ResponsiveContainer height={240}>
          <LineChart data={data?.prices ?? []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </Box>
  )
}
export default PriceChart
