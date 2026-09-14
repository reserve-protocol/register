import { getChartReferenceTimestamp } from '@/utils/chart-reference-date'
import photon from './fixtures/photon-source.json'

export { photon }
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
