import { describe, expect, it } from 'vitest'
import {
  hasSizingDrift,
  isPriceSnapshotStale,
  PRICE_MAX_AGE_MS,
} from '../utils/launch-readiness'

const page = {
  supply: 1_000n,
  currentAssets: { '0xa': 10n, '0xb': 20n },
  auctionLength: 1_800n,
}

describe('hasSizingDrift', () => {
  it('lets the launch through when the live read matches what the page sized the auction with', () => {
    expect(hasSizingDrift(page, { ...page, currentAssets: { '0xb': 20n, '0xa': 10n } })).toBe(false)
  })

  it.each([
    ['supply moved (mint or redeem)', { supply: 1_001n }],
    ['a basket balance moved (late bid)', { currentAssets: { '0xa': 9n, '0xb': 20n } }],
    ['a token entered the basket', { currentAssets: { ...page.currentAssets, '0xc': 1n } }],
    ['governance changed the v6 max auction length', { auctionLength: 3_600n }],
  ])('blocks when %s', (_, change) => {
    expect(hasSizingDrift(page, { ...page, ...change })).toBe(true)
  })
})

describe('isPriceSnapshotStale', () => {
  const now = 1_000_000

  it('accepts prices fetched within the window', () => {
    expect(isPriceSnapshotStale(now - PRICE_MAX_AGE_MS, now)).toBe(false)
  })

  it('rejects prices older than the window or never fetched', () => {
    expect(isPriceSnapshotStale(now - PRICE_MAX_AGE_MS - 1, now)).toBe(true)
    expect(isPriceSnapshotStale(0, now)).toBe(true)
  })
})
