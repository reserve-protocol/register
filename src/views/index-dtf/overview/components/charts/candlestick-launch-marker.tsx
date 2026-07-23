import { PriceChartLaunchMarker } from './price-chart-launch-marker'
import { ChartCandle, locateCandleBucket } from './use-candlestick-data'

type BandScale = ((value: number) => number | undefined) & {
  bandwidth?: () => number
}

// Chart internals recharts injects into <Customized> components.
export type CandlestickCustomizedProps = {
  offset?: { top: number; height: number; width?: number }
  width?: number
  xAxisMap?: Record<string | number, { scale?: BandScale }>
}

// The category axis' band scale only resolves exact bucket timestamps, so the
// shared marker can't scale the launch timestamp itself: locate the bucket
// containing it, offset within the band, and hand the precomputed x to
// PriceChartLaunchMarker through a synthetic single-value scale.
export const CandlestickLaunchMarker = ({
  candles,
  intervalSeconds,
  launchTimestamp,
  useLaunchLabel = false,
  offset,
  width,
  xAxisMap,
}: CandlestickCustomizedProps & {
  candles: ChartCandle[]
  intervalSeconds: number
  launchTimestamp?: number
  useLaunchLabel?: boolean
}) => {
  const scale = xAxisMap?.[0]?.scale
  if (launchTimestamp === undefined || !scale) return null

  const bucket = locateCandleBucket(candles, launchTimestamp, intervalSeconds)
  if (!bucket) return null

  const bandStart = scale(candles[bucket.index].timestamp)
  if (bandStart === undefined) return null
  const markerX = bandStart + bucket.fraction * (scale.bandwidth?.() ?? 0)

  return (
    <PriceChartLaunchMarker
      launchTimestamp={launchTimestamp}
      offset={offset}
      useLaunchLabel={useLaunchLabel}
      visible
      width={width}
      xAxisMap={{ 0: { scale: () => markerX } }}
    />
  )
}
