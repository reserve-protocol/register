import { describe, expect, it } from 'vitest'
import { safeParseEther } from '..'

describe('safeParseEther', () => {
  // viem >= 2.57 throws on parseUnits('') and parseUnits('.')
  it('returns 0n for an empty or partial input', () => {
    expect(safeParseEther('')).toBe(0n)
    expect(safeParseEther('.')).toBe(0n)
    expect(safeParseEther('', 6)).toBe(0n)
  })

  it('parses partial decimals with the token decimals', () => {
    expect(safeParseEther('1.', 6)).toBe(1_000_000n)
    expect(safeParseEther('.5', 6)).toBe(500_000n)
  })

  it('truncates extra decimals', () => {
    expect(safeParseEther('1.1234567', 6)).toBe(1_123_456n)
  })
})
