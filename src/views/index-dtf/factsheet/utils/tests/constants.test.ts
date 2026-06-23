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
})
