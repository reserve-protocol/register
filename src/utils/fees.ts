// A fee outside [0, 100) has no displayable share-of-total split — callers render "Unavailable", never fabricate.
export const isDisplayablePlatformFee = (platformFee: number): boolean =>
  Number.isFinite(platformFee) && platformFee >= 0 && platformFee < 100

// Converts a contract percentage (share of NON-platform revenue) to share of total; guard with isDisplayablePlatformFee first.
export const getFeePercentAdjust = (platformFee: number): number =>
  100 / (100 - platformFee)

// Folio 6.0 holders keep `selfFee` (a fraction) of the non-platform fees before the recipient tables split the rest.
export const getRecipientPercentAdjust = (platformFee: number, selfFee: number): number =>
  getFeePercentAdjust(platformFee) / (1 - selfFee)

export const getHolderSharePercent = (platformFee: number, selfFee: number): number =>
  (100 - platformFee) * selfFee
