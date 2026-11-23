import { renderHook } from '@testing-library/react'
import { act } from 'react'
import { createStore, Provider } from 'jotai'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { activeAuctionAtom, refreshNonceAtom, type Auction } from '../atoms'
import { useSyncRebalanceAuctions } from '../hooks/use-sync-rebalance-auctions'

const START = new Date('2026-11-06T15:00:00Z')
const endsIn = (seconds: number) =>
  ({ id: 'a-1', endTime: String(START.getTime() / 1000 + seconds), bids: [] }) as unknown as Auction

describe('useSyncRebalanceAuctions', () => {
  afterEach(() => vi.useRealTimers())

  it('drops an auction that ended when a refresh returns the same data', () => {
    vi.useFakeTimers()
    vi.setSystemTime(START)
    const store = createStore()
    // A refetch that finds no new bids gives back the same array reference.
    const data = [endsIn(60)]
    const wrapper = ({ children }: { children: ReactNode }) => <Provider store={store}>{children}</Provider>
    renderHook(() => useSyncRebalanceAuctions(data), { wrapper })
    expect(store.get(activeAuctionAtom)).not.toBeNull()

    vi.setSystemTime(new Date(START.getTime() + 61_000))
    act(() => store.set(refreshNonceAtom, (n) => n + 1))

    expect(store.get(activeAuctionAtom)).toBeNull()
  })
})
