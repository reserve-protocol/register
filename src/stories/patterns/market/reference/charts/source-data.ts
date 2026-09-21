import { getChartReferenceTimestamp } from '@/utils/chart-reference-date'
import candleCapture from './fixtures/photon-candles-ytd-7d.json'
import photon from './fixtures/photon-source.json'

export { candleCapture, photon }
export const homePoints = photon.homePoints.map(([timestamp, value]) => ({
  timestamp,
  value,
}))
export const overviewPoints = photon.overviewPoints.map(
  ([timestamp, price]) => ({ timestamp, price })
)
export const launchTimestamp = getChartReferenceTimestamp(
  photon.address,
  photon.chainId,
  photon.createdAt
)
export const overviewCandles = candleCapture.response.candles
  .filter(
    ({ open, high, low, close }) =>
      open > 0 && high > 0 && low > 0 && close > 0 && high >= low
  )
  .map(({ timestamp, open, high, low, close }) => ({
    timestamp,
    open,
    high,
    low,
    close,
    highLow: [low, high] as [number, number],
  }))
