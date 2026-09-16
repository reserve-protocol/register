import { test, expect, currentCapture } from './current-rebalance-helpers'
import type { Locator, Page, TestInfo } from '@playwright/test'
import photon from '../../src/views/internal/design-system/charts/fixtures/photon-source.json' with { type: 'json' }

for (const theme of ['light', 'dark']) {
  test(`responsive Overview page title ${theme}`, async ({ page }, info) => {
    await page.addInitScript(
      (mode) => localStorage.setItem('theme-ui-color-mode', mode),
      theme
    )
    await page.goto('/internal/design-system/components/chart')
    const chart = page.getByTestId('chart-overview-source')
    const title = chart.getByTestId('chart-source-title')
    const originalTitle = await title.textContent()
    const longTitle = `${originalTitle} — Global Technology and Infrastructure Portfolio`
    for (const width of [320, 390, 640, 1400]) {
      await page.setViewportSize({ width, height: 900 })
      await title.evaluate((el, text) => {
        el.textContent = text
      }, originalTitle)
      await settledOverview(page)
      await expect(title).toHaveCSS('font-size', width < 640 ? '24px' : '32px')
      await expect(title).toHaveCSS(
        'line-height',
        width < 640 ? '30px' : '38px'
      )
      await expect(title).toHaveCSS('font-weight', '300')
      await expect(title).toHaveCSS(
        'letter-spacing',
        width < 640 ? 'normal' : '-0.32px'
      )
      const plot = chart.getByTestId('chart-source-plot')
      const plotBefore = (await plot.boundingBox())!
      const ticks = await plot
        .locator('.recharts-cartesian-axis-tick-value')
        .allTextContents()
      const curves = await plot
        .locator('path.recharts-area-curve')
        .evaluateAll((paths) => paths.map((path) => path.getAttribute('d')))
      await currentCapture(page, chart, info, `page-title-${theme}-${width}`)
      await title.evaluate((el, text) => {
        el.textContent = text
      }, longTitle)
      await settledOverview(page)
      const titleHeight = (await title.boundingBox())!.height
      expect(titleHeight).toBeGreaterThan(width < 640 ? 30 : 38)
      for (const element of [title, chart]) {
        expect(
          await element.evaluate((el) => el.scrollWidth - el.clientWidth)
        ).toBeLessThanOrEqual(1)
      }
      const plotAfter = (await plot.boundingBox())!
      expect(plotAfter.width).toBe(plotBefore.width)
      expect(plotAfter.height).toBe(plotBefore.height)
      expect(
        await plot
          .locator('.recharts-cartesian-axis-tick-value')
          .allTextContents()
      ).toEqual(ticks)
      expect(
        await plot
          .locator('path.recharts-area-curve')
          .evaluateAll((paths) => paths.map((path) => path.getAttribute('d')))
      ).toEqual(curves)
      await currentCapture(
        page,
        chart,
        info,
        `page-title-long-${theme}-${width}`
      )
    }
  })
}

test('launch marker is a compact noninteractive annotation', async ({
  page,
}) => {
  await page.goto('/internal/design-system/components/chart')
  const plot = page.getByTestId('chart-source-plot')
  for (const width of [1400, 390, 320]) {
    await page.setViewportSize({ width, height: 900 })
    await settledOverview(page)
    const label = plot.getByText('DTF Launch', { exact: true })
    await expect(label).toHaveCSS('font-size', '12px')
    await expect(label).toHaveCSS('font-weight', '300')
    expect(await label.evaluate((el) => el.tagName)).toBe('text')
    await expect(label).toHaveCSS('pointer-events', 'none')
    const bounds = (await label.boundingBox())!
    const plotBounds = (await plot.boundingBox())!
    expect(bounds.x).toBeGreaterThanOrEqual(plotBounds.x + 8)
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(
      plotBounds.x + plotBounds.width - 8
    )
    const caption = plot.getByText('Est. Historical Price ✱', { exact: true })
    await expect(caption).toBeVisible()
    await expect(caption).toHaveCSS('font-size', '12px')
    const captionBounds = (await caption.boundingBox())!
    expect(captionBounds.x + captionBounds.width + 8).toBeLessThanOrEqual(
      bounds.x
    )
    const markerLine = label.locator('..').locator('line')
    const lineBounds = (await markerLine.boundingBox())!
    expect(Math.abs(lineBounds.x - bounds.x - bounds.width / 2)).toBeLessThan(1)
    expect(lineBounds.y + lineBounds.height + 4).toBeLessThanOrEqual(bounds.y)
  }
})

test('source frames follow V1 surfaces and Home card spacing', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1400, height: 900 })
  await page.goto('/internal/design-system/components/chart')
  const overview = page.getByTestId('chart-overview-source')
  const home = page.getByTestId('chart-card')
  for (const surface of [overview, home]) {
    await expect(surface).toHaveCSS('border-radius', '0px')
    await expect(surface).toHaveCSS('box-shadow', 'none')
    await expect(surface).toHaveCSS('border-top-width', '0px')
  }
  await expect(home).toHaveCSS('padding', '4px')
  await expect(home.getByTestId('chart-home-media')).toHaveCSS(
    'border-radius',
    '0px'
  )
  const title = home.getByRole('heading')
  const logo = home.getByTestId('canonical-chain-badged-logo')
  expect((await title.boundingBox())!.x - (await home.boundingBox())!.x).toBe(
    24
  )
  expect(
    (await title.boundingBox())!.y -
      ((await logo.boundingBox())!.y + (await logo.boundingBox())!.height)
  ).toBe(16)
  expect(
    (await home.getByTestId('chart-home-market-row').boundingBox())!.y -
      ((await title.boundingBox())!.y + (await title.boundingBox())!.height)
  ).toBe(8)
  await expect(overview.getByTestId('chart-source-title')).toHaveCSS(
    'font-size',
    '32px'
  )
  await expect(overview.getByTestId('chart-source-title')).toHaveCSS(
    'font-weight',
    '300'
  )
  await expect(title).toHaveCSS('font-size', '20px')
  await expect(title).toHaveCSS('font-weight', '300')
  await expect(title).toHaveCSS('line-height', '26px')
  await expect(overview.getByTestId('chart-source-title')).toHaveCSS(
    'color',
    await overview
      .getByTestId('chart-source-value')
      .evaluate((el) => getComputedStyle(el).color)
  )
})

