export type ChartCandle = {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  highLow: [number, number]
}

export const locateCandleBucket = (
  candles: ChartCandle[],
  timestamp: number,
  intervalSeconds: number
): { index: number; fraction: number } | null => {
  const index = candles.findIndex(
    (c) => timestamp >= c.timestamp && timestamp < c.timestamp + intervalSeconds
  )
  if (index === -1) return null
  return {
    index,
    fraction: (timestamp - candles[index].timestamp) / intervalSeconds,
  }
}

export const getCandleYDomain = (
  candles: ChartCandle[],
  padding = 0.05
): [number, number] | ['auto', 'auto'] => {
  if (candles.length === 0) return ['auto', 'auto']

  let min = Infinity
  let max = -Infinity
  for (const c of candles) {
    if (c.low < min) min = c.low
    if (c.high > max) max = c.high
  }

  const span = max - min
  const pad = span > 0 ? span * padding : Math.abs(max) * padding || 1

  return [min - pad, max + pad]
}
