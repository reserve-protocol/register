import { createStore } from 'jotai'
import { describe, expect, it } from 'vitest'
import { folioVersionAtom, indexDTFVersionAtom } from '@/state/dtf/atoms'
import { resetIndexDTFAtomsAtom } from '@/state/dtf/reset-index-dtf-atoms'

// Version identity must never be fabricated: before useIndexDtfVersion
// resolves, every ABI/calldata consumer has to see "pending", not v4.
describe('folioVersionAtom', () => {
  it('is pending until the SDK version resolves', () => {
    const store = createStore()
    expect(store.get(indexDTFVersionAtom)).toBeUndefined()
    expect(store.get(folioVersionAtom)).toEqual({ status: 'pending' })
  })

  it.each([
    ['1.0.0', 1],
    ['2.0.0', 2],
    ['4.0.0', 4],
    ['4.0.1', 4],
    ['5.0.0', 5],
    ['6.0.0', 6],
  ] as const)('maps %s to major %i', (version, major) => {
    const store = createStore()
    store.set(indexDTFVersionAtom, version)
    expect(store.get(folioVersionAtom)).toEqual({
      status: 'ready',
      major,
      version,
    })
  })

  it.each(['3.0.0', '5.1.0', '6.1.0', '7.0.0', ''])(
    'reports %s as unsupported instead of guessing a major',
    (version) => {
      const store = createStore()
      store.set(indexDTFVersionAtom, version)
      expect(store.get(folioVersionAtom)).toEqual({
        status: 'unsupported',
        version,
      })
    }
  )

  it('returns to pending on DTF reset so the next DTF cannot inherit a version', () => {
    const store = createStore()
    store.set(indexDTFVersionAtom, '5.0.0')
    store.set(resetIndexDTFAtomsAtom)
    expect(store.get(indexDTFVersionAtom)).toBeUndefined()
    expect(store.get(folioVersionAtom)).toEqual({ status: 'pending' })
  })
})
