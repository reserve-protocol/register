import { describe, expect, it } from 'vitest'
import type { IndexDtfLatestAuction } from '@reserve-protocol/react-sdk'
import { getLaunchBlocker } from '../utils/launch-readiness'

const NOW = 1_800_000_000n
// Folio's windows: restrictedUntil and availableUntil are both exclusive.
const window = {
  nonce: 7n,
  startedAt: NOW - 3_600n,
  restrictedUntil: NOW + 600n,
  availableUntil: NOW + 3_600n,
}
const auction = (overrides: Partial<IndexDtfLatestAuction>): IndexDtfLatestAuction => ({
  auctionId: 3n,
  rebalanceNonce: 7n,
  currentRebalanceNonce: 7n,
  startTime: NOW - 100n,
  endTime: NOW + 900n,
  blockNumber: 1n,
  isActive: true,
  ...overrides,
})

describe('getLaunchBlocker', () => {
  it('blocks when the live rebalance could not be read', () => {
    expect(
      getLaunchBlocker({ mode: 'launcher', window: undefined, expectedNonce: 7n, latestAuction: null, now: NOW })
    ).toBe('live-state-unavailable')
  })

  it('blocks a send whose nonce is no longer the live rebalance nonce', () => {
    expect(
      getLaunchBlocker({ mode: 'launcher', window: { ...window, nonce: 8n }, expectedNonce: 7n, latestAuction: null, now: NOW })
    ).toBe('nonce-changed')
  })

  it('blocks at and after availableUntil (exclusive on chain)', () => {
    const closed = { ...window, availableUntil: NOW }
    expect(
      getLaunchBlocker({ mode: 'launcher', window: closed, expectedNonce: 7n, latestAuction: null, now: NOW })
    ).toBe('window-closed')
  })

  it('lets the launcher open inside the restricted window', () => {
    expect(
      getLaunchBlocker({ mode: 'launcher', window, expectedNonce: 7n, latestAuction: null, now: NOW })
    ).toBeUndefined()
  })

  it('keeps community launch closed until the live restrictedUntil', () => {
    expect(
      getLaunchBlocker({ mode: 'community', window, expectedNonce: 7n, latestAuction: null, now: NOW })
    ).toBe('restricted')
    expect(
      getLaunchBlocker({ mode: 'community', window, expectedNonce: 7n, latestAuction: null, now: window.restrictedUntil })
    ).toBeUndefined()
  })

  it('keeps community launch closed within 120 s of the rebalance start (Folio buffer)', () => {
    const fresh = { ...window, startedAt: NOW - 60n, restrictedUntil: NOW - 60n }
    expect(
      getLaunchBlocker({ mode: 'community', window: fresh, expectedNonce: 7n, latestAuction: null, now: NOW })
    ).toBe('cooldown')
  })

  it('keeps community launch closed within 120 s after the last auction of this nonce ended', () => {
    const open = { ...window, restrictedUntil: NOW - 600n }
    const justEnded = auction({ endTime: NOW - 60n })
    const longEnded = auction({ endTime: NOW - 121n })
    expect(
      getLaunchBlocker({ mode: 'community', window: open, expectedNonce: 7n, latestAuction: auction({}), now: NOW })
    ).toBe('auction-ongoing')
    expect(
      getLaunchBlocker({ mode: 'community', window: open, expectedNonce: 7n, latestAuction: justEnded, now: NOW })
    ).toBe('cooldown')
    expect(
      getLaunchBlocker({ mode: 'community', window: open, expectedNonce: 7n, latestAuction: longEnded, now: NOW })
    ).toBeUndefined()
  })

  it('on v4 (no SDK latest-auction read) only the window and nonce decide', () => {
    const open = { ...window, restrictedUntil: NOW - 600n }
    expect(
      getLaunchBlocker({ mode: 'community', window: open, expectedNonce: 7n, latestAuction: undefined, now: NOW })
    ).toBeUndefined()
    expect(
      getLaunchBlocker({ mode: 'launcher', window, expectedNonce: 7n, latestAuction: undefined, now: NOW })
    ).toBeUndefined()
  })

  it('blocks while an auction of the current nonce has not ended', () => {
    expect(
      getLaunchBlocker({ mode: 'launcher', window, expectedNonce: 7n, latestAuction: auction({}), now: NOW })
    ).toBe('auction-ongoing')
  })

  it('ignores an ended auction or one from a previous rebalance', () => {
    const ended = auction({ endTime: NOW - 1n })
    const previous = auction({ rebalanceNonce: 6n })
    expect(
      getLaunchBlocker({ mode: 'launcher', window, expectedNonce: 7n, latestAuction: ended, now: NOW })
    ).toBeUndefined()
    expect(
      getLaunchBlocker({ mode: 'launcher', window, expectedNonce: 7n, latestAuction: previous, now: NOW })
    ).toBeUndefined()
  })
})
