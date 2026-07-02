import { describe, expect, it } from 'vitest'
import { PortfolioResponse } from '../types'
import { hasPositiveNumber, hasReserveActivity } from '../utils'

const emptyData: PortfolioResponse = {
  totalHoldingsUSD: 0,
  indexDTFs: [],
  yieldDTFs: [],
  stakedRSR: [],
  voteLocks: [],
  rsrBalances: [],
}

const withData = (partial: Partial<PortfolioResponse>): PortfolioResponse => ({
  ...emptyData,
  ...partial,
})

describe('hasPositiveNumber', () => {
  it('handles numbers, strings, null and undefined', () => {
    expect(hasPositiveNumber(1)).toBe(true)
    expect(hasPositiveNumber('0.5')).toBe(true)
    expect(hasPositiveNumber(0)).toBe(false)
    expect(hasPositiveNumber('0')).toBe(false)
    expect(hasPositiveNumber(-1)).toBe(false)
    expect(hasPositiveNumber(null)).toBe(false)
    expect(hasPositiveNumber(undefined)).toBe(false)
    expect(hasPositiveNumber('not-a-number')).toBe(false)
  })
})

describe('hasReserveActivity', () => {
  it('is false for a completely empty portfolio', () => {
    expect(hasReserveActivity(emptyData)).toBe(false)
  })

  it('is true when total holdings are positive', () => {
    expect(hasReserveActivity(withData({ totalHoldingsUSD: 12 }))).toBe(true)
  })

  it('is true for an index DTF with only rewards', () => {
    const data = withData({
      indexDTFs: [
        {
          amount: 0,
          value: 0,
          rewards: [{ value: 3 }],
        } as unknown as PortfolioResponse['indexDTFs'][number],
      ],
    })
    expect(hasReserveActivity(data)).toBe(true)
  })

  it('is false for positions where every amount is zero', () => {
    const data = withData({
      indexDTFs: [
        {
          amount: 0,
          value: 0,
          rewards: [],
        } as unknown as PortfolioResponse['indexDTFs'][number],
      ],
      yieldDTFs: [
        {
          amount: '0',
          value: 0,
        } as unknown as PortfolioResponse['yieldDTFs'][number],
      ],
    })
    expect(hasReserveActivity(data)).toBe(false)
  })

  it('is true for staked RSR with only active proposals', () => {
    const data = withData({
      stakedRSR: [
        {
          amount: 0,
          value: 0,
          votingPower: 0,
          pendingWithdrawals: [],
          activeProposals: [{}],
        } as unknown as PortfolioResponse['stakedRSR'][number],
      ],
    })
    expect(hasReserveActivity(data)).toBe(true)
  })

  it('is true for vote locks with only pending lock value', () => {
    const data = withData({
      voteLocks: [
        {
          amount: 0,
          value: 0,
          votingPower: 0,
          rewards: [],
          locks: [{ value: '2' }],
          activeProposals: [],
        } as unknown as PortfolioResponse['voteLocks'][number],
      ],
    })
    expect(hasReserveActivity(data)).toBe(true)
  })

  it('is true for a bare RSR balance', () => {
    const data = withData({
      rsrBalances: [
        {
          amount: '5',
          value: 1,
        } as unknown as PortfolioResponse['rsrBalances'][number],
      ],
    })
    expect(hasReserveActivity(data)).toBe(true)
  })
})
