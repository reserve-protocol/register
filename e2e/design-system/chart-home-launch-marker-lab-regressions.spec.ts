import { currentCapture, expect, test } from './current-rebalance-helpers'
import { readFileSync } from 'node:fs'

const photonSource = JSON.parse(
  readFileSync(
    new URL(
      '../../src/views/internal/design-system/charts/fixtures/photon-source.json',
      import.meta.url
    ),
    'utf8'
  )
) as { homePoints: [number, number][] }
const launchTimestamp = Math.floor(Date.UTC(2026, 6, 9) / 1000)

test('Home latest point, line gradient, and launch geometry share the padded plot', async ({
  page,
}, info) => {
  await page.addInitScript(() =>
    localStorage.setItem('theme-ui-color-mode', 'dark')
  )
  await page.setViewportSize({ width: 1400, height: 900 })
  await page.goto('/internal/design-system/components/chart')
  const home = page.getByTestId('chart-card')
  const media = home.getByTestId('chart-home-media')
  const plot = home.getByTestId('chart-home-plot')

  await expect(plot.getByTestId('chart-latest-point-marker')).toBeVisible()
  const geometry = await plot.evaluate((element) => {
    const surfaces = Array.from(
      element.querySelectorAll<SVGSVGElement>('svg.recharts-surface')
    )
    const strokeSurface = surfaces[1]
    const overlay = element.querySelector<SVGSVGElement>(
      '[data-testid="chart-latest-point-overlay"]'
    )
    const marker = overlay?.querySelector<SVGCircleElement>(
      '[data-testid="chart-latest-point-marker"]'
    )
    const curve = Array.from(
      strokeSurface?.querySelectorAll<SVGPathElement>(
        'path.recharts-area-curve'
      ) ?? []
    )
      .filter((path) => path.getAttribute('stroke') !== 'none')
      .map((path) => ({
        path,
        point: path.getPointAtLength(path.getTotalLength()),
      }))
      .sort((a, b) => b.point.x - a.point.x)[0]
    if (!strokeSurface || !overlay || !marker || !curve) return null
    const lineGradientId = curve.path
      .getAttribute('stroke')
      ?.match(/^url\(#(.+)\)$/)?.[1]
    const markerGradientId = marker
      .getAttribute('fill')
      ?.match(/^url\(#(.+)\)$/)?.[1]
    const lineGradient = lineGradientId
      ? strokeSurface.querySelector<SVGLinearGradientElement>(
          `#${lineGradientId}`
        )
      : null
    const markerGradient = markerGradientId
      ? overlay.querySelector<SVGLinearGradientElement>(`#${markerGradientId}`)
      : null
    const ringGradientId = marker
      .getAttribute('stroke')
      ?.match(/^url\(#(.+)\)$/)?.[1]
    const ringGradient = ringGradientId
      ? overlay.querySelector<SVGLinearGradientElement>(`#${ringGradientId}`)
      : null
    return {
      cx: marker.cx.baseVal.value,
      cy: marker.cy.baseVal.value,
      curveX: curve.point.x,
      curveY: curve.point.y,
      lineStops: Array.from(lineGradient?.querySelectorAll('stop') ?? []).map(
        (stop) => getComputedStyle(stop).stopColor
      ),
      markerStops: Array.from(
        markerGradient?.querySelectorAll('stop') ?? []
      ).map((stop) => getComputedStyle(stop).stopColor),
      lineY: [
        lineGradient?.getAttribute('y1'),
        lineGradient?.getAttribute('y2'),
      ],
      markerY: [
        markerGradient?.getAttribute('y1'),
        markerGradient?.getAttribute('y2'),
      ],
      ringY: [
        ringGradient?.getAttribute('y1'),
        ringGradient?.getAttribute('y2'),
      ],
      width: overlay.viewBox.baseVal.width,
      height: overlay.viewBox.baseVal.height,
    }
  })

  expect(geometry).not.toBeNull()
  expect(geometry!.cx).toBeCloseTo(geometry!.curveX, 0)
  expect(geometry!.cy).toBeCloseTo(geometry!.curveY, 0)
  expect(geometry!.cx).toBeGreaterThanOrEqual(4)
  expect(geometry!.cx).toBeLessThanOrEqual(geometry!.width - 4)
  expect(geometry!.cy).toBeGreaterThanOrEqual(4)
  expect(geometry!.cy).toBeLessThanOrEqual(geometry!.height - 4)
  expect(geometry!.markerStops).toEqual(geometry!.lineStops)
  expect(geometry!.markerY).toEqual(geometry!.lineY)

  const mediaBounds = (await media.boundingBox())!
  const plotBounds = (await plot.boundingBox())!
  expect(Number(geometry!.ringY[0])).toBeCloseTo(
    mediaBounds.y - plotBounds.y,
    0
  )
  expect(Number(geometry!.ringY[1])).toBeCloseTo(
    mediaBounds.y + mediaBounds.height - plotBounds.y,
    0
  )

  const firstTimestamp = photonSource.homePoints[0][0]
  const lastTimestamp = photonSource.homePoints.at(-1)![0]
  const expectedLaunchX =
    4 +
    ((launchTimestamp! - firstTimestamp) / (lastTimestamp - firstTimestamp)) *
      (plotBounds.width - 8)
  const launchLine = (await home
    .getByTestId('feature-card-launch-line')
    .boundingBox())!
  expect(launchLine.x + launchLine.width / 2 - plotBounds.x).toBeCloseTo(
    expectedLaunchX,
    0
  )
  await currentCapture(page, home, info, 'chart-home-endpoint-dark')
})

test('Home source opts into the unboxed launch annotation', async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 1400, height: 900 })
  await page.goto('/internal/design-system/components/chart')
  const home = page.getByTestId('chart-card')
  const label = home.getByTestId('feature-card-launch-label')

  await home.getByTestId('feature-card-launch-marker').hover()
  await expect(label).toHaveText('DTF Launch')
  await expect(label).toHaveCSS('font-size', '12px')
  await expect(label).toHaveCSS('border-top-width', '0px')
  await expect(label).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
  expect(await label.evaluate((el) => getComputedStyle(el).color)).toBe(
    await home.getByRole('heading').evaluate((el) => getComputedStyle(el).color)
  )
  const caption = home.getByTestId('feature-card-launch-history-label')
  await expect(caption).toHaveCSS('font-size', '12px')
  await expect(caption).toHaveCSS('font-weight', '300')
  await expect(caption).toHaveClass(/text-muted-foreground/)
  const labelBounds = (await label.boundingBox())!
  const lineBounds = (await home
    .getByTestId('feature-card-launch-line')
    .boundingBox())!
  expect(lineBounds.y + lineBounds.height + 4).toBeLessThanOrEqual(
    labelBounds.y
  )
  await currentCapture(page, home, info, 'chart-home-launch-annotation-light')
})

test('Home launch annotation is visible by default in a mobile viewport', async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 320, height: 900 })
  await page.goto('/internal/design-system/components/chart')
  const home = page.getByTestId('chart-card')
  await expect(home.getByTestId('feature-card-launch-marker')).toBeVisible()
  await expect(home.getByTestId('feature-card-launch-label')).toHaveCSS(
    'opacity',
    '1'
  )
  await expect(
    home.getByTestId('feature-card-launch-history-label')
  ).toBeVisible()
  const markerBounds = (await home
    .getByTestId('feature-card-launch-marker')
    .boundingBox())!
  const captionBounds = (await home
    .getByTestId('feature-card-launch-history-label')
    .boundingBox())!
  expect(captionBounds.x + captionBounds.width).toBeLessThanOrEqual(
    markerBounds.x - 8
  )
  expect(
    await home.evaluate((element) => element.scrollWidth - element.clientWidth)
  ).toBeLessThanOrEqual(1)
  await currentCapture(page, home, info, 'chart-home-launch-annotation-mobile')
})

test('Home launch annotation measures the longer Spanish label', async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 320, height: 900 })
  await page.addInitScript(() =>
    localStorage.setItem('register.locale', JSON.stringify('es'))
  )
  await page.goto('/internal/design-system/components/chart')
  const home = page.getByTestId('chart-card')
  const label = home.getByTestId('feature-card-launch-label')
  await expect(label).toHaveText('Lanzamiento del DTF')
  const homeBounds = (await home.boundingBox())!
  const labelBounds = (await label.boundingBox())!
  expect(labelBounds.x).toBeGreaterThanOrEqual(homeBounds.x)
  expect(labelBounds.x + labelBounds.width).toBeLessThanOrEqual(
    homeBounds.x + homeBounds.width
  )
  await currentCapture(page, home, info, 'chart-home-launch-annotation-es')
})
