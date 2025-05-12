export interface BasketRange {
  spot: bigint // D27{tok/share}
  low: bigint // D27{tok/share}
  high: bigint // D27{tok/share}
}

export interface Prices {
  low: bigint // D27{USD/tok}
  high: bigint // D27{USD/tok}
}

export interface Auction {
  sell: string
  buy: string
  sellLimit: bigint // D27{sellTok/share}
  buyLimit: bigint // D27{buyTok/share}
  startPrice: bigint // D27{buyTok/sellTok}
  endPrice: bigint // D27{buyTok/sellTok}
}
