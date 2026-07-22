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
  timeseries: readonly PricePoint[]
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
