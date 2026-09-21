import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import {
  getLaunchMarkerLeftPercent,
  getPerformancePlotGeometry,
  PerformanceLatestPointMarker,
} from '../performance-chart-presentation'

const points = [
  { timestamp: 0, value: 10 },
  { timestamp: 100, value: 20 },
]

describe('feature chart presentation geometry', () => {
  it('keeps the omitted-marker launch position independent of measured size', () => {
    expect(getLaunchMarkerLeftPercent(points, 50)).toBe(50)
    expect(getLaunchMarkerLeftPercent(points, -1)).toBeUndefined()
  })

  it('keeps the unpadded default coordinate model', () => {
    const geometry = getPerformancePlotGeometry({
      height: 208,
      horizontalPadding: 0,
      launchTimestamp: 50,
      points,
      width: 340,
      yDomain: [8.8, 21.2],
    })

    expect(geometry.endpoint?.x).toBe(340)
    expect(geometry.launchLeftPercent).toBe(50)
  })

  it('moves the line endpoint and launch marker through one padded scale', () => {
    const geometry = getPerformancePlotGeometry({
      height: 208,
      horizontalPadding: 4,
      launchTimestamp: 50,
      points,
      width: 340,
      yDomain: [8.8, 21.2],
    })

    expect(geometry.endpoint?.x).toBe(336)
    expect(geometry.launchLeftPercent).toBe(50)
    expect(geometry.endpoint?.y).toBeGreaterThanOrEqual(4)
    expect(geometry.endpoint?.y).toBeLessThanOrEqual(204)
  })

  it('uses global marker coordinates for the line and host gradients', () => {
    const markup = renderToStaticMarkup(
      <PerformanceLatestPointMarker
        direction="positive"
        endpoint={{ x: 336, y: 30 }}
        height={208}
        ringGradient={{
          id: 'host',
          from: 'hsl(var(--secondary))',
          to: 'hsl(var(--card))',
          top: -160,
          bottom: 208,
        }}
        strokeGradientCoordinates={{ top: 25, bottom: 180 }}
        width={340}
      />
    )

    expect(markup).toContain('cx="336"')
    expect(markup).toContain('cy="30"')
    expect(markup).toContain('r="3"')
    expect(markup).toContain('stroke="url(#host)"')
    expect(markup).toContain('stroke-width="2"')
    expect(markup).not.toContain('transform=')
  })
})
