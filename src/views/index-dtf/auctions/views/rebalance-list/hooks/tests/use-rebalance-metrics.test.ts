import type { IndexDtfCompletedRebalanceDetail } from '@reserve-protocol/react-sdk'
import { describe, expect, it } from 'vitest'
import {
  toCompletedRebalanceParams,
  toRebalanceMetrics,
} from '../use-rebalance-metrics'

const base: IndexDtfCompletedRebalanceDetail = {
  nonce: 1,
  timestamp: 1_700_000_000,
  auctions: [],
}

describe('toRebalanceMetrics', () => {
  it('returns null when there is no data', () => {
    expect(toRebalanceMetrics(undefined, false)).toBeNull()
  })

  it('maps a populated completed rebalance', () => {
    const data: IndexDtfCompletedRebalanceDetail = {
      ...base,
      auctions: [
        { startTime: 1, endTime: 2, bids: [] },
        { startTime: 3, endTime: 4, bids: [] },
      ],
      totalRebalancedUsd: 1_234,
      avgPriceImpactPercent: -0.5,
      totalPriceImpactUsd: -9,
      rebalanceAccuracy: 97.5,
      marketCapRebalanceImpact: 2.1,
      nativeBasketDeviation: 4,
    }

    expect(toRebalanceMetrics(data, false)).toEqual({
      timestamp: 1_700_000_000,
      auctionsRun: 2,
      totalRebalancedUsd: 1_234,
      priceImpact: -0.5,
      totalPriceImpactUsd: -9,
      rebalanceAccuracy: 97.5,
      deviationFromTarget: 4,
      marketCapRebalanceImpact: 2.1,
    })
  })

  it('coerces absent analytics to 0 for an auctions-less (present-empty) rebalance (Z30)', () => {
    // Present-empty auctions + absent analytics — the "0 auctions" product state.
    const metrics = toRebalanceMetrics(base, false)

    expect(metrics).not.toBeNull()
    expect(metrics?.auctionsRun).toBe(0)
    expect(metrics?.totalRebalancedUsd).toBe(0)
    expect(metrics?.priceImpact).toBe(0)
    expect(metrics?.totalPriceImpactUsd).toBe(0)
    expect(metrics?.rebalanceAccuracy).toBe(0)
    expect(metrics?.marketCapRebalanceImpact).toBe(0)
    expect(metrics?.deviationFromTarget).toBe(0)
    // Never undefined/NaN on any field.
    for (const value of Object.values(metrics!)) {
      expect(Number.isNaN(value)).toBe(false)
      expect(value).not.toBeUndefined()
    }
  })

  it('clamps rebalance accuracy above 100', () => {
    expect(
      toRebalanceMetrics({ ...base, rebalanceAccuracy: 142 }, false)?.rebalanceAccuracy
    ).toBe(100)
  })

  it('selects tracking deviation for a tracking DTF and takes the absolute value', () => {
    const data: IndexDtfCompletedRebalanceDetail = {
      ...base,
      trackingBasketDeviation: -7,
      nativeBasketDeviation: 3,
    }

    expect(toRebalanceMetrics(data, true)?.deviationFromTarget).toBe(7)
    expect(toRebalanceMetrics(data, false)?.deviationFromTarget).toBe(3)
  })
})

describe('toCompletedRebalanceParams', () => {
  const chainId = 8453 as const
  const address = '0x0000000000000000000000000000000000000001' as const

  it('nonce 0 is a real rebalance — params are built, not disabled', () => {
    // The subgraph serves nonce 0 as string '0' — it must not disable the read.
    expect(toCompletedRebalanceParams(chainId, address, 0)).toEqual({
      chainId,
      address,
      nonce: 0,
    })
    expect(toCompletedRebalanceParams(chainId, address, '0')).toEqual({
      chainId,
      address,
      nonce: '0',
    })
  })

  it('an unresolved nonce disables the read', () => {
    expect(toCompletedRebalanceParams(chainId, address, undefined)).toBeUndefined()
  })
})
