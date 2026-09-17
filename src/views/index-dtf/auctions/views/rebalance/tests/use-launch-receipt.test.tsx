import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { createStore, Provider } from 'jotai'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { dtfQueryKeys } from '@reserve-protocol/react-sdk'
import { rebalancesAtom, currentProposalIdAtom } from '../../../atoms'
import { governanceProposalsAtom } from '../../../../governance/atoms'
import { refreshNonceAtom } from '../atoms'
import useLaunchReceipt from '../hooks/use-launch-receipt'

const identity = {
  address: '0x2f8A339B5889FfaC4c5A956787cdA593b3c36867',
  chainId: 56,
} as const

vi.mock('@reserve-protocol/react-sdk', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@reserve-protocol/react-sdk')>()
  return { ...actual, useIndexDtfIdentity: () => identity }
})

// The receipt must refresh the RPC-backed keys (populated with the exact hook
// params, never the "default" placeholder) before the launching state clears.
describe('useLaunchReceipt', () => {
  it('invalidates the live SDK keys first, then clears launching and bumps history', async () => {
    const queryClient = new QueryClient()
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')
    const store = createStore()
    store.set(rebalancesAtom, [{ id: '0xdtf-12', blockNumber: '1', tokens: [] } as never])
    store.set(governanceProposalsAtom, [{ id: 'P', executionBlock: 1 } as never])
    store.set(currentProposalIdAtom, 'P')
    const onSettled = vi.fn()
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>{children}</Provider>
      </QueryClientProvider>
    )

    const { rerender } = renderHook(
      ({ isSuccess }: { isSuccess: boolean }) => useLaunchReceipt(isSuccess, onSettled),
      { wrapper, initialProps: { isSuccess: false } }
    )
    expect(invalidate).not.toHaveBeenCalled()

    rerender({ isSuccess: true })

    await waitFor(() => expect(onSettled).toHaveBeenCalledTimes(1))
    const keys = invalidate.mock.calls.map(([options]) => JSON.stringify(options?.queryKey))
    const live = [
      dtfQueryKeys.index.latestAuction(identity),
      dtfQueryKeys.index.currentRebalance(identity),
    ].map((k) => JSON.stringify(k))
    expect(keys.slice(0, 2)).toEqual(live)
    expect(keys).toContain(JSON.stringify(dtfQueryKeys.index.rebalances(identity)))
    expect(keys).toContain(
      JSON.stringify(
        dtfQueryKeys.index.rebalanceAuctions({ chainId: 56, rebalanceId: '0xdtf-12' })
      )
    )
    expect(keys.some((k) => k.includes('"default"'))).toBe(false)
    expect(store.get(refreshNonceAtom)).toBe(1)
  })
})
