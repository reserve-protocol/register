import { ChartConfig, ChartContainer } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { useIsMobile } from '@/hooks/use-media-query'
import {
  indexDTF7dChangeAtom,
  indexDTFAtom,
  indexDTFMarketCapAtom,
  isYieldIndexDTFAtom,
  performanceTimeRangeAtom,
} from '@/state/dtf/atoms'
import {
  formatCurrency,
  formatPercentage,
  formatToSignificantDigits,
} from '@/utils'
import { formatXAxisTick as formatTick } from '@/utils/chart-formatters'
import dayjs from 'dayjs'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'
import {
  Area,
  AreaChart,
  ReferenceLine,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from 'recharts'
import useIndexDTFPriceHistory from '../../hooks/use-dtf-price-history'
import useIndexDTFApyHistory from '../../hooks/use-dtf-apy-history'
import IndexCTAsOverviewMobile from '../index-ctas-overview-mobile'
import IndexTokenAddress from '../index-token-address'
import ChartOverlay from './chart-overlay'
import DataTypeSelector from './data-type-selector'
import TimeRangeSelector, { Range } from './time-range-selector'

const chartConfig = {
  desktop: {
    label: 'Desktop',
    color: 'hsl(var(--card))',
  },
} satisfies ChartConfig

export type DataType = 'price' | 'marketCap' | 'totalSupply' | 'yield'

const now = Math.floor(Date.now() / 1_000)
const currentHour = Math.floor(now / 3_600) * 3_600

const historicalConfigs: Record<
  Range,
  { to: number; from: number; interval: '1h' | '1d' }
> = {
  '24h': { to: currentHour, from: currentHour - 86_400, interval: '1h' },
  '7d': { to: currentHour, from: currentHour - 604_800, interval: '1h' },
  '1m': { to: currentHour, from: currentHour - 2_592_000, interval: '1h' },
  '3m': { to: currentHour, from: currentHour - 7_776_000, interval: '1d' },
  '1y': { to: currentHour, from: currentHour - 31_536_000, interval: '1d' },
  all: { to: currentHour, from: 0, interval: '1d' },
}

function PriceTooltip({
  payload,
  active,
  dataType,
}: {
  payload?: TooltipProps<number, string>['payload']
  active?: boolean
  dataType: DataType
}) {
  if (active && payload) {
    const subtitle = dayjs
      .unix(+payload[0]?.payload?.timestamp)
      .format('YYYY-M-D HH:mm')
    const value = payload[0]?.payload?.[dataType]
    const formattedValue =
      dataType === 'price'
        ? formatToSignificantDigits(value)
        : formatCurrency(value, 2)
    return (
      <div className="bg-card text-card-foreground rounded-[20px] p-4">
        <span className="text-base font-medium block mb-1">
          ${formattedValue}
        </span>
        <span className="text-sm text-muted-foreground">{subtitle}</span>
      </div>
    )
  }

  return null
}

function YieldTooltip({
  payload,
  active,
}: {
  payload?: TooltipProps<number, string>['payload']
  active?: boolean
}) {
  if (active && payload) {
    const d = payload[0]?.payload
    const subtitle = dayjs.unix(+d?.timestamp).format('YYYY-M-D HH:mm')
    return (
      <div className="bg-card text-card-foreground rounded-[20px] p-4">
        <span className="text-base font-medium block mb-1">
          {formatPercentage(d?.totalAPY)} Total APY
        </span>
        <div className="text-sm text-muted-foreground space-y-0.5 mb-1">
          <div>{formatPercentage(d?.collateralAPY)} Base APY</div>
          <div>{formatPercentage(d?.redirectAPY)} Revenue Boost</div>
        </div>
        <span className="text-sm text-muted-foreground">{subtitle}</span>
      </div>
    )
  }

  return null
}

export const dataTypeAtom = atom<DataType>('price')

const PriceChart = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const range = useAtomValue(performanceTimeRangeAtom)
  const dataType = useAtomValue(dataTypeAtom)
  const set7dChange = useSetAtom(indexDTF7dChangeAtom)
  const setMarketCap = useSetAtom(indexDTFMarketCapAtom)
  const isMobile = useIsMobile()
  const isYieldIndexDTF = useAtomValue(isYieldIndexDTFAtom)
  const isYieldMode = dataType === 'yield'

  const showHourlyInterval = now - (dtf?.timestamp || 0) < 30 * 86_400
  const config =
    range === 'all'
      ? {
          to: currentHour,
          from: dtf?.timestamp || 0,
          interval: (showHourlyInterval ? '1h' : '1d') as '1h' | '1d',
        }
      : historicalConfigs[range]

  const prefetchRanges = useMemo(() => {
    const ranges: Range[] = ['24h', '7d', '1m', '3m', '1y', 'all']
    return ranges
      .filter((r) => r !== range)
      .map((r) => {
        if (r === 'all') {
          return {
            to: currentHour,
            from: dtf?.timestamp || 0,
            interval: (showHourlyInterval ? '1h' : '1d') as '1h' | '1d',
          }
        }
        return {
          ...historicalConfigs[r],
          ...(showHourlyInterval ? { interval: '1h' as const } : {}),
        }
      })
  }, [range, dtf?.timestamp, showHourlyInterval])

  const { data: history } = useIndexDTFPriceHistory({
    address: dtf?.id,
    ...config,
    ...(showHourlyInterval && range !== 'all'
      ? { interval: '1h' as const }
      : {}),
    prefetchRanges,
  })

  const { data: apyHistory } = useIndexDTFApyHistory()

  const timeseries = useMemo(() => {
    return history?.timeseries.filter(({ price }) => Boolean(price)) || []
  }, [history?.timeseries])

  const apyTimeseries = useMemo(() => {
    if (!apyHistory) return []
    const rangeFrom =
      range === 'all' ? 0 : (historicalConfigs[range]?.from ?? 0)
    return apyHistory.filter((d) => d.timestamp >= rangeFrom)
  }, [apyHistory, range])

  const chartData = isYieldMode ? apyTimeseries : timeseries
  const chartKey = isYieldMode ? 'totalAPY' : dataType

  const avgApy = useMemo(() => {
    if (!apyTimeseries.length) return 0
    return (
      apyTimeseries.reduce((sum, d) => sum + d.totalAPY, 0) /
      apyTimeseries.length
    )
  }, [apyTimeseries])

  const xAxisTicks = useMemo(() => {
    if (chartData.length === 0) return []

    const mobilePositions = [0.15, 0.38, 0.62, 0.85]
    const desktopPositions = [0.05, 0.23, 0.41, 0.59, 0.77, 0.95]

    const positions = isMobile ? mobilePositions : desktopPositions

    return positions
      .map((i) => chartData[Math.floor(chartData.length * i)]?.timestamp)
      .filter(Boolean)
  }, [chartData, isMobile])

  useEffect(() => {
    if (timeseries.length > 0 && range === '7d') {
      const firstValue = timeseries[0].price
      const lastValue = timeseries[timeseries.length - 1].price

      const percentageChange =
        firstValue === 0 ? undefined : (lastValue - firstValue) / firstValue
      set7dChange(percentageChange)
    }
  }, [timeseries, range, set7dChange])

  useEffect(() => {
    if (timeseries.length > 0) {
      setMarketCap(timeseries[timeseries.length - 1].marketCap)
    }
  }, [timeseries, setMarketCap])

  const formatXAxisTick = (timestamp: number) => {
    return formatTick(timestamp, range, dtf?.timestamp)
  }

  const formatYAxisTick = (value: number) => {
    if (isYieldMode) {
      return formatPercentage(value)
    }
    if (dataType === 'totalSupply') {
      return formatCurrency(value, 0)
    }
    return '$' + formatCurrency(value, value >= 1000 ? 0 : value < 1 ? 4 : 2)
  }

  const isLoading = isYieldMode ? !apyHistory : history === undefined

  return (
    <div
      className={`lg:rounded-4xl lg:rounded-b-none bg-[#000] dark:bg-background lg:dark:bg-muted w-full text-[#fff] dark:text-foreground py-3 sm:py-6 pb-20 sm:h-[598px] xl:h-[599px] overflow-hidden ${isYieldIndexDTF ? 'h-[478px]' : 'h-[438px]'}`}
    >
      <div className="px-3 sm:px-6">
        <ChartOverlay timeseries={timeseries} apyTimeseries={apyTimeseries} />
        <div
          className={`pt-2 sm:pt-0 ${isYieldIndexDTF ? (isYieldMode ? 'h-[176px]' : 'h-[192px]') + ' sm:h-[254px] xl:h-[294px]' : 'h-48 sm:h-[300px]'}`}
        >
          {isLoading ? (
            <Skeleton
              className={`w-full rounded-lg ${isYieldIndexDTF ? (isYieldMode ? 'h-[158px]' : 'h-[174px]') + ' sm:h-[244px] xl:h-[284px]' : 'h-44 sm:h-[290px]'}`}
            />
          ) : chartData.length > 0 ? (
            <ChartContainer
              config={chartConfig}
              className={`w-full ${isYieldIndexDTF ? (isYieldMode ? 'h-[176px]' : 'h-[192px]') + ' sm:h-[254px] xl:h-[294px]' : 'h-48 sm:h-[300px]'}`}
            >
              <AreaChart
                data={chartData}
                margin={{ left: 0, right: 0, top: 5, bottom: 5 }}
                {...{
                  overflow: 'visible',
                }}
              >
                <defs>
                  {isYieldMode ? (
                    <linearGradient
                      id="yieldGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#4ADE80" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#4ADE80" stopOpacity={0} />
                    </linearGradient>
                  ) : (
                    <pattern
                      id="dots"
                      x="0"
                      y="0"
                      width="3"
                      height="3"
                      patternUnits="userSpaceOnUse"
                    >
                      <circle
                        cx="1"
                        cy="1"
                        r="0.4"
                        fill="#E5EEFA"
                        opacity="1"
                      />
                    </pattern>
                  )}
                </defs>
                <XAxis
                  dataKey="timestamp"
                  tick={{ fontSize: 13, opacity: 0.7 }}
                  tickFormatter={formatXAxisTick}
                  className="[&_.recharts-cartesian-axis-tick_text]:!fill-white"
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStart"
                  ticks={xAxisTicks}
                  tickMargin={10}
                />
                <YAxis
                  dataKey={chartKey}
                  orientation="right"
                  tick={{ fontSize: 13, opacity: 0.7 }}
                  tickFormatter={formatYAxisTick}
                  className="[&_.recharts-cartesian-axis-tick_text]:!fill-white"
                  axisLine={false}
                  tickLine={false}
                  domain={['auto', 'auto']}
                  width={55}
                  tickCount={5}
                  tickMargin={5}
                />
                <Tooltip
                  content={
                    isYieldMode ? (
                      <YieldTooltip />
                    ) : (
                      <PriceTooltip dataType={dataType} />
                    )
                  }
                />
                {isYieldMode && avgApy > 0 && (
                  <ReferenceLine
                    y={avgApy}
                    stroke="#fff"
                    strokeDasharray="4 4"
                    strokeOpacity={0.4}
                    label={{
                      value: `Avg ${formatPercentage(avgApy)}`,
                      position: 'insideBottomRight',
                      fill: '#fff',
                      fontSize: 12,
                      opacity: 0.8,
                    }}
                  />
                )}
                <Area
                  type="monotone"
                  dataKey={chartKey}
                  stroke={isYieldMode ? '#4ADE80' : '#E5EEFA'}
                  strokeWidth={1.5}
                  fill={isYieldMode ? 'url(#yieldGradient)' : 'url(#dots)'}
                  isAnimationActive={true}
                  animationDuration={500}
                  animationEasing="ease-in-out"
                />
              </AreaChart>
            </ChartContainer>
          ) : null}
        </div>
      </div>
      <div
        className={`flex flex-col xl:flex-row gap-2 mt-2 ${isYieldIndexDTF ? 'xl:border-t xl:border-white/20 xl:pt-4' : 'border-t border-white/20 pt-4'}`}
      >
        {isYieldIndexDTF && (
          <div className="flex xl:hidden items-center justify-between mb-2 px-5 pt-2 pb-4 sm:px-6 border-b border-white/20">
            <TimeRangeSelector variant="minimal" />
            <DataTypeSelector variant="minimal" />
          </div>
        )}
        <div className="flex items-center gap-2 justify-between xl:flex-1">
          <div className="pl-6 hidden xl:block">
            <TimeRangeSelector />
          </div>
          {isYieldIndexDTF ? (
            <div className="hidden xl:block pr-6">
              <DataTypeSelector />
            </div>
          ) : (
            <div className="hidden xl:block pr-6">
              <IndexTokenAddress />
            </div>
          )}
          <div className="flex xl:hidden flex-1 pl-3 sm:pl-6">
            <IndexTokenAddress />
          </div>
          <div className="min-w-sm pr-3 xl:pr-6 xl:hidden">
            <IndexCTAsOverviewMobile />
          </div>
        </div>
      </div>
    </div>
  )
}

export default PriceChart
