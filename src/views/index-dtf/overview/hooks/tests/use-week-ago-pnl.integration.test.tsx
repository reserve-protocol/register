import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { Provider as JotaiProvider } from 'jotai'
import type { ReactNode } from 'react'
import { type Address } from 'viem'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { dtfQueryKeys } from '@reserve-protocol/react-sdk'

const CHAIN = 8453
const TOKEN = '0x0000000000000000000000000000000000000abc' as Address
const ACCOUNT = '0x0000000000000000000000000000000000000def' as Address

const getPriceHistory = vi.fn()

vi.mock('@reserve-protocol/react-sdk', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@reserve-protocol/react-sdk')>()
  return {
    ...actual,
    useDtfSdk: () => ({ index: { getPriceHistory } }),
    useIndexDtfIdentity: () => ({ address: TOKEN, chainId: CHAIN }),
  }
})

// Wallet held a positive balance a week ago (snapshot present).
vi.mock('@/hooks/useIndexDTFSugbraph', () => ({
  default: () => ({
    data: {
      accountBalanceDailySnapshots: [{ amount: '2000000000000000000', timestamp: 1 }],
    },
    isSuccess: true,
    isError: false,
  }),
}))

import useWeekAgoPnl from '../use-week-ago-pnl'

const RAW_POINTS = [
  { timestamp: 10, price: 0, marketCap: 0, totalSupply: 0, basket: [] },
  { timestamp: 20, price: 5, marketCap: 0, totalSupply: 0, basket: [] },
]

const wrapper = ({ children }: { children: ReactNode }) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return (
    <QueryClientProvider client={client}>
      <JotaiProvider>{children}</JotaiProvider>
    </QueryClientProvider>
  )
}

describe('useWeekAgoPnl — SDK-backed history under the canonical key', () => {
  beforeEach(() => {
    getPriceHistory.mockReset().mockResolvedValue(RAW_POINTS)
  })

  it('caches the RAW point array under the canonical price-history key and derives the scalar locally', async () => {
    let capturedClient: QueryClient | undefined
    const capturingWrapper = ({ children }: { children: ReactNode }) => {
      capturedClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
      return (
        <QueryClientProvider client={capturedClient}>
          <JotaiProvider>{children}</JotaiProvider>
        </QueryClientProvider>
      )
    }

    const { result } = renderHook(
      () => useWeekAgoPnl({ account: ACCOUNT, token: TOKEN, currentValue: 100 }),
      { wrapper: capturingWrapper }
    )

    await waitFor(() => expect(result.current.isResolved).toBe(true))

    // (a) the shared cache entry is the raw SDK array — NOT a derived scalar.
    // This is the CXR-020 cache-shape contract: putting the scalar back in the
    // queryFn would make this a number and fail here.
    const from = getPriceHistory.mock.calls[0]![0].from
    const to = getPriceHistory.mock.calls[0]![0].to
    const cached = capturedClient!.getQueryData(
      dtfQueryKeys.index.priceHistory({ address: TOKEN, chainId: CHAIN, from, to, interval: '1h' })
    )
    expect(Array.isArray(cached)).toBe(true)
    expect(cached).toEqual(RAW_POINTS)

    // (b) the hook derives the last positive price → pnl = 100 - (2 * 5).
    expect(result.current.pnl).toBe(90)
  })

  it('calls the SDK with provider chain/address and the one-hour week-ago window', async () => {
    const { result } = renderHook(
      () => useWeekAgoPnl({ account: ACCOUNT, token: TOKEN, currentValue: 100 }),
      { wrapper }
    )

    await waitFor(() => expect(getPriceHistory).toHaveBeenCalled())

    const params = getPriceHistory.mock.calls[0]![0]
    expect(params.address).toBe(TOKEN)
    expect(params.chainId).toBe(CHAIN)
    expect(params.interval).toBe('1h')
    expect(params.to - params.from).toBe(3_600)
    await waitFor(() => expect(result.current.isResolved).toBe(true))
  })
})
