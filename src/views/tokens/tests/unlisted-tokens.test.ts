import { describe, expect, it } from 'vitest'
import { buildUnlistedTokenRows } from '../useUnlistedTokens'

const rtoken = {
  id: '0x0000000000000000000000000000000000000001',
  targetUnits: 'USD',
  rsrStaked: '1000000000000000000', // 1e18 → 1 RSR
  token: {
    name: 'Token One',
    symbol: 'ONE',
    lastPriceUSD: '2',
    transferCount: 5,
    totalSupply: '3000000000000000000', // 3e18
    cumulativeVolume: '4000000000000000000', // 4e18
  },
}

describe('buildUnlistedTokenRows', () => {
  it('maps rtokens across chains and values them', () => {
    const rows = buildUnlistedTokenRows({ 1: { rtokens: [rtoken] } }, [1], 0.5)

    expect(rows).toHaveLength(1)
    expect(rows[0].symbol).toBe('ONE')
    expect(rows[0].chain).toBe(1)
    expect(rows[0].cumulativeVolume).toBe(8) // 4 * 2
    expect(rows[0].staked).toBe(0.5) // 1 * 0.5
    expect(rows[0].marketCap).toBe(6) // 3 * 2
  })

  it('does not throw when a chain bucket is present but has no rtokens (Z2)', () => {
    // The GH0-class regression: bucket truthy, `rtokens` missing.
    expect(() => buildUnlistedTokenRows({ 1: {} }, [1], 1)).not.toThrow()
    expect(buildUnlistedTokenRows({ 1: {} }, [1], 1)).toEqual([])
  })

  it('skips absent chain buckets and undefined data', () => {
    expect(buildUnlistedTokenRows({ 1: { rtokens: [rtoken] } }, [8453], 1)).toEqual(
      []
    )
    expect(buildUnlistedTokenRows(undefined, [1], 1)).toEqual([])
  })
})
