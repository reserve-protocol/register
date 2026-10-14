import { createStore } from 'jotai'
import { describe, expect, it } from 'vitest'
import { isRevenueValidAtom, revenueSplitAtom } from '../atoms'

const external = (holders: string, stakers: string, total: string) => ({
  address: '0x0000000000000000000000000000000000000001',
  holders,
  stakers,
  total,
})

const validate = (split: Parameters<typeof revenueSplitAtom.write>[2]) => {
  const store = createStore()
  store.set(revenueSplitAtom, split)
  return store.get(isRevenueValidAtom)
}

describe('isRevenueValidAtom', () => {
  it('accepts splits that add up to 100%', () => {
    expect(
      validate({
        holders: '50',
        stakers: '40',
        external: [external('60', '40', '10')],
      })
    ).toBe(true)
  })

  it('rejects splits that do not add up to 100%', () => {
    expect(validate({ holders: '50', stakers: '40', external: [] })).toBe(false)
  })

  it('rejects non-numeric input instead of throwing', () => {
    expect(validate({ holders: '1,5', stakers: '40', external: [] })).toBe(
      false
    )
    expect(
      validate({
        holders: '50',
        stakers: '40',
        external: [external('60', '40', '1,5')],
      })
    ).toBe(false)
    expect(
      validate({
        holders: '50',
        stakers: '40',
        external: [external('abc', '40', '10')],
      })
    ).toBe(false)
  })

  it('rejects blank allocations', () => {
    expect(
      validate({
        holders: '50',
        stakers: '50',
        external: [external('60', '40', '')],
      })
    ).toBe(false)
    expect(validate({ holders: ' ', stakers: '100', external: [] })).toBe(false)
  })
})
