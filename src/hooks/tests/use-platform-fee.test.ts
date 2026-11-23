import { describe, expect, it } from 'vitest'
import { toPlatformFeePercent } from '../use-platform-fee'

describe('toPlatformFeePercent', () => {
  it('keeps two decimals of a one-third platform share', () => {
    expect(toPlatformFeePercent(1n, 3n)).toBe(33.33)
  })

  it('reads whole shares exactly', () => {
    expect(toPlatformFeePercent(1n, 2n)).toBe(50)
    expect(toPlatformFeePercent(1n, 5n)).toBe(20)
  })
})
