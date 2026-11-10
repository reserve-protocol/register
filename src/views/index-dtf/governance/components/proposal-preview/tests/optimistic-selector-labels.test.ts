import { describe, expect, it } from 'vitest'
import { toFunctionSelector } from 'viem'
import { getOptimisticSelectorLabel } from '../dtf-settings-preview'

// The lingui macro compiles a descriptor to its source text under vitest.
const label = (signature: string) => {
  const descriptor = getOptimisticSelectorLabel(toFunctionSelector(signature))
  return typeof descriptor === 'string' ? descriptor : descriptor?.message
}

describe('getOptimisticSelectorLabel', () => {
  it('names the setters only Folio 6.0 has', () => {
    expect(label('setFolioSelfFee(uint256)')).toBe('Holder share')
    expect(label('addToAllowlist(address[])')).toBe('Add to trade allowlist')
    expect(label('removeFromAllowlist(address[])')).toBe('Remove from trade allowlist')
    expect(label('setTradeAllowlistEnabled(bool)')).toBe('Trade allowlist enforcement')
  })

  it('keeps the Folio 6.0 names for the setters 6.0 changed', () => {
    expect(label('setMaxAuctionLength(uint256)')).toBe('Max auction length (Folio 6.0)')
    expect(label('setMandate(string)')).toBe('Mandate')
  })

  it('leaves an unknown selector unnamed', () => {
    expect(getOptimisticSelectorLabel('0xdeadbeef')).toBeUndefined()
  })
})
