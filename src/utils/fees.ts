// Index DTF fee-recipient percentages come from the contract as shares of the
// NON-platform revenue and sum to 100%. To display each recipient's share of
// TOTAL revenue we divide by PERCENT_ADJUST = 100 / (100 - platformFee).
//
// That adjustment is only meaningful for a finite fee in [0, 100). At exactly
// 100 the divisor is 0 (→ Infinity → every share collapses to 0%/NaN%); above
// 100 it goes negative; non-finite is an invalid registry read. In every such
// case the split is NOT displayable — callers must render an explicit
// "Unavailable" state, never fabricate a recipient allocation (B2 / CXR-063-I1).
// (Clamping the adjustment to 1 was rejected: it shows the raw non-platform
// split alongside a "Platform 100%" label → a card that sums to ~200%.)
export const isDisplayablePlatformFee = (platformFee: number): boolean =>
  Number.isFinite(platformFee) && platformFee >= 0 && platformFee < 100

// Divide a recipient's contract percentage (share of the non-platform revenue)
// by this to get its share of TOTAL revenue. Only call with a displayable fee
// (guard on isDisplayablePlatformFee first) — otherwise it is non-finite.
export const getFeePercentAdjust = (platformFee: number): number =>
  100 / (100 - platformFee)
