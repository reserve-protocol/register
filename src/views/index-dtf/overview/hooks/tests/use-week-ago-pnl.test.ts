import { describe, expect, it } from 'vitest'
import { calculateWeekAgoPnl } from '../use-week-ago-pnl'

describe('calculateWeekAgoPnl', () => {
  it('hides the PnL when the wallet has no week-old snapshot (fresh buyer)', () => {
    expect(
      calculateWeekAgoPnl({
        snapshotAmount: null,
        priceThen: 100,
        currentValue: 145.24,
      })
    ).toBeNull()
  })

  it('hides the PnL when the wallet held zero a week ago', () => {
    expect(
      calculateWeekAgoPnl({
        snapshotAmount: 0,
        priceThen: 100,
        currentValue: 145.24,
      })
    ).toBeNull()
  })

  it('hides the PnL while the historical price is missing or invalid', () => {
    expect(
      calculateWeekAgoPnl({
        snapshotAmount: 1.5,
        priceThen: undefined,
        currentValue: 145.24,
      })
    ).toBeNull()
    expect(
      calculateWeekAgoPnl({
        snapshotAmount: 1.5,
        priceThen: null,
        currentValue: 145.24,
      })
    ).toBeNull()
    expect(
      calculateWeekAgoPnl({
        snapshotAmount: 1.5,
        priceThen: 0,
        currentValue: 145.24,
      })
    ).toBeNull()
  })

  it('hides the PnL while the current balance value is still loading', () => {
    expect(
      calculateWeekAgoPnl({
        snapshotAmount: 1.5,
        priceThen: 100,
        currentValue: undefined,
      })
    ).toBeNull()
  })

  it('computes the value diff for a held position (gain and loss)', () => {
    // held 1.55 @ $104.35 a week ago (= $161.74), worth $145.24 now → -$16.50
    expect(
      calculateWeekAgoPnl({
        snapshotAmount: 1.55,
        priceThen: 104.35,
        currentValue: 145.24,
      })
    ).toBeCloseTo(-16.5, 1)
    expect(
      calculateWeekAgoPnl({
        snapshotAmount: 1,
        priceThen: 100,
        currentValue: 220,
      })
    ).toBe(120)
  })

  it('returns zero (still rendered) for a flat week', () => {
    expect(
      calculateWeekAgoPnl({
        snapshotAmount: 1,
        priceThen: 100,
        currentValue: 100,
      })
    ).toBe(0)
  })
})
