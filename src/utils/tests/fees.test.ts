import { describe, expect, it } from 'vitest'
import { parseEther } from 'viem'
import {
  getFeePercentAdjust,
  isDisplayablePlatformFee,
  platformFeePercent,
  quantizeFeePercent,
  revenuePortionFromShare,
  splitSharesEvenly,
} from '../fees'

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

describe('platformFeePercent', () => {
  it('keeps basis-point precision for a fractional registry fee', () => {
    // BSC DAO fee registry: numerator/denominator = 1/3 → 33.333…% of revenue.
    // Integer rounding reported it as 33%, which shifted every recipient share.
    expect(platformFeePercent(333333333333333333n, 10n ** 18n)).toBe(33.33)
  })

  it('reads an exact fee unchanged', () => {
    expect(platformFeePercent(5n * 10n ** 17n, 10n ** 18n)).toBe(50)
    expect(platformFeePercent(0n, 10n ** 18n)).toBe(0)
  })

  it('is undefined for a zero denominator (unreadable registry)', () => {
    expect(platformFeePercent(1n, 0n)).toBeUndefined()
  })
})

describe('quantizeFeePercent', () => {
  it('snaps to the 0.01% grid the share inputs accept', () => {
    expect(quantizeFeePercent(33.333333333333336)).toBe(33.33)
    expect(quantizeFeePercent(50)).toBe(50)
  })

  it('passes through a non-finite value untouched', () => {
    expect(quantizeFeePercent(NaN)).toBeNaN()
  })
})

describe('revenuePortionFromShare', () => {
  it('gives the whole non-platform pot to a share equal to it', () => {
    expect(revenuePortionFromShare(66.67, 33.33)).toBe(parseEther('1'))
    expect(revenuePortionFromShare(50, 50)).toBe(parseEther('1'))
  })

  it('never exceeds the pot for a fractional platform fee', () => {
    // parseEther on the float quotient overflowed 1e18 here (66.67/66.6667).
    expect(revenuePortionFromShare(66.67, 33.33)).toBeLessThanOrEqual(
      parseEther('1')
    )
    expect(revenuePortionFromShare(33.34, 33.33)).toBeLessThanOrEqual(
      parseEther('1')
    )
  })

  it('scales a partial share by the non-platform pot', () => {
    expect(revenuePortionFromShare(25, 50)).toBe(parseEther('0.5'))
    expect(revenuePortionFromShare(60, 0)).toBe(parseEther('0.6'))
  })

  it('falls back to the share of total when the pot is empty', () => {
    expect(revenuePortionFromShare(50, 100)).toBe(parseEther('0.5'))
  })
})

describe('splitSharesEvenly', () => {
  it('totals the pot exactly when it does not divide evenly', () => {
    expect(splitSharesEvenly(66.67, 2)).toEqual([33.33, 33.34])
    expect(splitSharesEvenly(66.67, 3)).toEqual([22.22, 22.22, 22.23])
  })

  it('splits an even pot into equal shares', () => {
    expect(splitSharesEvenly(50, 2)).toEqual([25, 25])
  })

  it('returns nothing without participants', () => {
    expect(splitSharesEvenly(50, 0)).toEqual([])
  })
})
