import { describe, expect, it } from 'vitest'
import { isUnderlyingFeesEnabled, type FeeRate } from '../api'
import {
  formatFeeUsd,
  formatRatePercent,
  getCategoryRates,
  groupRateLayers,
} from '../rates'

const row = (overrides: Partial<FeeRate> & Pick<FeeRate, 'category'>) =>
  ({
    basis: overrides.category === 'management' ? 'aum' : 'interest',
    rate: 0,
    weight: 1,
    source: 'onchain',
    layer: { kind: 'morpho-vault-v2', address: '0x01', label: 'Vault' },
    ...overrides,
  }) as FeeRate

const market = (id: string, rate: number, weight: number) =>
  row({
    category: 'protocol',
    rate,
    weight,
    layer: { kind: 'morpho-blue-market', address: id, label: `Market ${id}` },
  })

describe('getCategoryRates', () => {
  it('weights management by the full position and averages the rest over interest-earning capital', () => {
    const rates = [
      row({ category: 'management', rate: 0.01, weight: 1 }),
      row({ category: 'performance', rate: 0.1, weight: 1 }),
      market('a', 0.1, 0.3),
      market('b', 0, 0.5),
    ]

    const result = getCategoryRates(rates)

    expect(result.management).toEqual({ rate: 0.01, basis: 'aum' })
    expect(result.performance).toEqual({ rate: 0.1, basis: 'interest' })
    expect(result.protocol?.rate).toBeCloseTo((0.1 * 0.3) / 0.8)
    expect(result.protocol?.basis).toBe('interest')
  })

  it('scales management by weight when part of the position is exposed', () => {
    const result = getCategoryRates([
      row({ category: 'management', rate: 0.02, weight: 0.5 }),
    ])

    expect(result.management?.rate).toBeCloseTo(0.01)
  })

  it('returns null for categories without rows (Aave reserve factor only)', () => {
    const result = getCategoryRates([
      row({
        category: 'protocol',
        rate: 0.1,
        layer: { kind: 'aave-v3', address: '0x02', label: 'Aave V3 USDT' },
      }),
    ])

    expect(result.management).toBeNull()
    expect(result.performance).toBeNull()
    expect(result.protocol).toEqual({ rate: 0.1, basis: 'interest' })
  })

  it('returns all null for unavailable collaterals', () => {
    expect(getCategoryRates([])).toEqual({
      management: null,
      performance: null,
      protocol: null,
    })
  })

  it('returns 0 instead of NaN when the category has no weight', () => {
    expect(getCategoryRates([market('a', 0.1, 0)]).protocol?.rate).toBe(0)
  })
})

describe('groupRateLayers', () => {
  it('collapses zero-rate Morpho markets and orders vault fees first', () => {
    const rates = [
      market('a', 0, 0.2),
      market('b', 0.05, 0.1),
      market('c', 0.05, 0.4),
      market('d', 0, 0.1),
      row({ category: 'performance', rate: 0.1 }),
      row({ category: 'management', rate: 0.01 }),
    ]

    const { layers, zeroRateMarkets } = groupRateLayers(rates)

    expect(zeroRateMarkets).toBe(2)
    expect(layers.map((l) => l.layer.label)).toEqual([
      'Vault',
      'Vault',
      'Market c',
      'Market b',
    ])
    expect(layers[0].category).toBe('management')
  })

  it('keeps a zero-rate Aave reserve factor visible', () => {
    const aave = row({
      category: 'protocol',
      layer: { kind: 'aave-v3', address: '0x02', label: 'Aave V3 USDT' },
    })

    expect(groupRateLayers([aave])).toEqual({
      layers: [aave],
      zeroRateMarkets: 0,
    })
  })
})

describe('formatting', () => {
  it('formats rates with up to two decimals and 0 as 0%', () => {
    expect(formatRatePercent(0)).toBe('0%')
    expect(formatRatePercent(0.00001)).toBe('0%')
    expect(formatRatePercent(0.0125)).toBe('1.25%')
    expect(formatRatePercent(0.1)).toBe('10%')
  })

  it('does not round small USD amounts to zero', () => {
    expect(formatFeeUsd(0.0042)).toBe('$0.0042')
    expect(formatFeeUsd(0)).toBe('$0.00')
    expect(formatFeeUsd(1234.5)).toBe('$1,234.50')
  })
})

describe('isUnderlyingFeesEnabled', () => {
  it('only enables eUSD on mainnet', () => {
    const eusd = '0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F'

    expect(isUnderlyingFeesEnabled(1, eusd)).toBe(true)
    expect(isUnderlyingFeesEnabled(1, eusd.toLowerCase())).toBe(true)
    expect(isUnderlyingFeesEnabled(8453, eusd)).toBe(false)
    expect(
      isUnderlyingFeesEnabled(1, '0xE72B141DF173b999AE7c1aDcbF60Cc9833Ce56a8')
    ).toBe(false)
  })
})
