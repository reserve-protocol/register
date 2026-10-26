import { describe, expect, it } from 'vitest'
import { getBasketPortion } from '../utils'

const D27 = 10n ** 27n

describe('getBasketPortion', () => {
  it('returns the share of the basket a limit represents', () => {
    // 2.5 tok/share * $2/tok / $10/share = 50%
    const [portion, raw] = getBasketPortion((D27 * 5n) / 2n, 18n, 2, 10)
    expect(portion).toBe(0.5)
    expect(raw).toBe(D27 / 2n)
  })

  it('returns zero instead of throwing when the share price is unknown', () => {
    expect(getBasketPortion(D27, 18n, 2, 0)).toEqual([0, 0n])
  })
})
