import type { IndexDtfLatestAuction } from '@reserve-protocol/react-sdk'

export type LaunchMode = 'launcher' | 'community'

export type LaunchBlocker =
  | 'live-state-unavailable'
  | 'nonce-changed'
  | 'window-closed'
  | 'restricted'
  | 'cooldown'
  | 'auction-ongoing'
  | 'state-refreshed'

export type RebalanceWindow = {
  nonce: bigint
  startedAt: bigint
  restrictedUntil: bigint
  availableUntil: bigint
}

// Folio's RESTRICTED_AUCTION_BUFFER: openAuctionUnrestricted reverts this close to the rebalance start or the last auction's end.
const UNRESTRICTED_AUCTION_BUFFER = 120n

// "Ongoing" is wider than the SDK's biddable isActive: warm-up included, an unended auction of the current nonce blocks.
export const isLatestAuctionOngoing = (
  latest: IndexDtfLatestAuction | null,
  now: bigint
): boolean =>
  !!latest &&
  latest.rebalanceNonce === latest.currentRebalanceNonce &&
  now <= latest.endTime

// Folio's openAuction/openAuctionUnrestricted guards, checked against the live rebalance right before a send.
export const getLaunchBlocker = ({
  mode,
  window,
  expectedNonce,
  latestAuction,
  now,
}: {
  mode: LaunchMode
  window: RebalanceWindow | undefined
  expectedNonce: bigint
  // undefined on v4, which has no SDK latest-auction read.
  latestAuction: IndexDtfLatestAuction | null | undefined
  now: bigint
}): LaunchBlocker | undefined => {
  if (!window) return 'live-state-unavailable'
  if (window.nonce !== expectedNonce) return 'nonce-changed'
  if (now >= window.availableUntil) return 'window-closed'
  if (mode === 'launcher') {
    if (latestAuction !== undefined && isLatestAuctionOngoing(latestAuction, now))
      return 'auction-ongoing'
    return undefined
  }

  if (now < window.restrictedUntil) return 'restricted'
  if (now < window.startedAt + UNRESTRICTED_AUCTION_BUFFER) return 'cooldown'
  if (latestAuction === undefined) return undefined
  if (isLatestAuctionOngoing(latestAuction, now)) return 'auction-ongoing'
  if (isLatestAuctionOngoing(latestAuction, now - UNRESTRICTED_AUCTION_BUFFER))
    return 'cooldown'
  return undefined
}

export type AuctionSizing = {
  supply: bigint
  currentAssets: Record<string, bigint>
  auctionLength?: bigint
}

// The launcher sizes openAuction from the page's reads; a re-read that moved any of them needs a fresh render first.
export const hasSizingDrift = (page: AuctionSizing, live: AuctionSizing) => {
  if (page.supply !== live.supply) return true
  if (page.auctionLength !== live.auctionLength) return true
  const pageTokens = Object.keys(page.currentAssets)
  if (pageTokens.length !== Object.keys(live.currentAssets).length) return true
  return pageTokens.some(
    (token) => page.currentAssets[token] !== live.currentAssets[token]
  )
}

export const PRICE_MAX_AGE_MS = 60_000

export const isPriceSnapshotStale = (updatedAt: number, now: number) =>
  updatedAt === 0 || now - updatedAt > PRICE_MAX_AGE_MS
