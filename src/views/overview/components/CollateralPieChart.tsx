import TokenLogo from 'components/icons/TokenLogo'
import React, { FC, ReactNode, useMemo } from 'react'
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
  showTooltip?: boolean
}

// Value % between 0-100
const getAngles = (value: number) => {
  const radius = Math.floor((value * 360) / 100)
  return { startAngle: 270, endAngle: 270 - radius }
}

const MIN_VALUE = 0.1

const CollateralChart: FC<ChartProps> = ({
  data,
  logo,
  isRSV,
  staked,
  topInformation,
  bottomInformation,
  showTooltip = false,
  ...props
}) => {
  const filteredData = useMemo(
    () => data.filter((d) => d.value >= MIN_VALUE),
    [data]
  )
  return (
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
          <TokenLogo width={20} src={logo} />
        </Box>
        <ResponsiveContainer height={180} width={180}>
          <PieChart style={{ cursor: 'pointer' }}>
            <Pie
              data={filteredData}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius={46}
              outerRadius={60}
              paddingAngle={2}
              startAngle={91}
              endAngle={451}
            >
              {filteredData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke={'none'}
                />
              ))}
            </Pie>
            <Pie
              data={filteredData.map(({ project, value }) => ({
                name: project,
                value,
              }))}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius={59}
              outerRadius={65}
              paddingAngle={2}
              startAngle={91}
              endAngle={451}
            >
              {filteredData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.projectColor}
                  stroke={'none'}
                />
              ))}
            </Pie>
            {showTooltip && (
              <Tooltip
                wrapperStyle={{ zIndex: 10 }}
                formatter={(value) => formatPercentage(Number(value), 4)}
              />
            )}
            {!isRSV && (
              <Pie
                dataKey="value"
                data={[{ value: staked, name: 'Overcollaterization' }]}
                cx="50%"
                cy="50%"
                innerRadius={75}
                outerRadius={80}
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
}

export default React.memo(CollateralChart)
