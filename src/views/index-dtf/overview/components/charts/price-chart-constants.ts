import { ChartConfig } from '@/components/ui/chart'
import { Range } from './time-range-selector'

export type DataType =
  | 'price'
  | 'marketCap'
  | 'totalSupply'
  | 'yield'
  | 'priceBTC'

export const chartConfig = {
  desktop: {
    label: 'Desktop',
    color: 'hsl(var(--card))',
  },
} satisfies ChartConfig

const now = Math.floor(Date.now() / 1_000)
export const currentHour = Math.floor(now / 3_600) * 3_600

export const historicalConfigs: Record<
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
