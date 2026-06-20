import { describe, expect, it } from 'vitest'
import { calculateTrailingSevenDayChange } from '../price-chart-utils'

const DAY = 86_400

describe('calculateTrailingSevenDayChange', () => {
  it('calculates the trailing seven-day ratio from a longer series', () => {
    const result = calculateTrailingSevenDayChange([
      { timestamp: 0, price: 50 },
      { timestamp: 20 * DAY, price: 100 },
      { timestamp: 23 * DAY, price: 110 },
      { timestamp: 27 * DAY, price: 125 },
    ])

    expect(result).toBeCloseTo(0.25)
  })

  it('returns undefined when the series does not cover seven days', () => {
    const result = calculateTrailingSevenDayChange([
      { timestamp: 20 * DAY, price: 100 },
      { timestamp: 23 * DAY, price: 125 },
    ])

    expect(result).toBeUndefined()
  })

  it('ignores invalid or zero price points', () => {
    const result = calculateTrailingSevenDayChange([
      { timestamp: 0, price: 0 },
      { timestamp: 20 * DAY, price: 100 },
      { timestamp: 27 * DAY, price: 90 },
      { timestamp: 28 * DAY, price: Number.NaN },
    ])

    expect(result).toBeCloseTo(-0.1)
  })
})
