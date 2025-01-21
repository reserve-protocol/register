export interface Range {
  spot: bigint // D27{1} spot
  low: bigint // D27{1} low
  high: bigint // D27{1} high
}

export interface Prices {
  start: bigint // D27{1} start price
  end: bigint // D27{1} end price
}

// IFolio.Trade interface minus id field
export interface Trade {
  sell: string
  buy: string
  sellLimit: Range // D27{sellTok/share} spot est for min ratio of sell token to shares allowed, inclusive
  buyLimit: Range // D27{buyTok/share} spot est for max ratio of buy token to shares allowed, exclusive
  prices: Prices
}
