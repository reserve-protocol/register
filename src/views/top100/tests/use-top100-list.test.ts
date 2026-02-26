import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createWrapper } from '../../../test-utils'

const { mockRequest, mockFetch } = vi.hoisted(() => ({
  mockRequest: vi.fn(),
  mockFetch: vi.fn(),
}))

// Mock subgraph clients
vi.mock('@/state/chain/atoms/chainAtoms', () => ({
  INDEX_GRAPH_CLIENTS: {
    8453: { request: mockRequest },
  },
}))

// Mock constants
vi.mock('@/utils/constants', () => ({
  RESERVE_API: 'https://api.reserve.org/',
}))

vi.mock('@/views/index-dtf/deploy/permissionless-defaults', () => ({
  PERMISSIONLESS_VOTE_LOCK: {
    8453: '0xeDAB3789D7D2283214d8F65A6E412B00b1cBfB7a',
  },
}))

vi.mock('@/utils/chains', () => ({
  ChainId: { Base: 8453, Mainnet: 1, BSC: 56 },
}))

// Mock constants module to only include Base
vi.mock('../constants', async () => {
  const { gql } = await import('graphql-request')
  return {
    ACTIVE_CHAINS: [8453],
    TOP100_QUERY: gql`
      query GetTop100DTFs($first: Int!, $voteLockAddress: String!) {
        dtfs(first: $first, where: { ownerGovernance_: { token: $voteLockAddress } }) {
          id
          timestamp
          token { name symbol totalSupply currentHolderCount }
        }
      }
    `,
  }
})

// Mock fetch for price and brand APIs
global.fetch = mockFetch

import { useTop100List } from '../hooks/use-top100-list'

const MOCK_DTFS = [
  {
    id: '0xaaa',
    timestamp: '1700000000',
    token: {
      name: 'Test DTF',
      symbol: 'TDTF',
      totalSupply: '1000000000000000000000', // 1000 tokens
      currentHolderCount: 42,
    },
  },
  {
    id: '0xbbb',
    timestamp: '1699000000',
    token: {
      name: 'Another DTF',
      symbol: 'ADTF',
      totalSupply: '500000000000000000000', // 500 tokens
      currentHolderCount: 10,
    },
  },
]

describe('useTop100List', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockReset()
  })

  it('fetches DTFs from subgraph and returns them', async () => {
    mockRequest.mockResolvedValue({ dtfs: MOCK_DTFS })
    mockFetch.mockResolvedValue({ ok: false })

    const { result } = renderHook(() => useTop100List(), {
      wrapper: createWrapper(),
    })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.dtfs).toHaveLength(2)
    expect(result.current.dtfs[0].name).toBe('Test DTF')
    expect(result.current.dtfs[0].symbol).toBe('TDTF')
    expect(result.current.dtfs[0].chainId).toBe(8453)
    expect(result.current.dtfs[0].currentHolderCount).toBe(42)
  })

  it('enriches DTFs with price and calculates market cap', async () => {
    mockRequest.mockResolvedValue({ dtfs: [MOCK_DTFS[0]] })
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('current/dtf')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              price: 2.5,
              basket: [
                { address: '0xccc', symbol: 'USDC', weight: '50' },
                { address: '0xddd', symbol: 'WETH', weight: '50' },
              ],
            }),
        })
      }
      return Promise.resolve({ ok: false })
    })

    const { result } = renderHook(() => useTop100List(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.dtfs[0]?.price).toBe(2.5)
    })

    // 1000 tokens * $2.5 = $2500
    expect(result.current.dtfs[0].marketCap).toBe(2500)
    expect(result.current.dtfs[0].basket).toHaveLength(2)
    expect(result.current.dtfs[0].basket[0].symbol).toBe('USDC')
  })

  it('enriches DTFs with brand data', async () => {
    mockRequest.mockResolvedValue({ dtfs: [MOCK_DTFS[0]] })
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('folio-manager/read')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              status: 'ok',
              parsedData: {
                dtf: {
                  icon: 'https://icon.png',
                  cover: 'https://cover.png',
                  tags: ['defi', 'index'],
                },
              },
            }),
        })
      }
      return Promise.resolve({ ok: false })
    })

    const { result } = renderHook(() => useTop100List(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.dtfs[0]?.brand).toBeDefined()
    })

    expect(result.current.dtfs[0].brand?.icon).toBe('https://icon.png')
    expect(result.current.dtfs[0].brand?.tags).toEqual(['defi', 'index'])
  })

  it('handles API failures gracefully', async () => {
    mockRequest.mockResolvedValue({ dtfs: MOCK_DTFS })
    mockFetch.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useTop100List(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // DTFs should still be returned with null price/marketCap
    expect(result.current.dtfs).toHaveLength(2)
    expect(result.current.dtfs[0].price).toBeNull()
    expect(result.current.dtfs[0].marketCap).toBeNull()
    expect(result.current.dtfs[0].brand).toBeUndefined()
  })

  it('returns empty array when subgraph returns no DTFs', async () => {
    mockRequest.mockResolvedValue({ dtfs: [] })

    const { result } = renderHook(() => useTop100List(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.dtfs).toHaveLength(0)
  })

  it('handles subgraph failure gracefully', async () => {
    mockRequest.mockRejectedValue(new Error('Subgraph down'))

    const { result } = renderHook(() => useTop100List(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.dtfs).toHaveLength(0)
  })
})
