import { getChartReferenceTimestamp } from '@/utils/chart-reference-date'
import { mapCandles } from '@/views/index-dtf/overview/components/charts/use-candlestick-data'
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
export const overviewCandles = mapCandles(candleCapture.response)
