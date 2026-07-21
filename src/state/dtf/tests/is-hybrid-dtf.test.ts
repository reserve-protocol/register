import { createStore } from 'jotai'
import { describe, expect, it } from 'vitest'
import { IndexDTF } from '@/types'
import { indexDTFAtom, isHybridDTFAtom } from '../atoms'

const dtf = (id: string) => ({ id }) as IndexDTF

// Hybrid is a curated designation (requires weight control, but not every
// weight-controlled DTF is hybrid) — the allowlist is the source of truth.
describe('isHybridDTFAtom', () => {
  it('is hybrid for an allowlisted DTF (case-insensitive)', () => {
    const store = createStore()
    store.set(
      indexDTFAtom,
      dtf('0x4DA9a0f397db1397902070F93a4D6DDBC0e0E6E8') // LCAP, checksummed
    )
    expect(store.get(isHybridDTFAtom)).toBe(true)
  })

  it('is NOT hybrid for a weight-controlled DTF outside the allowlist', () => {
    const store = createStore()
    store.set(indexDTFAtom, dtf('0x0000000000000000000000000000000000000001'))
    expect(store.get(isHybridDTFAtom)).toBe(false)
  })

  it('is NOT hybrid while the DTF is loading', () => {
    const store = createStore()
    store.set(indexDTFAtom, undefined)
    expect(store.get(isHybridDTFAtom)).toBe(false)
  })
})
