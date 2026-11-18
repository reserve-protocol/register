import { describe, expect, it } from 'vitest'
import { VLRSR_SINGLETON } from '@/views/index-dtf/governance/views/propose/upgrade-banners/vote-lock-upgrade'
import { isSelfAppreciatingVoteLock } from '../constants'

describe('isSelfAppreciatingVoteLock', () => {
  it.each(Object.entries(VLRSR_SINGLETON))(
    'treats the vlRSR singleton on chain %s as self-appreciating',
    (chainId, vault) => {
      expect(isSelfAppreciatingVoteLock(Number(chainId), vault)).toBe(true)
    }
  )

  it('keeps a legacy vault with claimable reward tokens as manual', () => {
    expect(
      isSelfAppreciatingVoteLock(8453, '0x45a96cd0e4d89a41eebf3cc4204b00b1cf1582fa')
    ).toBe(false)
  })
})
