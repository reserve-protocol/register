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
  priceLineShadowFilterId,
  shouldSplit,
  strokeColor,
  activeDot,
}: {
  chartKey: DataType | 'totalAPY'
  dotsMaskId: string
  fill: string
  isYieldMode: boolean
  preLaunchFill: string
  priceLineShadowFilterId: string
  shouldSplit: boolean
  strokeColor: string
  activeDot?: boolean
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
        activeDot={activeDot}
        {...areaAnimation}
      />,
      <Area
        key="post-launch-fill"
        type="monotone"
        dataKey="postLaunchValue"
        stroke="none"
        fill={fill}
        mask={mask}
        activeDot={activeDot}
        {...areaAnimation}
      />,
      <Area
        key="pre-launch-stroke"
        type="monotone"
        dataKey="preLaunchValue"
        stroke={strokeColor}
        strokeWidth={2}
        fill="transparent"
        filter={`url(#${priceLineShadowFilterId})`}
        activeDot={activeDot}
        {...areaAnimation}
      />,
      <Area
        key="post-launch-stroke"
        type="monotone"
        dataKey="postLaunchValue"
        stroke={strokeColor}
        strokeWidth={2}
        fill="transparent"
        filter={`url(#${priceLineShadowFilterId})`}
        activeDot={activeDot}
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
      activeDot={activeDot}
      {...areaAnimation}
    />,
    <Area
      key="stroke"
      type="monotone"
      dataKey={chartKey}
      stroke={strokeColor}
      strokeWidth={2}
      fill="transparent"
      filter={`url(#${priceLineShadowFilterId})`}
      activeDot={activeDot}
      {...areaAnimation}
    />,
  ]
}
