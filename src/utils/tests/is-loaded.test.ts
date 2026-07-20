import { describe, expect, it } from 'vitest'
import { isLoaded } from '../index'

describe('isLoaded', () => {
  it('a real value is loaded — including 0 and empty string', () => {
    expect(isLoaded(5)).toBe(true)
    expect(isLoaded(0)).toBe(true)
    expect(isLoaded('')).toBe(true)
  })

  it('the sentinel states are not loaded', () => {
    expect(isLoaded(undefined)).toBe(false)
    expect(isLoaded('unavailable')).toBe(false)
  })
})
