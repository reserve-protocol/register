import type { Meta, StoryObj } from '@storybook/react-vite'
import { Provider } from 'jotai'
import PriceChartBody from '@/views/index-dtf/overview/components/charts/price-chart-body'
import CandlestickChartBody from '@/views/index-dtf/overview/components/charts/candlestick-chart-body'
import { centeredStoryDecorator } from '../../shared/story-surface'
import {
  launchTimestamp,
  overviewCandles,
  overviewPoints,
} from './reference/charts/source-data'

type Args = { mode: 'line' | 'candles' }
function OverviewChart({ mode }: Args) {
  return (
    <Provider>
      <div className="mx-auto h-[360px] max-w-5xl rounded-xl border bg-card p-4">
        {mode === 'line' ? (
          <PriceChartBody
            chartData={overviewPoints}
            range="1m"
            launchTimestamp={launchTimestamp}
            useLaunchLabel
            className="h-full"
          />
        ) : (
          <CandlestickChartBody
            candles={overviewCandles}
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
  decorators: [centeredStoryDecorator],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Overview price and candlestick charts. The product never renders a chart body without data; loading, unavailable and partial-history states are in Charts / Source states.',
      },
    },
  },
  args: { mode: 'line' },
  argTypes: {
    mode: { control: 'inline-radio', options: ['line', 'candles'] },
  },
} satisfies Meta<typeof OverviewChart>
export default meta
type Story = StoryObj<typeof meta>
export const PriceLine: Story = {
  name: 'Price line',
}
export const Candlesticks: Story = { args: { mode: 'candles' } }
