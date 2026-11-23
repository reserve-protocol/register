import { describe, expect, it } from 'vitest'
import { mockData } from '../uglycash-data'
import { withOnchainHeld } from '../use-uglycash-api'

const ledger = {
  ...mockData,
  daily: mockData.daily.slice(0, 3).map((p, i) => ({
    ...p,
    date: `2026-11-0${i + 1}`,
    balance: 100,
    texturedBalance: 100,
  })),
}

describe('withOnchainHeld', () => {
  it('replaces the held balance with the onchain one and keeps the ledger activity', () => {
    const data = withOnchainHeld(ledger, {
      points: [
        { date: '2026-11-01', balance: 90 },
        { date: '2026-11-03', balance: 120 },
      ],
    })

    expect(data.daily.map((p) => [p.balance, p.texturedBalance])).toEqual([
      [90, 90],
      [90, 90],
      [120, 120],
    ])
    expect(data.daily.map((p) => p.totalVolume)).toEqual(ledger.daily.map((p) => p.totalVolume))
    expect(data.headline.balance).toBe(120)
    expect(data.headline.balanceStart).toBe(90)
    expect(data.headline.volume30d).toBe(ledger.headline.volume30d)
  })

  it('heads with the latest onchain day even when the ledger stops earlier', () => {
    const data = withOnchainHeld(ledger, {
      points: [
        { date: '2026-11-03', balance: 120 },
        { date: '2026-11-04', balance: 130 },
      ],
    })

    expect(data.headline.balance).toBe(130)
  })
})