for (const theme of ['light', 'dark']) {
  test(`highlighted-card framing ${theme}`, async ({ page }, info) => {
    await page.addInitScript(
      (mode) => localStorage.setItem('theme-ui-color-mode', mode),
      theme
    )
    await page.goto('/internal/design-system/components/chart')
    const home = page.getByTestId('chart-card')
    const media = home.getByTestId('chart-home-media')
    const plot = home.getByTestId('chart-home-plot')
    for (const width of [320, 390, 1400]) {
      await page.setViewportSize({ width, height: 900 })
      await expect(home).toHaveCSS('padding', '4px')
      await expect(home).toHaveCSS('border-radius', '0px')
      await expect(media).toHaveCSS('border-radius', '0px')
      const frame = (await home.boundingBox())!
      const gradient = (await media.boundingBox())!
      const chart = (await plot.boundingBox())!
      const title = (await home.getByRole('heading').boundingBox())!
      expect(gradient.x - frame.x).toBe(4)
      expect(frame.x + frame.width - gradient.x - gradient.width).toBe(4)
      expect(gradient.y - frame.y).toBe(4)
      expect(title.x - frame.x).toBe(24)
      expect(chart.x).toBe(gradient.x)
      expect(chart.width).toBe(gradient.width)
      expect(chart.height).toBe(208)
      await expect
        .poll(() =>
          plot
            .locator('svg.recharts-surface')
            .evaluateAll((elements) =>
              elements.length
                ? Math.max(
                    ...elements.map((el) =>
                      Math.abs(
                        el.getBoundingClientRect().width -
                          el.parentElement!.clientWidth
                      )
                    )
                  )
                : Infinity
            )
        )
        .toBeLessThan(1)
      expect(
        await home.evaluate((el) => el.scrollWidth - el.clientWidth)
      ).toBeLessThanOrEqual(1)
      await currentCapture(page, home, info, `home-frame-${theme}-${width}`)
    }
  })
}

test('source chart review preserves real geometry and axis context', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1400, height: 900 })
  await page.goto('/internal/design-system/components/chart')
  const compact = page.getByTestId('chart-compact')
  await expect(compact).not.toContainText('LCAP')
  const box = (await compact.getByTestId('chart-plot').boundingBox())!
  expect(box.width).toBe(90)
  expect(box.height).toBe(40)
  const overview = page.getByTestId('chart-overview-source')
  await expect(overview.getByTestId('chart-source-title')).toHaveText(
    'Reserve AI Photonics DTF'
  )
  await expect(
    overview.locator('.recharts-xAxis .recharts-cartesian-axis-tick')
  ).toHaveCount(6)
  await expect(
    overview.locator('.recharts-yAxis .recharts-cartesian-axis-tick')
  ).toHaveCount(5)
  await expect(overview.getByText('DTF Launch', { exact: true })).toBeVisible()
})

test('source line and Discover markers stay centered and unclipped', async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 1400, height: 900 })
  await page.goto('/internal/design-system/components/chart')
  const overview = page.getByTestId('chart-overview-source')
  await settledOverview(page)
  await page.evaluate(() => document.fonts.ready)
  await expectLatestMarkerOnCurve(overview.getByTestId('chart-source-plot'), 4)
  const overviewAxisGap = await overview
    .getByTestId('chart-source-plot')
    .evaluate((element) => {
      const marker = element.querySelector<SVGCircleElement>(
        '[data-testid="chart-latest-point-marker"]'
      )
      const labels = Array.from(
        element.querySelectorAll<SVGTextElement>('.recharts-yAxis text')
      )
      if (!marker || !labels.length) return null
      return (
        Math.min(...labels.map((label) => label.getBBox().x)) -
        marker.cx.baseVal.value
      )
    })
  const yLabelRightEdges = await overview
    .getByTestId('chart-source-plot')
    .locator('.recharts-yAxis text')
    .evaluateAll((labels) =>
      labels.map((label) => {
        if (!(label instanceof SVGGraphicsElement)) {
          throw new Error('Expected an SVG Y-axis label')
        }
        const bounds = label.getBBox()
        return bounds.x + bounds.width
      })
    )
  expect(overviewAxisGap).toBeGreaterThanOrEqual(16)
  expect(overviewAxisGap).toBeLessThanOrEqual(20)
  expect(
    Math.max(...yLabelRightEdges) - Math.min(...yLabelRightEdges)
  ).toBeLessThanOrEqual(1)

  const compact = page.getByTestId('chart-compact').getByTestId('chart-plot')
  await expectLatestMarkerOnCurve(compact, 2.75)
  expect((await compact.boundingBox())!.width).toBe(90)
  expect((await compact.boundingBox())!.height).toBe(40)

  await page.evaluate(() => localStorage.setItem('theme-ui-color-mode', 'dark'))
  await page.reload()
  await settledOverview(page)
  const darkCompact = page
    .getByTestId('chart-compact')
    .getByTestId('chart-plot')
  await expectLatestMarkerOnCurve(darkCompact, 2.75)
  await captureSelectedOverview(darkCompact, info, 'discover-dark-90x40')
})

async function openPressure(page: Page) {
  await page.goto('/internal/design-system/components/chart')
  await page.getByTestId('chart-pressure-toggle').locator('summary').click()
}

