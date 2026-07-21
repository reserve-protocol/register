import { describe, expect, it } from 'vitest'
import { deriveDtfStatus, isKnownDeprecated } from '../use-dtf-status'

// A ledger entry from KNOWN_DEPRECATED (base chain).
const KNOWN = '0xcc7ff230365bd730ee4b352cc2492cedac49383e'
const UNKNOWN = '0x4dA9A0f397dB1397902070f93a4D6ddBC0E0E6e8'

describe('isKnownDeprecated', () => {
  it('matches ledger addresses case-insensitively on their chain', () => {
    expect(isKnownDeprecated(KNOWN, 8453)).toBe(true)
    expect(isKnownDeprecated(KNOWN.toUpperCase().replace('0X', '0x'), 8453)).toBe(true)
  })

  it('does not match the same address on another chain', () => {
    expect(isKnownDeprecated(KNOWN, 1)).toBe(false)
  })
})

describe('deriveDtfStatus (KNOWN_DEPRECATED fail-safe)', () => {
  it('uses the discovery status when it has landed', () => {
    expect(deriveDtfStatus('active', KNOWN, 8453)).toBe('active')
    expect(deriveDtfStatus('deprecated', UNKNOWN, 8453)).toBe('deprecated')
  })

  it('falls back to deprecated for ledger DTFs while discovery is unavailable', () => {
    expect(deriveDtfStatus(undefined, KNOWN, 8453)).toBe('deprecated')
  })

  it('falls back to active for unknown DTFs while discovery is unavailable', () => {
    expect(deriveDtfStatus(undefined, UNKNOWN, 8453)).toBe('active')
  })
})
