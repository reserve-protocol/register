import { describe, expect, it } from 'vitest'
import { ChainId } from '@/utils/chains'
import { hasUniV4PoolSwaps } from '../constants'

// The app passes checksummed addresses; the list stores lowercase
const PHOTON = '0xa0Fe4e0aEca5479705ce996615B2EACB6b6a10Fb'

describe('hasUniV4PoolSwaps', () => {
  it('matches a listed DTF regardless of address casing', () => {
    expect(hasUniV4PoolSwaps(PHOTON, ChainId.BSC)).toBe(true)
    expect(hasUniV4PoolSwaps(PHOTON.toLowerCase(), ChainId.BSC)).toBe(true)
  })

  it('does not match a listed address on another chain', () => {
    expect(hasUniV4PoolSwaps(PHOTON, ChainId.Mainnet)).toBe(false)
  })

  it('does not match an unlisted address', () => {
    expect(
      hasUniV4PoolSwaps('0x2f8A339B5889FfaC4c5A956787cdA593b3c36867', ChainId.BSC)
    ).toBe(false)
  })

  it('returns false while the DTF context is still loading', () => {
    expect(hasUniV4PoolSwaps(undefined, ChainId.BSC)).toBe(false)
    expect(hasUniV4PoolSwaps(PHOTON, undefined)).toBe(false)
  })
})