async function expectHeldValue(
  read: () => Promise<string | null>,
  expected: string,
  durationMs = 300
) {
  const startedAt = Date.now()
  await expect
    .poll(
      async () => ({
        held: Date.now() - startedAt >= durationMs,
        value: await read(),
      }),
      { timeout: durationMs + 1_000, intervals: [100] }
    )
    .toEqual({ held: true, value: expected })
}

async function settledOverview(page: Page) {
  const plot = page.getByTestId('chart-source-plot')
  await expect
    .poll(() =>
      plot.evaluate((el) => {
        const svg = el.querySelector<SVGSVGElement>('svg.recharts-surface')
        const clip = svg?.querySelector<SVGRectElement>('defs clipPath rect')
        const paths = Array.from(
          el.querySelectorAll<SVGPathElement>('path.recharts-area-curve')
        )
        if (!svg || !clip || !paths.length) return false
        const drawClips = Array.from(
          svg.querySelectorAll<SVGRectElement>(
            'clipPath[id^="animationClipPath-"] rect'
          )
        )
        const isDrawComplete = drawClips.every((rect) => {
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
        const width =
          el.clientWidth - parseFloat(getComputedStyle(el).paddingRight)
        const marker = el.querySelector<SVGCircleElement>(
          '[data-testid="chart-latest-point-marker"]'
        )
        const right = Math.max(
          ...paths.map((path) => path.getBBox().x + path.getBBox().width)
        )
        const expectedRight =
          marker?.cx.baseVal.value ??
          clip.x.baseVal.value + clip.width.baseVal.value
        return (
          isDrawComplete &&
          Math.abs(svg.getBoundingClientRect().width - width) < 1 &&
          Math.abs(right - expectedRight) < 1
        )
      })
    )
    .toBe(true)
}

test('source inspection changes only the readout, not the chart geometry', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1400, height: 900 })
  await page.goto('/internal/design-system/components/chart')
  const chart = page.getByTestId('chart-overview-source')
  const plot = chart.getByTestId('chart-source-plot')
  const value = chart.getByTestId('chart-source-value')
  const row = chart.getByTestId('chart-source-financial-row')
  await settledOverview(page)
  const restingLayout = await headerLayout(chart, plot, row)
  const restingYAxisGeometry = await plot
    .locator('.recharts-yAxis text')
    .evaluateAll((labels) =>
      labels.map((label) => {
        const bounds = label.getBoundingClientRect()
        return {
          left: bounds.left,
          right: bounds.right,
          text: label.textContent,
        }
      })
    )
  await expect(chart.getByTestId('chart-latest-point-marker')).toBeVisible()
  await expect(value).toHaveText('$81.50')
  await plot.hover({ position: { x: 90, y: 100 } })
  await expect(value).not.toHaveText('$81.50')
  await expect(chart.getByTestId('chart-latest-point-marker')).toHaveCount(1)
  await expect(chart.getByTestId('chart-latest-point-marker')).toHaveAttribute(
    'data-state',
    'inspection'
  )
  await expect(chart.getByTestId('chart-source-ticker')).toHaveText('$PHOTON')
  await expect(chart.getByTestId('chart-source-time')).toBeVisible()
  await expect(chart.getByTestId('chart-source-estimate')).toHaveText(
    'Est. Historical Price ✱'
  )
  await expect(chart.locator('.recharts-tooltip-wrapper')).not.toContainText(
    '$'
  )
  const plotHeight = (await plot.boundingBox())!.height
  await chart.getByTestId('chart-source-title').hover()
  await expect(value).toHaveText('$81.50')
  await expect(chart.getByTestId('chart-latest-point-marker')).toBeVisible()
  await expect(chart.getByTestId('chart-latest-point-marker')).toHaveAttribute(
    'data-state',
    'latest'
  )
  const plotSurface = plot.locator('svg.recharts-surface')
  const latestX = Number(
    await chart.getByTestId('chart-latest-point-marker').getAttribute('cx')
  )
  await plotSurface.hover({ position: { x: latestX, y: 100 } })
  await expect(chart.getByTestId('chart-latest-point-marker')).toHaveCount(1)
  await expect(chart.getByTestId('chart-latest-point-marker')).toHaveAttribute(
    'data-state',
    'inspection'
  )
  await chart.getByTestId('chart-source-title').hover()
  await expect(chart.getByTestId('chart-latest-point-marker')).toHaveCount(1)
  await expect(chart.getByTestId('chart-latest-point-marker')).toHaveAttribute(
    'data-state',
    'latest'
  )
  await expect(chart.getByTestId('chart-source-ticker')).toHaveText('$PHOTON')
  const svg = plot.locator('svg.recharts-surface')
  await svg.focus()
  await page.keyboard.press('ArrowRight')
  await expect(value).not.toHaveText('$81.50')
  await expect(chart.getByTestId('chart-latest-point-marker')).toHaveCount(1)
  await expect(chart.getByTestId('chart-latest-point-marker')).toHaveAttribute(
    'data-state',
    'inspection'
  )
  await expect(chart.getByTestId('chart-source-ticker')).toHaveText('$PHOTON')
  await expect(
    chart.locator('[data-testid="chart-source-return"]:visible')
  ).toHaveCount(0)
  await expect(chart.getByTestId('chart-source-time')).toBeVisible()
  await expect(
    chart.getByTestId('chart-source-accessible-value')
  ).toContainText('$')
  expect(await plot.evaluate((el) => getComputedStyle(el).boxShadow)).not.toBe(
    'none'
  )
  expect(await headerLayout(chart, plot, row)).toEqual(restingLayout)
  await page.keyboard.press('Tab')
  await expect(value).toHaveText('$81.50')
  await expect(chart.getByTestId('chart-latest-point-marker')).toBeVisible()
  await expect(
    chart.locator('[data-testid="chart-source-return"]:visible')
  ).toHaveCount(1)
  expect(await headerLayout(chart, plot, row)).toEqual(restingLayout)
  expect(
    await plot.locator('.recharts-yAxis text').evaluateAll((labels) =>
      labels.map((label) => {
        const bounds = label.getBoundingClientRect()
        return {
          left: bounds.left,
          right: bounds.right,
          text: label.textContent,
        }
      })
    )
  ).toEqual(restingYAxisGeometry)
  const ticks = await plot
    .locator('.recharts-cartesian-axis-tick-value')
    .allTextContents()
  await page.getByTestId('chart-mode-current').click()
  await plot.hover({ position: { x: 90, y: 100 } })
  await expect(value).toHaveText('$81.50')
  await expect(chart.locator('.recharts-tooltip-wrapper')).toContainText('$')
  expect((await plot.boundingBox())!.height).toBe(plotHeight)
  expect(
    await plot.locator('.recharts-cartesian-axis-tick-value').allTextContents()
  ).toEqual(ticks)
})

