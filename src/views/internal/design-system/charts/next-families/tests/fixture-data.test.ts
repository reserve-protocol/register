import { describe, expect, it } from 'vitest'
import {
  capturedRsrPriceProvenance,
  capturedYieldProvenance,
  historicalMetrics,
} from '../fixture-data'
import {
  portfolioPressurePoints,
  portfolioPressurePeriodSeconds,
} from '../fixtures/portfolio-pressure'
import { PORTFOLIO_CATEGORIES } from '../portfolio-categories'
import { getMetricDomain } from '../metric-formatters'
import { pointsInRange } from '../range-control'

describe('next chart-family inputs', () => {
  it('keeps captured Yield points and units distinct', () => {
    const price = historicalMetrics.find((metric) => metric.id === 'price')!
    const apy = historicalMetrics.find((metric) => metric.id === 'apy')!
    const supply = historicalMetrics.find((metric) => metric.id === 'supply')!
    const staked = historicalMetrics.find(
      (metric) => metric.id === 'staked-rsr'
    )!

    expect(price.points).toHaveLength(29)
    expect(supply.points).toHaveLength(365)
    expect(staked.points).toHaveLength(365)
    expect(price.unit).toBe('USD per hyUSD')
    expect(apy.unit).toBe('Annual percentage yield')
    expect(supply.unit).toBe('hyUSD')
    expect(staked.unit).toBe('USD value of RSR staked')
    expect(apy.isSynthetic).toBe(true)
    expect(price.isSynthetic).toBe(false)
    expect(capturedYieldProvenance.snapshotMeta.chainId).toBe(8453)
    expect(capturedYieldProvenance.sourceSha256).toBe(
      'daa0af6de543bf9e3f736d4fccf8d41a11aa19fe9a9556cad5a8b0111d86f452'
    )
    expect(capturedRsrPriceProvenance.usd).toBe('0.00144684')
  })

  it('orders the captured historical series chronologically', () => {
    for (const metric of historicalMetrics) {
      const timestamps = metric.points.map((point) => point.timestamp)
      expect(timestamps).toEqual([...timestamps].sort((a, b) => a - b))
    }
  })

  it('keeps exports faithful to captured fields and disables synthetic APY export', () => {
    const price = historicalMetrics.find((metric) => metric.id === 'price')!
    const apy = historicalMetrics.find((metric) => metric.id === 'apy')!
    const supply = historicalMetrics.find((metric) => metric.id === 'supply')!
    const staked = historicalMetrics.find(
      (metric) => metric.id === 'staked-rsr'
    )!

    expect(price.csv?.headers.map((header) => header.key)).toEqual([
      'timestamp',
      'priceUSD',
    ])
    expect(price.csv?.rows[0].priceUSD).toBeTypeOf('string')
    expect(supply.csv?.headers.map((header) => header.key)).toEqual([
      'timestamp',
      'supply',
    ])
    expect(staked.csv?.headers.map((header) => header.key)).toEqual([
      'timestamp',
      'rsrStaked',
    ])
    expect(apy.csv).toBeUndefined()
    expect(apy.csvUnavailableReason).toContain('simulated APY')
  })

  it('uses automatic domains only for level series that need them', () => {
    const metric = (id: (typeof historicalMetrics)[number]['id']) =>
      historicalMetrics.find((candidate) => candidate.id === id)!

    expect(getMetricDomain(metric('price'))).toEqual(['auto', 'auto'])
    expect(getMetricDomain(metric('apy'))).toEqual(['auto', 'auto'])
    expect(getMetricDomain(metric('supply'))).toBeUndefined()
    expect(getMetricDomain(metric('staked-rsr'))).toBeUndefined()
  })

  it('keeps each portfolio total equal to its displayed categories', () => {
    for (const point of portfolioPressurePoints) {
      const categoryTotal = PORTFOLIO_CATEGORIES.reduce(
        (total, category) => total + point[category.key],
        0
      )
      expect(point.value).toBe(categoryTotal)
    }
    const firstPositive = portfolioPressurePoints.findIndex(
      (point) => point.value > 0
    )
    expect(
      portfolioPressurePoints[firstPositive + 1].timestamp -
        portfolioPressurePoints[firstPositive].timestamp
    ).toBe(portfolioPressurePeriodSeconds)
  })

  it('models known zero holdings before the first positive Portfolio sample', () => {
    const zeroTimestamps = [
      '2025-08-24T00:00:00Z',
      '2026-01-01T00:00:00Z',
      '2026-05-24T00:00:00Z',
      '2026-05-31T23:59:59Z',
    ]

    for (const timestampIso of zeroTimestamps) {
      expect(
        portfolioPressurePoints.find(
          (point) => point.timestamp === Date.parse(timestampIso) / 1000
        )
      ).toEqual({
        timestamp: Date.parse(timestampIso) / 1000,
        value: 0,
        indexDTFs: 0,
        yieldDTFs: 0,
        stakedRSR: 0,
        voteLocked: 0,
        rsr: 0,
      })
    }

    expect(
      portfolioPressurePoints.filter((point) => point.value > 0)
    ).toHaveLength(13)
    expect(
      portfolioPressurePoints.find((point) => point.value > 0)?.timestamp
    ).toBe(Date.parse('2026-06-01T00:00:00Z') / 1000)
  })

  it('uses the source stack order and a token-derived category mapping', () => {
    expect(PORTFOLIO_CATEGORIES).toEqual([
      { key: 'rsr', label: 'RSR', color: 'hsl(var(--primary))' },
      {
        key: 'voteLocked',
        label: 'Vote-locked',
        color: 'hsl(var(--chart-4))',
      },
      {
        key: 'stakedRSR',
        label: 'Staked RSR',
        color: 'hsl(var(--chart-1))',
      },
      {
        key: 'yieldDTFs',
        label: 'Yield DTFs',
        color: 'hsl(var(--chart-2))',
      },
      {
        key: 'indexDTFs',
        label: 'Index DTFs',
        color: 'hsl(var(--primary) / 0.58)',
      },
    ])
  })

  it('preserves the supplied range meanings when filtering fixtures', () => {
    const staked = historicalMetrics.find(
      (metric) => metric.id === 'staked-rsr'
    )!

    expect(pointsInRange(staked.points, '1y')).toHaveLength(365)
    expect(pointsInRange(portfolioPressurePoints, '24h')).toHaveLength(1)
    expect(pointsInRange(portfolioPressurePoints, '7d')).toHaveLength(2)
    expect(pointsInRange(portfolioPressurePoints, 'all')).toHaveLength(
      portfolioPressurePoints.length
    )
  })

  it('uses calendar arithmetic from an explicit as-of timestamp', () => {
    const point = (date: string) => ({
      timestamp: Date.parse(`${date}T00:00:00Z`) / 1000,
    })
    const points = [
      point('2023-12-31'),
      point('2024-01-01'),
      point('2024-02-29'),
      point('2024-03-30'),
      point('2024-03-31'),
      point('2024-06-30'),
      point('2025-02-28'),
      point('2025-03-31'),
    ]

    expect(pointsInRange(points, '1m', point('2024-03-31').timestamp)).toEqual([
      point('2024-02-29'),
      point('2024-03-30'),
      point('2024-03-31'),
    ])
    expect(pointsInRange(points, '3m', point('2024-06-30').timestamp)).toEqual([
      point('2024-03-30'),
      point('2024-03-31'),
      point('2024-06-30'),
    ])
    expect(pointsInRange(points, 'ytd', point('2024-06-30').timestamp)).toEqual(
      [
        point('2024-01-01'),
        point('2024-02-29'),
        point('2024-03-30'),
        point('2024-03-31'),
        point('2024-06-30'),
      ]
    )
    expect(pointsInRange(points, '1y', point('2025-02-28').timestamp)).toEqual([
      point('2024-02-29'),
      point('2024-03-30'),
      point('2024-03-31'),
      point('2024-06-30'),
      point('2025-02-28'),
    ])
  })
})
