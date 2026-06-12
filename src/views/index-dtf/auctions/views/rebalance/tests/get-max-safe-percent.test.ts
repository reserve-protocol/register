import { describe, it, expect } from 'vitest'
import { AuctionMetrics } from '@reserve-protocol/dtf-rebalance-lib'
import {
  getExceededOndoLegs,
  getMaxSafeRebalancePercent,
  getScaledLegSizes,
  ONDO_LIMIT_BUFFER,
  OndoLimit,
} from '../utils/get-max-safe-percent'

const A = '0xaaa'
const B = '0xbbb'
const C = '0xccc'

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

  it('never searches below minPercent (SDK full-trade zone)', () => {
    // Below 31% (relativeProgression ~30%) the SDK would do the full trade —
    // sizes there are the max, not small. The search must stay above it.
    const sizes = (percent: number) =>
      percent <= 31 ? linearSizes(100) : linearSizes(percent)
    const limits: Record<string, OndoLimit> = {
      [A]: { capacityUsd: 500_000, tradingOpen: true },
    }
    // Cap = $475k -> 47%; reachable only if the search isn't poisoned by the
    // full-trade sizes at low percents.
    expect(getMaxSafeRebalancePercent(sizes, limits, 32)).toBe(47)
  })

  it('falls back to minPercent when nothing fits', () => {
    const limits: Record<string, OndoLimit> = {
      [A]: { capacityUsd: 100, tradingOpen: true },
    }
    expect(getMaxSafeRebalancePercent(linearSizes, limits, 32)).toBe(32)
  })
})

describe('getScaledLegSizes', () => {
  const metrics = (
    surplus: Record<string, number>,
    deficit: Record<string, number>
  ): AuctionMetrics =>
    ({
      surplusTokens: Object.keys(surplus),
      surplusTokenSizes: Object.values(surplus),
      deficitTokens: Object.keys(deficit),
      deficitTokenSizes: Object.values(deficit),
    }) as AuctionMetrics

  it('scales eject surpluses (full position) down to the deficit side', () => {
    // Ejected tokens report their whole position as surplus at any percent;
    // only min(surplus, deficit) actually trades.
    const sizes = getScaledLegSizes(
      metrics({ [A]: 300_000, [B]: 100_000 }, { [C]: 200_000 })
    )
    expect(sizes[A]).toBeCloseTo(150_000)
    expect(sizes[B]).toBeCloseTo(50_000)
    expect(sizes[C]).toBeCloseTo(200_000)
  })

  it('scales the deficit side when the surplus side is smaller', () => {
    const sizes = getScaledLegSizes(
      metrics({ [A]: 100_000 }, { [B]: 150_000, [C]: 50_000 })
    )
    expect(sizes[A]).toBeCloseTo(100_000)
    expect(sizes[B]).toBeCloseTo(75_000)
    expect(sizes[C]).toBeCloseTo(25_000)
  })

  it('leaves balanced sides untouched', () => {
    const sizes = getScaledLegSizes(metrics({ [A]: 100_000 }, { [B]: 100_000 }))
    expect(sizes[A]).toBeCloseTo(100_000)
    expect(sizes[B]).toBeCloseTo(100_000)
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