for (const theme of ['light', 'dark']) {
  test(`source header stays compact through inspection ${theme}`, async ({
    page,
  }, info) => {
    await page.addInitScript(
      (mode) => localStorage.setItem('theme-ui-color-mode', mode),
      theme
    )
    await page.goto('/internal/design-system/components/chart')
    for (const width of [320, 390, 1400]) {
      await page.setViewportSize({ width, height: 900 })
      await assertSourceHeaderStability(page, info, `${theme}-${width}`)
    }

    await page.setViewportSize({ width: 1400, height: 900 })
    await page.getByTestId('chart-viewport-narrow').click()
    await assertSourceHeaderStability(page, info, `${theme}-constrained`)
  })
}

async function assertSourceHeaderStability(
  page: Page,
  info: TestInfo,
  captureName: string
) {
  const chart = page.getByTestId('chart-overview-source')
  const plot = chart.getByTestId('chart-source-plot')
  const value = chart.getByTestId('chart-source-value')
  const row = chart.getByTestId('chart-source-financial-row')
  await settledOverview(page)
  const resting = await headerLayout(chart, plot, row)
  await expectEvenIdentitySpacing(chart)
  expect(resting.rowHeight).toBeLessThanOrEqual(
    resting.chartWidth < 352 ? 52 : 24
  )
  if (captureName.endsWith('-1400')) {
    await captureSelectedOverview(chart, info, `${captureName}-rest`)
  }

  await plot.hover({ position: { x: 1, y: 100 } })
  await expect(value).toHaveText('$47.41')
  await expect(chart.getByTestId('chart-source-ticker')).toHaveText('$PHOTON')
  await expect(chart.getByTestId('chart-source-time')).toHaveAttribute(
    'datetime',
    /^2026-01-0[12]T00:00:00\.000Z$/
  )
  await expect(
    chart.locator('[data-testid="chart-source-return"]:visible')
  ).toHaveCount(0)
  expect(await headerLayout(chart, plot, row)).toEqual(resting)
  expect(
    await chart.evaluate((el) => el.scrollWidth - el.clientWidth)
  ).toBeLessThanOrEqual(1)
  const firstTime = await inspectionTimeAnchor(chart, resting.chartWidth)
  await expectInspectionPartsNotToOverlap(chart)

  const plotBounds = (await plot.boundingBox())!
  const shortPrice = await value.textContent()
  const expectedSelections = new Map([
    ['2026-06-01T00:00:00.000Z', '$102.86'],
    ['2026-06-02T00:00:00.000Z', '$103.36'],
    ['2026-06-03T00:00:00.000Z', '$117.18'],
  ])
  const targetTimestamp = '2026-06-02T00:00:00.000Z'
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
  const sampleTime = Date.parse(targetTimestamp) / 1000
  const firstTimeValue = photon.overviewPoints[0][0]
  const lastTimeValue = photon.overviewPoints.at(-1)![0]
  const sampleRatio =
    (sampleTime - firstTimeValue) / (lastTimeValue - firstTimeValue)
  await plot.hover({
    position: {
      x:
        curveExtent.left +
        sampleRatio * (curveExtent.right - curveExtent.left) -
        plotBounds.x,
      y: 100,
    },
  })
  const selectedTimestamp = await chart
    .getByTestId('chart-source-time')
    .getAttribute('datetime')
  expect(expectedSelections.has(selectedTimestamp!)).toBe(true)
  const selectedPrice = expectedSelections.get(selectedTimestamp!)!
  await expect(value).toHaveText(selectedPrice)
  expect(selectedPrice.length).toBeGreaterThan(shortPrice!.length)
  expect(await headerLayout(chart, plot, row)).toEqual(resting)
  expect(await inspectionTimeAnchor(chart, resting.chartWidth)).toBeCloseTo(
    firstTime,
    0
  )
  await expectInspectionPartsNotToOverlap(chart)
  await captureSelectedOverview(
    chart,
    info,
    captureName.endsWith('-1400') ? `${captureName}-inspection` : captureName
  )

  await chart.getByTestId('chart-source-title').hover()
  await expect(value).toHaveText('$81.50')
  await expect(chart.getByTestId('chart-source-ticker')).toHaveText('$PHOTON')
  await expect(
    chart.locator('[data-testid="chart-source-return"]:visible')
  ).toHaveCount(1)
  expect(await headerLayout(chart, plot, row)).toEqual(resting)
  if (captureName.endsWith('-1400')) {
    await captureSelectedOverview(chart, info, `${captureName}-restored`)
  }
}

async function headerLayout(chart: Locator, plot: Locator, row: Locator) {
  const chartBounds = (await chart.boundingBox())!
  const plotBounds = (await plot.boundingBox())!
  const rowBounds = (await row.boundingBox())!
  return {
    chartWidth: chartBounds.width,
    plotWidth: plotBounds.width,
    plotHeight: plotBounds.height,
    plotTop: plotBounds.y - chartBounds.y,
    rowHeight: rowBounds.height,
  }
}

