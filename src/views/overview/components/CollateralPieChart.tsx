import TokenLogo from 'components/icons/TokenLogo'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Box, BoxProps } from 'theme-ui'
import { formatPercentage } from 'utils'

interface ChartProps extends BoxProps {
  data: { name: string; value: number; color: string }[]
  staked: number
  isRSV?: boolean
  logo: string
}

// Value % between 0-100
const getAngles = (value: number) => {
  const radius = Math.floor((value * 360) / 100) / 2
  return { startAngle: 270 + radius, endAngle: 270 - radius }
}

const CollateralChart = ({
  data,
  logo,
  isRSV,
  staked,
  ...props
}: ChartProps) => (
  <Box {...props} sx={{ position: 'relative' }}>
    <Box
      sx={{
        top: 'calc(50% - 14px)',
        left: 'calc(50% - 16px)',
        position: 'absolute',
      }}
    >
      <TokenLogo width={32} src={logo} />
    </Box>
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
            <Cell key={`cell-${index}`} fill={entry.color} stroke={'none'} />
          ))}
        </Pie>
        <Tooltip
          wrapperStyle={{ zIndex: 10 }}
          formatter={(value) => formatPercentage(Number(value), 4)}
        />
        {!isRSV && (
          <Pie
            dataKey="value"
            data={[{ value: staked, name: 'staked' }]}
            cx="50%"
            cy="50%"
            innerRadius={90}
            outerRadius={100}
            fill="currentColor"
            stroke="none"
            {...getAngles(staked)}
          />
        )}
      </PieChart>
    </ResponsiveContainer>
  </Box>
)

export default CollateralChart
