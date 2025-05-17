export interface RebalanceLimits {
  low: bigint // D18{BU/share}
  spot: bigint // D18{BU/share}
  high: bigint // D18{BU/share}
}

export interface WeightRange {
  low: bigint // D27{tok/BU}
  spot: bigint // D27{tok/BU}
  high: bigint // D27{tok/BU}
}

export interface PriceRange {
  low: bigint // D27{USD/tok}
  high: bigint // D27{USD/tok}
}

export interface Rebalance {
  nonce: bigint
  tokens: string[]
  weights: WeightRange[]
  initialPrices: PriceRange[]
  inRebalance: boolean[]
  limits: RebalanceLimits
  startedAt: bigint
  restrictedUntil: bigint
  availableUntil: bigint
  priceControl: boolean
}