async function inspectionTimeAnchor(chart: Locator, chartWidth: number) {
  const timeBounds = (await chart
    .getByTestId('chart-source-time')
    .boundingBox())!
  return chartWidth < 352 ? timeBounds.x : timeBounds.x + timeBounds.width
}

async function expectInspectionPartsNotToOverlap(chart: Locator) {
  await expectEvenIdentitySpacing(chart)
  const identity = (await chart
    .getByTestId('chart-source-market-identity')
    .boundingBox())!
  const time = (await chart.getByTestId('chart-source-time').boundingBox())!
  expect(
    time.x >= identity.x + identity.width ||
      time.y >= identity.y + identity.height
  ).toBe(true)
}

async function expectEvenIdentitySpacing(chart: Locator) {
  const price = (await chart.getByTestId('chart-source-value').boundingBox())!
  const dot = (await chart.getByTestId('chart-source-separator').boundingBox())!
  const ticker = (await chart.getByTestId('chart-source-ticker').boundingBox())!
  expect(dot.x - price.x - price.width).toBeCloseTo(8, 1)
  expect(ticker.x - dot.x - dot.width).toBeCloseTo(8, 1)
}

async function expectEvenReturnSpacing(chart: Locator) {
  const ticker = (await chart.getByTestId('chart-source-ticker').boundingBox())!
  const sourceReturn = chart.locator(
    '[data-testid="chart-source-return"]:visible'
  )
  const dot = (await sourceReturn
    .getByTestId('chart-source-return-separator')
    .boundingBox())!
  const change = (await sourceReturn
    .getByTestId('chart-source-return-change')
    .boundingBox())!
  expect(dot.x - ticker.x - ticker.width).toBeCloseTo(8, 1)
  expect(change.x - dot.x - dot.width).toBeCloseTo(8, 1)
}

async function captureSelectedOverview(
  chart: Locator,
  info: TestInfo,
  name: string
) {
  const directory = process.env.CHART_HOVER_CAPTURE_DIR
  await chart.evaluate((element) => {
    let ancestor = element.parentElement
    while (ancestor) {
      if (
        /(auto|scroll)/.test(getComputedStyle(ancestor).overflowY) &&
        ancestor.scrollHeight > ancestor.clientHeight
      ) {
        ancestor.scrollTo({
          top:
            ancestor.scrollTop +
            element.getBoundingClientRect().top -
            ancestor.getBoundingClientRect().top -
            80,
          behavior: 'instant',
        })
        return
      }
      ancestor = ancestor.parentElement
    }
    window.scrollTo({
      top: element.getBoundingClientRect().top + window.scrollY - 80,
      behavior: 'instant',
    })
  })
  const body = await chart.screenshot({
    animations: 'disabled',
    path: directory ? `${directory}/${name}.png` : undefined,
  })
  await info.attach(`chart-hover-${name}`, { body, contentType: 'image/png' })
}

async function scenario(page: Page, value: string) {
  await page.getByTestId('chart-scenario').click()
  await page.getByTestId(`chart-scenario-${value}`).click()
}

async function expectLatestMarkerOnCurve(plot: Locator, outerRadius: number) {
  const geometry = await plot.evaluate((element) => {
    const svg = element.querySelector<SVGSVGElement>('svg.recharts-surface')
    const marker = element.querySelector<SVGCircleElement>(
      '[data-testid="chart-latest-point-marker"]'
    )
    const curves = Array.from(
      element.querySelectorAll<SVGPathElement>(
        'path.recharts-area-curve, path.recharts-line-curve'
      )
    ).filter((path) => path.getAttribute('stroke') !== 'none')
    const curve = curves
      .map((path) => {
        const point = path.getPointAtLength(path.getTotalLength())
        return { path, point }
      })
      .sort((a, b) => b.point.x - a.point.x)[0]
    if (!svg || !marker || !curve) return null
    const viewBox = svg.viewBox.baseVal
    return {
      cx: marker.cx.baseVal.value,
      cy: marker.cy.baseVal.value,
      curveX: curve.point.x,
      curveY: curve.point.y,
      fill: marker.getAttribute('fill'),
      stroke: curve.path.getAttribute('stroke'),
      width: viewBox.width,
      height: viewBox.height,
    }
  })

  expect(geometry).not.toBeNull()
  expect(Math.abs(geometry!.cx - geometry!.curveX)).toBeLessThan(1)
  expect(Math.abs(geometry!.cy - geometry!.curveY)).toBeLessThan(1)
  expect(geometry!.cx).toBeGreaterThanOrEqual(outerRadius)
  expect(geometry!.cy).toBeGreaterThanOrEqual(outerRadius)
  expect(geometry!.cx).toBeLessThanOrEqual(geometry!.width - outerRadius)
  expect(geometry!.cy).toBeLessThanOrEqual(geometry!.height - outerRadius)
  expect(geometry!.fill).toBe(geometry!.stroke)
}

test('Overview return separator appears only on a shared desktop line', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1400, height: 900 })
  await page.goto('/internal/design-system/components/chart')
  const chart = page.getByTestId('chart-overview-source')
  await settledOverview(page)

  await expect(chart.getByTestId('chart-source-return-separator')).toBeVisible()
  await expectEvenReturnSpacing(chart)
  const sourceReturn = chart.locator(
    '[data-testid="chart-source-return"]:visible'
  )
  const priceWeight = await chart
    .getByTestId('chart-source-value')
    .evaluate((element) => getComputedStyle(element).fontWeight)
  await expect(sourceReturn).toHaveCSS('font-weight', priceWeight)
  await expect(sourceReturn.locator('span').last()).toHaveCSS(
    'font-weight',
    priceWeight
  )
  await expect(
    sourceReturn.getByTestId('chart-source-return-change')
  ).toHaveCSS('column-gap', '4px')

  await page.setViewportSize({ width: 390, height: 900 })
  await expect(
    chart.locator('[data-testid="chart-source-return-separator"]:visible')
  ).toHaveCount(0)
  await expect(
    chart.locator('[data-testid="chart-source-return"]:visible')
  ).toHaveCount(1)

  await page.setViewportSize({ width: 1400, height: 900 })
  await page.getByTestId('chart-viewport-narrow').click()
  await expect(
    chart.locator('[data-testid="chart-source-return-separator"]:visible')
  ).toHaveCount(0)
})

