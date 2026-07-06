export const WEEK_IN_SECONDS = 604_800

export const WEEKLY_DOWNSAMPLE_THRESHOLD = 400

// The API only serves 5m/1h/1d granularity, so display densities like 15m,
// 6h or 1w are produced client-side: keep the last point of each bucket, plus
// always the first point (chart domain start) and the last one (the live
// "now" point appended by use-dtf-price-history).
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
