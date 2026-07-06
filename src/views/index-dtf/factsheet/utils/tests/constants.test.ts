import { describe, expect, it } from 'vitest'
import { currentHour, getRangeParams } from '../constants'

describe('getRangeParams', () => {
  it('returns a year-to-date window for ytd', () => {
    const params = getRangeParams('ytd')
    const expectedFrom = Math.floor(
      Date.UTC(new Date(currentHour * 1000).getUTCFullYear(), 0, 1) / 1000
    )

    expect(params.from).toBe(expectedFrom)
    expect(params.to).toBe(currentHour)
    expect(params.interval).toBe('1d')
  })

  it('falls back to 7d for unknown ranges', () => {
    expect(getRangeParams('bogus')).toEqual(getRangeParams('7d'))
  })

  it('clamps from to minFrom on every range', () => {
    const inception = currentHour - 100
    expect(getRangeParams('all', inception).from).toBe(inception)
    expect(getRangeParams('1y', inception).from).toBe(inception)
    expect(getRangeParams('ytd', inception).from).toBe(inception)
  })

  it('keeps from untouched when the window starts after minFrom', () => {
    const inception = currentHour - 10 * 86400
    expect(getRangeParams('24h', inception).from).toBe(currentHour - 86400)
  })
})
