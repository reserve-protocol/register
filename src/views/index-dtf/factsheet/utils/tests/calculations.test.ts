import { describe, expect, it } from 'vitest'
import { calculateMonthlyChartData, calculatePerformance } from '../calculations'

// Independent-vector unit tests for the pure factsheet math. These lock the
// money/performance numbers the e2e suite renders but cannot verify offline.

describe('calculatePerformance (pure)', () => {
  it('gain: (110/100 - 1) * 100 = 10%', () => {
    expect(calculatePerformance(110, 100)).toBeCloseTo(10)
  })
  it('loss: (90/100 - 1) * 100 = -10%', () => {
    expect(calculatePerformance(90, 100)).toBeCloseTo(-10)
  })
  it('null past price → null (unavailable, not a number)', () => {
    expect(calculatePerformance(100, null)).toBeNull()
  })
  it('zero past price → null (guarded, no Infinity)', () => {
    expect(calculatePerformance(100, 0)).toBeNull()
  })
})

// Mid-month noon-UTC timestamps: the same calendar month in every timezone, so
// the month-grouping is deterministic regardless of where the test runs.
const JAN_15 = 1736942400
const JAN_20 = 1737374400
const FEB_15 = 1739620800

describe('calculateMonthlyChartData (pure)', () => {
  it('month-over-month P&L from each month\'s LAST price', () => {
    const r = calculateMonthlyChartData([
      { timestamp: JAN_15, price: 100 },
      { timestamp: JAN_20, price: 100 }, // Jan last = 100
      { timestamp: FEB_15, price: 110 }, // Feb last = 110
    ])
    expect(r[0].monthlyPL).toBeNull() // first month, no prior to compare
    expect(r[1].monthlyPL as number).toBeCloseTo(10) // (110-100)/100*100
  })
})

// BUG Z12 (REGISTER_HARDENING.md). The monthly P&L divides by the previous
// month's last price with NO zero-guard — the base calculatePerformance IS
// guarded, but this inline path does not reuse it — so a zero prior-month price
// yields Infinity instead of an unavailable point. `it.fails` documents it and
// flips (starts failing) when the guard is added.
describe('calculateMonthlyChartData zero prior price — KNOWN BUG (Z12)', () => {
  it.fails('zero prior-month price should be unavailable (null), not Infinity', () => {
    const r = calculateMonthlyChartData([
      { timestamp: JAN_15, price: 0 }, // Jan last = 0
      { timestamp: FEB_15, price: 110 }, // Feb P&L = (110-0)/0 = Infinity today
    ])
    // Desired = null (mirrors the guarded calculatePerformance). Today it's
    // Infinity, so this fails → it.fails passes. When the guard lands and returns
    // null, this passes → it.fails FLIPS red, prompting removal of the marker.
    // (Asserting Number.isFinite === true would NOT flip: isFinite(null) is also
    // false, so the marker would wrongly survive the fix.)
    expect(r[1].monthlyPL).toBeNull()
  })
})
