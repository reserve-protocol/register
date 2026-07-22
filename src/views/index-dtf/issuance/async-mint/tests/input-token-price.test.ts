import { describe, expect, it } from 'vitest'
import { resolveInputTokenPrice } from '../steps/input-token-price'

describe('resolveInputTokenPrice', () => {
  it('resolves a real positive price as available', () => {
    expect(resolveInputTokenPrice([{ price: 2000 }])).toEqual({
      price: 2000,
      available: true,
    })
  })

  it('is unavailable (never $1) when the price is missing', () => {
    // The fabricated `?? 1` regression: no price → unavailable, price 0.
    expect(resolveInputTokenPrice(undefined)).toEqual({
      price: 0,
      available: false,
    })
    expect(resolveInputTokenPrice([])).toEqual({ price: 0, available: false })
    expect(resolveInputTokenPrice([{}])).toEqual({ price: 0, available: false })
  })

  it('rejects zero and non-finite prices', () => {
    expect(resolveInputTokenPrice([{ price: 0 }]).available).toBe(false)
    expect(resolveInputTokenPrice([{ price: NaN }]).available).toBe(false)
    expect(resolveInputTokenPrice([{ price: Infinity }]).available).toBe(false)
  })
})
