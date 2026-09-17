import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { createStore, Provider } from 'jotai'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { dtfQueryKeys } from '@reserve-protocol/react-sdk'
import { rebalancesAtom, currentProposalIdAtom } from '../../../atoms'
import { governanceProposalsAtom } from '../../../../governance/atoms'
import { latestAuctionAtom, refreshNonceAtom } from '../atoms'
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
// params, never the "default" placeholder) and hold the launching state until
// the latest-auction read is at or past the receipt block.
describe('useLaunchReceipt', () => {
  const setup = () => {
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
    return { queryClient, invalidate, store, onSettled, wrapper }
  }
  const auctionAt = (blockNumber: bigint) => ({
    auctionId: 29n,
    rebalanceNonce: 12n,
    currentRebalanceNonce: 12n,
    startTime: 1n,
    endTime: 2n,
    blockNumber,
    isActive: true,
  })

  it('invalidates the live keys on the receipt and settles only once the read reaches the receipt block', async () => {
    const { invalidate, store, onSettled, wrapper } = setup()
    store.set(latestAuctionAtom, auctionAt(100n))
    const { rerender } = renderHook(
      ({ receiptBlock }: { receiptBlock: bigint | undefined }) =>
        useLaunchReceipt(receiptBlock, onSettled),
      { wrapper, initialProps: { receiptBlock: undefined as bigint | undefined } }
    )
    expect(invalidate).not.toHaveBeenCalled()

    rerender({ receiptBlock: 120n })
    const live = [
      dtfQueryKeys.index.latestAuction(identity),
      dtfQueryKeys.index.currentRebalance(identity),
    ].map((k) => JSON.stringify(k))
    await waitFor(() =>
      expect(invalidate.mock.calls.map(([o]) => JSON.stringify(o?.queryKey)).slice(0, 2)).toEqual(live)
    )
    // Provider lags the receipt: still launching, no history refresh yet.
    expect(onSettled).not.toHaveBeenCalled()
    expect(store.get(refreshNonceAtom)).toBe(0)

    store.set(latestAuctionAtom, auctionAt(120n))
    await waitFor(() => expect(onSettled).toHaveBeenCalledTimes(1))
    const keys = invalidate.mock.calls.map(([o]) => JSON.stringify(o?.queryKey))
    expect(keys).toContain(JSON.stringify(dtfQueryKeys.index.rebalances(identity)))
    expect(keys).toContain(
      JSON.stringify(dtfQueryKeys.index.rebalanceAuctions({ chainId: 56, rebalanceId: '0xdtf-12' }))
    )
    expect(keys.some((k) => k.includes('"default"'))).toBe(false)
    expect(store.get(refreshNonceAtom)).toBe(1)

    // A later read past the block must not settle twice.
    store.set(latestAuctionAtom, auctionAt(121n))
    await new Promise((r) => setTimeout(r, 20))
    expect(onSettled).toHaveBeenCalledTimes(1)
  })

  it('settles immediately on v4, where there is no SDK latest-auction read', async () => {
    const { store, onSettled, wrapper } = setup()
    expect(store.get(latestAuctionAtom)).toBeUndefined()
    const { rerender } = renderHook(
      ({ receiptBlock }: { receiptBlock: bigint | undefined }) =>
        useLaunchReceipt(receiptBlock, onSettled),
      { wrapper, initialProps: { receiptBlock: undefined as bigint | undefined } }
    )
    rerender({ receiptBlock: 5n })
    await waitFor(() => expect(onSettled).toHaveBeenCalledTimes(1))
  })
})
