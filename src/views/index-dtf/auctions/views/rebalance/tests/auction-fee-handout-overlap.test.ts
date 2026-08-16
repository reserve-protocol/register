import { describe, expect, it, vi } from 'vitest'
import {
  wouldAuctionOverlapFeeHandout,
  wouldAuctionOverlapFeeHandoutNow,
} from '../utils/auction-fee-handout-overlap'

const DAY = 24 * 60 * 60
const WARMUP = 30

const timestampAt = (hours: number, minutes = 0, seconds = 0) =>
  hours * 60 * 60 + minutes * 60 + seconds

describe('wouldAuctionOverlapFeeHandout', () => {
  it('allows an auction that ends before the next daily fee handout', () => {
    const now = timestampAt(23, 29)

    expect(wouldAuctionOverlapFeeHandout(now, 30 * 60)).toBe(false)
  })

  it('blocks an auction that remains open after the next daily fee handout', () => {
    const now = timestampAt(23, 30)

    expect(wouldAuctionOverlapFeeHandout(now, 30 * 60)).toBe(true)
  })

  it('blocks an auction whose inclusive end time equals the fee handout', () => {
    const now = DAY - WARMUP - 15 * 60

    expect(wouldAuctionOverlapFeeHandout(now, 15 * 60)).toBe(true)
  })

  it('uses the following handout after launching exactly at a day boundary', () => {
    expect(wouldAuctionOverlapFeeHandout(DAY, 30 * 60)).toBe(false)
  })

  it('checks the wall clock at invocation time instead of reusing rendered time', () => {
    vi.useFakeTimers()
    vi.setSystemTime(timestampAt(23, 29, 31) * 1000)

    expect(wouldAuctionOverlapFeeHandoutNow(30 * 60)).toBe(true)

    vi.useRealTimers()
  })
})
