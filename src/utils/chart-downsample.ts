export const FIFTEEN_MINUTES_IN_SECONDS = 900
export const SIX_HOURS_IN_SECONDS = 21_600
export const WEEK_IN_SECONDS = 604_800

// Max points before a daily series drops to weekly. Also read as days: a
// daily series only exceeds 400 points when its span exceeds ~400 days.
export const WEEKLY_DOWNSAMPLE_THRESHOLD = 400

// The historical API only serves 5m/1h/1d granularity, so display densities
// like 15m, 6h or 1w are produced client-side: keep the last point of each
// bucket, plus always the first point (chart domain start) and the last one
// (usually a live "now" point). Series whose span the server decides (e.g.
// discover/featured) arrive already downsampled by reserve-api.
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
