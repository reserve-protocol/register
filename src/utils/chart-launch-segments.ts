export type LaunchSegmentPoint = {
  timestamp: number
  [key: string]: number | undefined
}

export type LaunchSegmentResult<T extends LaunchSegmentPoint> = {
  data: Array<T & { preLaunchValue?: number; postLaunchValue?: number }>
  shouldSplit: boolean
}

export const getLaunchSegmentData = <T extends LaunchSegmentPoint>(
  chartData: T[],
  valueKey: keyof T & string,
  launchTimestamp?: number
): LaunchSegmentResult<T> => {
  if (
    launchTimestamp === undefined ||
    chartData.length < 2 ||
    launchTimestamp <= chartData[0].timestamp ||
    launchTimestamp >= chartData[chartData.length - 1].timestamp
  ) {
    return { data: chartData, shouldSplit: false }
  }

  const data = [...chartData]
  const hasLaunchPoint = data.some(
    ({ timestamp }) => timestamp === launchTimestamp
  )

  if (!hasLaunchPoint) {
    const insertIndex = data.findIndex(
      ({ timestamp }) => timestamp > launchTimestamp
    )
    const previous = data[insertIndex - 1]
    const next = data[insertIndex]
    const previousValue = previous?.[valueKey]
    const nextValue = next?.[valueKey]

    if (
      !previous ||
      !next ||
      previousValue === undefined ||
      nextValue === undefined ||
      next.timestamp === previous.timestamp
    ) {
      return { data: chartData, shouldSplit: false }
    }

    const launchProgress =
      (launchTimestamp - previous.timestamp) /
      (next.timestamp - previous.timestamp)
    const launchValue =
      previousValue + (nextValue - previousValue) * launchProgress

    data.splice(insertIndex, 0, {
      ...previous,
      timestamp: launchTimestamp,
      [valueKey]: launchValue,
    } as T)
  }

  return {
    shouldSplit: true,
    data: data.map((point) => {
      const value = point[valueKey]

      return {
        ...point,
        preLaunchValue:
          value !== undefined && point.timestamp <= launchTimestamp
            ? value
            : undefined,
        postLaunchValue:
          value !== undefined && point.timestamp >= launchTimestamp
            ? value
            : undefined,
      }
    }),
  }
}
