import TokenLogo from 'components/icons/TokenLogo'
import React, { FC, ReactNode } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Box, BoxProps } from 'theme-ui'
import { formatPercentage } from 'utils'

interface ChartProps extends BoxProps {
  data: {
    name: string
    value: number
    color: string
    project: string
    projectColor: string
  }[]
  staked: number
  isRSV?: boolean
  logo: string
  topInformation?: ReactNode
  bottomInformation?: ReactNode
}

// Value % between 0-100
const getAngles = (value: number) => {
  const radius = Math.floor((value * 360) / 100)
  return { startAngle: 270, endAngle: 270 - radius }
}

const CollateralChart: FC<ChartProps> = ({
  data,
  logo,
  isRSV,
  staked,
  topInformation,
  bottomInformation,
  ...props
}) => (
  <Box {...props} variant="layout.centered" sx={{ gap: 2 }}>
    {topInformation}
    <Box sx={{ position: 'relative' }}>
      <Box
        sx={{
          top: '50%',
          left: '50%',
          position: 'absolute',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <TokenLogo width={32} src={logo} />
      </Box>
      <ResponsiveContainer height={220} width={220}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            cx="50%"
            cy="50%"
            innerRadius={64}
            outerRadius={80}
            paddingAngle={2}
            startAngle={91}
            endAngle={451}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke={'none'} />
            ))}
          </Pie>
          <Pie
            data={data.map(({ project, value }) => ({ name: project, value }))}
            dataKey="value"
            cx="50%"
            cy="50%"
            innerRadius={79}
            outerRadius={85}
            paddingAngle={2}
            startAngle={91}
            endAngle={451}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.projectColor}
                stroke={'none'}
              />
            ))}
          </Pie>
          <Tooltip
            wrapperStyle={{ zIndex: 10 }}
            formatter={(value) => formatPercentage(Number(value), 4)}
          />
          {!isRSV && (
            <Pie
              dataKey="value"
              data={[{ value: staked, name: 'Overcollaterization' }]}
              cx="50%"
              cy="50%"
              innerRadius={95}
              outerRadius={100}
              fill="currentColor"
              stroke="none"
              {...getAngles(staked)}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
    </Box>
    {bottomInformation}
  </Box>
)

export default React.memo(CollateralChart)
