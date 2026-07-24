export const mapToAssets = (
  assets: readonly `0x${string}`[],
  amounts: readonly bigint[]
): Record<string, bigint> => {
  return assets.reduce(
    (acc, asset, index) => {
      acc[asset.toLowerCase()] = amounts[index]
      return acc
    },
    {} as Record<string, bigint>
  )
}

// Background polling keys off this — a missing/NaN window reads as not-ongoing so polling fails toward off, never on.
export const isRebalanceOngoing = (
  availableUntil: string | undefined,
  nowSeconds: number
): boolean =>
  availableUntil !== undefined && Number(availableUntil) >= nowSeconds
