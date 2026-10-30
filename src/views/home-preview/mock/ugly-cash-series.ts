// Mock only: deterministic series shaped like the numbers Gabo shared (~$17.3M balance, ~$40M+ last 30d).
export const CATEGORIES = [
  { key: 'deposits', label: 'Deposits', share: 0.3, ticket: 180 },
  { key: 'withdrawals', label: 'Withdrawals', share: 0.22, ticket: 220 },
  { key: 'sends', label: 'Sends', share: 0.18, ticket: 45 },
  { key: 'card', label: 'Card spends', share: 0.17, ticket: 28 },
  { key: 'savings', label: 'Savings', share: 0.09, ticket: 410 },
  { key: 'other', label: 'Other', share: 0.04, ticket: 60 },
] as const

export type CategoryKey = (typeof CATEGORIES)[number]['key']

export type DayPoint = {
  date: string
  ts: number
  volume: Record<CategoryKey, number>
  count: Record<CategoryKey, number>
  totalVolume: number
  totalCount: number
  balance: number
  texturedBalance: number
  cumulativeVolume: number
  cumulativeCount: number
}

export const LAUNCH_DATE = '2025-03-03'
export const TODAY = '2026-10-28'
export const OUTLIER_DATE = '2026-10-19'
export const OUTLIER_AMOUNT = 1_600_000

const DAY = 86_400_000

function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function build(): DayPoint[] {
  const rand = mulberry32(20250303)
  const start = Date.parse(`${LAUNCH_DATE}T00:00:00Z`)
  const end = Date.parse(`${TODAY}T00:00:00Z`)
  const days = Math.round((end - start) / DAY) + 1
  const points: DayPoint[] = []
  let cumulativeVolume = 0
  let cumulativeCount = 0
  let drift = 0
  const texture = mulberry32(777)

  for (let i = 0; i < days; i++) {
    const ts = start + i * DAY
    const d = new Date(ts)
    const progress = i / (days - 1)
    drift = Math.max(
      -0.12,
      Math.min(0.12, drift * 0.96 + (rand() - 0.5) * 0.035)
    )
    const waves = 1 + 0.07 * Math.sin(i / 19) + 0.05 * Math.sin(i / 53 + 1.3)
    const trend =
      (18_000 + 1_389_000 * Math.pow(progress, 2.1)) * waves * (1 + drift)
    const weekday = d.getUTCDay()
    const weekly = weekday === 0 ? 0.72 : weekday === 6 ? 0.84 : 1
    const dom = d.getUTCDate()
    const payday = dom === 1 || dom === 15 || dom === 16 ? 2.6 : 1

    const volume = {} as Record<CategoryKey, number>
    const count = {} as Record<CategoryKey, number>
    let totalVolume = 0
    let totalCount = 0
    for (const c of CATEGORIES) {
      const noise = 0.82 + rand() * 0.36
      const spike =
        c.key === 'savings'
          ? payday
          : payday > 1 && c.key === 'deposits'
            ? 1.9
            : payday > 1 && c.key === 'card'
              ? 1.3
              : 1
      let v = trend * c.share * weekly * noise * spike
      if (c.key === 'deposits' && d.toISOString().slice(0, 10) === OUTLIER_DATE)
        v += OUTLIER_AMOUNT
      volume[c.key] = Math.round(v)
      count[c.key] = Math.max(
        1,
        Math.round((v / c.ticket) * (0.9 + rand() * 0.2))
      )
      totalVolume += volume[c.key]
      totalCount += count[c.key]
    }
    cumulativeVolume += totalVolume
    cumulativeCount += totalCount
    const balance =
      (16_900_000 * Math.pow(progress, 1.45) + 380_000) *
      (1 +
        0.06 * Math.sin(i / 31) +
        0.04 * Math.sin(i / 11 + 0.7) +
        drift * 0.8) *
      (0.99 + rand() * 0.02)

    const sincePayday = dom >= 15 ? dom - 15 : dom - 1
    const textured =
      balance *
      (1 + 0.04 * (1 - sincePayday / 15) - 0.02) *
      (0.985 + texture() * 0.03)

    points.push({
      date: d.toISOString().slice(0, 10),
      ts,
      volume,
      count,
      totalVolume,
      totalCount,
      balance: i === days - 1 ? 17_300_000 : Math.round(balance),
      texturedBalance: i === days - 1 ? 17_300_000 : Math.round(textured),
      cumulativeVolume,
      cumulativeCount,
    })
  }
  return points
}

export const SERIES: DayPoint[] = build()