for (const theme of ['light', 'dark']) {
  test(`chart first review ${theme}`, async ({ page, txLog }, info) => {
    await page.addInitScript(
      (mode) => localStorage.setItem('theme-ui-color-mode', mode),
      theme
    )
    await page.setViewportSize({ width: 1400, height: 900 })
    await page.goto('/internal/design-system/components/chart')
    const review = page.getByTestId('chart-first-review')
    await expect(review).toBeVisible()
    await expect(review.getByTestId('chart-card')).toContainText('$PHOTON')
    await expect(review.getByTestId('chart-card')).toContainText(
      '+76.30% (YTD)'
    )
    await expect(review.getByTestId('chart-full')).toHaveCount(0)
    for (const width of [320, 390, 768, 1400]) {
      await page.setViewportSize({ width, height: 900 })
      await settledOverview(page)
      const identity = (await review
        .getByTestId('chart-source-ticker')
        .boundingBox())!
      const status = (await review
        .locator('[data-testid="chart-source-return"]:visible')
        .boundingBox())!
      expect(
        status.x >= identity.x + identity.width ||
          status.y >= identity.y + identity.height
      ).toBe(true)
      await currentCapture(
        page,
        review.getByTestId('chart-overview-source'),
        info,
        `charts-${theme}-${width}`
      )
      expect(
        await review.evaluate((el) => el.scrollWidth - el.clientWidth)
      ).toBeLessThanOrEqual(1)
      await currentCapture(
        page,
        review.getByTestId('chart-card'),
        info,
        `charts-home-${theme}-${width}`
      )
    }
    await currentCapture(page, review, info, `charts-${theme}-comparison`)
    await page.getByTestId('chart-viewport-narrow').click()
    expect(
      (await review.getByTestId('chart-overview-source').boundingBox())!.width
    ).toBeLessThanOrEqual(390)
    await settledOverview(page)
    const footer = review.getByTestId('chart-source-footer')
    expect(
      await footer.evaluate((el) => el.scrollWidth - el.clientWidth)
    ).toBeLessThanOrEqual(1)
    await currentCapture(
      page,
      review.getByTestId('chart-overview-source'),
      info,
      `charts-constrained-${theme}`
    )
    await page.getByTestId('chart-pressure-toggle').locator('summary').click()
    await page.getByTestId('chart-constrained').click()
    expect(
      (await review.getByTestId('chart-full').boundingBox())!.width
    ).toBeLessThanOrEqual(390)
    await page.getByTestId('chart-density-review').locator('summary').click()
    await expect(
      page.getByTestId('chart-density-hourly').getByTestId('chart-plot')
    ).toHaveAttribute('data-point-count', '721')
    await expect(
      page.getByTestId('chart-density-daily').getByTestId('chart-plot')
    ).toHaveAttribute('data-point-count', '31')
    expect(
      (await page.getByTestId('chart-density-hourly').boundingBox())!.width
    ).toBeLessThanOrEqual(390)
    await currentCapture(
      page,
      page.getByTestId('chart-density-review'),
      info,
      `charts-${theme}-density`
    )
    expect(txLog).toHaveLength(0)
  })

  test(`chart inspection and pressure states ${theme}`, async ({
    page,
    txLog,
  }, info) => {
    await page.addInitScript(
      (mode) => localStorage.setItem('theme-ui-color-mode', mode),
      theme
    )
    await page.setViewportSize({ width: 390, height: 900 })
    await openPressure(page)
    const full = page.getByTestId('chart-full')
    const price = page.getByTestId('chart-current-value')
    await expect(price).toHaveText('$6.6391')
    await expect(full.getByTestId('chart-stroke')).toHaveAttribute('d', /C/)
    await page.getByTestId('chart-inspection').focus()
    await page.keyboard.press('ArrowLeft')
    await expect(price).toHaveText('$6.7457')
    await expect(page.getByTestId('chart-current-time')).toHaveText(
      '12 Sept 2026, 13:56 UTC'
    )
    await expect(page.getByTestId('chart-inspection')).toBeFocused()
    await expect(full.getByTestId('chart-inspection-marker')).toBeVisible()
    const svg = full.getByTestId('chart-inspection')
    await svg.click({ position: { x: 1, y: 100 } })
    await expect(price).toHaveText('$5.1873')
    await page.getByTestId('chart-range-7d').click()
    await expect(page.getByTestId('chart-range-7d')).toHaveAttribute(
      'aria-checked',
      'true'
    )
    await expect(full.getByTestId('chart-plot')).toHaveAttribute(
      'data-point-count',
      '169'
    )
    await expect(price).toHaveText('$6.6391')
    const height = (await full.getByTestId('chart-plot').boundingBox())!.height
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await scenario(page, 'loading')
    await expect(full.getByTestId('v1-skeleton').first()).toBeVisible()
    expect(
      await full
        .getByTestId('v1-skeleton')
        .first()
        .evaluate((el) => getComputedStyle(el).animationName)
    ).toBe('none')
    expect((await full.getByTestId('chart-plot').boundingBox())!.height).toBe(
      height
    )
    await expect(page.getByTestId('chart-range-7d')).toHaveAttribute(
      'aria-checked',
      'true'
    )
    await scenario(page, 'captured')
    await expect(full.getByTestId('chart-plot')).toHaveAttribute(
      'data-point-count',
      '169'
    )
    await page.getByTestId('chart-range-1m').click()
    for (const state of [
      'neutral',
      'zero',
      'empty',
      'unavailable',
      'gapped',
      'estimated',
      'single',
      'two',
      'long',
      'delayed',
    ]) {
      await scenario(page, state)
      await expect(page.getByTestId('chart-provenance')).toContainText(
        'Lab-simulated'
      )
      expect(
        await page
          .getByTestId('chart-first-review')
          .evaluate((el) => el.scrollWidth - el.clientWidth)
      ).toBeLessThanOrEqual(1)
      if (state === 'zero') await expect(price).toHaveText('$0.00')
      if (state === 'empty' || state === 'unavailable') {
        await expect(price).toHaveText('—')
        await expect(full.getByTestId('chart-stroke')).toHaveCount(0)
        await expect(
          full.getByText(state === 'empty' ? 'No data' : 'Unavailable', {
            exact: true,
          })
        ).toBeVisible()
      }
      if (state === 'gapped')
        await expect(full.getByTestId('chart-segment')).toHaveCount(2)
      if (state === 'estimated') {
        await expect(full.locator('[data-estimated="true"]')).toHaveCount(1)
        await expect(full.getByTestId('chart-annotation')).toHaveText(
          'Est. Historical Price ✱'
        )
      }
      if (state === 'single') {
        await expect(full.getByTestId('chart-single-point')).toHaveCount(1)
        await expect(full.getByTestId('chart-stroke')).toHaveCount(0)
      }
      if (state === 'two')
        await expect(full.getByTestId('chart-plot')).toHaveAttribute(
          'data-point-count',
          '2'
        )
      if (state === 'long') {
        await page.setViewportSize({ width: 320, height: 900 })
        await expect(price).toHaveText('$1,234,567,890.1234')
        expect(
          await full.evaluate((el) => el.scrollWidth - el.clientWidth)
        ).toBeLessThanOrEqual(1)
        expect(
          await page
            .getByTestId('chart-compact')
            .evaluate((el) => el.scrollWidth - el.clientWidth)
        ).toBeLessThanOrEqual(1)
      }
      await currentCapture(page, full, info, `charts-${theme}-${state}`)
    }
    expect(txLog).toHaveLength(0)
  })
}

