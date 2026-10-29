export type ChartCategory = { key: string; label: string }

export type CategoryBucket = {
  start: number
  values: Record<string, number>
  partial?: boolean
}

export type CategoryPlotRow = {
  start: number
  partial: boolean
  [categoryKey: string]: number | boolean
}

export function bucketTotal(
  bucket: CategoryBucket,
  categories: readonly ChartCategory[]
) {
  return categories.reduce(
    (total, category) => total + (bucket.values[category.key] ?? 0),
    0
  )
}

export function summarizeBuckets(
  buckets: readonly CategoryBucket[],
  categories: readonly ChartCategory[]
) {
  const byCategory = Object.fromEntries(
    categories.map((category) => [
      category.key,
      buckets.reduce(
        (total, bucket) => total + (bucket.values[category.key] ?? 0),
        0
      ),
    ])
  )
  const total = Object.values(byCategory).reduce((sum, value) => sum + value, 0)
  return { total, byCategory }
}

export function toPlotRows(
  buckets: readonly CategoryBucket[],
  categories: readonly ChartCategory[],
  below: readonly string[]
): CategoryPlotRow[] {
  return buckets.map((bucket) => {
    const row: CategoryPlotRow = {
      start: bucket.start,
      partial: bucket.partial ?? false,
    }
    for (const category of categories) {
      const value = bucket.values[category.key] ?? 0
      row[category.key] = below.includes(category.key) ? -value : value
    }
    return row
  })
}

export function plotAxis(min: number, max: number) {
  if (!min && !max) return { domain: [0, 1] as [number, number], ticks: [0] }
  const low = withHeadroom(Math.min(0, min))
  const high = withHeadroom(Math.max(0, max))
  const step = niceStep((high - low) / 4)
  const first = Math.ceil(low / step)
  const ticks: number[] = []
  for (let index = first; index * step <= high; index++)
    ticks.push(index === 0 ? 0 : index * step)
  return { domain: [low, high] as [number, number], ticks }
}

export function stackExtent(rows: readonly CategoryPlotRow[], keys: string[]) {
  let min = 0
  let max = 0
  for (const row of rows) {
    let positive = 0
    let negative = 0
    for (const key of keys) {
      const value = Number(row[key])
      if (value > 0) positive += value
      else negative += value
    }
    max = Math.max(max, positive)
    min = Math.min(min, negative)
  }
  return { min, max }
}

function withHeadroom(value: number) {
  return value + Math.abs(value) / 20
}

function niceStep(raw: number) {
  const magnitude = 10 ** Math.floor(Math.log10(raw))
  return [1, 2, 2.5, 5, 10]
    .map((factor) => factor * magnitude)
    .find((step) => step >= raw)!
}

export const MAX_DAILY_BUCKETS = 90

export function groupIntoWeeks(days: readonly CategoryBucket[]) {
  const complete = days.slice(days.length % 7)
  const weeks: CategoryBucket[] = []
  for (let index = 0; index < complete.length; index += 7) {
    const week = complete.slice(index, index + 7)
    const values: Record<string, number> = {}
    for (const day of week)
      for (const [key, value] of Object.entries(day.values))
        values[key] = (values[key] ?? 0) + value
    weeks.push({
      start: week[0].start,
      values,
      partial: week.some((day) => day.partial) || undefined,
    })
  }
  return weeks
}

export function bucketsForPeriod(
  days: readonly CategoryBucket[],
  periodDays: number
) {
  if (periodDays <= MAX_DAILY_BUCKETS) return days.slice(-periodDays)
  return groupIntoWeeks(days.slice(-Math.floor(periodDays / 7) * 7))
}

export function formatCompactValue(
  value: number,
  { currency = false }: { currency?: boolean } = {}
) {
  return Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
    ...(currency ? { style: 'currency', currency: 'USD' } : {}),
  }).format(value)
}
