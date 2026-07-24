import { describe, expect, it } from 'vitest'
import { computeFolioUnits } from '../weight-calculation-utils'

const E18 = 10n ** 18n

describe('computeFolioUnits', () => {
  it('computes per-share units as assets * 1e18 / supply', () => {
    // 40 assets over a supply of 10 shares → 4 tokens per share
    expect(computeFolioUnits(40n * E18, 10n * E18)).toBe(4n * E18)
  })

  it('returns null for a 0 supply (indeterminate, never the || 1n inflation)', () => {
    expect(computeFolioUnits(40n * E18, 0n)).toBeNull()
  })

  it('returns null for a negative supply', () => {
    expect(computeFolioUnits(40n * E18, -5n)).toBeNull()
  })
})
