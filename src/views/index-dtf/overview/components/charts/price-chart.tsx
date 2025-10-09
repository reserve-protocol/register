import InfoBox from '@/components/old/info-box'
import { ChartConfig, ChartContainer } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { useIsMobile } from '@/hooks/use-media-query'
import {
  indexDTF7dChangeAtom,
  indexDTFAtom,
  indexDTFMarketCapAtom,
  performanceTimeRangeAtom,
} from '@/state/dtf/atoms'
import { formatCurrency, formatToSignificantDigits } from '@/utils'
import { formatXAxisTick as formatTick } from '@/utils/chart-formatters'
import dayjs from 'dayjs'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'
import { Area, AreaChart, Tooltip, TooltipProps, XAxis, YAxis } from 'recharts'
import { Card } from 'theme-ui'
import useIndexDTFPriceHistory from '../../hooks/use-dtf-price-history'
import IndexCTAsOverviewMobile from '../index-ctas-overview-mobile'
import IndexTokenAddress from '../index-token-address'
import ChartOverlay from './chart-overlay'
import TimeRangeSelector, { Range } from './time-range-selector'

const chartConfig = {
  desktop: {
    label: 'Desktop',
    color: 'hsl(var(--card))',
  },
} satisfies ChartConfig

export type DataType = 'price' | 'marketCap' | 'totalSupply'

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

function CustomTooltip({
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
      <Card backgroundColor="cardBackground">
        <InfoBox title={'$' + formattedValue} subtitle={subtitle} />
      </Card>
    )
  }

  return null
}

export const dataTypeAtom = atom<DataType>('price')

// TODO: Storing 7day change here, probably not the best place
const PriceChart = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const range = useAtomValue(performanceTimeRangeAtom)
  const dataType = useAtomValue(dataTypeAtom)
  const set7dChange = useSetAtom(indexDTF7dChangeAtom)
  const setMarketCap = useSetAtom(indexDTFMarketCapAtom)
  const isMobile = useIsMobile()

  const showHourlyInterval = now - (dtf?.timestamp || 0) < 30 * 86_400
  const config =
    range === 'all'
      ? {
          to: currentHour,
          from: dtf?.timestamp || 0,
          interval: (showHourlyInterval ? '1h' : '1d') as '1h' | '1d',
        }
      : historicalConfigs[range]

  // Build prefetch ranges for all other time ranges
  const prefetchRanges = useMemo(() => {
    const ranges: Range[] = ['24h', '7d', '1m', '3m', '1y', 'all']
    return ranges
      .filter((r) => r !== range) // Exclude current range
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

  const timeseries = useMemo(() => {
    return history?.timeseries.filter(({ price }) => Boolean(price)) || []
  }, [history?.timeseries])

  // Different tick positions for mobile vs desktop
  const xAxisTicks = useMemo(() => {
    if (timeseries.length === 0) return []

    const mobilePositions = [0.15, 0.38, 0.62, 0.85]
    const desktopPositions = [0.05, 0.23, 0.41, 0.59, 0.77, 0.95]

    const positions = isMobile ? mobilePositions : desktopPositions

    return positions
      .map((i) => timeseries[Math.floor(timeseries.length * i)]?.timestamp)
      .filter(Boolean)
  }, [timeseries, isMobile])

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

  // Wrapper to maintain backward compatibility
  const formatXAxisTick = (timestamp: number) => {
    return formatTick(timestamp, range, dtf?.timestamp)
  }

  const formatYAxisTick = (value: number) => {
    if (dataType === 'totalSupply') {
      return formatCurrency(value, 0)
    }
    return '$' + formatCurrency(value, value < 1 ? 4 : 2)
  }

  return (
    <div className="lg:rounded-4xl lg:rounded-b-none bg-[#000] dark:bg-background lg:dark:bg-muted w-full text-[#fff] dark:text-foreground py-3 sm:py-6 pb-20 h-[438px] sm:h-[598px] xl:h-[599px]">
      <div className="px-3 sm:px-6">
        <ChartOverlay timeseries={timeseries} />
        <div className="h-48 sm:h-[300px] pt-2 sm:pt-0">
          {history === undefined ? (
            <Skeleton className="h-44 sm:h-[290px] w-full rounded-lg" />
          ) : timeseries.length > 0 ? (
            <ChartContainer
              config={chartConfig}
              className="h-48 sm:h-[300px] w-full"
            >
              <AreaChart
                data={timeseries}
                margin={{ left: 0, right: 0, top: 5, bottom: 5 }}
                {...{
                  overflow: 'visible',
                }}
              >
                <defs>
                  <pattern
                    id="dots"
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
                  dataKey={dataType}
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
                <Tooltip content={<CustomTooltip dataType={dataType} />} />
                <Area
                  type="monotone"
                  dataKey={dataType}
                  stroke="#E5EEFA"
                  strokeWidth={1.5}
                  fill="url(#dots)"
                  isAnimationActive={true}
                  animationDuration={500}
                  animationEasing="ease-in-out"
                />
              </AreaChart>
            </ChartContainer>
          ) : null}
        </div>
      </div>
      <div className="flex items-center gap-2 justify-between mt-2 border-t border-white/20 pt-4">
        <div className="pl-6 hidden xl:block">
          <TimeRangeSelector />
        </div>
        <div className="hidden xl:block pr-6">
          <IndexTokenAddress />
        </div>
        <div className="flex xl:hidden flex-1 pl-3 sm:pl-6">
          <IndexTokenAddress />
        </div>
        <div className="min-w-sm pr-3 xl:pr-6 xl:hidden">
          <IndexCTAsOverviewMobile />
        </div>
      </div>
    </div>
  )
}

export default PriceChart
