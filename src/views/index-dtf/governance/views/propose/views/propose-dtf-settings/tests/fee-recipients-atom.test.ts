import { createStore } from 'jotai'
import { describe, expect, it } from 'vitest'
import { parseEther } from 'viem'
import { indexDTFAtom, indexDTFFeeAtom } from '@/state/dtf/atoms'
import { revenuePortionFromShare } from '@/utils/fees'
import { feeRecipientsAtom } from '../atoms'

const makeStore = (platformFee: number, percentage = '80') => {
  const store = createStore()
  store.set(indexDTFAtom, {
    deployer: '0x1111111111111111111111111111111111111111',
    feeRecipients: [
      { address: '0x2222222222222222222222222222222222222222', percentage },
    ],
    stToken: { id: '0x2222222222222222222222222222222222222222' },
  } as any)
  store.set(indexDTFFeeAtom, platformFee)
  return store
}

describe('feeRecipientsAtom platform-fee guard', () => {
  it('returns a split for a displayable fee', () => {
    const result = makeStore(50).get(feeRecipientsAtom)
    // platformFee 50 → adjust 2 → 80% governance displays as 40%
    expect(result?.governanceShare).toBe(40)
  })

  it('round-trips a whole-pot share under a fractional platform fee', () => {
    // BSC takes 1/3 of revenue: a contract 100% recipient owns 66.67% of total,
    // and that share must encode back to the whole pot (1e18), never above it.
    const result = makeStore(33.33, '100').get(feeRecipientsAtom)

    expect(result?.governanceShare).toBe(66.67)
    expect(revenuePortionFromShare(result!.governanceShare, 33.33)).toBe(
      parseEther('1')
    )
  })

  it('returns undefined (indeterminate) at platformFee=100 — no fabricated split', () => {
    expect(makeStore(100).get(feeRecipientsAtom)).toBeUndefined()
  })

  it('returns undefined for a non-finite / out-of-range fee', () => {
    expect(makeStore(NaN).get(feeRecipientsAtom)).toBeUndefined()
    expect(makeStore(150).get(feeRecipientsAtom)).toBeUndefined()
  })
})
