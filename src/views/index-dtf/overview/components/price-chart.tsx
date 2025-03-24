import InfoBox from '@/components/old/info-box'
import { Button } from '@/components/ui/button'
import { ChartConfig, ChartContainer } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { formatCurrency } from '@/utils'
import dayjs from 'dayjs'
import { atom, useAtom, useAtomValue } from 'jotai'
import { Line, LineChart, Tooltip, YAxis } from 'recharts'
import { Card } from 'theme-ui'
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
  dataType: DataType,
  wrap: boolean = false
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
    >{`${wrap ? '(' : ''}${percentageChange > 0 ? '+' : ''}${percentageChange.toFixed(2)}%${wrap ? ')' : ''}`}</span>
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
      <Card backgroundColor="cardBackground">
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

const dataTypeAtom = atom<DataType>('price')
const timeRangeAtom = atom<Range>('1w')

const DataTypeSelector = ({ className }: { className?: string }) => {
  const [dataType, setDataType] = useAtom(dataTypeAtom)

  return (
    <div className={cn('gap-1', className)}>
      {dataTypes.map((dt) => (
        <Button
          key={dt.value}
          variant="ghost"
          className={`h-6 text-xs sm:text-sm px-2 sm:px-3 text-white/80  rounded-[60px]  ${dt.value === dataType ? 'bg-muted/20 text-white' : ''}`}
          onClick={() => setDataType(dt.value)}
        >
          {dt.label}
        </Button>
      ))}
    </div>
  )
}

const TimeRangeSelector = ({ className }: { className?: string }) => {
  const [range, setRange] = useAtom(timeRangeAtom)

  return (
    <div className="gap-1 ml-auto sm:ml-0 sm:mr-auto">
      {timeRanges.map((tr) => (
        <Button
          key={tr.value}
          variant="ghost"
          className={`h-8 px-2 mr-1 sm:px-3 text-xs sm:text-sm text-white/80 rounded-[60px] hover:bg-white hover:text-black ${tr.value === range ? 'bg-white text-black' : ''}`}
          onClick={() => setRange(tr.value)}
        >
          {tr.label}
        </Button>
      ))}
    </div>
  )
}

const Selectors = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        'flex flex-row-reverse sm:flex-row items-center ',
        className
      )}
    >
      <TimeRangeSelector />
      <DataTypeSelector />
    </div>
  )
}

const PriceChart = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const range = useAtomValue(timeRangeAtom)
  const dataType = useAtomValue(dataTypeAtom)

  const showHourlyInterval = now - (dtf?.timestamp || 0) < 30 * 86_400
  const { data: history } = useIndexDTFPriceHistory({
    address: dtf?.id,
    ...historicalConfigs[range],
    ...(showHourlyInterval ? { interval: '1h' } : {}),
  })

  const timeseries =
    history?.timeseries.filter(({ price }) => Boolean(price)) || []

  return (
    <div className="lg:rounded-4xl lg:rounded-b-none bg-[#000] dark:bg-background lg:dark:bg-muted w-full text-[#fff] dark:text-foreground p-3 sm:p-6 pb-20 h-80 sm:h-[538px]">
      <div className="mb-0 sm:mb-3">
        <h4 className=" mb-2 hidden sm:block">{TITLES[dataType]}</h4>
        {/* <Selectors className="flex sm:hidden mb-2" /> */}
        <div className="sm:hidden items-center gap-1 flex">
          <span className=" text-sm ">Price</span>
          <TimeRangeSelector />
        </div>
        <div className="flex items-center gap-1 text-2xl sm:text-3xl font-medium sm:font-medium mb-2">
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
          <span className="ml-1 sm:ml-2 block text-xs font-normal sm:hidden">
            {calculatePercentageChange(timeseries, dataType, true)}
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-1">
          <span>{periodLabel[range]} change: </span>
          <div className="text-base">
            {history === undefined ? (
              <Skeleton className="min-w-20 h-[16px]" />
            ) : (
              calculatePercentageChange(timeseries, dataType, false)
            )}
          </div>
        </div>
      </div>
      <div className="h-32 sm:h-60">
        {history !== undefined && timeseries.length > 0 && (
          <ChartContainer config={chartConfig} className="h-32 sm:h-60 w-full ">
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
                stroke="#E5EEFA"
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ChartContainer>
        )}
      </div>
      <div className="sm:flex mt-7 items-center gap-1 hidden">
        <TimeRangeSelector />

        <div className="sm:flex items-center gap-1 hidden justify-end">
          <div className="text-white/80">Market Cap:</div>
          <div className="text-white">
            $
            {formatCurrency(
              timeseries[timeseries.length - 1]?.marketCap || 0,
              0
            )}
          </div>
        </div>
      </div>
      {/* <Selectors className="hidden sm:flex sm:mt-8" /> */}
    </div>
  )
}

export default PriceChart
