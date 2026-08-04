import { createStore } from 'jotai'
import { describe, expect, it } from 'vitest'
import { parseEther } from 'viem'
import { indexDTFAtom, indexDTFFeeAtom } from '@/state/dtf/atoms'
import { revenuePortionFromShare } from '@/utils/fees'
import { feeRecipientsAtom } from '../atoms'

type Recipient = { address: string; percentage: string }

const makeStoreWith = (platformFee: number, feeRecipients: Recipient[]) => {
  const store = createStore()
  store.set(indexDTFAtom, {
    deployer: '0x1111111111111111111111111111111111111111',
    feeRecipients,
    stToken: { id: '0x2222222222222222222222222222222222222222' },
  } as any)
  store.set(indexDTFFeeAtom, platformFee)
  return store
}

const makeStore = (platformFee: number, percentage = '80') =>
  makeStoreWith(platformFee, [
    { address: '0x2222222222222222222222222222222222222222', percentage },
  ])

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

  it('shows shares that total the pot when per-recipient rounding drifts', () => {
    // 80/10/10 of the pot each round up: the naive read-back totals 66.68% of
    // revenue, rendering an untouched form as over-allocated.
    const result = makeStoreWith(33.33, [
      {
        address: '0x2222222222222222222222222222222222222222',
        percentage: '80',
      },
      {
        address: '0x3333333333333333333333333333333333333333',
        percentage: '10',
      },
      {
        address: '0x4444444444444444444444444444444444444444',
        percentage: '10',
      },
    ]).get(feeRecipientsAtom)

    const total =
      result!.deployerShare +
      result!.governanceShare +
      result!.externalRecipients.reduce((sum, r) => sum + r.share, 0)

    expect(+total.toFixed(2)).toBe(66.67)
  })

  it('returns undefined (indeterminate) at platformFee=100 — no fabricated split', () => {
    expect(makeStore(100).get(feeRecipientsAtom)).toBeUndefined()
  })

  it('returns undefined for a non-finite / out-of-range fee', () => {
    expect(makeStore(NaN).get(feeRecipientsAtom)).toBeUndefined()
    expect(makeStore(150).get(feeRecipientsAtom)).toBeUndefined()
  })
})
