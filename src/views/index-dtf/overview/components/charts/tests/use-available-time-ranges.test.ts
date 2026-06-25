import { describe, expect, it } from 'vitest'
import { getAvailableTimeRanges } from '../use-available-time-ranges'

const DTF_TS = 1_600_000_000

describe('getAvailableTimeRanges', () => {
  it('returns null when the DTF timestamp is unknown', () => {
    expect(
      getAvailableTimeRanges({
        dtfTimestamp: undefined,
        firstHistoryTimestamp: undefined,
        isYieldMode: false,
      })
    ).toBeNull()
  })

  it('keeps every range while history availability is unresolved', () => {
    const ranges = getAvailableTimeRanges({
      dtfTimestamp: DTF_TS,
      firstHistoryTimestamp: undefined,
      isYieldMode: false,
    })
    expect(ranges?.map((r) => r.value)).toEqual([
      '24h',
      '7d',
      '1m',
      '3m',
      'ytd',
      '1y',
      'all',
    ])
  })

  it('drops 24h in yield mode', () => {
    const ranges = getAvailableTimeRanges({
      dtfTimestamp: DTF_TS,
      firstHistoryTimestamp: undefined,
      isYieldMode: true,
    })
    expect(ranges?.some((r) => r.value === '24h')).toBe(false)
    expect(ranges?.some((r) => r.value === 'all')).toBe(true)
  })

  it('leaves only "all" when there is no price history', () => {
    const ranges = getAvailableTimeRanges({
      dtfTimestamp: DTF_TS,
      firstHistoryTimestamp: null,
      isYieldMode: false,
    })
    expect(ranges?.map((r) => r.value)).toEqual(['all'])
  })

  it('hides ranges whose window starts before the first available data point', () => {
    // History only goes back ~2 days. A range is available only if its window
    // starts at/after the first data point (i.e. data covers the whole window).
    const now = Math.floor(Date.now() / 1_000)
    const firstHistoryTimestamp = now - 2 * 86_400

    const ranges = getAvailableTimeRanges({
      dtfTimestamp: DTF_TS,
      firstHistoryTimestamp,
      isYieldMode: false,
    })
    const values = ranges?.map((r) => r.value) ?? []

    // 24h window (starts ~1 day ago) is fully covered by the history.
    expect(values).toContain('24h')
    // 'all' is always available.
    expect(values).toContain('all')
    // 7d / 1y windows begin before history started -> excluded.
    expect(values).not.toContain('7d')
    expect(values).not.toContain('1y')
  })
})
