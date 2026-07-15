import { describe, expect, it } from 'vitest'
import { PortfolioResponse } from '../types'
import {
  appendLivePoint,
  ChartDataPoint,
} from '../hooks/use-historical-portfolio'

const emptyPortfolio: PortfolioResponse = {
  totalHoldingsUSD: 0,
  indexDTFs: [],
  yieldDTFs: [],
  stakedRSR: [],
  voteLocks: [],
  rsrBalances: [],
}

const historicalPoint: ChartDataPoint = {
  value: 100,
  ts: 1751980000000,
  label: 'Jul 08, 2026 12:00 AM',
  display: '$100',
  indexDTFs: 100,
  yieldDTFs: 0,
  stakedRSR: 0,
  voteLocked: 0,
  rsr: 0,
}

describe('appendLivePoint', () => {
  it('appends the live total as the final point', () => {
    const portfolio: PortfolioResponse = {
      ...emptyPortfolio,
      totalHoldingsUSD: 297.18,
      indexDTFs: [{ value: 297.18 } as PortfolioResponse['indexDTFs'][0]],
    }

    const result = appendLivePoint([historicalPoint], portfolio)

    expect(result).toHaveLength(2)
    const live = result[1]
    expect(live.value).toBe(297.18)
    expect(live.indexDTFs).toBe(297.18)
    expect(live.ts).toBeGreaterThan(historicalPoint.ts)
    expect(live.display).toBe('$297.18')
  })

  it('sums each category independently', () => {
    const portfolio: PortfolioResponse = {
      ...emptyPortfolio,
      totalHoldingsUSD: 60,
      indexDTFs: [{ value: 10 }, { value: 5 }] as PortfolioResponse['indexDTFs'],
      yieldDTFs: [{ value: 20 }] as PortfolioResponse['yieldDTFs'],
      stakedRSR: [{ value: 15 }] as PortfolioResponse['stakedRSR'],
      voteLocks: [{ value: 7 }] as PortfolioResponse['voteLocks'],
      rsrBalances: [{ value: 3 }] as PortfolioResponse['rsrBalances'],
    }

    const [, live] = appendLivePoint([historicalPoint], portfolio)

    expect(live.indexDTFs).toBe(15)
    expect(live.yieldDTFs).toBe(20)
    expect(live.stakedRSR).toBe(15)
    expect(live.voteLocked).toBe(7)
    expect(live.rsr).toBe(3)
  })

  it('treats a position without a value as 0, never NaN (Z25)', () => {
    const portfolio: PortfolioResponse = {
      ...emptyPortfolio,
      totalHoldingsUSD: 10,
      // A partial API row missing `value` must not poison the category total.
      indexDTFs: [{ value: 10 }, {}] as PortfolioResponse['indexDTFs'],
    }

    const [, live] = appendLivePoint([historicalPoint], portfolio)

    expect(live.indexDTFs).toBe(10)
    expect(Number.isNaN(live.indexDTFs)).toBe(false)
  })

  it('does not mutate the original series', () => {
    const original = [historicalPoint]
    const result = appendLivePoint(original, emptyPortfolio)

    expect(original).toHaveLength(1)
    expect(result).not.toBe(original)
  })
})
