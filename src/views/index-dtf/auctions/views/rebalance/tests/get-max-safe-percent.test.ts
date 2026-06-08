import { describe, it, expect } from 'vitest'
import {
  getExceededOndoLegs,
  getMaxSafeRebalancePercent,
  ONDO_LIMIT_BUFFER,
  OndoLimit,
} from '../utils/get-max-safe-percent'

const A = '0xaaa'
const B = '0xbbb'

// Linear model: at 100% each leg is $1M, scaling down with the percent — close
// enough to the real monotonic SDK sizing to exercise the search.
const linearSizes = (percent: number) => ({
  [A]: (percent / 100) * 1_000_000,
  [B]: (percent / 100) * 1_000_000,
})

describe('getMaxSafeRebalancePercent', () => {
  it('returns 100 when there are no Ondo limits', () => {
    expect(getMaxSafeRebalancePercent(linearSizes, {})).toBe(100)
  })

  it('returns 100 when every leg fits at full percent', () => {
    const limits: Record<string, OndoLimit> = {
      [A]: { capacityUsd: 5_000_000, tradingOpen: true },
      [B]: { capacityUsd: 5_000_000, tradingOpen: true },
    }
    expect(getMaxSafeRebalancePercent(linearSizes, limits)).toBe(100)
  })

  it('caps to the tightest open Ondo asset (with buffer)', () => {
    // A binds at $200k (-> $190k after buffer); B at $800k is slack.
    const limits: Record<string, OndoLimit> = {
      [A]: { capacityUsd: 200_000, tradingOpen: true },
      [B]: { capacityUsd: 800_000, tradingOpen: true },
    }
    const pct = getMaxSafeRebalancePercent(linearSizes, limits)

    expect(pct).toBe(19) // 19% -> A leg = $190k = 200k * 0.95
    expect(linearSizes(pct)[A]).toBeLessThanOrEqual(200_000 * ONDO_LIMIT_BUFFER)
    expect(linearSizes(pct + 1)[A]).toBeGreaterThan(200_000 * ONDO_LIMIT_BUFFER)
  })

  it('ignores halted assets (they are warned, not capped)', () => {
    const limits: Record<string, OndoLimit> = {
      [A]: { capacityUsd: 1_000, tradingOpen: false }, // halted -> skipped
      [B]: { capacityUsd: 5_000_000, tradingOpen: true },
    }
    expect(getMaxSafeRebalancePercent(linearSizes, limits)).toBe(100)
  })

  it('returns the minimum when a leg is over its cap even at 1%', () => {
    const limits: Record<string, OndoLimit> = {
      [A]: { capacityUsd: 100, tradingOpen: true }, // 1% leg = $10k >> $95
    }
    expect(getMaxSafeRebalancePercent(linearSizes, limits)).toBe(1)
  })

  it('treats an unpriceable percent (null) as not fitting', () => {
    const limits: Record<string, OndoLimit> = {
      [A]: { capacityUsd: 200_000, tradingOpen: true },
      [B]: { capacityUsd: 800_000, tradingOpen: true },
    }
    // Null above 50% forces the search below it; A still binds at ~19%.
    const sizes = (percent: number) => (percent > 50 ? null : linearSizes(percent))
    expect(getMaxSafeRebalancePercent(sizes, limits)).toBe(19)
  })
})

describe('getExceededOndoLegs', () => {
  const limits = {
    [A]: { capacityUsd: 200_000, tradingOpen: true, symbol: 'Aon' },
    [B]: { capacityUsd: 800_000, tradingOpen: true, symbol: 'Bon' },
  }

  it('flags only legs over the buffered soft cap', () => {
    // A = $195k (> $190k soft cap), B = $195k (< $760k soft cap).
    const exceeded = getExceededOndoLegs({ [A]: 195_000, [B]: 195_000 }, limits)
    expect(exceeded).toEqual([
      { address: A, symbol: 'Aon', sizeUsd: 195_000, capacityUsd: 200_000 },
    ])
  })

  it('is empty when every leg is within its soft cap', () => {
    expect(getExceededOndoLegs({ [A]: 100_000, [B]: 100_000 }, limits)).toEqual([])
  })

  it('ignores halted assets', () => {
    const halted = {
      [A]: { capacityUsd: 1_000, tradingOpen: false, symbol: 'Aon' },
    }
    expect(getExceededOndoLegs({ [A]: 500_000 }, halted)).toEqual([])
  })
})
