import { Card } from '@/components/ui/card'
import { ChartConfig, ChartContainer } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { indexDTFAtom, performanceTimeRangeAtom } from '@/state/dtf/atoms'
import { formatCurrency, formatToSignificantDigits } from '@/utils'
import { formatXAxisTick as formatTick } from '@/utils/chart-formatters'
import dayjs from 'dayjs'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'
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
import TimeRangeSelector from '../../overview/components/charts/time-range-selector'
import { factsheetChartTypeAtom } from '../atoms'
import type { FactsheetData } from '../types/factsheet-data'
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
          {label}: ${formatToSignificantDigits(value)}
          {chartType === 'monthlyPL' && '%'}
        </p>
      </Card>
    )
  }
  return null
}

interface FactsheetChartProps {
  data?: FactsheetData
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
  const setTimeRange = useSetAtom(performanceTimeRangeAtom)
  const timeRange = useAtomValue(performanceTimeRangeAtom)
  const dtf = useAtomValue(indexDTFAtom)

  // Force 'all' time range when Monthly P&L is selected
  useEffect(() => {
    if (chartType === 'monthlyPL') {
      setTimeRange('all')
    }
  }, [chartType, setTimeRange])

  const chartData = useMemo(() => {
    if (chartType === 'navGrowth') {
      if (!data?.chartData) return []
      return data.chartData.map((point: any) => ({
        ...point,
        displayValue: point.navGrowth,
      }))
    } else {
      // Use monthly aggregated data for P&L chart
      if (!data?.monthlyChartData) return []
      return data.monthlyChartData.map((point: any) => ({
        ...point,
        displayValue: point.monthlyPL,
      }))
    }
  }, [data?.chartData, data?.monthlyChartData, chartType])

  // Calculate optimal tick interval based on data points
  const xAxisInterval = useMemo(() => {
    if (!chartData.length) return 0
    const dataLength = chartData.length
    const maxTicks = 10

    if (dataLength <= maxTicks) return 0
    return Math.ceil(dataLength / maxTicks) - 1
  }, [chartData])

  const formatXAxisTick = (timestamp: number) => {
    if (chartType === 'navGrowth') {
      return formatTick(timestamp, timeRange, dtf?.timestamp)
    }
    // Monthly P&L chart always shows month/year format
    const date = dayjs.unix(timestamp)
    return date.format("MMM 'YY")
  }

  const formatYAxisTick = (value: number) => {
    if (chartType === 'monthlyPL') {
      return `${value.toFixed(1)}%`
    }
    return '$' + formatCurrency(value, value < 1 ? 4 : 2)
  }

  return (
    <div className="bg-[#000] dark:bg-background lg:dark:bg-muted sm:rounded-3xl text-[#fff] dark:text-foreground py-6">
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
                  interval={xAxisInterval}
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
        <div className="hidden sm:block">
          <ChartTypeSelector />
        </div>
      </div>
    </div>
  )
}

export default FactsheetChart
