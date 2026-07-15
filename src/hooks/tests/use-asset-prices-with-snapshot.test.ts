import { describe, expect, it } from 'vitest'
import {
  parseCurrentPricesResponse,
  parseHistoricalSnapshotPrice,
} from '../use-asset-prices-with-snapshot'

describe('parseCurrentPricesResponse (Z37 shape guard)', () => {
  it('maps a well-formed array into current/snapshot prices, lowercasing keys', () => {
    const result = parseCurrentPricesResponse([
      { address: '0xAbC0000000000000000000000000000000000001', price: 12.5 },
      { address: '0xDeF0000000000000000000000000000000000002', price: 3 },
    ])
    expect(result).toEqual({
      '0xabc0000000000000000000000000000000000001': {
        currentPrice: 12.5,
        snapshotPrice: 12.5,
      },
      '0xdef0000000000000000000000000000000000002': {
        currentPrice: 3,
        snapshotPrice: 3,
      },
    })
  })

  it('coerces a missing token price to 0 (existing behavior — Z26 catches it later)', () => {
    const result = parseCurrentPricesResponse([
      { address: '0xAbC0000000000000000000000000000000000001' },
    ])
    expect(result['0xabc0000000000000000000000000000000000001']).toEqual({
      currentPrice: 0,
      snapshotPrice: 0,
    })
  })

  it('throws on a { statusCode } error body instead of feeding it into reduce', () => {
    expect(() =>
      parseCurrentPricesResponse({ statusCode: 500, message: 'boom' })
    ).toThrow('boom')
  })

  it('throws on a non-array response shape', () => {
    expect(() => parseCurrentPricesResponse({ foo: 'bar' })).toThrow(
      'Unexpected prices response shape'
    )
    expect(() => parseCurrentPricesResponse(null)).toThrow(
      'Unexpected prices response shape'
    )
    expect(() => parseCurrentPricesResponse(undefined)).toThrow(
      'Unexpected prices response shape'
    )
  })
})

describe('parseHistoricalSnapshotPrice (Z37 historical shape guard)', () => {
  it('reads the middle timeseries point', () => {
    expect(
      parseHistoricalSnapshotPrice({
        address: '0xabc',
        timeseries: [
          { price: 1, timestamp: 1 },
          { price: 2, timestamp: 2 },
          { price: 3, timestamp: 3 },
        ],
      })
    ).toBe(2)
  })

  it('returns 0 for a well-formed but empty timeseries (legit "no price")', () => {
    expect(
      parseHistoricalSnapshotPrice({ address: '0xabc', timeseries: [] })
    ).toBe(0)
  })

  it('throws on a { statusCode } error body — never silently retains current price', () => {
    expect(() =>
      parseHistoricalSnapshotPrice({ statusCode: 500, message: 'boom' })
    ).toThrow('boom')
  })

  it('throws when timeseries is missing / mis-shaped', () => {
    expect(() => parseHistoricalSnapshotPrice({ address: '0xabc' })).toThrow(
      'Unexpected historical prices response shape'
    )
    expect(() => parseHistoricalSnapshotPrice(null)).toThrow(
      'Unexpected historical prices response shape'
    )
  })
})
