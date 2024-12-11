import { Button } from '@/components/ui/button'
import { ChartConfig, ChartContainer } from '@/components/ui/chart'
import { Line, LineChart } from 'recharts'

const chartData = [
  { month: 'January', desktop: 186 },
  { month: 'February', desktop: 305 },
  { month: 'March', desktop: 237 },
  { month: 'April', desktop: 73 },
  { month: 'May', desktop: 209 },
  { month: 'June', desktop: 214 },
]

const data = [
  { timestamp: 1, value: 280 },
  { timestamp: 2, value: 275 },
  { timestamp: 3, value: 285 },
  { timestamp: 4, value: 290 },
  { timestamp: 5, value: 288 },
  { timestamp: 6, value: 100 },
  { timestamp: 7, value: 295 },
  { timestamp: 8, value: 500 },
  { timestamp: 9, value: 287 },
  { timestamp: 10, value: 290 },
  { timestamp: 11, value: 295 },
  { timestamp: 12, value: 304.03 },
]

const timeRanges = [
  { label: '1D', value: '1d' },
  { label: '1W', value: '1w' },
  { label: '1M', value: '1m' },
  { label: '1Y', value: '1y' },
  { label: 'ALL', value: 'all' },
]

const chartConfig = {
  desktop: {
    label: 'Desktop',
    color: 'hsl(var(--card))',
  },
} satisfies ChartConfig

const PriceChart = () => {
  const percentageChange = '+4.56%'
  const currentPrice = '$304.03'
  return (
    <div className="rounded-2xl rounded-b-none bg-[#021122] w-full p-6 pb-20 color-[#fff] h-[500px]">
      <div className="flex justify-between">
        <div>
          <span className="text-white">7d performance</span>
          <div className="mt-1 mb-3 text-5xl font-bold text-white">
            {percentageChange}
          </div>
          <p className="text-sm text-muted">
            <span className="text-white/80">Price:</span> {currentPrice}
          </p>
        </div>
        <div className="gap-1 hidden md:flex">
          {timeRanges.map((range) => (
            <Button
              key={range.value}
              // variant={range.value === '1w' ? 'muted' : 'ghost'}
              variant="ghost"
              className={`h-9 text-white rounded-[60px] ${range.value === '1w' ? 'bg-muted/20' : ''}`}
            >
              {range.label}
            </Button>
          ))}
        </div>
      </div>
      <ChartContainer config={chartConfig} className="h-96 w-full pb-28">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="value"
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
