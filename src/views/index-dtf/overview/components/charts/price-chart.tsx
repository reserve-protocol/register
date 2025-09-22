import InfoBox from '@/components/old/info-box'
import { ChartConfig, ChartContainer } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import {
  indexDTF7dChangeAtom,
  indexDTFAtom,
  indexDTFMarketCapAtom,
} from '@/state/dtf/atoms'
import { formatCurrency } from '@/utils'
import dayjs from 'dayjs'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'
import { Area, AreaChart, Tooltip, XAxis, YAxis } from 'recharts'
import { Card } from 'theme-ui'
import useIndexDTFPriceHistory from '../../hooks/use-dtf-price-history'
import ChartOverlay from './chart-overlay'

const chartConfig = {
  desktop: {
    label: 'Desktop',
    color: 'hsl(var(--card))',
  },
} satisfies ChartConfig

type Range = '24h' | '3d' | '7d' | '1m' | '3m' | '1y'
export type DataType = 'price' | 'marketCap' | 'totalSupply'

const now = Math.floor(Date.now() / 1_000)
const currentHour = Math.floor(now / 3_600) * 3_600

const historicalConfigs = {
  '24h': { to: currentHour, from: currentHour - 86_400, interval: '1h' },
  '3d': { to: currentHour, from: currentHour - 259_200, interval: '1h' },
  '7d': { to: currentHour, from: currentHour - 604_800, interval: '1h' },
  '1m': { to: currentHour, from: currentHour - 2_592_000, interval: '1h' },
  '3m': { to: currentHour, from: currentHour - 7_776_000, interval: '1d' },
  '1y': { to: currentHour, from: currentHour - 31_536_000, interval: '1d' },
} as const

function CustomTooltip({ payload, active, dataType }: any) {
  if (active && payload) {
    const subtitle = dayjs
      .unix(+payload[0]?.payload?.timestamp)
      .format('YYYY-M-D HH:mm:ss')
    const value = payload[0]?.payload?.[dataType]
    const formattedValue =
      dataType === 'price' ? formatCurrency(value, 5) : formatCurrency(value, 2)
    return (
      <Card backgroundColor="cardBackground">
        <InfoBox title={'$' + formattedValue} subtitle={subtitle} />
      </Card>
    )
  }

  return null
}

export const dataTypeAtom = atom<DataType>('price')
export const timeRangeAtom = atom<Range>('7d')

// TODO: Storing 7day change here, probably not the best place
const PriceChart = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const range = useAtomValue(timeRangeAtom)
  const dataType = useAtomValue(dataTypeAtom)
  const set7dChange = useSetAtom(indexDTF7dChangeAtom)
  const setMarketCap = useSetAtom(indexDTFMarketCapAtom)

  const showHourlyInterval = now - (dtf?.timestamp || 0) < 30 * 86_400
  const { data: history } = useIndexDTFPriceHistory({
    address: dtf?.id,
    ...historicalConfigs[range],
    ...(showHourlyInterval ? { interval: '1h' } : {}),
  })

  const timeseries = useMemo(() => {
    return history?.timeseries.filter(({ price }) => Boolean(price)) || []
  }, [history?.timeseries])

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
    const date = dayjs.unix(timestamp)
    switch (range) {
      case '24h':
        return date.format('HH:mm')
      case '3d':
      case '7d':
      case '1m':
      case '3m':
        return date.format('D MMM')
      case '1y':
        return date.format("MMM 'YY")
      default:
        return date.format('D MMM')
    }
  }

  const formatYAxisTick = (value: number) => {
    if (dataType === 'totalSupply') {
      return formatCurrency(value, 0)
    }
    return '$' + formatCurrency(value, value < 1 ? 4 : 2)
  }

  return (
    <div className="lg:rounded-4xl lg:rounded-b-none bg-[#000] dark:bg-background lg:dark:bg-muted w-full text-[#fff] dark:text-foreground p-3 sm:p-6 pb-20 h-[340px] sm:h-[572px]">
      <ChartOverlay timeseries={timeseries} />
      <div className="h-32 sm:h-80">
        {history === undefined ? (
          <Skeleton className="h-32 sm:h-80 w-full rounded-lg" />
        ) : timeseries.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-32 sm:h-80 w-full">
            <AreaChart
              data={timeseries}
              margin={{ left: 0, right: 0, top: 5, bottom: 5 }}
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
                ticks={[
                  ...[0.05, 0.23, 0.41, 0.59, 0.77, 0.95].map(
                    (i) =>
                      timeseries[Math.floor(timeseries.length * i)]?.timestamp
                  ),
                ].filter(Boolean)}
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
                tickMargin={10}
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
      {/* <div className="flex sm:mt-4 mt-3 items-center gap-1 sm:justify-between justify-end">
        <div className="hidden sm:flex">
          <TimeRangeSelector />
        </div>

        <MarketCap timeseries={timeseries} />
      </div> */}
    </div>
  )
}

export default PriceChart
