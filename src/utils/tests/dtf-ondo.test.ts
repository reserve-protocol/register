import { describe, expect, it } from 'vitest'
import {
  floorOndoMaxUsd,
  formatOndoTime,
  getNextTradableSession,
  getOndoWeightedMaxUsd,
  isOndoMintingAvailable,
  isOndoMintingUnavailable,
  OndoAssetLimit,
  OndoMarketStatus,
  OndoSessionLimits,
} from '../dtf-ondo'

const ADDRESS_A = '0x000000000000000000000000000000000000000a'
const ADDRESS_B = '0x000000000000000000000000000000000000000b'
const ADDRESS_C = '0x000000000000000000000000000000000000000c'

const asset = (
  address: string = ADDRESS_A,
  capacityUsd?: number,
  sessionLimits: OndoSessionLimits | null = null
): OndoAssetLimit => ({
  address: address as OndoAssetLimit['address'],
  symbol: 'TESTon',
  name: 'Test (Ondo Tokenized)',
  sessionLimits,
  capacityUsd,
})

const market = (isOpen: boolean, session = 'regular'): OndoMarketStatus => ({
  isOpen,
  session,
  nextOpen: null,
  nextClose: null,
  timestamp: '2026-07-03T00:00:00Z',
})

describe('getOndoWeightedMaxUsd', () => {
  it('returns undefined for an empty basket', () => {
    expect(getOndoWeightedMaxUsd([], {})).toBeUndefined()
  })

  it('returns undefined when no asset reports a cap', () => {
    expect(
      getOndoWeightedMaxUsd([asset(ADDRESS_A), asset(ADDRESS_B)], {
        [ADDRESS_A]: '50.00',
        [ADDRESS_B]: '50.00',
      })
    ).toBeUndefined()
  })

  it('returns the minimum of capacity / weight across assets', () => {
    // A: 240k / 24.80% ≈ 967,742 — B: 50k / 10.00% = 500,000
    expect(
      getOndoWeightedMaxUsd(
        [asset(ADDRESS_A, 240_000), asset(ADDRESS_B, 50_000)],
        { [ADDRESS_A]: '24.80', [ADDRESS_B]: '10.00' }
      )
    ).toBe(500_000)
  })

  it('a low cap on a low weight can bind over a high cap on a high weight', () => {
    // A: 660k / 50% = 1.32M — B: 10k / 1.12% ≈ 892,857
    expect(
      getOndoWeightedMaxUsd(
        [asset(ADDRESS_A, 660_000), asset(ADDRESS_B, 10_000)],
        { [ADDRESS_A]: '50.00', [ADDRESS_B]: '1.12' }
      )
    ).toBeCloseTo(892_857.14, 1)
  })

  it('skips assets with a zero weight or missing from the shares map', () => {
    expect(
      getOndoWeightedMaxUsd(
        [
          asset(ADDRESS_A, 100_000),
          asset(ADDRESS_B, 1_000),
          asset(ADDRESS_C, 1_000),
        ],
        { [ADDRESS_A]: '50.00', [ADDRESS_B]: '0.00' }
      )
    ).toBe(200_000)
  })

  it('treats a zero cap on a weighted asset as a zero max (unmintable)', () => {
    expect(
      getOndoWeightedMaxUsd(
        [asset(ADDRESS_A, 240_000), asset(ADDRESS_B, 0)],
        { [ADDRESS_A]: '50.00', [ADDRESS_B]: '50.00' }
      )
    ).toBe(0)
  })

  it('matches checksummed asset addresses against lowercase share keys', () => {
    expect(
      getOndoWeightedMaxUsd(
        [asset('0x0000000000000000000000000000000000000A0a', 100_000)],
        { '0x0000000000000000000000000000000000000a0a': '25.00' }
      )
    ).toBe(400_000)
  })
})

describe('floorOndoMaxUsd', () => {
  it('floors to $10k above $10k', () => {
    expect(floorOndoMaxUsd(967_741)).toBe(960_000)
    expect(floorOndoMaxUsd(93_453)).toBe(90_000)
    expect(floorOndoMaxUsd(10_000)).toBe(10_000)
  })

  it('floors to $1k below $10k', () => {
    expect(floorOndoMaxUsd(9_999)).toBe(9_000)
    expect(floorOndoMaxUsd(7_432)).toBe(7_000)
    expect(floorOndoMaxUsd(999)).toBe(0)
    expect(floorOndoMaxUsd(0)).toBe(0)
  })
})

