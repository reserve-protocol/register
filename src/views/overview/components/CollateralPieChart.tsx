import TokenLogo from 'components/icons/TokenLogo'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { Box, BoxProps } from 'theme-ui'

interface ChartProps extends BoxProps {
  data: { name: string; value: number; color: string }[]
  symbol: string
  insurance: number
  isRSV?: boolean
}

// Value % between 0-100
const getAngles = (value: number) => {
  const radius = Math.floor((value * 360) / 100) / 2
  return { startAngle: 270 + radius, endAngle: 270 - radius }
}

const CollateralChart = ({
  data,
  symbol,
  isRSV,
  insurance,
  ...props
}: ChartProps) => (
  <Box {...props} sx={{ position: 'relative' }}>
    <ResponsiveContainer height={200}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          cx="50%"
          cy="50%"
          innerRadius={70}
          outerRadius={80}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        {!isRSV && (
          <Pie
            dataKey="value"
            data={[{ value: 100, name: 'insurance' }]}
            cx="50%"
            cy="50%"
            innerRadius={90}
            outerRadius={100}
            fill="#000000"
            {...getAngles(insurance)}
          />
        )}
      </PieChart>
    </ResponsiveContainer>
    <Box
      sx={{
        top: 'calc(50% - 8px)',
        left: 'calc(50% - 12px)',
        position: 'absolute',
      }}
    >
      <TokenLogo size={24} symbol={symbol} />
    </Box>
  </Box>
)

export default CollateralChart
