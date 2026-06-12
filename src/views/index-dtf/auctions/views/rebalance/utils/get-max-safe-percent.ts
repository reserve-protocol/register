import { AuctionMetrics } from '@reserve-protocol/dtf-rebalance-lib'

// Ondo tokenized equities cap the size of a single trade per account/session.
// The rebalance percent drives each token's auction leg size, so we find the
// highest percent at which every (open) Ondo leg stays within its session cap,
// leaving a buffer for the "limits may vary" disclaimer.

export const ONDO_LIMIT_BUFFER = 0.95

const MIN_PERCENT = 1

export type OndoLimit = {
  capacityUsd?: number
  tradingOpen: boolean
}

export type SizesByAddress = Record<string, number>

// An auction only trades min(surplus, deficit) — the larger side reports the
// full available amount (an ejected token's surplus is its whole position at
// any percent), so scale each side to the matched auction size to get the USD
// actually traded per token. Mirrors getAllTokensWithSizes in the liquidity
// checker.
export const getScaledLegSizes = (metrics: AuctionMetrics): SizesByAddress => {
  const surplusTotal = metrics.surplusTokenSizes.reduce((a, b) => a + b, 0)
  const deficitTotal = metrics.deficitTokenSizes.reduce((a, b) => a + b, 0)
  const auctionSize = Math.min(surplusTotal, deficitTotal)
  const sScale = surplusTotal > 0 ? auctionSize / surplusTotal : 0
  const dScale = deficitTotal > 0 ? auctionSize / deficitTotal : 0

  const sizes: SizesByAddress = {}
  metrics.surplusTokens.forEach((token, i) => {
    sizes[token.toLowerCase()] = metrics.surplusTokenSizes[i] * sScale
  })
  metrics.deficitTokens.forEach((token, i) => {
    sizes[token.toLowerCase()] = metrics.deficitTokenSizes[i] * dScale
  })
  return sizes
}

// `computeSizes(percent)` returns the USD leg size per token address (lowercase)
// for an auction launched at that percent, or null if the SDK can't price it.
// `minPercent` bounds the search from below: at or under the current relative
// progression (+1) the SDK flips to a FINAL round that trades everything, so
// callers must keep the search above that zone.
export const getMaxSafeRebalancePercent = (
  computeSizes: (percent: number) => SizesByAddress | null,
  ondoLimits: Record<string, OndoLimit>,
  minPercent = MIN_PERCENT
): number => {
  // Halted assets are skipped — we can't size against a closed market, and the
  // scope is "warn, don't cap" for those.
  const constrained = Object.entries(ondoLimits).filter(
    ([, l]) => l.tradingOpen && l.capacityUsd != null && l.capacityUsd > 0
  )
  if (constrained.length === 0) return 100

  const fits = (percent: number): boolean => {
    const sizes = computeSizes(percent)
    if (!sizes) return false
    return constrained.every(
      ([address, l]) =>
        (sizes[address] ?? 0) <= (l.capacityUsd as number) * ONDO_LIMIT_BUFFER
    )
  }

  if (fits(100)) return 100

  // Above minPercent leg size is monotonic in percent, so binary-search the
  // highest integer percent that fits. If none fits (an asset is over its cap
  // even at the minimum), best stays at minPercent — the cap is soft.
  let lo = minPercent
  let hi = 100
  let best = minPercent
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2)
    if (fits(mid)) {
      best = mid
      lo = mid + 1
    } else {
      hi = mid - 1
    }
  }
  return best
}

export type ExceededOndoLeg = {
  address: string
  symbol: string
  sizeUsd: number
  capacityUsd: number
}

// Open Ondo legs whose size at the current percent is over the buffered soft cap.
// Drives the debug warning (the cap is soft — the slider can still surpass it).
export const getExceededOndoLegs = (
  sizes: SizesByAddress,
  ondoLimits: Record<string, OndoLimit & { symbol: string }>
): ExceededOndoLeg[] =>
  Object.entries(ondoLimits)
    .filter(
      ([address, l]) =>
        l.tradingOpen &&
        l.capacityUsd != null &&
        l.capacityUsd > 0 &&
        (sizes[address] ?? 0) > l.capacityUsd * ONDO_LIMIT_BUFFER
    )
    .map(([address, l]) => ({
      address,
      symbol: l.symbol,
      sizeUsd: sizes[address] ?? 0,
      capacityUsd: l.capacityUsd as number,
    }))
