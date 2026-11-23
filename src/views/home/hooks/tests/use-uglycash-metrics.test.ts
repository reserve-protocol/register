import { describe, expect, it } from 'vitest'
import { toUglycashMetrics, withOnchainHeld } from '../use-uglycash-metrics'

const split = (deposits: number, savings = 0) => ({
  deposits,
  withdrawals: 0,
  sends: 0,
  card: 0,
  savings,
  other: 0,
})

const day = (date: string, totalVolume: number, balance: number) => ({
  date,
  volume: split(totalVolume),
  count: split(1),
  totalVolume,
  totalCount: 1,
  balance,
})

const month = (month: string, totalVolume: number, partial: boolean) => ({
  month,
  volume: split(totalVolume),
  count: split(3, partial ? 2 : 0),
  totalVolume,
  totalCount: 3,
  balance: 100,
  partial,
})

const ledger = toUglycashMetrics(
  {
    generatedAt: '2026-11-03T00:00:00Z',
    points: [
      day('2026-10-31', 50, 100),
      day('2026-11-01', 70, 100),
      day('2026-11-02', 30, 100),
    ],
  },
  {
    generatedAt: '2026-11-03T00:00:00Z',
    points: [month('2026-10', 50, false), month('2026-11', 100, true)],
  }
)

describe('toUglycashMetrics', () => {
  it('charts complete months only and totals the whole daily series', () => {
    expect(ledger.monthly.map((m) => m.month)).toEqual(['2026-10'])
    expect(ledger.headline).toEqual({
      balance: 100,
      cumulativeVolume: 150,
      cumulativeCount: 3,
      daysLive: 3,
    })
  })

  it('lists a type per metric as soon as it has any activity', () => {
    const keys = (metric: 'volume' | 'count') =>
      ledger.categories[metric].map((category) => category.key)
    expect(keys('volume')).toEqual(['deposits'])
    expect(keys('count')).toEqual(['deposits', 'savings'])
  })

  it('fails loud when no month is complete yet', () => {
    expect(() =>
      toUglycashMetrics(
        { generatedAt: '', points: [day('2026-11-01', 1, 1)] },
        { generatedAt: '', points: [month('2026-11', 1, true)] }
      )
    ).toThrow('empty series')
  })
})

describe('withOnchainHeld', () => {
  it('replaces the held balance with the onchain one and keeps the ledger activity', () => {
    const data = withOnchainHeld(ledger, {
      points: [
        { date: '2026-10-31', balance: 90 },
        { date: '2026-11-02', balance: 120 },
      ],
    })

    expect(data.daily.map((p) => p.balance)).toEqual([90, 90, 120])
    expect(data.daily.map((p) => p.totalVolume)).toEqual([50, 70, 30])
    expect(data.headline.balance).toBe(120)
    expect(data.headline.cumulativeVolume).toBe(150)
  })

  it('fails loud on an empty onchain series instead of showing $0', () => {
    expect(() => withOnchainHeld(ledger, { points: [] })).toThrow(
      'empty series'
    )
  })

  it('heads with the latest onchain day even when the ledger stops earlier', () => {
    const data = withOnchainHeld(ledger, {
      points: [
        { date: '2026-11-02', balance: 120 },
        { date: '2026-11-03', balance: 130 },
      ],
    })

    expect(data.headline.balance).toBe(130)
  })
})
