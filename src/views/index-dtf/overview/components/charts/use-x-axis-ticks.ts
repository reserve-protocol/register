import { useMemo } from 'react'

export function useXAxisTicks(
  chartData: { timestamp: number }[],
  isMobile: boolean,
  xDomain?: readonly [number, number]
) {
  return useMemo(() => {
    if (xDomain) {
      const [start, end] = xDomain
      if (start >= end) return []

      const positions = isMobile
        ? [0.15, 0.38, 0.62, 0.85]
        : [0.05, 0.23, 0.41, 0.59, 0.77, 0.95]

      return positions.map((position) =>
        Math.round(start + (end - start) * position)
      )
    }

    if (chartData.length === 0) return []

    const mobilePositions = [0.15, 0.38, 0.62, 0.85]
    const desktopPositions = [0.05, 0.23, 0.41, 0.59, 0.77, 0.95]
    const positions = isMobile ? mobilePositions : desktopPositions

    return positions
      .map((i) => chartData[Math.floor(chartData.length * i)]?.timestamp)
      .filter(Boolean)
  }, [chartData, isMobile, xDomain])
}
