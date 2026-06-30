import { describe, expect, it } from 'vitest'
import {
  calculateTrailingSevenDayChange,
  getMarketPriceInfo,
} from '../price-chart-utils'

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

describe('getMarketPriceInfo', () => {
  it('returns no data when every point is null', () => {
    expect(
      getMarketPriceInfo([
        { marketPrice: null },
        { marketPrice: null },
      ])
    ).toEqual({ hasData: false, latest: null })
  })

  it('returns no data for an empty series', () => {
    expect(getMarketPriceInfo([])).toEqual({ hasData: false, latest: null })
  })

  it('returns the last finite positive value as latest', () => {
    expect(
      getMarketPriceInfo([
        { marketPrice: 0.33 },
        { marketPrice: null },
        { marketPrice: 0.34 },
        { marketPrice: null },
      ])
    ).toEqual({ hasData: true, latest: 0.34 })
  })

  it('ignores zero, negative, and non-finite values', () => {
    expect(
      getMarketPriceInfo([
        { marketPrice: 0 },
        { marketPrice: -1 },
        { marketPrice: Number.NaN },
        { marketPrice: 0.5 },
        { marketPrice: 0 },
      ])
    ).toEqual({ hasData: true, latest: 0.5 })
  })
})
