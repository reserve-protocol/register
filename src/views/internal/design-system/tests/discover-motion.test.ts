import { describe, expect, it } from 'vitest'
import { discoverScrollDistance } from '../table-family/discover-asset-strip'

describe('Discover source motion contract', () => {
  it('preserves the 1.2-second acceleration and 72px/s cruising speed', () => {
    expect(discoverScrollDistance(0)).toBe(0)
    expect(discoverScrollDistance(0.6)).toBeCloseTo(3.6)
    expect(discoverScrollDistance(1.2)).toBeCloseTo(28.8)
    expect(discoverScrollDistance(2.2)).toBeCloseTo(100.8)
    expect(discoverScrollDistance(3.2)).toBeCloseTo(172.8)
  })
})
