import { describe, expect, it } from 'vitest'
import { ChainId } from '@/utils/chains'
import { hasLockedZapSettings } from '../locked-zap-settings'

// The app passes checksummed addresses; the list stores lowercase
const PHOTON = '0xa0Fe4e0aEca5479705ce996615B2EACB6b6a10Fb'

describe('hasLockedZapSettings', () => {
  it('matches a listed DTF regardless of address casing', () => {
    expect(hasLockedZapSettings(PHOTON, ChainId.BSC)).toBe(true)
    expect(hasLockedZapSettings(PHOTON.toLowerCase(), ChainId.BSC)).toBe(true)
  })

  it('does not match a listed address on another chain', () => {
    expect(hasLockedZapSettings(PHOTON, ChainId.Mainnet)).toBe(false)
  })

  it('does not match an unlisted address', () => {
    expect(
      hasLockedZapSettings(
        '0x2f8A339B5889FfaC4c5A956787cdA593b3c36867',
        ChainId.BSC
      )
    ).toBe(false)
  })
})
