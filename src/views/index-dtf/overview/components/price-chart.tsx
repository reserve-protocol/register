import InfoBox from '@/components/old/info-box'
import { Button } from '@/components/ui/button'
import { ChartConfig, ChartContainer } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { formatCurrency } from '@/utils'
import dayjs from 'dayjs'
import { useAtomValue } from 'jotai'
import { useState } from 'react'
import { Line, LineChart, Tooltip, YAxis } from 'recharts'
import { Card } from 'theme-ui'
import useIndexDTFCurrentPrice from '../hooks/use-dtf-price'
import useIndexDTFPriceHistory, {
  IndexDTFPerformance,
} from '../hooks/use-dtf-price-history'

const chartConfig = {
  desktop: {
    label: 'Desktop',
    color: 'hsl(var(--card))',
  },
} satisfies ChartConfig

type Range = '1d' | '1w' | '1m' | '1y'
type DataType = 'price' | 'marketCap' | 'totalSupply'

const now = Math.floor(Date.now() / 1_000)
const currentHour = Math.floor(now / 3_600) * 3_600

const historicalConfigs = {
  '1d': { to: currentHour, from: currentHour - 86_400, interval: '1h' },
  '1w': { to: currentHour, from: currentHour - 604_800, interval: '1h' },
  '1m': { to: currentHour, from: currentHour - 2_592_000, interval: '1h' },
  '1y': { to: currentHour, from: currentHour - 31_536_000, interval: '1d' },
} as const

const periodLabel = {
  '1d': '24h',
  '1w': '7d',
  '1m': '30d',
  '1y': '365d',
} as const

const timeRanges = [
  { label: '1D', value: '1d' },
  { label: '1W', value: '1w' },
  { label: '1M', value: '1m' },
  // { label: '1Y', value: '1y' },
] as const

const dataTypes = [
  { label: 'Price', value: 'price' },
  { label: 'Market Cap', value: 'marketCap' },
  { label: 'Supply', value: 'totalSupply' },
] as const

const calculatePercentageChange = (
  performance: IndexDTFPerformance['timeseries'],
  dataType: DataType
) => {
  if (performance.length === 0) {
    return <span className="text-legend">No data</span>
  }
  const firstValue = performance[0][dataType]
  const lastValue = performance[performance.length - 1][dataType]

  const percentageChange =
    firstValue === 0 ? lastValue : ((lastValue - firstValue) / firstValue) * 100

  return (
    <span
      className={
        percentageChange < 0
          ? 'text-red-500'
          : percentageChange > 0
            ? 'text-success'
            : ''
      }
    >{`${percentageChange > 0 ? '+' : ''}${percentageChange.toFixed(2)}%`}</span>
  )
}

function CustomTooltip({ payload, active, dataType }: any) {
  if (active && payload) {
    const subtitle = dayjs
      .unix(+payload[0]?.payload?.timestamp)
      .format('YYYY-M-D HH:mm:ss')
    const value = payload[0]?.payload?.[dataType]
    const formattedValue =
      dataType === 'price' ? formatCurrency(value, 5) : formatCurrency(value, 2)
    return (
      <Card backgroundColor="white">
        <InfoBox title={'$' + formattedValue} subtitle={subtitle} />
      </Card>
    )
  }

  return null
}

const TITLES = {
  price: 'Price',
  marketCap: 'Market Cap',
  totalSupply: 'Total Supply',
}

const PriceChart = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const [range, setRange] = useState<Range>('1w')
  const [dataType, setDataType] = useState<DataType>('price')

  const showHourlyInterval = now - (dtf?.timestamp || 0) < 30 * 86_400
  const { data: history } = useIndexDTFPriceHistory({
    address: dtf?.id,
    ...historicalConfigs[range],
    ...(showHourlyInterval ? { interval: '1h' } : {}),
  })

  const timeseries =
    history?.timeseries.filter(({ price }) => Boolean(price)) || []

  // h-[500px]
  return (
    <div className="rounded-2xl rounded-b-none bg-[#021122] w-full p-6 pb-20  color-[#fff] h-[542px]">
      <div className="flex justify-between">
        <div className="mb-3">
          <h4 className="text-card/80 mb-2">{TITLES[dataType]}</h4>
          <div className="flex items-center gap-1 text-3xl font-bold text-white mb-2">
            {!history ? (
              <Skeleton className="min-w-[200px] h-9" />
            ) : (
              <span>
                {dataType !== 'totalSupply' ? '$' : ''}
                {formatCurrency(
                  timeseries[timeseries.length - 1][dataType],
                  // dataType === 'marketCap' ? 2 : 5
                  2
                )}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-white/80">{periodLabel[range]} change: </span>
            <div className="text-base">
              {history === undefined ? (
                <Skeleton className="min-w-20 h-[16px]" />
              ) : (
                calculatePercentageChange(timeseries, dataType)
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2"></div>
      </div>
      <div className="h-60">
        {history !== undefined && timeseries.length > 0 && (
          <ChartContainer config={chartConfig} className="h-60 w-full ">
            <LineChart data={timeseries}>
              <YAxis
                dataKey={dataType}
                hide
                visibility="0"
                domain={['dataMin', 'dataMax']}
              />
              <Tooltip content={<CustomTooltip dataType={dataType} />} />
              <Line
                type="monotone"
                dataKey={dataType}
                stroke="#ffffff"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ChartContainer>
        )}
      </div>

      <div className="flex items-center pb-28 mt-8">
        <div className="gap-1 hidden md:flex mr-auto">
          {timeRanges.map((tr) => (
            <Button
              key={tr.value}
              variant="ghost"
              className={`h-7 px-3 text-white/80 rounded-[60px] ${tr.value === range ? 'bg-muted/20 text-white' : ''}`}
              onClick={() => setRange(tr.value)}
            >
              {tr.label}
            </Button>
          ))}
        </div>
        <div className="gap-1 hidden md:flex">
          {dataTypes.map((dt) => (
            <Button
              key={dt.value}
              variant="ghost"
              className={`h-7 px-3 text-white/80  rounded-[60px]  ${dt.value === dataType ? 'bg-muted/20 text-white' : ''}`}
              onClick={() => setDataType(dt.value)}
            >
              {dt.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PriceChart
