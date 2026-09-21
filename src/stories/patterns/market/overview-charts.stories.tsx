import type { Meta, StoryObj } from '@storybook/react-vite'
import { Provider } from 'jotai'
import PriceChartBody from '@/views/index-dtf/overview/components/charts/price-chart-body'
import CandlestickChartBody from '@/views/index-dtf/overview/components/charts/candlestick-chart-body'
import {
  launchTimestamp,
  overviewCandles,
  overviewPoints,
} from './reference/charts/source-data'

type Args = { mode: 'line' | 'candles'; empty: boolean }
function OverviewChart({ mode, empty }: Args) {
  return (
    <Provider>
      <div className="mx-auto h-[360px] max-w-5xl rounded-xl border bg-card p-4">
        {mode === 'line' ? (
          <PriceChartBody
            chartData={empty ? [] : overviewPoints}
            range="1m"
            launchTimestamp={launchTimestamp}
            useLaunchLabel
            className="h-full"
          />
        ) : (
          <CandlestickChartBody
            candles={empty ? [] : overviewCandles}
            range="1m"
            intervalSeconds={86400}
            launchTimestamp={launchTimestamp}
            useLaunchLabel
            className="h-full"
          />
        )}
      </div>
    </Provider>
  )
}
const meta = {
  title: 'Patterns/Market/Charts/Overview',
  component: OverviewChart,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Overview price and candlestick charts.',
      },
    },
  },
  args: { mode: 'line', empty: false },
  argTypes: {
    mode: { control: 'inline-radio', options: ['line', 'candles'] },
    empty: { control: 'boolean' },
  },
} satisfies Meta<typeof OverviewChart>
export default meta
type Story = StoryObj<typeof meta>
export const PriceLine: Story = {}
export const Candlesticks: Story = { args: { mode: 'candles' } }
export const EmptyLine: Story = { args: { empty: true } }
export const EmptyCandlesticks: Story = {
  args: { mode: 'candles', empty: true },
}
