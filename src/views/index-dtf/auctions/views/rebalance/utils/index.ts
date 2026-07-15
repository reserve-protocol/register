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

// A rebalance is "ongoing" until its availableUntil window closes. Background
// polling (auctions history, liquidity) must stop once it does, otherwise a
// visitor parked on a completed/historical rebalance keeps hitting the subgraph
// and liquidity API forever (Z29). A missing/NaN window reads as not-ongoing so
// polling fails toward off, never on.
export const isRebalanceOngoing = (
  availableUntil: string | undefined,
  nowSeconds: number
): boolean =>
  availableUntil !== undefined && Number(availableUntil) >= nowSeconds
