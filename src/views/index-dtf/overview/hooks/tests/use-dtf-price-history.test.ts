import { describe, expect, it } from 'vitest'
import { dedupeByTimestamp } from '../use-dtf-price-history'

describe('dedupeByTimestamp', () => {
  it('returns the same array when there are no duplicates', () => {
    const points = [
      { timestamp: 1, price: 10 },
      { timestamp: 2, price: 20 },
    ]
    expect(dedupeByTimestamp(points)).toBe(points)
  })

  it('keeps the last occurrence of a duplicated timestamp', () => {
    const points = [
      { timestamp: 1, price: 10 },
      { timestamp: 2, price: 20 },
      { timestamp: 2, price: 21 },
      { timestamp: 3, price: 30 },
    ]
    expect(dedupeByTimestamp(points)).toEqual([
      { timestamp: 1, price: 10 },
      { timestamp: 2, price: 21 },
      { timestamp: 3, price: 30 },
    ])
  })

  it('sorts the rebuilt array by timestamp when duplicates force a rebuild', () => {
    const points = [
      { timestamp: 3, price: 30 },
      { timestamp: 1, price: 10 },
      { timestamp: 1, price: 11 },
      { timestamp: 2, price: 20 },
    ]
    expect(dedupeByTimestamp(points).map((p) => p.timestamp)).toEqual([
      1, 2, 3,
    ])
  })
})
