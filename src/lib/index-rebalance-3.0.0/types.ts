export interface BasketRange {
  spot: bigint // D27{tok/share}
  low: bigint // D27{tok/share}
  high: bigint // D27{tok/share}
}

export interface Prices {
  low: bigint // D27{USD/tok}
  high: bigint // D27{USD/tok}
}
