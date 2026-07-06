import { ChartConfig } from '@/components/ui/chart'
import { TimeRange } from '@/types'
import {
  FIFTEEN_MINUTES_IN_SECONDS,
  SIX_HOURS_IN_SECONDS,
} from '@/utils/chart-downsample'
import type { FetchInterval } from '../../hooks/use-dtf-price-history'

export type Range = TimeRange

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
const startOfYear = Math.floor(Date.UTC(new Date().getUTCFullYear(), 0, 1) / 1_000)

// `interval` is what the API supports (anything else is HTTP 400); `bucket`
// is the display density in seconds, applied client-side via downsampleToBucket.
export const historicalConfigs: Record<
  Range,
  { to: number; from: number; interval: FetchInterval; bucket?: number }
> = {
  '24h': {
    to: currentHour,
    from: currentHour - 86_400,
    interval: '5m',
    bucket: FIFTEEN_MINUTES_IN_SECONDS,
  },
  '7d': { to: currentHour, from: currentHour - 604_800, interval: '1h' },
  '1m': {
    to: currentHour,
    from: currentHour - 2_592_000,
    interval: '1h',
    bucket: SIX_HOURS_IN_SECONDS,
  },
  '3m': { to: currentHour, from: currentHour - 7_776_000, interval: '1d' },
  ytd: { to: currentHour, from: startOfYear, interval: '1d' },
  '1y': { to: currentHour, from: currentHour - 31_536_000, interval: '1d' },
  all: { to: currentHour, from: 0, interval: '1d' },
}