test.describe('chart touch', () => {
  test.use({
    viewport: { width: 320, height: 900 },
    hasTouch: true,
    isMobile: true,
  })
  test('source Overview holds the actual selected sample on first touch', async ({
    page,
  }, info) => {
    await page.goto('/internal/design-system/components/chart')
    const chart = page.getByTestId('chart-overview-source')
    const plot = chart.getByTestId('chart-source-plot')
    const financialRow = chart.getByTestId('chart-source-financial-row')
    await settledOverview(page)
    await plot.scrollIntoViewIfNeeded()
    const restingRowHeight = (await financialRow.boundingBox())!.height
    const box = (await plot.boundingBox())!
    const plotOffset = await plot.evaluate(
      (el) =>
        el.getBoundingClientRect().top -
        el
          .closest('[data-testid="chart-overview-source"]')!
          .getBoundingClientRect().top
    )
    await page.touchscreen.tap(box.x + 5, box.y + 100)
    await expect(chart.getByTestId('chart-source-value')).toHaveText('$47.41')
    await expect(chart.getByTestId('chart-source-ticker')).toHaveText('$PHOTON')
    await expect(
      chart.locator('[data-testid="chart-source-return"]:visible')
    ).toHaveCount(0)
    expect((await financialRow.boundingBox())!.height).toBe(restingRowHeight)
    await expect(chart.getByTestId('chart-source-time')).toHaveAttribute(
      'datetime',
      '2026-01-02T00:00:00.000Z'
    )
    await expect(
      chart.getByTestId('chart-latest-point-marker')
    ).toHaveAttribute('data-timestamp', '1767312000')
    await expectHeldValue(
      () => chart.getByTestId('chart-source-value').textContent(),
      '$47.41'
    )
    await expect(chart.getByTestId('chart-source-value')).toHaveText('$47.41')
    await expect(chart.getByTestId('chart-source-ticker')).toHaveText('$PHOTON')
    await expect(chart.getByTestId('chart-source-time')).toHaveAttribute(
      'datetime',
      '2026-01-02T00:00:00.000Z'
    )
    await expect(
      chart.getByTestId('chart-latest-point-marker')
    ).toHaveAttribute('data-timestamp', '1767312000')
    await expect(chart.getByTestId('chart-source-estimate')).toHaveText(
      'Est. Historical Price ✱'
    )
    expect(
      await plot.evaluate(
        (el) =>
          el.getBoundingClientRect().top -
          el
            .closest('[data-testid="chart-overview-source"]')!
            .getBoundingClientRect().top
      )
    ).toBe(plotOffset)
    await info.attach('charts-source-touch', {
      body: await chart.screenshot({ animations: 'disabled' }),
      contentType: 'image/png',
    })
    await page.getByTestId('chart-mode-current').tap()
    await expect(chart.getByTestId('chart-source-value')).toHaveText('$81.50')
    await settledOverview(page)
    await plot.scrollIntoViewIfNeeded()
    const currentBox = (await plot.boundingBox())!
    await page.touchscreen.tap(currentBox.x + 5, currentBox.y + 100)
    await expect(
      chart.getByTestId('chart-latest-point-marker')
    ).toHaveAttribute('data-timestamp', '1767312000')
    await expectHeldValue(
      () =>
        chart
          .getByTestId('chart-latest-point-marker')
          .getAttribute('data-timestamp'),
      '1767312000'
    )
    await expect(
      chart.getByTestId('chart-latest-point-marker')
    ).toHaveAttribute('data-timestamp', '1767312000')
    await page.getByTestId('chart-mode-header').tap()
    await expect(chart.getByTestId('chart-source-value')).toHaveText('$81.50')
    await expect(
      chart.locator('[data-testid="chart-source-return"]:visible')
    ).toHaveCount(1)
    await settledOverview(page)
    await plot.scrollIntoViewIfNeeded()
    const resetBox = (await plot.boundingBox())!
    await page.touchscreen.tap(resetBox.x + 5, resetBox.y + 100)
    await expect(chart.getByTestId('chart-source-value')).toHaveText('$47.41')
    await expect(chart.getByTestId('chart-source-ticker')).toHaveText('$PHOTON')
    await expect(chart.getByTestId('chart-source-time')).toHaveAttribute(
      'datetime',
      '2026-01-02T00:00:00.000Z'
    )
    await expectHeldValue(
      () => chart.getByTestId('chart-source-value').textContent(),
      '$47.41'
    )
    await expect(chart.getByTestId('chart-source-value')).toHaveText('$47.41')
    await expect(chart.getByTestId('chart-source-time')).toHaveAttribute(
      'datetime',
      '2026-01-02T00:00:00.000Z'
    )
    const scrollOffset = () =>
      plot.evaluate((el) => {
        let parent = el.parentElement
        while (parent) {
          if (
            parent.scrollHeight > parent.clientHeight &&
            ['auto', 'scroll'].includes(getComputedStyle(parent).overflowY)
          )
            return parent.scrollTop
          parent = parent.parentElement
        }
        return window.scrollY
      })
    const beforeScroll = await scrollOffset()
    const touch = await page.context().newCDPSession(page)
    const swipeBox = (await plot.boundingBox())!
    const x = swipeBox.x + swipeBox.width / 2
    const y = swipeBox.y + 160
    await touch.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x, y }],
    })
    for (const dy of [30, 60, 90, 120]) {
      await touch.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x, y: y - dy }],
      })
    }
    await touch.send('Input.dispatchTouchEvent', {
      type: 'touchEnd',
      touchPoints: [],
    })
    await expect.poll(scrollOffset).toBeGreaterThan(beforeScroll)
    await touch.detach()
  })
  test('inspection and translated pressure', async ({ page, txLog }, info) => {
    await openPressure(page)
    const full = page.getByTestId('chart-full')
    await expect(full).toBeVisible()
    await full.getByTestId('chart-inspection').scrollIntoViewIfNeeded()
    const box = (await full.getByTestId('chart-inspection').boundingBox())!
    await page.touchscreen.tap(box.x + 1, box.y + 100)
    await expect(page.getByTestId('chart-current-value')).toHaveText('$5.1873')
    await page.touchscreen.tap(box.x + box.width - 1, box.y + 100)
    await expect(page.getByTestId('chart-current-value')).not.toHaveText(
      '$5.1873'
    )
    await page.setViewportSize({ width: 1400, height: 900 })
    await page
      .getByRole('button', { name: 'Select language', exact: true })
      .click()
    await page
      .getByRole('menuitemradio', { name: 'Español', exact: true })
      .click()
    await page.setViewportSize({ width: 320, height: 900 })
    await scenario(page, 'estimated')
    await expect(page.getByTestId('chart-first-review')).toContainText(
      'Gráficos de series temporales'
    )
    expect(
      await page
        .getByTestId('chart-first-review')
        .evaluate((el) => el.scrollWidth - el.clientWidth)
    ).toBeLessThanOrEqual(1)
    await currentCapture(page, full, info, 'charts-spanish-touch')
    expect(txLog).toHaveLength(0)
  })
})

