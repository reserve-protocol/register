import { expect, test } from './current-rebalance-helpers'
import type { Locator, Page, TestInfo } from '@playwright/test'
import photon from '../../src/views/internal/design-system/charts/fixtures/photon-source.json' with { type: 'json' }

const route = '/internal/design-system/components/chart'
const selectedSample = {
  price: '$103.36',
  timestamp: '2026-06-02T00:00:00.000Z',
  visibleTime: '2026-6-2 00:00',
}

test.use({ timezoneId: 'UTC' })

for (const theme of ['light', 'dark'] as const) {
  test(`Home launch guide follows label visibility on ${theme}`, async ({
    page,
  }, info) => {
    await openReview(page, theme, 1400)
    const home = page.getByTestId('chart-card')
    const marker = home.getByTestId('feature-card-launch-marker')
    const label = home.getByTestId('feature-card-launch-label')
    const line = home.getByTestId('feature-card-launch-line')

    await expect(label).toHaveAttribute('aria-hidden', 'true')
    await expectGuideToMeetBadge(line, marker)

    await marker.hover()
    await expect(label).toHaveAttribute('aria-hidden', 'false')
    await expectVisibleLabelClearance(line, label)

    await home.getByRole('heading').hover()
    await expect(label).toHaveAttribute('aria-hidden', 'true')
    await expectGuideToMeetBadge(line, marker)

    await marker.focus()
    await expect(marker).toBeFocused()
    await expect(label).toHaveAttribute('aria-hidden', 'false')
    await expectVisibleLabelClearance(line, label)
    await attach(page, info, `final-home-${theme}-focus`)

    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 900 })
      await expect(label).toHaveAttribute('aria-hidden', 'false')
      await expectVisibleLabelClearance(line, label)
      expect(
        await home.evaluate(
          (element) => element.scrollWidth - element.clientWidth
        )
      ).toBeLessThanOrEqual(1)
    }
    await attach(page, info, `final-home-${theme}-phone`)
  })

  test(`Portfolio descriptor keeps its own hierarchy on ${theme}`, async ({
    page,
  }, info) => {
    await openReview(page, theme, 1400)
    const review = page.getByTestId('next-chart-families-review')
    const portfolio = review.getByTestId('next-portfolio-history')
    const surface = review.getByTestId('next-portfolio-review-surface')
    const descriptor = portfolio.getByText('Portfolio total', { exact: true })
    const value = portfolio.getByTestId('next-portfolio-value')
    const date = portfolio.getByTestId('next-portfolio-time')
    const ranges = portfolio.getByTestId('historical-range-scrollport')
    const yieldDescriptors = [
      review.getByTestId('next-metric-price-descriptor'),
      review.getByTestId('next-metric-apy-descriptor'),
      review.getByTestId('next-metric-supply-descriptor'),
      review.getByTestId('next-metric-staked-rsr-descriptor'),
    ]

    for (const width of [320, 390, 1400]) {
      await page.setViewportSize({ width, height: 1000 })
      await descriptor.scrollIntoViewIfNeeded()
      await expect(descriptor).toHaveCSS('font-size', '16px')
      await expect(descriptor).toHaveCSS('line-height', '24px')
      await expect(descriptor).toHaveCSS('font-weight', '300')
      await expect(date).toHaveCSS('font-size', '14px')
      await expect(date).toHaveCSS('line-height', '20px')
      for (const yieldDescriptor of yieldDescriptors) {
        await expect(yieldDescriptor).toHaveCSS('font-size', '14px')
        await expect(yieldDescriptor).toHaveCSS('line-height', '20px')
      }

      expect(
        await descriptor.evaluate((node) => getComputedStyle(node).color)
      ).toBe(await date.evaluate((node) => getComputedStyle(node).color))
      const surfaceBounds = (await surface.boundingBox())!
      const descriptorBounds = (await descriptor.boundingBox())!
      const valueBounds = (await value.boundingBox())!
      const dateBounds = (await date.boundingBox())!
      const rangeBounds = (await ranges.boundingBox())!
      expect(descriptorBounds.x - surfaceBounds.x).toBeCloseTo(24, 0)
      expect(
        valueBounds.y - descriptorBounds.y - descriptorBounds.height
      ).toBeCloseTo(8, 0)
      expect(dateBounds.y - valueBounds.y - valueBounds.height).toBeCloseTo(
        8,
        0
      )
      expect(rectanglesOverlap(dateBounds, rangeBounds)).toBe(false)
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth - window.innerWidth
        )
      ).toBeLessThanOrEqual(1)
    }
    await attach(page, info, `final-portfolio-${theme}`)
  })

  test(`provisional line tooltip preserves the selected sample on ${theme}`, async ({
    page,
  }, info) => {
    await openReview(page, theme, 1400)
    const provisional = page.getByTestId('chart-mode-current')
    await expect(provisional).toHaveText('Floating tooltip · provisional')
    await provisional.click()

    for (const width of [320, 390, 1400]) {
      await page.setViewportSize({ width, height: 900 })
      const chart = page.getByTestId('chart-overview-source')
      const plot = chart.getByTestId('chart-source-plot')
      await settledOverview(plot)
      await hoverSelectedSample(plot)

      const tooltip = chart.getByTestId('chart-line-source-tooltip')
      await expect(tooltip).toBeVisible()
      await expect(tooltip).toContainText(selectedSample.price)
      await expect(tooltip).toContainText(selectedSample.visibleTime)
      await expect(tooltip.locator('time')).toHaveAttribute(
        'datetime',
        selectedSample.timestamp
      )
      await expect(tooltip).toHaveCSS('font-size', '14px')
      await expect(tooltip).toHaveCSS('line-height', '20px')
      await expect(tooltip).toHaveCSS('font-weight', '300')
      await expect(tooltip).toHaveCSS('border-radius', '8px')
      await expect(tooltip).toHaveCSS('padding', '8px 12px')
      expect(await fitsInside(tooltip, chart)).toBe(true)
      const tooltipBounds = (await tooltip.boundingBox())!
      expect(tooltipBounds.width).toBeLessThan(180)
      expect(tooltipBounds.height).toBeLessThan(72)
      await expect(chart.getByTestId('chart-source-value')).toHaveText('$81.50')
      await expect(
        chart.getByTestId('chart-latest-point-marker')
      ).toHaveAttribute('data-state', 'inspection')

      await chart.getByTestId('chart-source-title').hover()
      await expect(tooltip).toHaveCount(0)
      await expect(
        chart.getByTestId('chart-latest-point-marker')
      ).toHaveAttribute('data-state', 'latest')
    }
    await attach(page, info, `final-line-tooltip-${theme}`)

    await page.getByTestId('chart-mode-header').click()
    const chart = page.getByTestId('chart-overview-source')
    const plot = chart.getByTestId('chart-source-plot')
    await settledOverview(plot)
    await hoverSelectedSample(plot)
    await expect(chart.getByTestId('chart-line-source-tooltip')).toHaveCount(0)
    const selectedTimestamp = await chart
      .getByTestId('chart-source-time')
      .getAttribute('datetime')
    const selectedPoint = photon.overviewPoints.find(
      ([timestamp]) =>
        new Date(timestamp * 1000).toISOString() === selectedTimestamp
    )
    expect(selectedPoint).toBeDefined()
    await expect(chart.getByTestId('chart-source-value')).toHaveText(
      `$${selectedPoint![1].toFixed(2)}`
    )
    await chart.getByTestId('chart-source-title').hover()
    await expect(chart.getByTestId('chart-source-value')).toHaveText('$81.50')
  })
}

