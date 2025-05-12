export interface BasketRange {
  spot: bigint // D27{buyTok/sellTok} spot
  low: bigint // D27{buyTok/sellTok} low
  high: bigint // D27{buyTok/sellTok} high
}

export interface Prices {
  start: bigint // D27{buyTok/sellTok} start price
  end: bigint // D27{buyTok/sellTok} end price
}

// IFolio.Auction interface minus id field
export interface Auction {
  sell: string
  buy: string
  sellLimit: BasketRange // D27{sellTok/share} spot est for min ratio of sell token to shares allowed, inclusive
  buyLimit: BasketRange // D27{buyTok/share} spot est for max ratio of buy token to shares allowed, exclusive
  prices: Prices
  availableRuns?: bigint | number
}
