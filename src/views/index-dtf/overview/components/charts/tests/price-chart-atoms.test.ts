import { indexDTFAtom } from '@/state/dtf/atoms'
import type { IndexDTF } from '@/types'
import { createStore } from 'jotai'
import { describe, expect, it } from 'vitest'
import {
  chartTypeAtom,
  dataTypeAtom,
  hasEstimatedHistoricalPriceAtom,
  isMarketPriceVisibleAtom,
  marketPriceInfoAtom,
  priceHistoryAvailabilityAtom,
  showMarketPriceAtom,
} from '../price-chart-atoms'

const ADDRESS = '0xABC0000000000000000000000000000000000000'
const LAUNCH = 1_700_000_000
const YIELD_INDEX_DTF = '0x1d55940cf6eb85321816327aa785006f8dd59ef9'

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

describe('isMarketPriceVisibleAtom', () => {
  const visibleStore = () => {
    const store = createStore()
    store.set(indexDTFAtom, dtf())
    store.set(showMarketPriceAtom, true)
    store.set(marketPriceInfoAtom, { hasData: true, latest: 0.33 })
    store.set(dataTypeAtom, 'price')
    return store
  }

  it('is true when toggled on, data exists, in price mode, on a standard DTF', () => {
    expect(visibleStore().get(isMarketPriceVisibleAtom)).toBe(true)
  })

  it('is false when the toggle is off', () => {
    const store = visibleStore()
    store.set(showMarketPriceAtom, false)
    expect(store.get(isMarketPriceVisibleAtom)).toBe(false)
  })

  it('is false when the DTF has no market data', () => {
    const store = visibleStore()
    store.set(marketPriceInfoAtom, { hasData: false, latest: null })
    expect(store.get(isMarketPriceVisibleAtom)).toBe(false)
  })

  it('is false outside NAV price mode', () => {
    const store = visibleStore()
    store.set(dataTypeAtom, 'marketCap')
    expect(store.get(isMarketPriceVisibleAtom)).toBe(false)
  })

  it('is false on the candlestick chart even if the toggle was left on', () => {
    const store = visibleStore()
    store.set(chartTypeAtom, 'candlestick')
    expect(store.get(isMarketPriceVisibleAtom)).toBe(false)
  })

  it('is false on a yield index DTF even if the toggle was left on', () => {
    const store = visibleStore()
    store.set(indexDTFAtom, dtf({ id: YIELD_INDEX_DTF }))
    expect(store.get(isMarketPriceVisibleAtom)).toBe(false)
  })
})
