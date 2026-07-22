import { describe, expect, it } from 'vitest'
import { computeMaxTokenIn } from '../context/max-token-in'

describe('computeMaxTokenIn', () => {
  it('divides the USD max by the input-token price', () => {
    // tokenOut $1 * 1000 available = $1000 USD max; input token at $2 → 500 units.
    expect(computeMaxTokenIn(1, 1000, 2)).toBe(500)
  })

  it('returns null (unavailable) when the input price is missing/0', () => {
    // The regression: dividing $1000 by a fabricated 1 would return 1000 tokens.
    expect(computeMaxTokenIn(1, 1000, undefined)).toBeNull()
    expect(computeMaxTokenIn(1, 1000, 0)).toBeNull()
    expect(computeMaxTokenIn(1, 1000, NaN)).toBeNull()
  })

  it('defaults missing out-price / availability to 0 USD', () => {
    expect(computeMaxTokenIn(undefined, undefined, 2)).toBe(0)
  })
})
