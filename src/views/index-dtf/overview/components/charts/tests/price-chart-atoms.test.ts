import { indexDTFAtom } from '@/state/dtf/atoms'
import type { IndexDTF } from '@/types'
import { createStore } from 'jotai'
import { describe, expect, it } from 'vitest'
import {
  hasEstimatedHistoricalPriceAtom,
  priceHistoryAvailabilityAtom,
} from '../price-chart-atoms'

const ADDRESS = '0xABC0000000000000000000000000000000000000'
const LAUNCH = 1_700_000_000

const dtf = (overrides?: Partial<IndexDTF>) =>
  ({ id: ADDRESS, timestamp: LAUNCH, ...overrides }) as IndexDTF

describe('hasEstimatedHistoricalPriceAtom', () => {
  it('returns false when there is no dtf', () => {
    const store = createStore()
    store.set(priceHistoryAvailabilityAtom, {
      address: ADDRESS.toLowerCase(),
      firstTimestamp: LAUNCH - 100,
    })
    expect(store.get(hasEstimatedHistoricalPriceAtom)).toBe(false)
  })

  it('returns false when availability has not synced yet', () => {
    const store = createStore()
    store.set(indexDTFAtom, dtf())
    expect(store.get(hasEstimatedHistoricalPriceAtom)).toBe(false)
  })

  it('returns false when availability is for a different dtf', () => {
    const store = createStore()
    store.set(indexDTFAtom, dtf())
    store.set(priceHistoryAvailabilityAtom, {
      address: '0xdead000000000000000000000000000000000000',
      firstTimestamp: LAUNCH - 100,
    })
    expect(store.get(hasEstimatedHistoricalPriceAtom)).toBe(false)
  })

  it('returns false when there is no valid first timestamp', () => {
    const store = createStore()
    store.set(indexDTFAtom, dtf())
    store.set(priceHistoryAvailabilityAtom, {
      address: ADDRESS.toLowerCase(),
      firstTimestamp: null,
    })
    expect(store.get(hasEstimatedHistoricalPriceAtom)).toBe(false)
  })

  it('returns false when data starts at or after launch', () => {
    const store = createStore()
    store.set(indexDTFAtom, dtf())
    store.set(priceHistoryAvailabilityAtom, {
      address: ADDRESS.toLowerCase(),
      firstTimestamp: LAUNCH,
    })
    expect(store.get(hasEstimatedHistoricalPriceAtom)).toBe(false)
  })

  it('returns true when data predates launch (case-insensitive address)', () => {
    const store = createStore()
    store.set(indexDTFAtom, dtf())
    store.set(priceHistoryAvailabilityAtom, {
      address: ADDRESS.toLowerCase(),
      firstTimestamp: LAUNCH - 86_400,
    })
    expect(store.get(hasEstimatedHistoricalPriceAtom)).toBe(true)
  })
})
