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
  const exactLaunchPoint = data.some(
    ({ timestamp }) => timestamp === launchTimestamp
  )

  if (!exactLaunchPoint) {
    const insertIndex = data.findIndex(
      ({ timestamp }) => timestamp > launchTimestamp
    )
    const prev = data[insertIndex - 1]
    const next = data[insertIndex]
    const prevValue = prev?.[valueKey]
    const nextValue = next?.[valueKey]

    if (
      !prev ||
      !next ||
      prevValue === undefined ||
      nextValue === undefined ||
      next.timestamp === prev.timestamp
    ) {
      return { data: chartData, shouldSplit: false }
    }

    const launchProgress =
      (launchTimestamp - prev.timestamp) / (next.timestamp - prev.timestamp)
    const launchValue = prevValue + (nextValue - prevValue) * launchProgress
    const launchPoint = {
      ...prev,
      timestamp: launchTimestamp,
      [valueKey]: launchValue,
    } as T

    data.splice(insertIndex, 0, launchPoint)
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
