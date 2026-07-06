export const FIFTEEN_MINUTES_IN_SECONDS = 900
export const SIX_HOURS_IN_SECONDS = 21_600
export const DAY_IN_SECONDS = 86_400
export const WEEK_IN_SECONDS = 604_800

// Max points before a daily series drops to weekly. Also read as days: a
// daily series only exceeds 400 points when its span exceeds ~400 days.
export const WEEKLY_DOWNSAMPLE_THRESHOLD = 400

// The API only serves 5m/1h/1d granularity, so display densities like 15m,
// 6h or 1w are produced client-side: keep the last point of each bucket, plus
// always the first point (chart domain start) and the last one (usually a
// live "now" point).
export const downsampleToBucket = <T extends { timestamp: number }>(
  points: T[],
  bucketSeconds: number
): T[] =>
  points.filter((point, i) => {
    if (i === 0 || i === points.length - 1) return true
    const bucket = Math.floor(point.timestamp / bucketSeconds)
    const nextBucket = Math.floor(points[i + 1].timestamp / bucketSeconds)
    return bucket !== nextBucket
  })

// Span → display bucket, mirroring the overview per-range policy
// (24h→15m, 7d→1h, 1m→6h, 3m..1y→1d, multi-year→1w) for series whose time
// span the server decides. Targets ~90-180 points per chart.
export const getDisplayBucket = (spanSeconds: number): number => {
  if (spanSeconds <= 2 * DAY_IN_SECONDS) return FIFTEEN_MINUTES_IN_SECONDS
  if (spanSeconds <= 7 * DAY_IN_SECONDS) return 3_600
  if (spanSeconds <= 45 * DAY_IN_SECONDS) return SIX_HOURS_IN_SECONDS
  if (spanSeconds <= WEEKLY_DOWNSAMPLE_THRESHOLD * DAY_IN_SECONDS)
    return DAY_IN_SECONDS
  return WEEK_IN_SECONDS
}

// No-op when the data is already at or coarser than the display bucket.
export const downsampleForSpan = <T extends { timestamp: number }>(
  points: T[]
): T[] => {
  if (points.length < 2) return points
  const span = points[points.length - 1].timestamp - points[0].timestamp
  return downsampleToBucket(points, getDisplayBucket(span))
}
