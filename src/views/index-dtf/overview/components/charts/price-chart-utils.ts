const SEVEN_DAYS_SECONDS = 7 * 24 * 60 * 60

type PricePoint = {
  timestamp: number
  price: number
}

const isValidPricePoint = (point: PricePoint) =>
  Number.isFinite(point.timestamp) &&
  Number.isFinite(point.price) &&
  point.price > 0

export const calculateTrailingSevenDayChange = (
  timeseries: PricePoint[]
): number | undefined => {
  const validTimeseries = timeseries.filter(isValidPricePoint)
  const latest = validTimeseries[validTimeseries.length - 1]

  if (!latest) return undefined

  const targetTimestamp = latest.timestamp - SEVEN_DAYS_SECONDS
  const start =
    [...validTimeseries]
      .reverse()
      .find((point) => point.timestamp <= targetTimestamp) ??
    validTimeseries[0]

  if (latest.timestamp - start.timestamp < SEVEN_DAYS_SECONDS) {
    return undefined
  }

  return (latest.price - start.price) / start.price
}

export type MarketPriceInfo = {
  hasData: boolean
  latest: number | null
}

// Derives whether a DTF has any DEX market-price data and its most recent
// value. marketPrice is nullable (many DTFs have no DEX market) and the
// synthetic live point carries null, so we only count finite positive values.
export const getMarketPriceInfo = (
  timeseries: { marketPrice?: number | null }[]
): MarketPriceInfo => {
  let latest: number | null = null

  for (const point of timeseries) {
    const value = point.marketPrice
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
      latest = value
    }
  }

  return { hasData: latest !== null, latest }
}
