import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createWrapper } from '../../test-utils'
import useQuery, { useMultiFetch } from '../use-query'

// Mock the gqlClientAtom and GRAPH_CLIENTS
vi.mock('state/atoms', () => ({
  gqlClientAtom: {},
  GRAPH_CLIENTS: {
    1: { request: vi.fn() },
    8453: { request: vi.fn() },
  },
}))

vi.mock('jotai', async () => {
  const actual = await vi.importActual('jotai')
  return {
    ...actual,
    useAtomValue: vi.fn(() => ({
      request: vi.fn().mockResolvedValue({ data: 'mocked' }),
    })),
  }
})

vi.mock('utils/constants', () => ({
  supportedChainList: [1, 8453],
}))

describe('useQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns undefined data when query is null', () => {
    const { result } = renderHook(() => useQuery(null), {
      wrapper: createWrapper(),
    })

    expect(result.current.data).toBeUndefined()
    expect(result.current.isLoading).toBe(false)
  })

  it('returns SWR-compatible interface shape', () => {
    const { result } = renderHook(() => useQuery(null), {
      wrapper: createWrapper(),
    })

    expect(result.current).toHaveProperty('data')
    expect(result.current).toHaveProperty('error')
    expect(result.current).toHaveProperty('isLoading')
    expect(result.current).toHaveProperty('isValidating')
    expect(result.current).toHaveProperty('mutate')
    expect(typeof result.current.mutate).toBe('function')
  })

  it('fetches data when query is provided', async () => {
    const mockQuery = `query { test }`

    const { result } = renderHook(
      () => useQuery(mockQuery, {}),
      { wrapper: createWrapper() }
    )

    // Initially loading
    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual({ data: 'mocked' })
  })
})

describe('useMultiFetch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  it('returns undefined when urls is null', () => {
    const { result } = renderHook(() => useMultiFetch(null), {
      wrapper: createWrapper(),
    })

    expect(result.current.data).toBeUndefined()
    expect(result.current.isLoading).toBe(false)
  })

  it('fetches multiple URLs in parallel', async () => {
    const mockData = [{ id: 1 }, { id: 2 }]
    ;(global.fetch as any).mockImplementation((url: string) =>
      Promise.resolve({
        json: () => Promise.resolve(url.includes('1') ? mockData[0] : mockData[1]),
      })
    )

    const { result } = renderHook(
      () => useMultiFetch(['https://api.test/1', 'https://api.test/2']),
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual(mockData)
    expect(global.fetch).toHaveBeenCalledTimes(2)
  })

  it('has SWR-compatible interface', () => {
    const { result } = renderHook(() => useMultiFetch(null), {
      wrapper: createWrapper(),
    })

    expect(result.current).toHaveProperty('data')
    expect(result.current).toHaveProperty('error')
    expect(result.current).toHaveProperty('isLoading')
    expect(result.current).toHaveProperty('isValidating')
    expect(result.current).toHaveProperty('mutate')
  })
})
