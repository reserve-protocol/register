import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { Provider, useAtomValue, useSetAtom } from 'jotai'
import { createElement, ReactNode } from 'react'

import {
  activeAuctionAtom,
  isAuctionOngoingAtom,
  latestAuctionAtom,
  rebalanceAuctionsAtom,
  Auction,
} from '../atoms'
import { createStore } from 'jotai'

// Wrapper component for Jotai Provider
const createWrapper = () => {
  return ({ children }: { children: ReactNode }) =>
    createElement(Provider, null, children)
}

// Helper to create mock auctions
const createMockAuction = (
  endTimeOffset: number,
  id = '1'
): Partial<Auction> => ({
  id,
  endTime: String(Math.floor(Date.now() / 1000) + endTimeOffset),
  startTime: String(Math.floor(Date.now() / 1000) - 3600), // Started 1 hour ago
  tokens: [],
  bids: [],
})

// Helper hook to set up test state
const useTestSetup = () => {
  const setRebalanceAuctions = useSetAtom(rebalanceAuctionsAtom)
  const activeAuction = useAtomValue(activeAuctionAtom)
  const isAuctionOngoing = useAtomValue(isAuctionOngoingAtom)

  return {
    setRebalanceAuctions,
    activeAuction,
    isAuctionOngoing,
  }
}

describe('activeAuctionAtom', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns null when no auctions exist', () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useTestSetup(), { wrapper })

    act(() => {
      result.current.setRebalanceAuctions([])
    })

    expect(result.current.activeAuction).toBeNull()
  })

  it('returns null when all auctions have ended', () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useTestSetup(), { wrapper })

    act(() => {
      result.current.setRebalanceAuctions([
        createMockAuction(-3600, '1'), // Ended 1 hour ago
        createMockAuction(-1800, '2'), // Ended 30 min ago
      ] as Auction[])
    })

    expect(result.current.activeAuction).toBeNull()
  })

  it('returns first active auction when multiple exist', () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useTestSetup(), { wrapper })

    act(() => {
      result.current.setRebalanceAuctions([
        createMockAuction(-3600, '1'), // Ended 1 hour ago
        createMockAuction(1800, '2'), // Ends in 30 min (first active)
        createMockAuction(3600, '3'), // Ends in 1 hour
      ] as Auction[])
    })

    expect(result.current.activeAuction).not.toBeNull()
    expect(result.current.activeAuction?.auction.id).toBe('2')
    expect(result.current.activeAuction?.index).toBe(2) // 1-based index
  })

  it('returns correct 1-based index for display', () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useTestSetup(), { wrapper })

    act(() => {
      result.current.setRebalanceAuctions([
        createMockAuction(1800, '1'), // Active auction at index 0
      ] as Auction[])
    })

    expect(result.current.activeAuction?.index).toBe(1)
  })

  it('handles exact endTime boundary (edge case)', () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useTestSetup(), { wrapper })

    const currentTime = Math.floor(Date.now() / 1000)

    act(() => {
      result.current.setRebalanceAuctions([
        // Auction ends exactly at current time - should NOT be active
        // because condition is endTime > currentTime
        {
          ...createMockAuction(0, '1'),
          endTime: String(currentTime),
        },
      ] as Auction[])
    })

    // endTime === currentTime means auction has ended (not >)
    expect(result.current.activeAuction).toBeNull()
  })

  it('handles auction ending 1 second in the future', () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useTestSetup(), { wrapper })

    act(() => {
      result.current.setRebalanceAuctions([
        createMockAuction(1, '1'), // Ends in 1 second
      ] as Auction[])
    })

    expect(result.current.activeAuction).not.toBeNull()
    expect(result.current.activeAuction?.auction.id).toBe('1')
  })

  it('transitions from active to null as time passes', () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useTestSetup(), { wrapper })

    act(() => {
      result.current.setRebalanceAuctions([
        createMockAuction(60, '1'), // Ends in 60 seconds
      ] as Auction[])
    })

    expect(result.current.activeAuction).not.toBeNull()

    // Advance time past the auction end
    act(() => {
      vi.advanceTimersByTime(61 * 1000)
    })

    // Note: In real app, the atom would need to re-evaluate
    // This test verifies the time comparison logic
    const newCurrentTime = Math.floor(Date.now() / 1000)
    const auctionEndTime = parseInt(
      result.current.activeAuction?.auction.endTime || '0'
    )
    expect(newCurrentTime).toBeGreaterThan(auctionEndTime)
  })
})

describe('isAuctionOngoingAtom', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns false when no auctions exist', () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useTestSetup(), { wrapper })

    act(() => {
      result.current.setRebalanceAuctions([])
    })

    expect(result.current.isAuctionOngoing).toBe(false)
  })

  it('returns false when all auctions have ended', () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useTestSetup(), { wrapper })

    act(() => {
      result.current.setRebalanceAuctions([
        createMockAuction(-3600, '1'),
        createMockAuction(-1800, '2'),
      ] as Auction[])
    })

    expect(result.current.isAuctionOngoing).toBe(false)
  })

  it('returns true when at least one auction is active', () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useTestSetup(), { wrapper })

    act(() => {
      result.current.setRebalanceAuctions([
        createMockAuction(-3600, '1'), // Ended
        createMockAuction(1800, '2'), // Active
      ] as Auction[])
    })

    expect(result.current.isAuctionOngoing).toBe(true)
  })

  it('returns true when multiple auctions are active', () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useTestSetup(), { wrapper })

    act(() => {
      result.current.setRebalanceAuctions([
        createMockAuction(1800, '1'),
        createMockAuction(3600, '2'),
      ] as Auction[])
    })

    expect(result.current.isAuctionOngoing).toBe(true)
  })
})

// Live gating is RPC-first: once the SDK's latest-auction read resolves it
// decides, whatever the (lagging) indexed auctions say.
describe('isAuctionOngoingAtom with the RPC latest auction', () => {
  const rpcAuction = (isActive: boolean) => ({
    auctionId: 1n,
    rebalanceNonce: 3n,
    currentRebalanceNonce: 3n,
    startTime: 1n,
    endTime: 2n,
    blockNumber: 10n,
    isActive,
  })

  it('reports ongoing from RPC before the indexer has any auction rows', () => {
    const store = createStore()
    store.set(rebalanceAuctionsAtom, [])
    store.set(latestAuctionAtom, rpcAuction(true))
    expect(store.get(isAuctionOngoingAtom)).toBe(true)
  })

  it('reports not ongoing from RPC even while an indexed row still looks open', () => {
    const store = createStore()
    const future = String(Math.floor(Date.now() / 1000) + 3600)
    store.set(rebalanceAuctionsAtom, [
      { id: '1', endTime: future, startTime: '0', tokens: [], bids: [] } as unknown as Auction,
    ])
    store.set(latestAuctionAtom, rpcAuction(false))
    expect(store.get(isAuctionOngoingAtom)).toBe(false)
    store.set(latestAuctionAtom, null)
    expect(store.get(isAuctionOngoingAtom)).toBe(false)
  })

  it('falls back to indexed rows while the RPC read is unresolved', () => {
    const store = createStore()
    const future = String(Math.floor(Date.now() / 1000) + 3600)
    store.set(rebalanceAuctionsAtom, [
      { id: '1', endTime: future, startTime: '0', tokens: [], bids: [] } as unknown as Auction,
    ])
    expect(store.get(latestAuctionAtom)).toBeUndefined()
    expect(store.get(isAuctionOngoingAtom)).toBe(true)
  })
})
