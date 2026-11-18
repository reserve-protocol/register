import { describe, expect, it } from 'vitest'
import { isWithinPeriod, parsePeriod } from '../period'

const NOW = 1_800_000_000
const DAY = 24 * 60 * 60

describe('parsePeriod', () => {
  it('defaults to the last month when the URL has no valid period', () => {
    expect(parsePeriod(null)).toBe('1m')
    expect(parsePeriod('forever')).toBe('1m')
  })

  it('reads a period from the URL', () => {
    expect(parsePeriod('all')).toBe('all')
    expect(parsePeriod('1w')).toBe('1w')
  })
})

describe('isWithinPeriod', () => {
  it('keeps a proposal created inside the window and drops an older one', () => {
    expect(isWithinPeriod(NOW - 29 * DAY, '1m', NOW)).toBe(true)
    expect(isWithinPeriod(NOW - 31 * DAY, '1m', NOW)).toBe(false)
    expect(isWithinPeriod(NOW - 8 * DAY, '1w', NOW)).toBe(false)
    expect(isWithinPeriod(NOW - 300 * DAY, '1y', NOW)).toBe(true)
  })

  it('keeps every proposal for All', () => {
    expect(isWithinPeriod(0, 'all', NOW)).toBe(true)
  })
})
