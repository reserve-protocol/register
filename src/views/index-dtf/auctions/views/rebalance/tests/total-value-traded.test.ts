import { describe, expect, it } from 'vitest'
import { getTotalValueTraded } from '../hooks/use-total-value-traded'

const USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'

const bid = (sellAmount: string) => ({
  sellToken: { address: USDC, decimals: 6 },
  sellAmount,
})

describe('getTotalValueTraded', () => {
  it('prices checksummed bid tokens against the lowercase price map', () => {
    const prices = { [USDC.toLowerCase()]: { currentPrice: 1 } }

    expect(
      getTotalValueTraded([{ bids: [bid('293944926')] }], prices)
    ).toBeCloseTo(293.944926)
  })

  it('skips bids without a price', () => {
    expect(getTotalValueTraded([{ bids: [bid('1000000')] }], {})).toBe(0)
  })
})
