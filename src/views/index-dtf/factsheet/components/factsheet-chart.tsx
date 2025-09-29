import { Card } from '@/components/ui/card'
import { ChartConfig, ChartContainer } from '@/components/ui/chart'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/utils'
import dayjs from 'dayjs'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import TimeRangeSelector, {
  timeRangeAtom,
} from '../../overview/components/charts/time-range-selector'
import { factsheetChartTypeAtom } from '../atoms'
import { useSetAtom } from 'jotai'
import { useEffect } from 'react'
import ChartOverlay from './chart-overlay'
import ChartTypeSelector from './chart-type-selector'

const chartConfig = {
  desktop: {
    label: 'Desktop',
    color: 'hsl(var(--card))',
  },
} satisfies ChartConfig

function CustomTooltip({ payload, active, chartType }: any) {
  if (active && payload?.[0]) {
    const data = payload[0].payload
    const subtitle = dayjs.unix(data.timestamp).format('YYYY-M-D HH:mm')
    const value = chartType === 'navGrowth' ? data.navGrowth : data.monthlyPL
    const label = chartType === 'navGrowth' ? 'NAV' : 'P&L'

    return (
      <Card className="p-3 bg-background/95 backdrop-blur">
        <p className="text-xs text-muted-foreground">{subtitle}</p>
        <p className="text-sm font-semibold">
          {label}: ${formatCurrency(value, 2)}
          {chartType === 'monthlyPL' && '%'}
        </p>
      </Card>
    )
  }
  return null
}

interface FactsheetChartProps {
  data: any
  isLoading?: boolean
}

export const CustomizedAxisTick = ({
  x,
  y,
  payload,
  rotateAngle = -90,
  formatXAxisTick,
}: {
  x?: number
  y?: number
  payload?: any
  rotateAngle?: number
  formatXAxisTick: (value: number) => string
}) => {
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={16}
        textAnchor="end"
        fill="#666"
        transform={`rotate(${rotateAngle})`}
        style={{ fontSize: 11, opacity: 0.5 }}
      >
        {formatXAxisTick(payload.value)}
      </text>
    </g>
  )
}

const FactsheetChart = ({ data, isLoading }: FactsheetChartProps) => {
  const chartType = useAtomValue(factsheetChartTypeAtom)
  const setTimeRange = useSetAtom(timeRangeAtom)

  // Force 'all' time range when Monthly P&L is selected
  useEffect(() => {
    if (chartType === 'monthlyPL') {
      setTimeRange('all')
    }
  }, [chartType, setTimeRange])

  const chartData = useMemo(() => {
    if (!data?.chartData) return []

    return data.chartData.map((point: any) => ({
      ...point,
      displayValue:
        chartType === 'navGrowth' ? point.navGrowth : point.monthlyPL,
    }))
  }, [data?.chartData, chartType])

  const formatXAxisTick = (timestamp: number) => {
    const date = dayjs.unix(timestamp)
    return date.format("MMM 'YY")
  }

  const formatYAxisTick = (value: number) => {
    if (chartType === 'monthlyPL') {
      return `${value.toFixed(1)}%`
    }
    return '$' + formatCurrency(value, value < 100 ? 2 : 0)
  }

  return (
    <div className="bg-[#000] dark:bg-background lg:dark:bg-muted rounded-3xl text-[#fff] dark:text-foreground py-6">
      <div className="mb-4 px-6">
        <ChartOverlay
          timeseries={chartData}
          currentNav={data?.currentNav || 0}
        />
      </div>

      <div className="h-[300px] md:h-[400px] px-6">
        {isLoading ? (
          <Skeleton className="h-full w-full rounded-lg" />
        ) : chartData.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-full w-full">
            {chartType === 'navGrowth' ? (
              <AreaChart
                data={chartData}
                margin={{ left: 0, right: 0, top: 0, bottom: 30 }}
                {...{
                  overflow: 'visible',
                }}
              >
                <defs>
                  <pattern
                    id="factsheet-dots"
                    x="0"
                    y="0"
                    width="3"
                    height="3"
                    patternUnits="userSpaceOnUse"
                  >
                    <circle cx="1" cy="1" r="0.4" fill="#E5EEFA" opacity="1" />
                  </pattern>
                </defs>
                <XAxis
                  dataKey="timestamp"
                  tick={
                    <CustomizedAxisTick formatXAxisTick={formatXAxisTick} />
                  }
                  tickFormatter={formatXAxisTick}
                  className="[&_.recharts-cartesian-axis-tick_text]:!fill-white"
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                  tickMargin={10}
                />
                <YAxis
                  dataKey="displayValue"
                  orientation="left"
                  tick={{ fontSize: 11, opacity: 0.5 }}
                  tickFormatter={formatYAxisTick}
                  className="[&_.recharts-cartesian-axis-tick_text]:!fill-white"
                  axisLine={false}
                  tickLine={false}
                  domain={['auto', 'auto']}
                  width={45}
                  tickCount={6}
                  tickMargin={5}
                />
                <Tooltip content={<CustomTooltip chartType={chartType} />} />
                <Area
                  type="monotone"
                  dataKey="displayValue"
                  stroke="#E5EEFA"
                  strokeWidth={1.5}
                  fill="url(#factsheet-dots)"
                  isAnimationActive={true}
                  animationDuration={500}
                  animationEasing="ease-in-out"
                />
              </AreaChart>
            ) : (
              <BarChart
                data={chartData}
                margin={{ left: 0, right: 0, top: 0, bottom: 30 }}
                {...{
                  overflow: 'visible',
                }}
              >
                <XAxis
                  dataKey="timestamp"
                  tick={
                    <CustomizedAxisTick formatXAxisTick={formatXAxisTick} />
                  }
                  tickFormatter={formatXAxisTick}
                  className="[&_.recharts-cartesian-axis-tick_text]:!fill-white"
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                  tickMargin={10}
                />
                <YAxis
                  orientation="left"
                  tick={{ fontSize: 11, opacity: 0.5 }}
                  tickFormatter={(value) => `${value.toFixed(0)}%`}
                  className="[&_.recharts-cartesian-axis-tick_text]:!fill-white"
                  axisLine={false}
                  tickLine={false}
                  domain={['auto', 'auto']}
                  width={45}
                  tickCount={6}
                  tickMargin={5}
                />
                <Tooltip content={<CustomTooltip chartType={chartType} />} />
                <ReferenceLine y={0} stroke="#666" strokeWidth={1} />
                <Bar dataKey="displayValue">
                  {chartData.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.displayValue >= 0 ? '#22c55e' : '#ef4444'}
                    />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ChartContainer>
        ) : null}
      </div>

      <div className="mt-4 px-6 flex items-center gap-2 justify-between w-full">
        {chartType === 'monthlyPL' ? <div /> : <TimeRangeSelector />}
        <ChartTypeSelector />
      </div>

      <Separator className="bg-white/10 mt-5" />

      <p className="text-base text-muted-foreground pt-5 px-6">
        Performance shown assumes an initial investment of $100 and represents
        cumulative performance net of fees from fund inception. *Performance for
        periods of one year or less is not annualized.
      </p>
    </div>
  )
}

export default FactsheetChart
