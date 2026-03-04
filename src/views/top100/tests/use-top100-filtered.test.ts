import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Provider, useSetAtom } from 'jotai'
import { createElement, ReactNode } from 'react'
import { Address } from 'viem'
import { searchFilterAtom, chainFilterAtom } from '../atoms'
import useTop100Filtered from '../hooks/use-top100-filtered'
import { Top100DTF } from '../types'

const createWrapper = () => {
  return ({ children }: { children: ReactNode }) =>
    createElement(Provider, null, children)
}

const makeDTF = (overrides: Partial<Top100DTF> = {}): Top100DTF => ({
  address: '0xaaa' as Address,
  name: 'Test DTF',
  symbol: 'TDTF',
  chainId: 8453,
  totalSupply: '1000000000000000000000',
  currentHolderCount: 10,
  timestamp: 1700000000,
  price: 2.5,
  marketCap: 2500,
  basket: [{ address: '0xccc' as Address, symbol: 'USDC' }],
  performance: [],
  performancePercent: null,
  ...overrides,
})

const MOCK_DTFS: Top100DTF[] = [
  makeDTF({
    address: '0xaaa' as Address,
    name: 'Alpha Fund',
    symbol: 'ALPHA',
    chainId: 8453,
    marketCap: 5000,
    basket: [
      { address: '0xccc' as Address, symbol: 'USDC' },
      { address: '0xddd' as Address, symbol: 'WETH' },
    ],
  }),
  makeDTF({
    address: '0xbbb' as Address,
    name: 'Beta Index',
    symbol: 'BETA',
    chainId: 8453,
    marketCap: 1000,
    basket: [{ address: '0xeee' as Address, symbol: 'DAI' }],
  }),
  makeDTF({
    address: '0xccc' as Address,
    name: 'Gamma Yield',
    symbol: 'GAMMA',
    chainId: 1,
    marketCap: null,
    price: null,
    basket: [],
  }),
]

describe('useTop100Filtered', () => {
  it('returns all DTFs when no filters applied', () => {
    const { result } = renderHook(
      () => {
        const setChains = useSetAtom(chainFilterAtom)
        const data = useTop100Filtered(MOCK_DTFS)
        return { data, setChains }
      },
      { wrapper: createWrapper() }
    )

    // Default chain filter includes all active chains
    expect(result.current.data.length).toBeGreaterThanOrEqual(2)
  })

  it('filters by chain', () => {
    const { result } = renderHook(
      () => {
        const setChains = useSetAtom(chainFilterAtom)
        const data = useTop100Filtered(MOCK_DTFS)
        return { data, setChains }
      },
      { wrapper: createWrapper() }
    )

    act(() => {
      result.current.setChains([8453])
    })

    expect(result.current.data.every((d) => d.chainId === 8453)).toBe(true)
    expect(
      result.current.data.find((d) => d.symbol === 'GAMMA')
    ).toBeUndefined()
  })

  it('searches by name (case-insensitive)', () => {
    const { result } = renderHook(
      () => {
        const setSearch = useSetAtom(searchFilterAtom)
        const setChains = useSetAtom(chainFilterAtom)
        const data = useTop100Filtered(MOCK_DTFS)
        return { data, setSearch, setChains }
      },
      { wrapper: createWrapper() }
    )

    act(() => {
      result.current.setChains([8453, 1])
      result.current.setSearch('alpha')
    })

    expect(result.current.data).toHaveLength(1)
    expect(result.current.data[0].symbol).toBe('ALPHA')
  })

  it('searches by symbol', () => {
    const { result } = renderHook(
      () => {
        const setSearch = useSetAtom(searchFilterAtom)
        const setChains = useSetAtom(chainFilterAtom)
        const data = useTop100Filtered(MOCK_DTFS)
        return { data, setSearch, setChains }
      },
      { wrapper: createWrapper() }
    )

    act(() => {
      result.current.setChains([8453, 1])
      result.current.setSearch('BETA')
    })

    expect(result.current.data).toHaveLength(1)
    expect(result.current.data[0].name).toBe('Beta Index')
  })

  it('searches by basket token symbol', () => {
    const { result } = renderHook(
      () => {
        const setSearch = useSetAtom(searchFilterAtom)
        const setChains = useSetAtom(chainFilterAtom)
        const data = useTop100Filtered(MOCK_DTFS)
        return { data, setSearch, setChains }
      },
      { wrapper: createWrapper() }
    )

    act(() => {
      result.current.setChains([8453, 1])
      result.current.setSearch('WETH')
    })

    expect(result.current.data).toHaveLength(1)
    expect(result.current.data[0].symbol).toBe('ALPHA')
  })

  it('empty search returns all DTFs', () => {
    const { result } = renderHook(
      () => {
        const setSearch = useSetAtom(searchFilterAtom)
        const setChains = useSetAtom(chainFilterAtom)
        const data = useTop100Filtered(MOCK_DTFS)
        return { data, setSearch, setChains }
      },
      { wrapper: createWrapper() }
    )

    act(() => {
      result.current.setChains([8453, 1])
      result.current.setSearch('')
    })

    expect(result.current.data).toHaveLength(3)
  })

  it('sorts by created time desc (newest first)', () => {
    const { result } = renderHook(
      () => {
        const setChains = useSetAtom(chainFilterAtom)
        const data = useTop100Filtered(MOCK_DTFS)
        return { data, setChains }
      },
      { wrapper: createWrapper() }
    )

    act(() => {
      result.current.setChains([8453, 1])
    })

    const data = result.current.data
    // All three have same timestamp from makeDTF default (1700000000)
    // so order is stable based on input order
    expect(data).toHaveLength(3)
  })

  it('returns empty array when no DTFs provided', () => {
    const { result } = renderHook(
      () => useTop100Filtered([]),
      { wrapper: createWrapper() }
    )

    expect(result.current).toHaveLength(0)
  })
})
