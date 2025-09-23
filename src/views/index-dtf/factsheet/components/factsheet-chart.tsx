import { ChartConfig, ChartContainer } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/utils'
import dayjs from 'dayjs'
import { useAtom } from 'jotai'
import { useMemo } from 'react'
import { Area, AreaChart, Bar, BarChart, Tooltip, XAxis, YAxis, ReferenceLine } from 'recharts'
import { Card } from '@/components/ui/card'
import ChartOverlay from './chart-overlay'
import { factsheetChartTypeAtom } from '../atoms'
import type { TimeRange } from '../mocks/factsheet-data'
import FactsheetTimeRangeSelector from './factsheet-time-range-selector'

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

const FactsheetChart = ({ data, isLoading }: FactsheetChartProps) => {
  const [chartType, setChartType] = useAtom(factsheetChartTypeAtom)

  const chartData = useMemo(() => {
    if (!data?.chartData) return []

    return data.chartData.map((point: any) => ({
      ...point,
      displayValue: chartType === 'navGrowth' ? point.navGrowth : point.monthlyPL
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
    <div className="bg-[#000] dark:bg-background lg:bg-transparent rounded-3xl lg:rounded-none text-[#fff] dark:text-foreground p-4 md:p-6 lg:p-0">
      <div className="flex justify-between items-start mb-4">
        <ChartOverlay
          timeseries={chartData}
          currentNav={data?.currentNav || 0}
        />
        {/* Chart Type Toggle - Top Right */}
        <div className="flex gap-1 bg-white/10 rounded-full p-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setChartType('navGrowth')}
            className={`h-6 px-3 text-xs rounded-full ${
              chartType === 'navGrowth'
                ? 'bg-white text-black hover:bg-white hover:text-black'
                : 'text-white/70 hover:bg-white/20 hover:text-white'
            }`}
          >
            NAV
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setChartType('monthlyPL')}
            className={`h-6 px-3 text-xs rounded-full ${
              chartType === 'monthlyPL'
                ? 'bg-white text-black hover:bg-white hover:text-black'
                : 'text-white/70 hover:bg-white/20 hover:text-white'
            }`}
          >
            P&L
          </Button>
        </div>
      </div>

      <div className="h-[300px] md:h-[400px]">
        {isLoading ? (
          <Skeleton className="h-full w-full rounded-lg" />
        ) : chartData.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-full w-full">
            {chartType === 'navGrowth' ? (
              <AreaChart
                data={chartData}
                margin={{ left: 50, right: 10, top: 5, bottom: 30 }}
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
                  tick={{ fontSize: 11, opacity: 0.5 }}
                  tickFormatter={formatXAxisTick}
                  className="[&_.recharts-cartesian-axis-tick_text]:!fill-white/50 dark:[&_.recharts-cartesian-axis-tick_text]:!fill-foreground/50"
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
                  className="[&_.recharts-cartesian-axis-tick_text]:!fill-white/50 dark:[&_.recharts-cartesian-axis-tick_text]:!fill-foreground/50"
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
                margin={{ left: 50, right: 10, top: 5, bottom: 30 }}
              >
                <XAxis
                  dataKey="timestamp"
                  tick={{ fontSize: 11, opacity: 0.5 }}
                  tickFormatter={formatXAxisTick}
                  className="[&_.recharts-cartesian-axis-tick_text]:!fill-white/50 dark:[&_.recharts-cartesian-axis-tick_text]:!fill-foreground/50"
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                  tickMargin={10}
                />
                <YAxis
                  dataKey="displayValue"
                  orientation="left"
                  tick={{ fontSize: 11, opacity: 0.5 }}
                  tickFormatter={(value) => `${value.toFixed(0)}%`}
                  className="[&_.recharts-cartesian-axis-tick_text]:!fill-white/50 dark:[&_.recharts-cartesian-axis-tick_text]:!fill-foreground/50"
                  axisLine={false}
                  tickLine={false}
                  domain={['dataMin - 10', 'dataMax + 10']}
                  width={45}
                  tickCount={6}
                  tickMargin={5}
                />
                <Tooltip content={<CustomTooltip chartType={chartType} />} />
                <ReferenceLine y={0} stroke="#666" strokeWidth={1} />
                <Bar
                  dataKey="displayValue"
                  fill={(data: any) => data.displayValue >= 0 ? '#22c55e' : '#ef4444'}
                  isAnimationActive={true}
                  animationDuration={500}
                  animationEasing="ease-in-out"
                  shape={(props: any) => {
                    const fill = props.payload.displayValue >= 0 ? '#22c55e' : '#ef4444'
                    return <rect {...props} fill={fill} />
                  }}
                />
              </BarChart>
            )}
          </ChartContainer>
        ) : null}
      </div>

      {/* Time Range Selector - Bottom Left */}
      <div className="mt-4">
        <FactsheetTimeRangeSelector />
      </div>

      {/* Disclaimer text */}
      <p className="text-xs text-white/40 dark:text-muted-foreground mt-4">
        Performance shown assumes an initial investment of $100 and represents cumulative performance net of fees from
        fund inception. *Performance for periods of one year or less is not annualized.
      </p>
    </div>
  )
}

export default FactsheetChart