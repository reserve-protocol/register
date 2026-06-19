import { Area } from 'recharts'
import { DataType } from './price-chart-constants'

const areaAnimation = {
  isAnimationActive: true,
  animationDuration: 500,
  animationEasing: 'ease-in-out' as const,
}

export const renderPriceChartSeries = ({
  chartKey,
  dotsMaskId,
  fill,
  isYieldMode,
  preLaunchFill,
  shouldSplit,
  strokeColor,
}: {
  chartKey: DataType | 'totalAPY'
  dotsMaskId: string
  fill: string
  isYieldMode: boolean
  preLaunchFill: string
  shouldSplit: boolean
  strokeColor: string
}) => {
  const mask = !isYieldMode ? `url(#${dotsMaskId})` : undefined

  if (shouldSplit) {
    return [
      <Area
        key="pre-launch-fill"
        type="monotone"
        dataKey="preLaunchValue"
        stroke="none"
        fill={preLaunchFill}
        mask={mask}
        {...areaAnimation}
      />,
      <Area
        key="post-launch-fill"
        type="monotone"
        dataKey="postLaunchValue"
        stroke="none"
        fill={fill}
        mask={mask}
        {...areaAnimation}
      />,
      <Area
        key="pre-launch-stroke"
        type="monotone"
        dataKey="preLaunchValue"
        stroke={strokeColor}
        strokeDasharray="2 3"
        strokeLinecap="round"
        strokeWidth={1.5}
        fill="transparent"
        {...areaAnimation}
      />,
      <Area
        key="post-launch-stroke"
        type="monotone"
        dataKey="postLaunchValue"
        stroke={strokeColor}
        strokeWidth={1.5}
        fill="transparent"
        {...areaAnimation}
      />,
    ]
  }

  return [
    <Area
      key="fill"
      type="monotone"
      dataKey={chartKey}
      stroke="none"
      fill={fill}
      mask={mask}
      {...areaAnimation}
    />,
    <Area
      key="stroke"
      type="monotone"
      dataKey={chartKey}
      stroke={strokeColor}
      strokeWidth={1.5}
      fill="transparent"
      {...areaAnimation}
    />,
  ]
}
