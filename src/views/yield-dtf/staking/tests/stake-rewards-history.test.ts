import { describe, expect, it } from 'vitest'
import { buildStakeRewardsRows } from '../components/overview/stake-rewards-history'

describe('buildStakeRewardsRows (Z38)', () => {
  it('maps snapshots to chart rows', () => {
    const rows = buildStakeRewardsRows({
      rtoken: {
        snapshots: [{ timestamp: '1700000000', cumulativeRSRRevenueUSD: 5 }],
      },
    })
    expect(rows).toHaveLength(1)
    expect(rows[0].value).toBe(5)
  })

  it('does not throw when rtoken has no snapshots (Z38)', () => {
    // Partial subgraph response: rtoken present, snapshots missing.
    expect(() => buildStakeRewardsRows({ rtoken: {} })).not.toThrow()
    expect(buildStakeRewardsRows({ rtoken: {} })).toEqual([])
  })

  it('returns [] for an absent rtoken / undefined data', () => {
    expect(buildStakeRewardsRows({})).toEqual([])
    expect(buildStakeRewardsRows(undefined)).toEqual([])
  })
})
