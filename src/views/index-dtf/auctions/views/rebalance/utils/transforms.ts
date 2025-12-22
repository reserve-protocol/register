import { FolioVersion, PriceControl } from '@reserve-protocol/dtf-rebalance-lib'
import { Rebalance as RebalanceV4 } from '@reserve-protocol/dtf-rebalance-lib/dist/4.0.0/types'
import { Rebalance as RebalanceV5 } from '@reserve-protocol/dtf-rebalance-lib/dist/types'

// -------------------------------------------------------------------
// Version Detection
// -------------------------------------------------------------------

/**
 * Convert version string to FolioVersion enum
 * v5.x.x → V5, everything else → V4
 */
export function getFolioVersion(versionString: string): FolioVersion {
  return versionString.startsWith('5') ? FolioVersion.V5 : FolioVersion.V4
}

// -------------------------------------------------------------------
// Contract Response → Library Type Transformations
// -------------------------------------------------------------------

/**
 * Transform v4 getRebalance() contract response to library RebalanceV4 type
 *
 * v4 returns tuple: [nonce, tokens[], weights[], initialPrices[], inRebalance[],
 *                    limits, startedAt, restrictedUntil, availableUntil, priceControl]
 */
export function transformV4Rebalance(raw: readonly unknown[]): RebalanceV4 {
  return {
    nonce: raw[0] as bigint,
    tokens: raw[1] as string[],
    weights: raw[2] as Array<{ low: bigint; spot: bigint; high: bigint }>,
    initialPrices: raw[3] as Array<{ low: bigint; high: bigint }>,
    inRebalance: raw[4] as boolean[],
    limits: raw[5] as { low: bigint; spot: bigint; high: bigint },
    startedAt: raw[6] as bigint,
    restrictedUntil: raw[7] as bigint,
    availableUntil: raw[8] as bigint,
    priceControl: raw[9] as PriceControl,
  }
}

/**
 * Transform v5 getRebalance() contract response to library RebalanceV5 type
 *
 * v5 returns tuple: [nonce, priceControl, tokens[], limits, timestamps, bidsEnabled]
 * where tokens[] is TokenRebalanceParams[] with nested weight/price/maxAuctionSize/inRebalance
 */
export function transformV5Rebalance(raw: readonly unknown[]): RebalanceV5 {
  const tokenParams = raw[2] as Array<{
    token: string
    weight: { low: bigint; spot: bigint; high: bigint }
    price: { low: bigint; high: bigint }
    maxAuctionSize: bigint
    inRebalance: boolean
  }>

  const timestamps = raw[4] as {
    startedAt: bigint
    restrictedUntil: bigint
    availableUntil: bigint
  }

  return {
    nonce: raw[0] as bigint,
    priceControl: raw[1] as PriceControl,
    tokens: tokenParams.map((t) => ({
      token: t.token,
      weight: { low: t.weight.low, spot: t.weight.spot, high: t.weight.high },
      price: { low: t.price.low, high: t.price.high },
      maxAuctionSize: t.maxAuctionSize,
      inRebalance: t.inRebalance,
    })),
    limits: raw[3] as { low: bigint; spot: bigint; high: bigint },
    timestamps: {
      startedAt: timestamps.startedAt,
      restrictedUntil: timestamps.restrictedUntil,
      availableUntil: timestamps.availableUntil,
    },
  }
}

// -------------------------------------------------------------------
// Unified Accessors (version-agnostic helpers)
// -------------------------------------------------------------------

/** Get token addresses from either v4 or v5 rebalance */
export function getRebalanceTokens(
  rebalance: RebalanceV4 | RebalanceV5,
  version: FolioVersion
): string[] {
  if (version === FolioVersion.V5) {
    return (rebalance as RebalanceV5).tokens.map((t) => t.token)
  }
  return (rebalance as RebalanceV4).tokens
}

/** Get weights from either v4 or v5 rebalance */
export function getRebalanceWeights(
  rebalance: RebalanceV4 | RebalanceV5,
  version: FolioVersion
): Array<{ low: bigint; spot: bigint; high: bigint }> {
  if (version === FolioVersion.V5) {
    return (rebalance as RebalanceV5).tokens.map((t) => t.weight)
  }
  return (rebalance as RebalanceV4).weights
}

/** Get prices from either v4 or v5 rebalance */
export function getRebalancePrices(
  rebalance: RebalanceV4 | RebalanceV5,
  version: FolioVersion
): Array<{ low: bigint; high: bigint }> {
  if (version === FolioVersion.V5) {
    return (rebalance as RebalanceV5).tokens.map((t) => t.price)
  }
  return (rebalance as RebalanceV4).initialPrices
}

/** Get inRebalance flags from either v4 or v5 rebalance */
export function getRebalanceInRebalance(
  rebalance: RebalanceV4 | RebalanceV5,
  version: FolioVersion
): boolean[] {
  if (version === FolioVersion.V5) {
    return (rebalance as RebalanceV5).tokens.map((t) => t.inRebalance)
  }
  return (rebalance as RebalanceV4).inRebalance
}

/** Get timestamps from either v4 or v5 rebalance */
export function getRebalanceTimestamps(
  rebalance: RebalanceV4 | RebalanceV5,
  version: FolioVersion
): { startedAt: bigint; restrictedUntil: bigint; availableUntil: bigint } {
  if (version === FolioVersion.V5) {
    return (rebalance as RebalanceV5).timestamps
  }
  const r = rebalance as RebalanceV4
  return {
    startedAt: r.startedAt,
    restrictedUntil: r.restrictedUntil,
    availableUntil: r.availableUntil,
  }
}

/**
 * Extract bidsEnabled from v5 getRebalance() raw response
 * v5 getRebalance returns: [nonce, priceControl, tokens[], limits, timestamps, bidsEnabled_]
 */
export function extractBidsEnabledFromV5(raw: readonly unknown[]): boolean {
  return raw[5] as boolean
}
