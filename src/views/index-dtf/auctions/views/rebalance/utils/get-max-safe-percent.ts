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

// `computeSizes(percent)` returns the USD leg size per token address (lowercase)
// for an auction launched at that percent, or null if the SDK can't price it.
export const getMaxSafeRebalancePercent = (
  computeSizes: (percent: number) => SizesByAddress | null,
  ondoLimits: Record<string, OndoLimit>
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

  // Leg size is monotonic in percent, so binary-search the highest integer
  // percent that fits. If none fits (an asset is over its cap even at the
  // minimum), best stays at MIN_PERCENT — the slider still allows it.
  let lo = MIN_PERCENT
  let hi = 100
  let best = MIN_PERCENT
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
