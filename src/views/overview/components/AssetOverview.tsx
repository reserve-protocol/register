import TokenLogo from 'components/icons/TokenLogo'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { Box } from 'theme-ui'

const data = [
  { name: 'A1', value: 100 },
  { name: 'A2', value: 300 },
  { name: 'B1', value: 100 },
  { name: 'A2', value: 300 },
  { name: 'B1', value: 100 },
  { name: 'A2', value: 300 },
  { name: 'B1', value: 100 },
  { name: 'A1', value: 100 },
]

const colors = [
  '#000000',
  '#333333',
  '#4C4C4C',
  '#666666',
  '#808080',
  '#999999',
  '#B3B3B3',
  '#CCCCCC',
]

// Value % between 0-100
const getAngles = (value: number) => {
  const radius = Math.floor((value * 360) / 100) / 2
  return { startAngle: 270 + radius, endAngle: 270 - radius }
}

const AssetOverview = () => {
  return (
    <Box>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart width={400} height={400}>
          <Pie
            data={data}
            dataKey="value"
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={80}
            fill="#82ca9d"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index]} />
            ))}
          </Pie>
          <Pie
            dataKey="value"
            data={[{ value: 100, name: 'insurance' }]}
            cx="50%"
            cy="50%"
            innerRadius={90}
            outerRadius={100}
            fill="#11BB8D"
            {...getAngles(50)}
          />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  )
}

export default AssetOverview