async function openReview(page: Page, theme: 'light' | 'dark', width: number) {
  await page.addInitScript(
    (mode) => localStorage.setItem('theme-ui-color-mode', mode),
    theme
  )
  await page.setViewportSize({ width, height: 1000 })
  await page.goto(route)
  await page.evaluate(() => document.fonts.ready)
}

async function expectGuideToMeetBadge(line: Locator, marker: Locator) {
  const lineBounds = (await line.boundingBox())!
  const markerBounds = (await marker.boundingBox())!
  expect(lineBounds.y + lineBounds.height).toBeCloseTo(markerBounds.y, 0)
}

async function expectVisibleLabelClearance(line: Locator, label: Locator) {
  const lineBounds = (await line.boundingBox())!
  const labelBounds = (await label.boundingBox())!
  expect(
    labelBounds.y - lineBounds.y - lineBounds.height
  ).toBeGreaterThanOrEqual(4)
}

function rectanglesOverlap(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number }
) {
  return !(
    a.x + a.width <= b.x ||
    b.x + b.width <= a.x ||
    a.y + a.height <= b.y ||
    b.y + b.height <= a.y
  )
}

async function fitsInside(inner: Locator, outer: Locator) {
  const innerBounds = (await inner.boundingBox())!
  const outerBounds = (await outer.boundingBox())!
  return (
    innerBounds.x >= outerBounds.x - 1 &&
    innerBounds.y >= outerBounds.y - 1 &&
    innerBounds.x + innerBounds.width <=
      outerBounds.x + outerBounds.width + 1 &&
    innerBounds.y + innerBounds.height <= outerBounds.y + outerBounds.height + 1
  )
}

