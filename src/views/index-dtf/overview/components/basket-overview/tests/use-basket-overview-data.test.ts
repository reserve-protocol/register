import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { Provider, useAtomValue, useSetAtom } from 'jotai'
import { createElement, ReactNode } from 'react'

import { useBasketOverviewData } from '../use-basket-overview-data'
import {
  indexDTFBasketAtom,
  indexDTFBasketSharesAtom,
  indexDTFCollateralMCapMapAtom,
  indexDTFExposureDataAtom,
  indexDTFExposureMCapMapAtom,
  ExposureGroup,
} from '@/state/dtf/atoms'
import { Token } from '@/types'

const createWrapper = () => {
  return ({ children }: { children: ReactNode }) =>
    createElement(Provider, null, children)
}

const useTestSetup = () => {
  const setBasket = useSetAtom(indexDTFBasketAtom)
  const setBasketShares = useSetAtom(indexDTFBasketSharesAtom)
  const setExposureData = useSetAtom(indexDTFExposureDataAtom)
  const data = useBasketOverviewData()
  // Read mcap atoms directly to verify
  const marketCaps = useAtomValue(indexDTFExposureMCapMapAtom)
  const collateralMarketCaps = useAtomValue(indexDTFCollateralMCapMapAtom)

  return {
    setBasket,
    setBasketShares,
    setExposureData,
    data,
    marketCaps,
    collateralMarketCaps,
  }
}

const mockToken = (address: string, symbol = 'TEST'): Token =>
  ({
    address,
    symbol,
    name: `${symbol} Token`,
    decimals: 18,
  }) as Token

const mockExposureGroup = (
  overrides: Partial<ExposureGroup> = {}
): ExposureGroup => ({
  native: {
    symbol: 'ETH',
    name: 'Ethereum',
    logo: '',
    caip2: 'eip155:1',
  },
  tokens: [
    {
      address: '0xaaa',
      symbol: 'WETH',
      weight: 50,
      change: 2.5,
    },
  ],
  totalWeight: 50,
  change: 2.5,
  ...overrides,
})

