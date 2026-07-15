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

  it('treats a missing chain bucket as 0 contribution (no throw)', () => {
    expect(() => sumUnlistedRTokenCount({}, [ChainId.Mainnet])).not.toThrow()
    // Missing bucket → 0 total − listed count.
    expect(sumUnlistedRTokenCount({}, [ChainId.Mainnet])).toBe(-listed)
  })

  it('treats a missing protocol as 0 (no throw)', () => {
    expect(() =>
      sumUnlistedRTokenCount({ [ChainId.Mainnet]: {} }, [ChainId.Mainnet])
    ).not.toThrow()
    expect(
      sumUnlistedRTokenCount({ [ChainId.Mainnet]: { protocol: null } }, [
        ChainId.Mainnet,
      ])
    ).toBe(-listed)
  })

  it('returns 0 for undefined data', () => {
    expect(sumUnlistedRTokenCount(undefined, [ChainId.Mainnet])).toBe(0)
  })
})