test('chart retains range focus', async ({ page }) => {
  await openPressure(page)
  const range = page.getByTestId('chart-range-7d')
  await range.focus()
  await page.keyboard.press('Space')
  await expect(range).toHaveAttribute('aria-checked', 'true')
  await expect(range).toBeFocused()
})

test('chart inspection needs no visible arrow controls', async ({ page }) => {
  await openPressure(page)
  const full = page.getByTestId('chart-full')
  await expect(full).toBeVisible()
  await expect(full.getByTestId('chart-previous')).toHaveCount(0)
  await expect(full.getByTestId('chart-next')).toHaveCount(0)
  const plot = full.getByTestId('chart-inspection')
  const price = page.getByTestId('chart-current-value')
  await plot.hover({ position: { x: 1, y: 100 } })
  await expect(price).toHaveText('$5.1873')
  await page.getByTestId('chart-range-1m').hover()
  await expect(price).toHaveText('$6.6391')
  await expect(full.getByTestId('chart-inspection-marker')).toHaveCount(0)
  await plot.focus()
  await page.keyboard.press('Home')
  await page.keyboard.press('ArrowLeft')
  await expect(plot).toHaveAttribute('aria-valuenow', '0')
  await expect(plot).toHaveAttribute('aria-valuetext', /\$5\.1873/)
  await page.keyboard.press('End')
  await page.keyboard.press('ArrowRight')
  await expect(plot).toHaveAttribute('aria-valuenow', '30')
  await expect(price).toHaveText('$6.6391')
  await expect(plot).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(plot).not.toBeFocused()
  await expect(full.getByTestId('chart-inspection-marker')).toHaveCount(0)
})

test('chart inspection identifies estimated samples', async ({ page }) => {
  await openPressure(page)
  await scenario(page, 'estimated')
  await page
    .getByTestId('chart-full')
    .getByTestId('chart-inspection')
    .click({ position: { x: 1, y: 100 } })
  await expect(page.getByTestId('chart-current-quality')).toHaveText(
    'Est. Historical Price ✱'
  )
  await page.getByTestId('chart-inspection').focus()
  await expect(page.getByTestId('chart-inspection')).toHaveAttribute(
    'aria-valuetext',
    /Est\. Historical Price/
  )
  for (let index = 0; index < 8; index++)
    await page.keyboard.press('ArrowRight')
  await expect(page.getByTestId('chart-current-quality')).toHaveCount(0)
})