describe('useBasketOverviewData', () => {
  it('returns null for exposureGroups when exposure data atom is null', () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useTestSetup(), { wrapper })

    expect(result.current.data.exposureGroups).toBeNull()
  })

  it('returns empty array when exposure data is empty', () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useTestSetup(), { wrapper })

    act(() => {
      result.current.setExposureData([])
    })

    expect(result.current.data.exposureGroups).toEqual([])
  })

  it('filters out groups with 0.00 totalWeight', () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useTestSetup(), { wrapper })

    act(() => {
      result.current.setExposureData([
        mockExposureGroup({ totalWeight: 50 }),
        mockExposureGroup({
          totalWeight: 0.001, // rounds to 0.00
          native: { symbol: 'ZERO', name: 'Zero', logo: '', caip2: 'eip155:1' },
          tokens: [{ address: '0xbbb', symbol: 'ZERO', weight: 0, change: 0 }],
        }),
      ])
    })

    expect(result.current.data.exposureGroups).toHaveLength(1)
    expect(result.current.data.exposureGroups![0][0]).toBe('ETH')
  })

  it('filters out collateral tokens with 0.00 share', () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useTestSetup(), { wrapper })

    act(() => {
      result.current.setBasket([
        mockToken('0xaaa', 'WETH'),
        mockToken('0xbbb', 'USDC'),
      ])
      result.current.setBasketShares({
        '0xaaa': '50.00',
        '0xbbb': '0.00',
      })
    })

    expect(result.current.data.filtered).toHaveLength(1)
    expect(result.current.data.filtered![0].address).toBe('0xaaa')
  })

  it('maps token addresses (lowercased) to change values in basketPerformanceChanges', () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useTestSetup(), { wrapper })

    act(() => {
      result.current.setExposureData([
        mockExposureGroup({
          tokens: [
            { address: '0xAAA', symbol: 'WETH', weight: 50, change: 3.2 },
            { address: '0xBBB', symbol: 'stETH', weight: 10, change: -1.5 },
          ],
        }),
      ])
    })

    const changes = result.current.data.basketPerformanceChanges
    expect(changes['0xaaa']).toBe(3.2)
    expect(changes['0xbbb']).toBe(-1.5)
  })

  it('maps token addresses to hasNewlyAdded flags in newlyAddedAssets', () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useTestSetup(), { wrapper })

    act(() => {
      result.current.setExposureData([
        mockExposureGroup({
          hasNewlyAdded: true,
          tokens: [{ address: '0xaaa', symbol: 'WETH', weight: 50 }],
        }),
        mockExposureGroup({
          hasNewlyAdded: false,
          native: {
            symbol: 'USDC',
            name: 'USD Coin',
            logo: '',
            caip2: 'eip155:1',
          },
          tokens: [{ address: '0xbbb', symbol: 'USDC', weight: 30 }],
          totalWeight: 30,
        }),
      ])
    })

    const newAssets = result.current.data.newlyAddedAssets
    expect(newAssets['0xaaa']).toBe(true)
    expect(newAssets['0xbbb']).toBe(false)
  })

  it('defaults change to 0 when token has no change value', () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useTestSetup(), { wrapper })

    act(() => {
      result.current.setExposureData([
        mockExposureGroup({
          tokens: [{ address: '0xaaa', symbol: 'WETH', weight: 50 }],
        }),
      ])
    })

    expect(result.current.data.basketPerformanceChanges['0xaaa']).toBe(0)
  })

  // Bug regression: exposure null vs empty distinction
  it('preserves null vs empty distinction — null means loading, [] means empty', () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useTestSetup(), { wrapper })

    // Initially null (not loaded)
    expect(result.current.data.exposureGroups).toBeNull()

    // Set to empty array (loaded but empty)
    act(() => {
      result.current.setExposureData([])
    })
    expect(result.current.data.exposureGroups).toEqual([])
    expect(result.current.data.exposureGroups).not.toBeNull()
  })

  // Exposure tab shows the underlying (tradfi) asset market cap, not the
  // on-chain token market cap. Ondo tokenized assets carry a distinct
  // native.marketCap for the real-world asset.
  it('maps coingeckoId to the native (tradfi) market cap for exposure', () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useTestSetup(), { wrapper })

    act(() => {
      result.current.setExposureData([
        mockExposureGroup({
          native: {
            symbol: 'AAPLon',
            name: 'Apple',
            logo: '',
            caip2: 'eip155:1',
            coingeckoId: 'apple',
            marketCap: 3_000_000_000_000,
          },
          marketCap: 5_000_000, // on-chain (ondo) mcap, should be ignored here
          tokens: [
            {
              address: '0xaaa',
              symbol: 'AAPLon',
              weight: 50,
              marketCap: 5_000_000,
            },
          ],
        }),
      ])
    })

    expect(result.current.marketCaps['apple']).toBe(3_000_000_000_000)
  })

  it('falls back to the group market cap when native has no market cap', () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useTestSetup(), { wrapper })

    act(() => {
      result.current.setExposureData([
        mockExposureGroup({
          native: {
            symbol: 'AAVE',
            name: 'Aave',
            logo: '',
            caip2: 'eip155:1',
            coingeckoId: 'aave',
          },
          marketCap: 1_315_950_455,
          tokens: [
            {
              address: '0xaaa',
              symbol: 'AAVE',
              weight: 50,
              marketCap: 1_315_950_455,
            },
          ],
        }),
      ])
    })

    expect(result.current.marketCaps['aave']).toBe(1_315_950_455)
  })

  // Collateral tab shows the on-chain token (ondo) market cap, keyed by
  // lowercased token address.
  it('maps lowercased token address to the on-chain token market cap for collateral', () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useTestSetup(), { wrapper })

    act(() => {
      result.current.setExposureData([
        mockExposureGroup({
          native: {
            symbol: 'AAPLon',
            name: 'Apple',
            logo: '',
            caip2: 'eip155:1',
            coingeckoId: 'apple',
            marketCap: 3_000_000_000_000,
          },
          tokens: [
            {
              address: '0xAAA',
              symbol: 'AAPLon',
              weight: 50,
              marketCap: 5_000_000,
            },
          ],
        }),
      ])
    })

    expect(result.current.collateralMarketCaps['0xaaa']).toBe(5_000_000)
    expect(result.current.data.collateralMarketCaps['0xaaa']).toBe(5_000_000)
  })

  // Bug regression: race condition — basket loads before exposure
  it('returns filtered items even when exposure data is still null', () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useTestSetup(), { wrapper })

    act(() => {
      result.current.setBasket([
        mockToken('0xaaa', 'WETH'),
        mockToken('0xbbb', 'USDC'),
      ])
      result.current.setBasketShares({
        '0xaaa': '60.00',
        '0xbbb': '40.00',
      })
    })

    // Exposure still null
    expect(result.current.data.exposureGroups).toBeNull()
    // But collateral data is available
    expect(result.current.data.filtered).toHaveLength(2)
  })
})
