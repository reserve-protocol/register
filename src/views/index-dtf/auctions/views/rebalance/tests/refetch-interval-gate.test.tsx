import { renderHook } from '@testing-library/react'
import { createStore, Provider } from 'jotai'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { governanceProposalsAtom } from '../../../../governance/atoms'
import { currentProposalIdAtom, rebalancesAtom } from '../../../atoms'

// Capture the exact options object each hook passes to useQuery so we can
// exercise its wired refetchInterval callback (Z29). This guards the REAL seam:
// a hook that reverts to a literal `refetchInterval: 30_000` fails here because
// the captured value is no longer a function returning false on expiry.
type CapturedQuery = {
  queryKey?: readonly unknown[]
  refetchInterval?: (() => number | false) | number | false
}
const captured: Record<string, CapturedQuery> = {}

vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@tanstack/react-query')>()
  return {
    ...actual,
    useQueryClient: () => ({ setQueryData: vi.fn(), getQueryData: vi.fn() }),
    useQuery: (options: CapturedQuery) => {
      captured[String(options.queryKey?.[0])] = options
      return {
        data: undefined,
        isLoading: false,
        isFetching: false,
        refetch: vi.fn(),
      }
    },
  }
})

// Liquidity hook depends on the wagmi-heavy useRebalanceParams — stub it.
vi.mock('../hooks/use-rebalance-params', () => ({ default: () => undefined }))

import useRebalanceAuctions from '../hooks/use-rebalance-auctions'
import useRebalanceLiquidityCheck from '../hooks/use-rebalance-liquidity-check'

const BLOCK = '123'
const NOW = Math.floor(Date.now() / 1000)

const storeFor = (availableUntil: string) => {
  const store = createStore()
  store.set(rebalancesAtom, [
    {
      blockNumber: BLOCK,
      availableUntil,
      tokens: [],
    } as any,
  ])
  store.set(governanceProposalsAtom, [
    { id: 'P', executionBlock: Number(BLOCK) } as any,
  ])
  store.set(currentProposalIdAtom, 'P')
  return store
}

const wrapper =
  (store: ReturnType<typeof createStore>) =>
  ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  )

beforeEach(() => {
  for (const k of Object.keys(captured)) delete captured[k]
})

describe('rebalance poll refetchInterval is gated on the window (Z29)', () => {
  // Asserts the captured refetchInterval is a callback (fails if a hook reverts
  // to a literal interval) and invokes it.
  const invokeInterval = (key: string): number | false => {
    const fn = captured[key].refetchInterval
    expect(typeof fn).toBe('function')
    return (fn as () => number | false)()
  }

  it('use-rebalance-auctions polls 30s while ongoing, stops when expired', () => {
    renderHook(() => useRebalanceAuctions(), {
      wrapper: wrapper(storeFor(String(NOW + 3600))),
    })
    expect(invokeInterval('auctions')).toBe(1000 * 30)

    renderHook(() => useRebalanceAuctions(), {
      wrapper: wrapper(storeFor(String(NOW - 3600))),
    })
    expect(invokeInterval('auctions')).toBe(false)
  })

  it('use-rebalance-liquidity-check polls 30s while ongoing, stops when expired', () => {
    renderHook(() => useRebalanceLiquidityCheck(), {
      wrapper: wrapper(storeFor(String(NOW + 3600))),
    })
    expect(invokeInterval('rebalance-liquidity')).toBe(30_000)

    renderHook(() => useRebalanceLiquidityCheck(), {
      wrapper: wrapper(storeFor(String(NOW - 3600))),
    })
    expect(invokeInterval('rebalance-liquidity')).toBe(false)
  })
})
