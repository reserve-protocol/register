import { createStore } from 'jotai'
import { describe, expect, it } from 'vitest'
import { indexDTFAtom, indexDTFFeeAtom } from '@/state/dtf/atoms'
import { feeRecipientsAtom } from '../atoms'

const makeStore = (platformFee: number) => {
  const store = createStore()
  store.set(indexDTFAtom, {
    deployer: '0x1111111111111111111111111111111111111111',
    feeRecipients: [
      { address: '0x2222222222222222222222222222222222222222', percentage: '80' },
    ],
    stToken: { id: '0x2222222222222222222222222222222222222222' },
  } as any)
  store.set(indexDTFFeeAtom, platformFee)
  return store
}

describe('feeRecipientsAtom platform-fee guard (B2)', () => {
  it('returns a split for a displayable fee', () => {
    const result = makeStore(50).get(feeRecipientsAtom)
    // platformFee 50 → adjust 2 → 80% governance displays as 40%
    expect(result?.governanceShare).toBe(40)
  })

  it('returns undefined (indeterminate) at platformFee=100 — no fabricated split', () => {
    expect(makeStore(100).get(feeRecipientsAtom)).toBeUndefined()
  })

  it('returns undefined for a non-finite / out-of-range fee', () => {
    expect(makeStore(NaN).get(feeRecipientsAtom)).toBeUndefined()
    expect(makeStore(150).get(feeRecipientsAtom)).toBeUndefined()
  })
})
