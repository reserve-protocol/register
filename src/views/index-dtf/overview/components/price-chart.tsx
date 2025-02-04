import { Button } from '@/components/ui/button'
import { ChartConfig, ChartContainer } from '@/components/ui/chart'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { useAtomValue } from 'jotai'
import { Line, LineChart, YAxis } from 'recharts'
import useIndexDTFPriceHistory, {
  IndexDTFPerformance,
} from '../hooks/use-dtf-price-history'
import { useState } from 'react'
import useIndexDTFCurrentPrice from '../hooks/use-dtf-price'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/utils'
import PriceTag from '@/components/icons/PriceTag'

const chartConfig = {
  desktop: {
    label: 'Desktop',
    color: 'hsl(var(--card))',
  },
} satisfies ChartConfig

type Range = '1d' | '1w' | '1m' | '1y' | 'all'

const now = Math.floor(Date.now() / 1_000)
const currentHour = Math.floor(now / 3_600) * 3_600

const historicalConfigs = {
  '1d': { to: currentHour, from: currentHour - 86_400, interval: '1h' },
  '1w': { to: currentHour, from: currentHour - 604_800, interval: '1h' },
  '1m': { to: currentHour, from: currentHour - 2_592_000, interval: '1d' },
  '1y': { to: currentHour, from: currentHour - 31_536_000, interval: '1d' },
  all: { to: currentHour, from: currentHour - 3 * 31_536_000, interval: '1d' },
} as const

const timeRanges = [
  { label: '1D', value: '1d' },
  { label: '1W', value: '1w' },
  { label: '1M', value: '1m' },
  { label: '1Y', value: '1y' },
  { label: 'ALL', value: 'all' },
] as const

const calculatePercentageChange = (
  performance: IndexDTFPerformance['timeseries']
) => {
  if (performance.length === 0) {
    return <span className="text-legend">No data</span>
  }
  const firstValue = performance[0].price
  const lastValue = performance[performance.length - 1].price
  const percentageChange = ((lastValue - firstValue) / firstValue) * 100
  return `${percentageChange > 0 ? '+' : ''}${percentageChange.toFixed(2)}%`
}

const PriceChart = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const [range, setRange] = useState<Range>('1w')

  const { data: history } = useIndexDTFPriceHistory({
    address: dtf?.id,
    ...historicalConfigs[range],
  })

  const { data: price } = useIndexDTFCurrentPrice({ address: dtf?.id })

  return (
    <div className="rounded-2xl rounded-b-none bg-[#021122] w-full p-6 pb-20 color-[#fff] h-[500px]">
      <div className="flex justify-between">
        <div>
          <span className="text-white">
            {range === 'all' ? 'All time' : range} performance
          </span>
          <div className="mt-1 mb-3 text-5xl font-bold text-white">
            {history === undefined ? (
              <Skeleton className="min-w-[180px] h-[48px]" />
            ) : (
              calculatePercentageChange(history.timeseries)
            )}
          </div>
          <div className="flex items-center gap-1 text-base text-muted">
            <PriceTag />
            <span className="text-white/80">Price:</span>
            {price === undefined ? (
              <Skeleton className="min-w-20 h-[14px]" />
            ) : (
              <span>${formatCurrency(price.price, 5)}</span>
            )}
          </div>
        </div>
        <div className="gap-1 hidden md:flex">
          {timeRanges.map((tr) => (
            <Button
              key={tr.value}
              variant="ghost"
              className={`h-9 text-white rounded-[60px] ${tr.value === range ? 'bg-muted/20' : ''}`}
              onClick={() => setRange(tr.value)}
            >
              {tr.label}
            </Button>
          ))}
        </div>
      </div>
      <ChartContainer config={chartConfig} className="h-96 w-full pb-28">
        <LineChart data={history?.timeseries}>
          <YAxis
            dataKey="price"
            hide
            visibility="0"
            domain={['dataMin', 'dataMax']}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#ffffff"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ChartContainer>
    </div>
  )
}

export default PriceChart
