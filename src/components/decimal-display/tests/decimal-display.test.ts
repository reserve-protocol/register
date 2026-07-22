import { describe, expect, it } from 'vitest'
import { formatNumberValue } from '../index'

// Defaults mirror the DecimalDisplay component (decimals 2, currency, trimZeros).
const fmt = (value: number | string) =>
  formatNumberValue(value, 2, true, false, true)

describe('formatNumberValue non-finite', () => {
  it('renders NaN as unavailable, not 0', () => {
    expect(fmt(NaN)).toBe('—')
    expect(fmt('not-a-number')).toBe('—') // parseFloat → NaN
  })

  it('renders ±Infinity as unavailable, not ∞', () => {
    expect(fmt(Infinity)).toBe('—')
    expect(fmt(-Infinity)).toBe('—')
  })
})

describe('formatNumberValue finite path unchanged', () => {
  it('formats finite values as before', () => {
    expect(fmt(0)).toBe('0')
    expect(fmt(1234.5)).toBe('1,234.5')
    expect(fmt(-42)).toBe('-42')
  })

  it('keeps the sub-1 subscript formatting', () => {
    expect(formatNumberValue(0.5, 2, false, false, true)).toBe('0.50')
    // Pre-existing float artifact of toFixed(27) — locks the finite path as-is.
    expect(formatNumberValue(0.0012, 2, false, false, true)).toBe(
      '0.0<sub>2</sub>11'
    )
  })
})