export type Range = '7D' | '30D' | '6M' | 'YTD' | 'All'
export const RANGES: Range[] = ['7D', '30D', '6M', 'YTD', 'All']

export function sliceRange(
  range: Range,
  series: DayPoint[] = SERIES
): DayPoint[] {
  const last = series[series.length - 1].ts
  if (range === 'All') return series
  if (range === 'YTD') {
    const jan1 = Date.UTC(new Date(last).getUTCFullYear(), 0, 1)
    return series.filter((p) => p.ts >= jan1)
  }
  const days = range === '7D' ? 7 : range === '30D' ? 30 : 182
  return series.slice(-days)
}

export function sumRange(points: DayPoint[], metric: 'volume' | 'count') {
  return points.reduce(
    (acc, p) => acc + (metric === 'volume' ? p.totalVolume : p.totalCount),
    0
  )
}

export function weekly(points: DayPoint[]): DayPoint[] {
  const out: DayPoint[] = []
  const start = points.length % 7
  for (let i = start; i < points.length; i += 7) {
    const chunk = points.slice(i, i + 7)
    const first = chunk[0]
    const volume = {} as Record<CategoryKey, number>
    const count = {} as Record<CategoryKey, number>
    for (const c of CATEGORIES) {
      volume[c.key] = chunk.reduce((a, p) => a + p.volume[c.key], 0)
      count[c.key] = chunk.reduce((a, p) => a + p.count[c.key], 0)
    }
    const last = chunk[chunk.length - 1]
    out.push({
      ...last,
      date: first.date,
      ts: first.ts,
      volume,
      count,
      totalVolume: chunk.reduce((a, p) => a + p.totalVolume, 0),
      totalCount: chunk.reduce((a, p) => a + p.totalCount, 0),
    })
  }
  return out
}

const last = SERIES[SERIES.length - 1]
const last30 = SERIES.slice(-30)
const prev30 = SERIES.slice(-60, -30)

export const HEADLINE = {
  balance: last.balance,
  balanceStart: SERIES[0].balance,
  volume30d: sumRange(last30, 'volume'),
  volume30dPrev: sumRange(prev30, 'volume'),
  count30d: sumRange(last30, 'count'),
  cumulativeVolume: last.cumulativeVolume,
  cumulativeCount: last.cumulativeCount,
  daysLive: SERIES.length,
}

export const ACTIVE_COUNTRIES = [
  'Argentina',
  'Bolivia',
  'Chile',
  'Colombia',
  'Costa Rica',
  'Dominican Republic',
  'Ecuador',
  'El Salvador',
  'Guatemala',
  'Honduras',
  'Mexico',
  'Panama',
  'Paraguay',
  'Peru',
  'Uruguay',
]

export const MOCK_PROTOCOL_METRICS = {
  tvl: 62_608_831,
  partnerRevenue: 371_943,
  rsrAccrual: 256_235,
  yieldDistributed: 471_642,
  mintVolume: 1_249_600_667,
}

// Placeholder from UGLYCASH's signup allowlist (authn phone_verify.rb); Gabo to confirm the public list.
export const GLOBAL_COUNTRIES: Record<string, string[]> = {
  Americas: [
    'Argentina',
    'Bolivia',
    'Chile',
    'Colombia',
    'Costa Rica',
    'Dominican Republic',
    'Ecuador',
    'El Salvador',
    'Guatemala',
    'Honduras',
    'Mexico',
    'Panama',
    'Paraguay',
    'Peru',
    'United States',
    'Uruguay',
    'Venezuela',
  ],
  Africa: [
    'Angola',
    'Benin',
    'Botswana',
    'Burkina Faso',
    'Cameroon',
    "Côte d'Ivoire",
    'Eswatini',
    'Ghana',
    'Guinea-Bissau',
    'Kenya',
    'Malawi',
    'Mali',
    'Mozambique',
    'Nigeria',
    'Rwanda',
    'Senegal',
    'Tanzania',
    'Tunisia',
    'Uganda',
    'Zambia',
  ],
  'Asia and the Middle East': [
    'Armenia',
    'Azerbaijan',
    'Brunei',
    'Georgia',
    'India',
    'Jordan',
    'Kuwait',
    'Kyrgyzstan',
    'Maldives',
    'Oman',
    'Pakistan',
    'Philippines',
    'Saudi Arabia',
    'Sri Lanka',
    'Thailand',
    'Vietnam',
  ],
  Oceania: ['Fiji', 'New Zealand', 'Solomon Islands'],
}

export const GLOBAL_COUNTRY_COUNT =
  Object.values(GLOBAL_COUNTRIES).flat().length