describe('isOndoMintingAvailable', () => {
  it('is false without ondo assets or market data', () => {
    expect(isOndoMintingAvailable(market(true), [])).toBe(false)
    expect(isOndoMintingAvailable(null, [asset(ADDRESS_A, 100)])).toBe(false)
  })

  it('is false while the market is closed', () => {
    expect(isOndoMintingAvailable(market(false), [asset(ADDRESS_A, 100)])).toBe(
      false
    )
  })

  it('is true when open and every reported cap is positive', () => {
    expect(
      isOndoMintingAvailable(market(true), [
        asset(ADDRESS_A, 100),
        asset(ADDRESS_B),
      ])
    ).toBe(true)
  })

  it('is false when open but an asset is paused (cap 0)', () => {
    expect(
      isOndoMintingAvailable(market(true), [
        asset(ADDRESS_A, 100),
        asset(ADDRESS_B, 0),
      ])
    ).toBe(false)
  })
})

describe('isOndoMintingUnavailable', () => {
  it('is true while the market is closed', () => {
    expect(isOndoMintingUnavailable(market(false), [asset(ADDRESS_A)])).toBe(
      true
    )
  })

  it('is true when open but an asset is paused', () => {
    expect(
      isOndoMintingUnavailable(market(true), [
        asset(ADDRESS_A, 100),
        asset(ADDRESS_B, 0),
      ])
    ).toBe(true)
  })

  it('fails open on missing market data or an empty basket', () => {
    expect(isOndoMintingUnavailable(null, [asset(ADDRESS_A)])).toBe(false)
    expect(isOndoMintingUnavailable(market(false), [])).toBe(false)
  })

  it('is false when open with healthy caps', () => {
    expect(
      isOndoMintingUnavailable(market(true), [asset(ADDRESS_A, 100)])
    ).toBe(false)
  })
})

describe('getNextTradableSession', () => {
  const limits = (
    overrides: Partial<OndoSessionLimits> = {}
  ): OndoSessionLimits => ({
    premarket: 10_000,
    regular: 100_000,
    postmarket: 10_000,
    overnight: 10_000,
    ...overrides,
  })

  it('returns the next session where every asset trades', () => {
    expect(
      getNextTradableSession('regular', [
        asset(ADDRESS_A, 0, limits({ postmarket: 0 })),
      ])
    ).toBe('overnight')
  })

  it('wraps around the trading day', () => {
    expect(
      getNextTradableSession('overnight', [asset(ADDRESS_A, 0, limits())])
    ).toBe('premarket')
  })

  it('intersects the limits across assets', () => {
    expect(
      getNextTradableSession('regular', [
        asset(ADDRESS_A, 0, limits({ postmarket: 0 })),
        asset(ADDRESS_B, 0, limits({ overnight: 0 })),
      ])
    ).toBe('premarket')
  })

  it('can wrap all the way back to the current session', () => {
    expect(
      getNextTradableSession('regular', [
        asset(
          ADDRESS_A,
          0,
          limits({ premarket: 0, postmarket: 0, overnight: 0 })
        ),
      ])
    ).toBe('regular')
  })

  it('returns undefined without session limits', () => {
    expect(getNextTradableSession('regular', [asset(ADDRESS_A, 0)])).toBe(
      undefined
    )
  })

  it('falls back to the regular cap for missing buckets, like the API', () => {
    expect(
      getNextTradableSession('regular', [
        asset(ADDRESS_A, 0, { regular: 100_000 }),
      ])
    ).toBe('postmarket')
    expect(
      getNextTradableSession('regular', [
        asset(ADDRESS_A, 0, { premarket: 10_000 }),
      ])
    ).toBe('premarket')
  })

  it('returns undefined for unknown sessions', () => {
    expect(
      getNextTradableSession('closed', [asset(ADDRESS_A, 0, limits())])
    ).toBe(undefined)
  })
})

describe('formatOndoTime', () => {
  it('formats a valid ISO timestamp', () => {
    // Exact output is locale/timezone dependent — assert shape only.
    expect(formatOndoTime('2026-07-06T00:05:00Z')).toMatch(/\d/)
  })

  it('returns null for missing or invalid input', () => {
    expect(formatOndoTime(null)).toBeNull()
    expect(formatOndoTime(undefined)).toBeNull()
    expect(formatOndoTime('not-a-date')).toBeNull()
  })
})
