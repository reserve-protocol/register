import type { ChartCategory } from '@/components/design-system-v1/category-bar-chart-data'
import type { ChartSeriesSlot } from '@/components/design-system-v1/chart-panel'

export const ACTIVITY_CATEGORIES: (ChartCategory & {
  slot: ChartSeriesSlot
})[] = [
  { key: 'deposits', label: 'Deposits', slot: 1 },
  { key: 'withdrawals', label: 'Withdrawals', slot: 2 },
  { key: 'sends', label: 'In-app sends', slot: 3 },
  { key: 'cardSpends', label: 'Card spends', slot: 4 },
  { key: 'other', label: 'Other', slot: 5 },
]

export type ActivityRange = '7d' | '30d' | '90d' | '1y'

export const ACTIVITY_RANGES: {
  value: ActivityRange
  label: string
  days: number
  caption: string
}[] = [
  { value: '7d', label: '7D', days: 7, caption: 'Last 7 days' },
  { value: '30d', label: '30D', days: 30, caption: 'Last 30 days' },
  { value: '90d', label: '90D', days: 90, caption: 'Last 90 days' },
  { value: '1y', label: '1Y', days: 365, caption: 'Last 52 weeks' },
]

const DAY = 86_400
const AS_OF = Date.UTC(2026, 9, 29) / 1000
const HISTORY_DAYS = 371
const TODAY_SHARE = 0.42

const volumeShape = {
  deposits: 210_000,
  withdrawals: 120_000,
  sends: 64_000,
  cardSpends: 88_000,
  other: 9_000,
}
const countShape = {
  deposits: 420,
  withdrawals: 260,
  sends: 610,
  cardSpends: 1_480,
  other: 35,
}

export const ACTIVITY_VOLUME = buildHistory(volumeShape, 11)
export const ACTIVITY_COUNT = buildHistory(countShape, 29)

function buildHistory(shape: Record<string, number>, seed: number) {
  const random = seededRandom(seed)
  return Array.from({ length: HISTORY_DAYS }, (_, index) => {
    const start = AS_OF - (HISTORY_DAYS - 1 - index) * DAY
    const growth = 0.45 + 0.55 * (index / (HISTORY_DAYS - 1))
    const weekday = new Date(start * 1000).getUTCDay()
    const isToday = index === HISTORY_DAYS - 1
    const values = Object.fromEntries(
      Object.entries(shape).map(([key, base]) => {
        const weekend = weekday === 0 || weekday === 6
        const seasonal =
          key === 'cardSpends' && weekend ? 1.25 : weekend ? 0.8 : 1
        const value =
          base *
          growth *
          seasonal *
          (0.75 + random() * 0.5) *
          (isToday ? TODAY_SHARE : 1)
        return [key, Math.round(value)]
      })
    )
    return { start, values, partial: isToday || undefined }
  })
}

function seededRandom(seed: number) {
  let state = seed
  return () => {
    state = (state * 1_103_515_245 + 12_345) % 2_147_483_648
    return state / 2_147_483_648
  }
}
