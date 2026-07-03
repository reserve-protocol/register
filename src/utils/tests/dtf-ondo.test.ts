import { describe, expect, it } from 'vitest'
import { getMinOndoCapacityUsd, OndoAssetLimit } from '../dtf-ondo'

const asset = (capacityUsd?: number): OndoAssetLimit => ({
  address: '0x0000000000000000000000000000000000000001',
  symbol: 'TESTon',
  name: 'Test (Ondo Tokenized)',
  sessionLimits: null,
  capacityUsd,
})

describe('getMinOndoCapacityUsd', () => {
  it('returns undefined for an empty basket', () => {
    expect(getMinOndoCapacityUsd([])).toBeUndefined()
  })

  it('returns undefined when no asset reports a cap', () => {
    expect(getMinOndoCapacityUsd([asset(), asset()])).toBeUndefined()
  })

  it('returns the minimum of the reported caps, skipping unreported ones', () => {
    expect(
      getMinOndoCapacityUsd([asset(660_000), asset(), asset(200_000)])
    ).toBe(200_000)
  })

  it('treats a zero cap (paused asset) as the minimum', () => {
    expect(getMinOndoCapacityUsd([asset(240_000), asset(0)])).toBe(0)
  })
})
