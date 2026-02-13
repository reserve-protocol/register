import { cn } from '@/lib/utils'
import TokenLogo from 'components/icons/TokenLogo'
import React, { FC, ReactNode, useMemo } from 'react'
import { Cell, Pie, PieChart, Tooltip } from 'recharts'
import { colors } from 'theme'
import { formatPercentage } from 'utils'

interface ChartProps {
  data: {
    name: string
    value: number
    color: string
    project: string
    projectColor: string
  }[]
  staked: number
  logo: string
  topInformation?: ReactNode
  bottomInformation?: ReactNode
  showTooltip?: boolean
  isRebalancing?: boolean
  className?: string
}

// Value % between 0-100
const getAngles = (value: number) => {
  const radius = Math.floor((value * 360) / 100)
  return { startAngle: 270, endAngle: 270 - radius }
}

const MIN_VALUE = 0.1

const staticData = [{ value: 100 }]

const REBALANCING_PIES = [
  {
    innerRadius: 10,
    outerRadius: 25,
  },
  {
    innerRadius: 10,
    outerRadius: 45,
  },
  {
    innerRadius: 10,
    outerRadius: 65,
  },
]

const CollateralChart: FC<ChartProps> = ({
  data,
  logo,
  staked,
  topInformation,
  bottomInformation,
  showTooltip = false,
  isRebalancing = false,
  className,
}) => {
  const filteredData = useMemo(
    () =>
      data
        .filter((d) => d.value >= MIN_VALUE)
        .sort((a, b) => b.value - a.value),
    [data]
  )
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2',
        className
      )}
    >
      {topInformation}
      <div className="relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <TokenLogo width={20} src={logo} />
        </div>
        <div className="w-[180px] h-[180px]">
          <PieChart width={180} height={180} style={{ cursor: 'pointer' }}>
            <defs>
              <linearGradient
                id="stkcvxeusd3crv-f"
                x1="10%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#3E73C4" />
                <stop offset="50%" stopColor="#000000" />
                <stop offset="100%" stopColor="#000000" />
              </linearGradient>
              <style>
                {`
                  @keyframes breathe {
                    0%, 100% {
                      transform: scale(0.95);
                    }
                    50% {
                      transform: scale(1);
                    }
                  }
                `}
              </style>
            </defs>
            {isRebalancing ? (
              REBALANCING_PIES.map((pie, index) => (
                <Pie
                  key={index}
                  data={staticData}
                  dataKey="value"
                  isAnimationActive={false}
                  cx="50%"
                  cy="50%"
                  {...pie}
                  style={{
                    animation: 'breathe 2s infinite',
                    transformOrigin: 'center',
                  }}
                >
                  <Cell opacity={0.3} stroke="none" fill={colors.rebalancing} />
                </Pie>
              ))
            ) : (
              <>
                <Pie
                  data={filteredData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={46}
                  outerRadius={60}
                  paddingAngle={2}
                  startAngle={269}
                  endAngle={-91}
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
                  startAngle={269}
                  endAngle={-91}
                >
                  {filteredData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.projectColor}
                      stroke={'none'}
                    />
                  ))}
                </Pie>
              </>
            )}
            {showTooltip && (
              <Tooltip
                wrapperStyle={{ zIndex: 10 }}
                formatter={(value) => formatPercentage(Number(value), 2)}
              />
            )}

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
          </PieChart>
        </div>
      </div>
      {bottomInformation}
    </div>
  )
}

export default React.memo(CollateralChart)
