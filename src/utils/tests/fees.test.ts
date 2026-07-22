import { describe, expect, it } from 'vitest'
import { getFeePercentAdjust, isDisplayablePlatformFee } from '../fees'

describe('isDisplayablePlatformFee', () => {
  it('accepts a finite fee in [0, 100)', () => {
    expect(isDisplayablePlatformFee(0)).toBe(true)
    expect(isDisplayablePlatformFee(50)).toBe(true)
    expect(isDisplayablePlatformFee(99.99)).toBe(true)
  })

  it('rejects 100 (divisor 0 → Infinity → every share 0%/NaN%)', () => {
    expect(isDisplayablePlatformFee(100)).toBe(false)
  })

  it('rejects above 100 (negative divisor → negative shares)', () => {
    expect(isDisplayablePlatformFee(150)).toBe(false)
  })

  it('rejects negative and non-finite fees (invalid registry read)', () => {
    expect(isDisplayablePlatformFee(-1)).toBe(false)
    expect(isDisplayablePlatformFee(NaN)).toBe(false)
    expect(isDisplayablePlatformFee(Infinity)).toBe(false)
  })
})

describe('getFeePercentAdjust', () => {
  it('is 1 at platformFee 0 (no platform cut → shares shown as-is)', () => {
    expect(getFeePercentAdjust(0)).toBe(1)
  })

  it('scales by the non-platform portion for a displayable fee', () => {
    // platformFee 50 → 100/50 = 2 → a contract 80% displays as 40%
    expect(getFeePercentAdjust(50)).toBe(2)
    expect(getFeePercentAdjust(20)).toBe(100 / 80)
  })
})
