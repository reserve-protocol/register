import { describe, it, expect } from 'vitest'
import { Decimal } from '../decimals'

describe('Decimal', () => {
  describe('constructor', () => {
    it('creates from number', () => {
      expect(new Decimal(42).value).toBe(42)
    })

    it('creates from string', () => {
      expect(new Decimal('3.14').value).toBe(3.14)
    })

    it('creates from static factory', () => {
      expect(Decimal.from(99).value).toBe(99)
    })
  })

  describe('arithmetic', () => {
    it('adds two decimals', () => {
      const a = new Decimal(1.5)
      const b = new Decimal(2.3)
      expect(a.plus(b).value).toBeCloseTo(3.8)
    })

    it('adds decimal and number', () => {
      expect(new Decimal(1.5).plus(2).value).toBeCloseTo(3.5)
    })

    it('subtracts two decimals', () => {
      const a = new Decimal(5)
      const b = new Decimal(3.2)
      expect(a.minus(b).value).toBeCloseTo(1.8)
    })

    it('subtracts decimal and number', () => {
      expect(new Decimal(10).minus(3).value).toBe(7)
    })
  })

  describe('eq', () => {
    it('returns true for equal values', () => {
      expect(new Decimal(100).eq(new Decimal(100))).toBe(true)
    })

    it('returns true within epsilon tolerance', () => {
      // Floating point: 0.1 + 0.2 !== 0.3
      const result = new Decimal(0.1).plus(new Decimal(0.2))
      expect(result.eq(new Decimal(0.3))).toBe(true)
    })

    it('returns false for different values', () => {
      expect(new Decimal(1).eq(new Decimal(2))).toBe(false)
    })

    it('compares with raw number', () => {
      expect(new Decimal(42).eq(42)).toBe(true)
    })
  })

  describe('abs', () => {
    it('returns absolute value of negative', () => {
      expect(new Decimal(-5).abs().value).toBe(5)
    })

    it('returns same value for positive', () => {
      expect(new Decimal(5).abs().value).toBe(5)
    })
  })

  describe('isPositive / isNegative', () => {
    it('identifies positive', () => {
      expect(new Decimal(1).isPositive()).toBe(true)
      expect(new Decimal(1).isNegative()).toBe(false)
    })

    it('identifies negative', () => {
      expect(new Decimal(-1).isNegative()).toBe(true)
      expect(new Decimal(-1).isPositive()).toBe(false)
    })

    it('zero is neither positive nor negative', () => {
      expect(new Decimal(0).isPositive()).toBe(false)
      expect(new Decimal(0).isNegative()).toBe(false)
    })
  })

  describe('min / max', () => {
    it('returns min of two decimals', () => {
      expect(new Decimal(3).min(new Decimal(5)).value).toBe(3)
      expect(new Decimal(5).min(new Decimal(3)).value).toBe(3)
    })

    it('returns max of two decimals', () => {
      expect(new Decimal(3).max(new Decimal(5)).value).toBe(5)
      expect(new Decimal(5).max(new Decimal(3)).value).toBe(5)
    })
  })

  describe('toDisplayString', () => {
    it('returns integer without decimals', () => {
      expect(new Decimal(42).toDisplayString()).toBe('42')
    })

    it('returns float with 2 decimal places by default', () => {
      expect(new Decimal(3.14159).toDisplayString()).toBe('3.14')
    })

    it('respects custom decimal places', () => {
      expect(new Decimal(3.14159).toDisplayString(4)).toBe('3.1416')
    })
  })

  describe('toString', () => {
    it('converts to string', () => {
      expect(new Decimal(42).toString()).toBe('42')
      expect(new Decimal(3.14).toString()).toBe('3.14')
    })
  })
})
