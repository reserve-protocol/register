import { describe, expect, it } from 'vitest'
import { ChainId } from '../chains'
import { isSelfAppreciatingVoteLock } from '../constants'

const MAG7_VLRSR = '0x2f0d6538807a77d4addcd4b4daf214ea2e818e3d'

describe('isSelfAppreciatingVoteLock', () => {
  it('classifies the MAG7 vlRSR vault as self-appreciating', () => {
    expect(isSelfAppreciatingVoteLock(ChainId.Base, MAG7_VLRSR)).toBe(true)
  })
})
