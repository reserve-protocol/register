import { describe, expect, it } from 'vitest'
import { buildExchangeRateRows } from '../components/overview/exchange-rate'

describe('buildExchangeRateRows (Z38)', () => {
  it('maps snapshots to chart rows', () => {
    const rows = buildExchangeRateRows(
      {
        rtoken: {
          snapshots: [{ timestamp: '1700000000', rsrExchangeRate: '1.234' }],
        },
      },
      'stRSR'
    )
    expect(rows).toHaveLength(1)
    expect(rows[0].value).toBe(1.234)
    expect(rows[0].display).toContain('stRSR')
  })

  it('does not throw when rtoken has no snapshots (Z38)', () => {
    // Partial subgraph response: rtoken present, snapshots missing — the
    // pre-guard code threw here (`rtoken?.snapshots.map`), blanking the
    // default StakingMetrics tab.
    expect(() => buildExchangeRateRows({ rtoken: {} }, 'stRSR')).not.toThrow()
    expect(buildExchangeRateRows({ rtoken: {} }, 'stRSR')).toEqual([])
  })

  it('returns [] for an absent rtoken / undefined data', () => {
    expect(buildExchangeRateRows({}, 'stRSR')).toEqual([])
    expect(buildExchangeRateRows(undefined, 'stRSR')).toEqual([])
  })
})