async function settledOverview(plot: Locator) {
  await expect
    .poll(() =>
      plot.evaluate(async (element) => {
        const svg = element.querySelector<SVGSVGElement>('svg.recharts-surface')
        const paths = Array.from(
          element.querySelectorAll<SVGPathElement>('path.recharts-area-curve')
        )
        if (!svg || !paths.length) return false
        const svgBounds = svg.getBoundingClientRect()
        const pathBounds = paths.map((path) => path.getBoundingClientRect())
        const pathsFitCurrentViewport = pathBounds.every((bounds) => {
          return (
            bounds.left >= svgBounds.left - 1 &&
            bounds.right <= svgBounds.right + 1
          )
        })
        const curveSpan =
          Math.max(...pathBounds.map((bounds) => bounds.right)) -
          Math.min(...pathBounds.map((bounds) => bounds.left))
        const drawableClip = svg.querySelector<SVGRectElement>(
          'clipPath[id^="recharts"] rect'
        )
        const svgScale = svgBounds.width / svg.width.baseVal.value
        const drawableWidth = drawableClip
          ? drawableClip.width.baseVal.value * svgScale
          : 0
        if (
          !pathsFitCurrentViewport ||
          !drawableClip ||
          curveSpan < drawableWidth - 10
        ) {
          return false
        }
        const pathData = paths.map((path) => path.getAttribute('d'))
        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
        })
        const currentPaths = Array.from(
          element.querySelectorAll<SVGPathElement>('path.recharts-area-curve')
        )
        if (
          currentPaths.length !== paths.length ||
          currentPaths.some(
            (path, index) => path.getAttribute('d') !== pathData[index]
          )
        ) {
          return false
        }
        const drawClips = Array.from(
          svg.querySelectorAll<SVGRectElement>(
            'clipPath[id^="animationClipPath-"] rect'
          )
        )
        return drawClips.every((rect) => {
          const group = rect.parentElement?.parentElement?.nextElementSibling
          const area = group?.querySelector<SVGPathElement>(
            'path.recharts-area-area'
          )
          if (!area) return false
          const bounds = area.getBBox()
          return (
            rect.x.baseVal.value + rect.width.baseVal.value >=
            bounds.x + bounds.width - 1
          )
        })
      })
    )
    .toBe(true)
}

async function hoverSelectedSample(plot: Locator) {
  const plotBounds = (await plot.boundingBox())!
  const curveExtent = await plot
    .locator('path.recharts-area-curve')
    .evaluateAll((paths) => {
      const xs = paths.flatMap((node) => {
        const path = node as SVGPathElement
        const matrix = path.getScreenCTM()!
        return [0, path.getTotalLength()].map((length) => {
          const point = path.getPointAtLength(length)
          return new DOMPoint(point.x, point.y).matrixTransform(matrix).x
        })
      })
      return { left: Math.min(...xs), right: Math.max(...xs) }
    })
  const sampleTime = Date.parse(selectedSample.timestamp) / 1000
  const firstTimestamp = photon.overviewPoints[0][0]
  const lastTimestamp = photon.overviewPoints.at(-1)![0]
  const ratio = (sampleTime - firstTimestamp) / (lastTimestamp - firstTimestamp)
  await plot.hover({
    position: {
      x:
        curveExtent.left +
        ratio * (curveExtent.right - curveExtent.left) -
        plotBounds.x,
      y: 100,
    },
  })
}

async function attach(page: Page, info: TestInfo, name: string) {
  await info.attach(name, {
    body: await page.screenshot({ animations: 'disabled' }),
    contentType: 'image/png',
  })
}
