// A fee outside [0, 100) has no displayable share-of-total split — callers render "Unavailable", never fabricate.
export const isDisplayablePlatformFee = (platformFee: number): boolean =>
  Number.isFinite(platformFee) && platformFee >= 0 && platformFee < 100

// Converts a contract percentage (share of NON-platform revenue) to share of total; guard with isDisplayablePlatformFee first.
export const getFeePercentAdjust = (platformFee: number): number =>
  100 / (100 - platformFee)
