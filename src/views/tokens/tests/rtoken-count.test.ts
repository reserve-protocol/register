import { describe, expect, it } from 'vitest'
import { sumUnlistedRTokenCount } from '../components/UnlistedTokensTable'
import { LISTED_RTOKEN_ADDRESSES } from 'utils/constants'
import { ChainId } from 'utils/chains'

const listed = LISTED_RTOKEN_ADDRESSES[ChainId.Mainnet].length

describe('sumUnlistedRTokenCount (A3)', () => {
  it('subtracts the listed set from each chain total', () => {
    const total = sumUnlistedRTokenCount(
      { [ChainId.Mainnet]: { protocol: { rTokenCount: listed + 3 } } },
      [ChainId.Mainnet]
    )
    expect(total).toBe(3)
  })

  it('clamps a per-chain contribution at 0 (never negative)', () => {
    // A stale/inconsistent count below the listed set must not go negative.
    const total = sumUnlistedRTokenCount(
      { [ChainId.Mainnet]: { protocol: { rTokenCount: 0 } } },
      [ChainId.Mainnet]
    )
    expect(total).toBe(0)
  })

  it('skips a missing bucket (contributes 0, not a negative)', () => {
    expect(() => sumUnlistedRTokenCount({}, [ChainId.Mainnet])).not.toThrow()
    expect(sumUnlistedRTokenCount({}, [ChainId.Mainnet])).toBe(0)
  })

  it('skips a missing protocol (contributes 0)', () => {
    expect(
      sumUnlistedRTokenCount({ [ChainId.Mainnet]: {} }, [ChainId.Mainnet])
    ).toBe(0)
    expect(
      sumUnlistedRTokenCount({ [ChainId.Mainnet]: { protocol: null } }, [
        ChainId.Mainnet,
      ])
    ).toBe(0)
  })

  it('skips a non-numeric string count (NaN-safe), keeping healthy chains', () => {
    // GraphQL permits a string here — Number('bad') = NaN must not poison the sum.
    const total = sumUnlistedRTokenCount(
      {
        [ChainId.Mainnet]: { protocol: { rTokenCount: 'bad' } },
        [ChainId.Base]: { protocol: { rTokenCount: LISTED_RTOKEN_ADDRESSES[ChainId.Base].length + 2 } },
      },
      [ChainId.Mainnet, ChainId.Base]
    )
    expect(total).toBe(2)
  })

  it('returns 0 for undefined data', () => {
    expect(sumUnlistedRTokenCount(undefined, [ChainId.Mainnet])).toBe(0)
  })
})
