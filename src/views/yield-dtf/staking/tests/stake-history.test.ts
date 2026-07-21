import { describe, expect, it } from 'vitest'
import { buildStakeHistoryRows } from '../components/overview/stake-history'

describe('buildStakeHistoryRows (Z38)', () => {
  it('maps snapshots to chart rows', () => {
    const rows = buildStakeHistoryRows({
      rtoken: {
        snapshots: [{ timestamp: '1700000000', rsrStaked: 2n * 10n ** 18n }],
      },
    })
    expect(rows).toHaveLength(1)
    expect(rows[0].value).toBe(2)
  })

  it('does not throw when rtoken has no snapshots (Z38)', () => {
    // Partial subgraph response: rtoken present, snapshots missing.
    expect(() => buildStakeHistoryRows({ rtoken: {} })).not.toThrow()
    expect(buildStakeHistoryRows({ rtoken: {} })).toEqual([])
  })

  it('returns [] for an absent rtoken / undefined data', () => {
    expect(buildStakeHistoryRows({})).toEqual([])
    expect(buildStakeHistoryRows(undefined)).toEqual([])
  })
})
