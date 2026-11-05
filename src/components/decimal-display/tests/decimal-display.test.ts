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

  it('writes small values plainly until three leading zeros', () => {
    expect(formatNumberValue(0.5, 2, false, false, true)).toBe('0.50')
    expect(formatNumberValue(0.074, 2, false, false, true)).toBe('0.074')
    expect(formatNumberValue(0.0012, 2, false, false, true)).toBe('0.0012')
  })

  it('uses a subscript from three leading zeros, with rounded digits', () => {
    expect(formatNumberValue(0.0000413, 2, false, false, true)).toBe(
      '0.0<sub>4</sub>41'
    )
    expect(formatNumberValue(0.00012, 2, false, false, true)).toBe(
      '0.0<sub>3</sub>12'
    )
    expect(formatNumberValue(-0.0000413, 2, false, false, true)).toBe(
      '-0.0<sub>4</sub>41'
    )
  })
})
