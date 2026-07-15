import { createStore } from 'jotai'
import { describe, expect, it } from 'vitest'
import { indexDTFRebalanceControlAtom, isHybridDTFAtom } from '../atoms'

describe('isHybridDTFAtom (D1)', () => {
  it('is hybrid for a NATIVE DTF (weightControl true)', () => {
    const store = createStore()
    store.set(indexDTFRebalanceControlAtom, {
      weightControl: true,
      priceControl: 1,
    })
    expect(store.get(isHybridDTFAtom)).toBe(true)
  })

  it('is NOT hybrid for a TRACKING DTF (weightControl false)', () => {
    const store = createStore()
    store.set(indexDTFRebalanceControlAtom, {
      weightControl: false,
      priceControl: 1,
    })
    expect(store.get(isHybridDTFAtom)).toBe(false)
  })

  it('is NOT hybrid while rebalance control is missing (loading)', () => {
    const store = createStore()
    store.set(indexDTFRebalanceControlAtom, undefined)
    expect(store.get(isHybridDTFAtom)).toBe(false)
  })
})
