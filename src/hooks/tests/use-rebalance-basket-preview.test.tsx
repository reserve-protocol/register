import { renderHook } from '@testing-library/react'
import { createStore, Provider } from 'jotai'
import type { ReactNode } from 'react'
import { encodeFunctionData, type Abi, type Address, type Hex } from 'viem'
import { afterEach, describe, expect, it, vi } from 'vitest'

import dtfIndexAbiV5 from '@/abis/dtf-index-abi'
import dtfIndexAbiV4 from '@/abis/dtf-index-abi-v4'
import { indexDTFVersionAtom } from '@/state/dtf/atoms'
import {
  computeSnapshotWeights,
  fetchSnapshotWeights,
  resolveSnapshotWeights,
  useDecodedRebalanceCalldata,
} from '../use-rebalance-basket-preview'

const TOKEN = '0x0000000000000000000000000000000000000001' as Address
const WEIGHT_RANGE = { low: 1n, spot: 2n, high: 3n }
const PRICE_RANGE = { low: 4n, high: 5n }
const LIMITS = { low: 6n, spot: 7n, high: 8n }

const createWrapper = (version: string) => {
  const store = createStore()
  // The old decoder used this atom, so tests set the opposite version on purpose.
  store.set(indexDTFVersionAtom, version)

  return function Wrapper({ children }: { children: ReactNode }) {
    return <Provider store={store}>{children}</Provider>
  }
}

describe('useDecodedRebalanceCalldata', () => {
  it('decodes historical v4 startRebalance calldata when current DTF version is v5', () => {
    const calldata = encodeFunctionData({
      abi: dtfIndexAbiV4 as Abi,
      functionName: 'startRebalance',
      args: [[TOKEN], [WEIGHT_RANGE], [PRICE_RANGE], LIMITS, 99n, 100n],
    }) as Hex

    const { result } = renderHook(
      () => useDecodedRebalanceCalldata([calldata]),
      { wrapper: createWrapper('5.0.0') }
    )

    expect(result.current?.calldata.signature).toBe('startRebalance')
    expect(result.current?.data.tokens).toEqual([TOKEN])
    expect(result.current?.data.weights[0]).toMatchObject(WEIGHT_RANGE)
    expect(result.current?.data.prices[0]).toMatchObject(PRICE_RANGE)
    expect(result.current?.data.limits).toMatchObject(LIMITS)
    expect(result.current?.data.auctionLauncherWindow).toBe(99n)
    expect(result.current?.data.ttl).toBe(100n)
  })

  it('decodes v5 startRebalance calldata when current DTF version is v4', () => {
    const calldata = encodeFunctionData({
      abi: dtfIndexAbiV5 as Abi,
      functionName: 'startRebalance',
      args: [
        [
          {
            token: TOKEN,
            weight: WEIGHT_RANGE,
            price: PRICE_RANGE,
            maxAuctionSize: 123n,
            inRebalance: true,
          },
        ],
        LIMITS,
        99n,
        100n,
      ],
    }) as Hex

    const { result } = renderHook(
      () => useDecodedRebalanceCalldata([calldata]),
      { wrapper: createWrapper('4.0.0') }
    )

    expect(result.current?.calldata.signature).toBe('startRebalance')
    expect(result.current?.data.tokens).toEqual([TOKEN])
    expect(result.current?.data.weights[0]).toMatchObject(WEIGHT_RANGE)
    expect(result.current?.data.prices[0]).toMatchObject(PRICE_RANGE)
    expect(result.current?.data.limits).toMatchObject(LIMITS)
    expect(result.current?.data.auctionLauncherWindow).toBe(99n)
    expect(result.current?.data.ttl).toBe(100n)
  })
})

describe('computeSnapshotWeights (Z7)', () => {
  const basket = [
    { address: '0xAAA', price: 2, amount: 30 }, // 60 USD
    { address: '0xBBB', price: 5, amount: 8 }, //  40 USD
  ]

  it('computes each token share of dtfPrice as a fixed-2 weight', () => {
    // dtfPrice 100 → 60% / 40% (independent oracle: value/dtfPrice*100)
    expect(computeSnapshotWeights(basket, 100)).toEqual({
      '0xaaa': '60.00',
      '0xbbb': '40.00',
    })
  })

  it('returns undefined for a 0 dtfPrice instead of "Infinity"', () => {
    expect(computeSnapshotWeights(basket, 0)).toBeUndefined()
  })

  it('returns undefined for a negative or NaN dtfPrice', () => {
    expect(computeSnapshotWeights(basket, -1)).toBeUndefined()
    expect(computeSnapshotWeights(basket, NaN)).toBeUndefined()
  })

  it('returns undefined for an Infinity dtfPrice (> 0 alone would accept it → 0.00)', () => {
    expect(computeSnapshotWeights(basket, Infinity)).toBeUndefined()
  })

  it('returns undefined when a per-token value is non-finite, even with a valid dtfPrice', () => {
    const badToken = [{ address: '0xAAA', price: Infinity, amount: 1 }]
    expect(computeSnapshotWeights(badToken, 100)).toBeUndefined()
  })
})

describe('resolveSnapshotWeights (Z7 / CXR-062-I1)', () => {
  const point = (price: number) => ({
    timeseries: [
      { price, basket: [{ address: '0xAAA', price: 2, amount: 30 }] },
    ],
  })

  it('returns the snapshot weights from the timeseries when the price is valid', () => {
    // 60 USD / 60 dtfPrice * 100 = 100%
    expect(resolveSnapshotWeights(point(60) as any)).toEqual({
      '0xaaa': '100.00',
    })
  })

  it('throws (indeterminate) for a malformed snapshot price — never substitutes current', () => {
    expect(() => resolveSnapshotWeights(point(0) as any)).toThrow()
    expect(() => resolveSnapshotWeights(point(Infinity) as any)).toThrow()
  })

  it('throws (indeterminate) for an EMPTY timeseries — never substitutes current', () => {
    expect(() => resolveSnapshotWeights({ timeseries: [] } as any)).toThrow()
  })
})

describe('fetchSnapshotWeights caller seam (Z7 / CXR-062-I1)', () => {
  const dtf = { id: '0xdtf' }
  const current = { '0xaaa': '10.00' }

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  const stubFetch = (body: unknown) =>
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ json: async () => body }) as Response)
    )

  it('returns the current weights on the live path (no timestamp), without fetching', async () => {
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
    await expect(
      fetchSnapshotWeights(dtf, 8453, undefined, current)
    ).resolves.toEqual(current)
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('resolves the snapshot weights for a valid historical response', async () => {
    stubFetch({
      timeseries: [
        { price: 60, basket: [{ address: '0xAAA', price: 2, amount: 30 }] },
      ],
    })
    await expect(
      fetchSnapshotWeights(dtf, 8453, 1_700_000_000, current)
    ).resolves.toEqual({ '0xaaa': '100.00' })
  })

  it('REJECTS (suppresses preview) on an empty historical response — not current', async () => {
    stubFetch({ timeseries: [] })
    await expect(
      fetchSnapshotWeights(dtf, 8453, 1_700_000_000, current)
    ).rejects.toThrow()
  })

  it('REJECTS (suppresses preview) on a malformed snapshot price — not current', async () => {
    stubFetch({
      timeseries: [
        { price: 0, basket: [{ address: '0xAAA', price: 2, amount: 30 }] },
      ],
    })
    await expect(
      fetchSnapshotWeights(dtf, 8453, 1_700_000_000, current)
    ).rejects.toThrow()
  })
})
