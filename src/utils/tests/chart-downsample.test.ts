import { describe, expect, it } from 'vitest'
import { downsampleToBucket, WEEK_IN_SECONDS } from '../chart-downsample'

const DAY = 86_400
const HOUR = 3_600

const series = (count: number, stepSeconds: number, start = 1_700_000_000) =>
  Array.from({ length: count }, (_, i) => ({
    timestamp: start + i * stepSeconds,
    price: 100 + i,
  }))

describe('downsampleToBucket', () => {
  it('keeps one point per bucket', () => {
    const daily = series(700, DAY)
    const weekly = downsampleToBucket(daily, WEEK_IN_SECONDS)

    expect(weekly.length).toBeLessThan(daily.length / 6)

    const buckets = weekly.map((p) => Math.floor(p.timestamp / WEEK_IN_SECONDS))
    const interiorBuckets = buckets.slice(1, -1)
    expect(new Set(interiorBuckets).size).toBe(interiorBuckets.length)
  })

  it('collapses hourly data to 6h buckets and 5m data to 15m buckets', () => {
    const hourly = series(721, HOUR)
    expect(downsampleToBucket(hourly, 21_600).length).toBe(122)

    const fiveMin = series(289, 300)
    expect(downsampleToBucket(fiveMin, 900).length).toBe(97)
  })

  it('preserves the first and last points', () => {
    const daily = series(700, DAY)
    const result = downsampleToBucket(daily, WEEK_IN_SECONDS)

    expect(result[0]).toBe(daily[0])
    expect(result[result.length - 1]).toBe(daily[daily.length - 1])
  })

  it('keeps the last point of each bucket', () => {
    const daily = series(700, DAY)
    const result = downsampleToBucket(daily, WEEK_IN_SECONDS)
    const resultTimestamps = new Set(result.map((p) => p.timestamp))

    for (let i = 1; i < daily.length - 1; i++) {
      const bucket = Math.floor(daily[i].timestamp / WEEK_IN_SECONDS)
      const nextBucket = Math.floor(daily[i + 1].timestamp / WEEK_IN_SECONDS)
      if (bucket !== nextBucket) {
        expect(resultTimestamps.has(daily[i].timestamp)).toBe(true)
      }
    }
  })
})
